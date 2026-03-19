import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3003;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'PipettaLibe';

// --- Config ---
const OPENING_HOUR = 18; const OPENING_MIN = 30;
const CLOSING_HOUR = 21; const CLOSING_MIN = 30;
const CLOSED_DAY = 2; // Tuesday (0=Sun)
const SLOT_MINUTES = 5;
const MAX_PIZZAS_PER_SLOT = 7;

// --- Ingredient cost estimates (€ per pizza/item) ---
const INGREDIENT_COSTS = {
  'fior di latte': 0.80, 'bufala D.O.P.': 1.60, 'burrata': 1.80,
  'polpa di pomodoro': 0.30, 'basilico': 0.05, 'mozzarella': 0.80,
  'prosciutto cotto': 0.70, 'crudo': 1.20, 'speck': 1.00,
  'salsiccia': 0.80, 'guanciale': 1.00, 'wurstel': 0.40,
  'gorgonzola D.O.P.': 0.90, 'taleggio D.O.P.': 0.90, 'pecorino': 0.70,
  'ricotta': 0.50, 'brie': 0.70, 'grana': 0.60, 'scamorza': 0.70,
  'funghi champignon': 0.40, 'funghi porcini': 1.50, 'carciofi': 0.60,
  'melanzane': 0.30, 'zucchine': 0.30, 'peperoni': 0.35,
  'cipolle': 0.10, 'pomodorini': 0.40, 'rucola': 0.20,
  'olive riviera': 0.40, 'capperi': 0.30, 'friarielli': 0.80,
  'tonno': 0.70, 'alici': 0.60, 'spianata calabra': 0.80,
  'patatine fritte': 0.30, 'noci': 0.40, 'pere': 0.30,
  'radicchio': 0.25, 'nutella': 0.50, 'uovo': 0.20,
  'origano di Pantelleria': 0.10, 'aglio': 0.05, 'pepe': 0.05,
  'menta': 0.05, 'sale': 0.02, 'glassa d\'aceto': 0.15,
  'olio extravergine d\'oliva': 0.20, 'pelati San Marzano': 0.50,
  'scaglie di grana padano': 0.60,
};
const BASE_DOUGH_COST = 0.45; // flour, yeast, water, oil per pizza
const BASE_CALZONE_COST = 0.50;
const BASE_PANUOZZO_COST = 0.55;
const FRITTI_COST = { 'bocconcini-pollo': 1.20, 'mozzarelle-impanate': 0.90, 'olive-ascolana': 1.10, 'patatine-fritte': 0.60 };

function estimateItemCost(item) {
  // Check if it's a fritto
  const frittoId = Object.keys(FRITTI_COST).find(k => item.name.toLowerCase().includes(k.replace('-', ' ')));
  if (frittoId) return FRITTI_COST[frittoId] * (item.qty || 1);

  // Base cost
  let base = BASE_DOUGH_COST;
  if (item.name.toLowerCase().includes('calzon')) base = BASE_CALZONE_COST;
  else if (['moser','nibali','gimondi','sagan','pantani','magrini'].some(n => item.name.toLowerCase().includes(n))) base = BASE_PANUOZZO_COST;

  // Parse ingredients from the order's removed/added or from original desc
  let ingredientCost = 0;
  const desc = (item.desc || '').toLowerCase();
  for (const [ing, cost] of Object.entries(INGREDIENT_COSTS)) {
    if (desc.includes(ing.toLowerCase())) {
      // Check if removed
      const removed = (item.removed || []).map(r => r.toLowerCase());
      if (!removed.includes(ing.toLowerCase())) {
        ingredientCost += cost;
      }
    }
  }
  // Added ingredients
  (item.added || []).forEach(a => {
    const match = Object.entries(INGREDIENT_COSTS).find(([k]) => k.toLowerCase() === a.toLowerCase());
    ingredientCost += match ? match[1] : 0.50; // default 0.50 for unknown
  });

  return (base + ingredientCost) * (item.qty || 1);
}

// --- Storage ---
let db = null;
const ORDERS_FILE = path.join(__dirname, 'orders.json');

async function initDB() {
  if (process.env.TURSO_URL) {
    const { createClient } = await import('@libsql/client');
    db = createClient({ url: process.env.TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });
    await db.execute(`CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      order_mode TEXT NOT NULL,
      delivery_address TEXT,
      items TEXT NOT NULL,
      total_price REAL NOT NULL,
      notes TEXT,
      status TEXT DEFAULT 'pending'
    )`);
    console.log('[DB] Turso connected');
  } else {
    if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');
    console.log('[DB] Using local JSON fallback');
  }
}

function readLocalOrders() {
  return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf-8'));
}
function writeLocalOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

