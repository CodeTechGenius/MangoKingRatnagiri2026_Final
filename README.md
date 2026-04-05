# 🥭 Mango King Ratnagiri — Monorepo

Two fully separate projects sharing one repo:

```
mango-king/
├── client/          ← SvelteKit + TailwindCSS (port 5173)
├── server/          ← Node.js + Express + Prisma (port 4000)
├── package.json     ← Workspace root
└── README.md
```

## 🚀 Quick Start

### 1. Start database
```bash
cd server
docker-compose up -d postgres
```

### 2. Setup server
```bash
cd server
npm install
cp .env.example .env    # Fill in credentials
npm run db:push
npm run db:seed
npm run dev             # → http://localhost:4000
```

### 3. Setup client
```bash
cd client
npm install
cp .env.example .env    # Set PUBLIC_API_URL=http://localhost:4000
npm run dev             # → http://localhost:5173
```

## 📁 Architecture

### Client (SvelteKit)
- **Pure frontend** — no server-side code, no database access
- All data fetched via `fetch()` from the API server
- `src/lib/api/` — typed API client layer
- `src/lib/stores/` — cart, auth, UI state (Svelte stores)
- `src/routes/(app)/` — customer pages
- `src/routes/(admin)/` — admin panel
- `src/routes/(auth)/` — login

### Server (Express + Prisma)
- **Pure backend** — REST API only, no HTML rendering
- `src/routes/` — Express route handlers
- `src/services/` — OTP, Razorpay, Shiprocket, image processing
- `src/middleware/` — JWT authentication, role guard
- `src/config/` — database, multer

## 🔑 API Base URL

Client talks to server via: `http://localhost:4000` (dev) or your production domain.

Configure in client `.env`:
```
PUBLIC_API_URL=https://api.yourdomain.com
```

## 🌐 Production Deployment

**Server** → Deploy on any Node.js host (Railway, Render, VPS)  
**Client** → Deploy on Vercel, Netlify, or serve as static files from Nginx
