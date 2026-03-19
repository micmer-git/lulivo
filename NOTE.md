# L'Ulivo Pizzeria — Project Notes

## URLs

| What | URL |
|------|-----|
| Frontend (live) | https://micmer-git.github.io/lulivo/ |
| Menu & Ordina | https://micmer-git.github.io/lulivo/menu/ |
| Contatti | https://micmer-git.github.io/lulivo/contatti/ |
| Backend API | https://lulivo-orders.onrender.com |
| Admin Dashboard | https://lulivo-orders.onrender.com/ordini |
| GitHub Repo | https://github.com/micmer-git/lulivo |
| Render Blueprint | ID: exs-d6tss1ma2pns73913kjg |

## Backend Login

- **Admin URL**: https://lulivo-orders.onrender.com/ordini
- **Password**: `PipettaLibe`
- Session cookie-based auth (lasts 24h)
- Set `ADMIN_PASSWORD` env var on Render to change

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/orders | Public | Submit new order |
| GET | /api/orders | Admin | List all orders |
| PUT | /api/orders/:id | Admin | Update order status |
| DELETE | /api/orders/:id | Admin | Delete order |
| POST | /api/login | Public | Login (returns session cookie) |
| POST | /api/logout | Public | Logout |
| GET | /api/auth | Public | Check auth status |
| GET | /health | Public | Health check |

## WhatsApp

- Orders are sent to **+39 348 7024985** via wa.me link
- Formatted message with order details (items, mods, total, delivery info)
- Backend POST is fire-and-forget (never blocks WhatsApp)

## Pizzeria Info

- **Name**: L'Ulivo Pizzeria
- **Phone**: 035 611616
- **Address**: Via Alfredo Piatti, 6, 24030 Mozzo BG
- **Hours**: Lun–Dom 18:30–21:30 | Martedi chiuso
- **Delivery**: Mozzo €1 · Zone limitrofe €2 · Pizza singola +€2

## Local Dev

```bash
# Frontend (Astro dev server)
cd Desktop/micmer/lulivo
npm run dev

# Backend (orders API)
cd Desktop/micmer/lulivo/server
node server.js
# → http://localhost:3003/ordini (admin)
```

## Deploy

- **Frontend**: Push to `main` → GitHub Actions auto-deploys to Pages
- **Backend**: Render Blueprint auto-deploys from `render.yaml` at repo root
