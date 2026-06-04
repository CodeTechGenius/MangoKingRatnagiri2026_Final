#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Mango King Ratnagiri
# Run on your Ubuntu server as root or with sudo
# Usage: bash deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

DOMAIN="www.mangokingratnagiri.com"
APP_DIR="/var/www/mangoking"
NGINX_CONF="/etc/nginx/sites-available/mangoking"

echo "🥭 Deploying Mango King Ratnagiri..."

# ── 1. Install dependencies ───────────────────────────────────────────────────
apt-get update -qq
apt-get install -y nginx nodejs npm certbot python3-certbot-nginx

# Install PM2 globally
npm install -g pm2 --silent

# ── 2. Create app directory ───────────────────────────────────────────────────
mkdir -p $APP_DIR/server/uploads
mkdir -p $APP_DIR/client

# ── 3. Copy project files ─────────────────────────────────────────────────────
echo "📁 Copying project files..."
cp -r MangoKingRatnagiri2026_V1/server/. $APP_DIR/server/
cp -r MangoKingRatnagiri2026_V1/client/. $APP_DIR/client/

# ── 4. Install server dependencies ───────────────────────────────────────────
echo "📦 Installing server dependencies..."
cd $APP_DIR/server
npm install --production

# ── 5. Build the client ───────────────────────────────────────────────────────
echo "🔨 Building SvelteKit client..."
cd $APP_DIR/client
npm install
npm run build

# ── 6. Prisma setup ───────────────────────────────────────────────────────────
echo "🗄️  Setting up database..."
cd $APP_DIR/server
npm run db:generate
npm run db:push
npm run db:seed

# ── 7. Nginx config ───────────────────────────────────────────────────────────
echo "⚙️  Configuring Nginx..."
cp MangoKingRatnagiri2026_V1/nginx.conf $NGINX_CONF
ln -sf $NGINX_CONF /etc/nginx/sites-enabled/mangoking

# Remove default site
rm -f /etc/nginx/sites-enabled/default

nginx -t && systemctl reload nginx

# ── 8. SSL certificate (Let's Encrypt) ───────────────────────────────────────
echo "🔒 Obtaining SSL certificate..."
certbot --nginx \
  -d mangokingratnagiri.com \
  -d www.mangokingratnagiri.com \
  --non-interactive \
  --agree-tos \
  --email admin@mangokingratnagiri.com \
  --redirect

# ── 9. Start apps with PM2 ───────────────────────────────────────────────────
echo "🚀 Starting apps with PM2..."
cd $APP_DIR/server
pm2 delete mangoking-api 2>/dev/null || true
pm2 start "npm run dev" --name mangoking-api --cwd $APP_DIR/server

cd $APP_DIR/client
pm2 delete mangoking-web 2>/dev/null || true
pm2 start "node build/index.js" --name mangoking-web --cwd $APP_DIR/client \
  -e /var/log/mangoking-web.err.log \
  -o /var/log/mangoking-web.out.log

# Save PM2 config and set to start on boot
pm2 save
pm2 startup systemd -u root --hp /root

echo ""
echo "✅ Deployment complete!"
echo "   Frontend : https://$DOMAIN"
echo "   API      : https://$DOMAIN/api"
echo "   PM2 logs : pm2 logs"