async function addOrder(order) {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const record = { id, timestamp, ...order, status: 'pending' };
  if (db) {
    await db.execute({
      sql: `INSERT INTO orders (id, timestamp, customer_name, order_mode, delivery_address, items, total_price, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, timestamp, order.customerName, order.orderMode, order.deliveryAddress || '',
             JSON.stringify(order.items), order.totalPrice, order.notes || '']
    });
  } else {
    const orders = readLocalOrders();
    orders.unshift(record);
    writeLocalOrders(orders);
  }
  return record;
}

async function getOrders() {
  if (db) {
    const rs = await db.execute('SELECT * FROM orders ORDER BY timestamp DESC');
    return rs.rows.map(r => ({
      ...r,
      items: JSON.parse(r.items),
      totalPrice: r.total_price,
      customerName: r.customer_name,
      orderMode: r.order_mode,
      deliveryAddress: r.delivery_address,
    }));
  }
  return readLocalOrders();
}

async function updateOrderStatus(id, status) {
  if (db) {
    await db.execute({ sql: 'UPDATE orders SET status = ? WHERE id = ?', args: [status, id] });
  } else {
    const orders = readLocalOrders();
    const o = orders.find(o => o.id === id);
    if (o) { o.status = status; writeLocalOrders(orders); }
  }
}

async function deleteOrder(id) {
  if (db) {
    await db.execute({ sql: 'DELETE FROM orders WHERE id = ?', args: [id] });
  } else {
    const orders = readLocalOrders().filter(o => o.id !== id);
    writeLocalOrders(orders);
  }
}

// --- Slot capacity ---
function getSlotKey(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(Math.floor(date.getMinutes() / SLOT_MINUTES) * SLOT_MINUTES).padStart(2, '0');
  return `${h}:${m}`;
}

async function getSlotUsage(dateStr) {
  // dateStr = 'YYYY-MM-DD'
  const orders = await getOrders();
  const dayOrders = orders.filter(o => o.timestamp?.startsWith(dateStr) && (o.status || 'pending') !== 'cancelled');
  const slots = {};

  // Generate all slots for the day
  for (let h = OPENING_HOUR; h <= CLOSING_HOUR; h++) {
    const startMin = (h === OPENING_HOUR) ? OPENING_MIN : 0;
    const endMin = (h === CLOSING_HOUR) ? CLOSING_MIN : 60;
    for (let m = startMin; m < endMin; m += SLOT_MINUTES) {
      const key = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      slots[key] = { time: key, used: 0, max: MAX_PIZZAS_PER_SLOT, available: MAX_PIZZAS_PER_SLOT };
    }
  }

  // Count pizzas per slot from orders
  dayOrders.forEach(order => {
    const orderTime = new Date(order.timestamp);
    // Use delivery time if specified, otherwise order timestamp
    let slotTime = orderTime;
    // Count items (each item counts as pizza-equivalents)
    const itemCount = (order.items || []).reduce((s, i) => s + (i.qty || 1), 0);

    const key = getSlotKey(slotTime);
    if (slots[key]) {
      slots[key].used += itemCount;
      slots[key].available = Math.max(0, slots[key].max - slots[key].used);
    }
  });

  return slots;
}

// --- Inventory tracking ---
async function getInventoryForDate(dateStr) {
  const orders = await getOrders();
  const dayOrders = orders.filter(o => o.timestamp?.startsWith(dateStr) && (o.status || 'pending') !== 'cancelled');

  const ingredients = {};
  let totalCost = 0;
  let totalRevenue = 0;
  let totalItems = 0;

  dayOrders.forEach(order => {
    totalRevenue += order.totalPrice || 0;
    (order.items || []).forEach(item => {
      const qty = item.qty || 1;
      totalItems += qty;

      // Parse ingredients from description
      const desc = (item.desc || '').toLowerCase();
      for (const [ing] of Object.entries(INGREDIENT_COSTS)) {
        if (desc.includes(ing.toLowerCase())) {
          const removed = (item.removed || []).map(r => r.toLowerCase());
          if (!removed.includes(ing.toLowerCase())) {
            ingredients[ing] = (ingredients[ing] || 0) + qty;
          }
        }
      }
      // Added extras
      (item.added || []).forEach(a => {
        ingredients[a] = (ingredients[a] || 0) + qty;
      });

      totalCost += estimateItemCost(item);
    });
  });

  return {
    date: dateStr,
    totalOrders: dayOrders.length,
    totalItems,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    estimatedCost: Math.round(totalCost * 100) / 100,
    estimatedMargin: Math.round((totalRevenue - totalCost) * 100) / 100,
    ingredients: Object.entries(ingredients)
      .map(([name, count]) => ({ name, count, unitCost: INGREDIENT_COSTS[name.toLowerCase()] || 0.50 }))
      .sort((a, b) => b.count - a.count),
  };
}

// --- Auth ---
const sessions = new Map();

function checkAuth(req) {
  const cookie = req.headers.cookie || '';
  const match = cookie.match(/session=([^;]+)/);
  if (!match) return false;
  return sessions.has(match[1]);
}

function createSession() {
  const token = crypto.randomUUID();
  sessions.set(token, Date.now());
  return token;
}

// --- HTTP Server ---
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

function serveFile(res, filePath, contentType) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // Health
  if (pathname === '/health') return json(res, { status: 'ok' });

  // --- Public API: slots availability (no auth needed) ---
  if (pathname === '/api/slots' && req.method === 'GET') {
    const dateParam = url.searchParams.get('date');
    const now = new Date();
    const dateStr = dateParam || now.toISOString().slice(0, 10);

    // Check if closed (Tuesday)
    const checkDate = new Date(dateStr + 'T12:00:00');
    if (checkDate.getDay() === CLOSED_DAY) {
      return json(res, { date: dateStr, closed: true, reason: 'Martedì chiuso', slots: [] });
    }

    const slots = await getSlotUsage(dateStr);
    // Filter out past slots if today
    const isToday = dateStr === now.toISOString().slice(0, 10);
    const slotList = Object.values(slots).map(s => ({
      ...s,
      past: isToday && s.time <= getSlotKey(now),
    }));

    return json(res, {
      date: dateStr,
      closed: false,
      openingTime: `${String(OPENING_HOUR).padStart(2,'0')}:${String(OPENING_MIN).padStart(2,'0')}`,
      closingTime: `${String(CLOSING_HOUR).padStart(2,'0')}:${String(CLOSING_MIN).padStart(2,'0')}`,
      closedDay: CLOSED_DAY,
      maxPerSlot: MAX_PIZZAS_PER_SLOT,
      slotMinutes: SLOT_MINUTES,
      slots: slotList,
    });
  }

  // --- Public API: POST orders (customers) ---
  if (pathname === '/api/orders' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.customerName || !body.items?.length) return json(res, { error: 'Missing data' }, 400);
    const order = await addOrder(body);
    return json(res, order, 201);
  }

  // --- Admin auth ---
  if (pathname === '/api/login' && req.method === 'POST') {
    const body = await parseBody(req);
    if (body.password === ADMIN_PASSWORD) {
      const token = createSession();
      res.writeHead(200, {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`,
      });
      return res.end(JSON.stringify({ ok: true }));
    }
    return json(res, { error: 'Password errata' }, 401);
  }

  if (pathname === '/api/logout' && req.method === 'POST') {
    const cookie = req.headers.cookie || '';
    const match = cookie.match(/session=([^;]+)/);
    if (match) sessions.delete(match[1]);
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Set-Cookie': 'session=; Path=/; Max-Age=0',
    });
    return res.end(JSON.stringify({ ok: true }));
  }

  if (pathname === '/api/auth') {
    return json(res, { authenticated: checkAuth(req) });
  }

  // --- Protected admin endpoints ---
  if (pathname === '/api/orders' && req.method === 'GET') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const orders = await getOrders();
    return json(res, orders);
  }

  if (pathname === '/api/inventory' && req.method === 'GET') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const dateParam = url.searchParams.get('date') || new Date().toISOString().slice(0, 10);
    const inventory = await getInventoryForDate(dateParam);
    return json(res, inventory);
  }

  if (pathname === '/api/calendar' && req.method === 'GET') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const orders = await getOrders();
    // Group by date
    const byDate = {};
    orders.forEach(o => {
      const d = (o.timestamp || '').slice(0, 10);
      if (!d) return;
      if (!byDate[d]) byDate[d] = { date: d, orders: 0, revenue: 0, items: 0, pending: 0, completed: 0 };
      byDate[d].orders++;
      byDate[d].revenue += o.totalPrice || 0;
      byDate[d].items += (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
      if ((o.status || 'pending') === 'pending') byDate[d].pending++;
      else byDate[d].completed++;
    });
    const calendar = Object.values(byDate).sort((a, b) => b.date.localeCompare(a.date));
    return json(res, calendar);
  }

  if (pathname.startsWith('/api/orders/') && req.method === 'PUT') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const id = pathname.split('/').pop();
    const body = await parseBody(req);
    await updateOrderStatus(id, body.status);
    return json(res, { ok: true });
  }

  if (pathname.startsWith('/api/orders/') && req.method === 'DELETE') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const id = pathname.split('/').pop();
    await deleteOrder(id);
    return json(res, { ok: true });
  }

  // --- Admin page ---
  if (pathname === '/ordini' || pathname === '/ordini/') {
    return serveFile(res, path.join(__dirname, 'public', 'ordini.html'), 'text/html');
  }

  json(res, { error: 'Not found' }, 404);
});

await initDB();
server.listen(PORT, () => console.log(`[L'Ulivo] Server running on port ${PORT}`));

setInterval(() => console.log('[ALIVE]', new Date().toISOString()), 240000);
