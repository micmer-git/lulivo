# 🫒 L'Ulivo Pizzeria — Sito & Sistema Ordini

Sito web e sistema ordini online per **L'Ulivo Pizzeria d'Asporto** — Mozzo (BG).

---

## Link rapidi

| Cosa | URL |
|------|-----|
| **Sito web** | https://micmer-git.github.io/lulivo/ |
| **Menu & Ordina** | https://micmer-git.github.io/lulivo/menu/ |
| **Contatti** | https://micmer-git.github.io/lulivo/contatti/ |
| **Dashboard ordini** | https://lulivo-orders.onrender.com/ordini |
| **GitHub Repo** | https://github.com/micmer-git/lulivo |

---

## Accesso Dashboard

| Campo | Valore |
|-------|--------|
| **URL** | https://lulivo-orders.onrender.com/ordini |
| **Password** | `PipettaLibe` |
| **Durata sessione** | 24 ore (cookie) |

Per cambiare la password: variabile d'ambiente `ADMIN_PASSWORD` su Render.

---

## Informazioni Pizzeria

| | |
|---|---|
| **Nome** | L'Ulivo Pizzeria d'Asporto |
| **Telefono** | 035 611616 |
| **WhatsApp** | +39 348 7024985 |
| **Indirizzo** | Via Alfredo Piatti, 6, 24030 Mozzo BG |
| **Orari** | Lun–Dom 18:30–21:30 |
| **Giorno chiusura** | Martedì |
| **Consegna** | Mozzo €1 · Zone limitrofe €2 · Pizza singola +€2 |

---

## Cosa include

### Sito web (Frontend)
- **Homepage** — hero a tutto schermo con badge animati (Menu / Chiama)
- **Menu interattivo** — 57 piatti in 5 sezioni (pizze rosse, bianche, calzoni, panuozzi, fritti)
- **Ricerca** — cerca per nome pizza o ingrediente
- **Ordini vocali** — "Due margherite e una diavola" (Web Speech API italiano)
- **Carrello** — personalizzazione ingredienti (togli/aggiungi), note per pizza, quantità
- **Asporto & Consegna** — scelta modalità, nome, indirizzo, slot orario con capacità
- **WhatsApp** — ordine formattato inviato direttamente al numero della pizzeria
- **Contatti** — mappa OpenStreetMap, link Google Maps, info consegna

### Backend (API Ordini)
- **Ordini CRUD** — creazione pubblica, gestione admin (completa/riapri/elimina)
- **Slot orari** — capacità max 7 pizze per slot da 5 minuti
- **Insights** — incasso, costi stimati, margine, top pizze, ingredienti utilizzati
- **Calendario storico** — storico ordini per giorno con ricavi
- **Database** — Turso (libSQL) con fallback JSON locale

### Extra
- **Cornicione ripieno di ricotta** — €2,00 (Lun–Gio)

---

## API Endpoints

| Metodo | Endpoint | Auth | Descrizione |
|--------|----------|------|-------------|
| POST | `/api/orders` | Pubblico | Invia nuovo ordine |
| GET | `/api/orders` | Admin | Lista ordini |
| PUT | `/api/orders/:id` | Admin | Aggiorna stato ordine |
| DELETE | `/api/orders/:id` | Admin | Elimina ordine |
| GET | `/api/slots?date=YYYY-MM-DD` | Pubblico | Disponibilità slot |
| GET | `/api/inventory?date=YYYY-MM-DD` | Admin | Tracking ingredienti e costi |
| GET | `/api/calendar` | Admin | Storico ricavi per giorno |
| POST | `/api/login` | Pubblico | Login (cookie sessione) |
| POST | `/api/logout` | Pubblico | Logout |
| GET | `/api/auth` | Pubblico | Verifica autenticazione |
| GET | `/health` | Pubblico | Health check |

---

## Sviluppo locale

```bash
# Frontend (Astro dev server)
cd Desktop/micmer/lulivo
npm install
npm run dev
# → http://localhost:4321/lulivo/

# Backend (server ordini)
cd Desktop/micmer/lulivo/server
npm install
node server.js
# → http://localhost:3003/ordini (dashboard)
```

---

## Deploy

| Componente | Piattaforma | Trigger |
|---|---|---|
| **Frontend** | GitHub Pages | Push su `main` → GitHub Actions auto-deploy |
| **Backend** | Render | Auto-deploy da `render.yaml` (root dir: `server`) |

### Variabili Render

| Variabile | Valore |
|---|---|
| `PORT` | 3003 |
| `ADMIN_PASSWORD` | PipettaLibe |
| `TURSO_URL` | (opzionale) |
| `TURSO_AUTH_TOKEN` | (opzionale) |

---

## Struttura progetto

```
lulivo/
├── src/
│   ├── data/
│   │   ├── site.js          ← Config pizzeria (nome, tel, orari)
│   │   └── menu.js          ← Menu completo (57 piatti, 5 sezioni)
│   ├── pages/
│   │   ├── index.astro      ← Homepage
│   │   ├── menu.astro       ← Menu + ordini + voce
│   │   └── contatti.astro   ← Contatti + mappa
│   ├── layouts/
│   │   └── BaseLayout.astro
│   ├── components/
│   │   ├── Header.astro
│   │   └── Footer.astro
│   └── styles/
│       └── global.css       ← Tema verde oliva
├── server/
│   ├── server.js             ← API ordini + auth + insights
│   ├── public/
│   │   └── ordini.html       ← Dashboard admin
│   └── package.json
├── package.json
├── astro.config.mjs
├── render.yaml
├── NOTE.md
└── README.md                 ← Questo file
```

---

## Tecnologie

- **Frontend**: Astro 4 (SSG, zero JS inutile)
- **Backend**: Node.js vanilla (http, nessun framework)
- **Database**: Turso (libSQL) con fallback JSON locale
- **Deploy**: GitHub Pages + Render (entrambi gratis)
- **Ordini**: WhatsApp (nessun costo)
- **Voce**: Web Speech API (nativo nel browser)

---

## Menu — Sezioni

| Sezione | Piatti | Range prezzi |
|---|---|---|
| 🔴 Pizze Rosse | 22 | €5,00 – €11,50 |
| ⚪ Pizze Bianche | 18 | €4,50 – €11,00 |
| 🥟 Calzoni | 5 | €7,00 – €9,00 |
| 🥖 Panuozzi | 6 | €6,00 – €7,50 |
| 🍟 Fritti | 4 | €3,00 – €3,50 |

**Specialità della casa**: 🫒 **L'Ulivo** — burrata, grana, peperoni, olive riviera, spianata calabra (€11,50)
