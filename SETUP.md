# 🥭 Mango King Ratnagiri — Complete Setup Guide

## Architecture Overview

```
mango-king/
├── client/    SvelteKit + TailwindCSS   → port 5173
└── server/    Node.js + Express         → port 4000
```

The **client** is a pure frontend — it never touches the database directly.
All data flows through the **server** REST API.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | bundled with Node |
| PostgreSQL | 14+ | or Docker (below) |
| Git | any | https://git-scm.com |

---

## Step 1 — Start the Database

**Option A: Docker (Recommended)**
```bash
cd server
docker-compose up -d postgres
# Database available at localhost:5432
# DB admin UI at http://localhost:8080 (Adminer)
```

**Option B: Existing PostgreSQL**
```sql
CREATE DATABASE mango_king_db;
CREATE USER mango_user WITH ENCRYPTED PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE mango_king_db TO mango_user;
```

---

## Step 2 — Configure the Server

```bash
cd server
npm install
cp .env.example .env
```

Open `.env` and fill in:

```env
# Required
DATABASE_URL="postgresql://postgres:password@localhost:5432/mango_king_db"
JWT_SECRET="your-minimum-32-character-secret-key-here"

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_key_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# WhatsApp OTP — Gupshup.io (or leave blank for dev console OTP)
WHATSAPP_API_URL="https://api.gupshup.io/sm/api/v1/msg"
WHATSAPP_API_KEY="your_gupshup_key"
WHATSAPP_NUMBER="917000000000"

# Shiprocket (shiprocket.in credentials)
SHIPROCKET_EMAIL="your@email.com"
SHIPROCKET_PASSWORD="your_password"
```

> **Dev tip:** In development, OTP is printed to the server console. You don't need WhatsApp configured to test locally.

---

## Step 3 — Setup the Database

```bash
# Inside server/
npm run db:generate    # Generate Prisma client
npm run db:push        # Create tables
npm run db:seed        # Seed categories, sample products, admin user
```

> ⚠️ **Before seeding:** Edit `scripts/seed.ts` line 10 — change `adminPhone` to your real phone number.

---

## Step 4 — Start the Server

```bash
# Inside server/
npm run dev
```

You should see:
```
🥭 Mango King API Server
   ✓ Running on http://localhost:4000
   ✓ Environment: development
```

Test it: http://localhost:4000/health

---

## Step 5 — Configure the Client

```bash
cd client
npm install
cp .env.example .env
```

`.env` for client:
```env
PUBLIC_API_URL=http://localhost:4000
```

---

## Step 6 — Start the Client

```bash
# Inside client/
npm run dev
```

Open: **http://localhost:5173**

---

## First Login (Admin)

1. Go to http://localhost:5173/login
2. Enter the phone number you set in `seed.ts`
3. Check server console for the OTP (in dev mode)
4. After login → go to http://localhost:5173/admin/dashboard

---

## API Reference

### Base URL
- Development: `http://localhost:4000`
- Production: `https://api.yourdomain.com`

### Auth Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/send-otp` | Send WhatsApp OTP | No |
| POST | `/api/auth/verify-otp` | Verify OTP, get token | No |
| POST | `/api/auth/logout` | Logout | No |
| GET | `/api/auth/me` | Get current user | Token |

### Customer Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | `/api/products` | List products (paginated) | No |
| GET | `/api/products/:slug` | Single product + related | No |
| GET | `/api/categories` | All categories | No |
| GET | `/api/categories/:slug` | Single category | No |
| GET | `/api/banners` | Active banners | No |
| GET | `/api/trading/today` | Today's mango prices | No |
| GET | `/api/trading` | Price history | No |
| GET | `/api/cart` | Get cart | Token |
| POST | `/api/cart` | Add to cart | Token |
| PUT | `/api/cart/:itemId` | Update quantity | Token |
| DELETE | `/api/cart/:itemId` | Remove item | Token |
| DELETE | `/api/cart` | Clear cart | Token |
| GET | `/api/orders` | My orders | Token |
| GET | `/api/orders/:id` | Order detail | Token |
| POST | `/api/orders` | Place order | Token |
| POST | `/api/payments/verify` | Verify Razorpay payment | Token |
| POST | `/api/payments/webhook` | Razorpay webhook | No |
| GET | `/api/addresses` | My addresses | Token |
| POST | `/api/addresses` | Add address | Token |
| PATCH | `/api/addresses/:id` | Update address | Token |
| GET | `/api/profile` | My profile + stats | Token |
| PATCH | `/api/profile` | Update profile | Token |
| GET | `/api/settings/public` | Public settings | No |

### Admin Endpoints (SUPER_ADMIN or OPERATOR)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/dashboard` | Stats + recent orders |
| GET | `/api/admin/users` | All customers |
| PATCH | `/api/admin/users/:id` | Update user role |
| POST | `/api/products` | Create product (multipart) |
| PATCH | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Soft-delete product |
| POST | `/api/categories` | Create category |
| PATCH | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |
| PATCH | `/api/orders/:id` | Update order status/tracking |
| GET | `/api/banners/all` | All banners (admin) |
| POST | `/api/banners` | Create banner (multipart) |
| PATCH | `/api/banners/:id` | Update banner |
| DELETE | `/api/banners/:id` | Delete banner |
| POST | `/api/trading` | Add/update mango price |
| DELETE | `/api/trading/:id` | Delete price entry |
| GET | `/api/expenses` | All expenses + stats |
| POST | `/api/expenses` | Add expense |
| GET | `/api/shipping/pending` | Orders awaiting Shiprocket sync |
| POST | `/api/shipping/sync/:orderId` | Sync order to Shiprocket |
| GET | `/api/shipping/serviceability` | Check delivery to pincode |
| GET | `/api/admin/payment-gateways` | Gateway configs |
| PATCH | `/api/admin/payment-gateways/:gateway` | Enable/disable/default |

