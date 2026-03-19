import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3003;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'ulivo2024';

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
  const record = { id, timestamp, ...order };
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

  // Check auth status
  if (pathname === '/api/auth') {
    return json(res, { authenticated: checkAuth(req) });
  }

  // --- Protected admin endpoints ---
  if (pathname === '/api/orders' && req.method === 'GET') {
    if (!checkAuth(req)) return json(res, { error: 'Non autorizzato' }, 401);
    const orders = await getOrders();
    return json(res, orders);
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

// Keep-alive for free-tier hosting
setInterval(() => console.log('[ALIVE]', new Date().toISOString()), 240000);