---

## Client Routes

| Route | Description |
|-------|-------------|
| `/` | Homepage — banners, categories, featured/trending/new |
| `/login` | WhatsApp OTP login |
| `/categories` | All categories |
| `/categories/:slug` | Products in a category with filters |
| `/product/:slug` | Product detail + add to cart |
| `/search` | Search products |
| `/trading` | Daily mango prices + chart |
| `/checkout` | Checkout + Razorpay |
| `/orders` | My order history |
| `/orders/:id` | Order detail + tracking timeline |
| `/profile` | Customer profile |
| `/return-policy` | Return policy page |
| `/admin/dashboard` | Analytics + quick actions |
| `/admin/products` | Product list + CRUD |
| `/admin/products/new` | Add product with images |
| `/admin/orders` | All orders + status update |
| `/admin/orders/:id` | Order detail + profit calc |
| `/admin/categories` | Category CRUD |
| `/admin/banners` | Banner carousel management |
| `/admin/banners/new` | Add banner with scheduling |
| `/admin/trading` | Manage daily mango prices |
| `/admin/expenses` | Track expenses |
| `/admin/shipping` | Shiprocket sync |
| `/admin/payments` | Gateway config |

---

## Production Deployment

### Server → Railway / Render / VPS

**Railway:**
```bash
cd server
railway login && railway init
railway add postgresql
railway up
# Set env vars in Railway dashboard
```

**Ubuntu VPS:**
```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
npm install -g pm2

# Setup project
cd server
npm install
npm run build
npm run db:migrate
npm run db:seed

# Start with PM2
pm2 start dist/index.js --name mango-king-api
pm2 save && pm2 startup
```

**Nginx reverse proxy (server):**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    client_max_body_size 15M;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/mango-king/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### Client → Vercel / Netlify

**Vercel:**
```bash
cd client
npm run build
vercel --prod
# Set PUBLIC_API_URL=https://api.yourdomain.com in Vercel dashboard
```

**Netlify:**
```bash
cd client
npm run build
netlify deploy --prod --dir=build
```

**Static Nginx (serve client build):**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/mango-king/client/build;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y; add_header Cache-Control "public, immutable";
    }
}
```

### SSL (both server and client)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

---

## Client–Server Communication Flow

```
Browser (5173)
    │
    ├── GET /api/products  ──────────► Vite Proxy (dev)
    │                                       │
    │                                       ▼
    │                              Express Server (4000)
    │                                       │
    │                                       ▼
    │                              Prisma → PostgreSQL
    │
    └── Auth: localStorage.getItem('auth_token')
              → Authorization: Bearer <JWT>
              → server verifies → req.user
```

In production, `PUBLIC_API_URL=https://api.yourdomain.com` replaces the proxy.

---

## Environment Variables Quick Reference

### Server `.env`
```env
DATABASE_URL=postgresql://...
PORT=4000
NODE_ENV=production
CLIENT_URL=https://yourdomain.com
JWT_SECRET=minimum-32-char-secret
JWT_EXPIRES_IN=7d
WHATSAPP_API_URL=
WHATSAPP_API_KEY=
WHATSAPP_NUMBER=
OTP_EXPIRY_MINUTES=10
OTP_MAX_ATTEMPTS=3
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
SHIPROCKET_EMAIL=
SHIPROCKET_PASSWORD=
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
FREE_SHIPPING_ABOVE=500
DEFAULT_SHIPPING_CHARGE=60
```

### Client `.env`
```env
PUBLIC_API_URL=https://api.yourdomain.com
```

---

## Razorpay Webhook Setup

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://api.yourdomain.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`, `refund.created`
4. Copy the webhook secret → set `RAZORPAY_WEBHOOK_SECRET` in server `.env`

---

## Post-Launch Checklist

- [ ] Changed admin phone in `seed.ts` before seeding
- [ ] Ran `npm run db:seed` with correct admin phone
- [ ] Logged in as admin and verified dashboard
- [ ] Added product categories
- [ ] Added first products with images
- [ ] Set homepage banners
- [ ] Tested full order flow (cart → checkout → Razorpay → confirmation)
- [ ] Switched Razorpay from test to live mode
- [ ] Configured Shiprocket pickup address
- [ ] Set Razorpay webhook URL
- [ ] SSL certificates installed on both domains
- [ ] PM2 running and auto-starts on reboot
- [ ] Database backup scheduled

---

## Troubleshooting

**CORS errors in browser:**
Make sure `CLIENT_URL` in server `.env` matches exactly where your frontend runs (including protocol and port).

**OTP not received:**
In development, OTP prints to server console. In production, configure `WHATSAPP_API_KEY`.

**Images not showing:**
Check `UPLOAD_DIR` in server `.env`. In production, set up Nginx to serve `/uploads/` statically.

**Razorpay payment not confirming:**
Ensure webhook is configured. If testing locally, use Razorpay's test mode and manually verify via the `/api/payments/verify` endpoint.

**Database connection failed:**
Check `DATABASE_URL` format and ensure PostgreSQL is running. Test with: `npm run db:studio`
