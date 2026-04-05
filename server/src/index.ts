import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { rateLimit } from 'express-rate-limit';

import authRoutes     from './routes/auth.routes';
import productRoutes  from './routes/product.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes     from './routes/cart.routes';
import orderRoutes    from './routes/order.routes';
import addressRoutes  from './routes/address.routes';
import profileRoutes  from './routes/profile.routes';
import paymentRoutes  from './routes/payment.routes';
import bannerRoutes   from './routes/banner.routes';
import tradingRoutes  from './routes/trading.routes';
import expenseRoutes  from './routes/expense.routes';
import shippingRoutes from './routes/shipping.routes';
import adminRoutes    from './routes/admin.routes';
import settingRoutes  from './routes/setting.routes';

const app    = express();
const PORT   = parseInt(process.env.PORT || '4000');
const CLIENT = process.env.CLIENT_URL || 'http://localhost:5173';

// ─── Security & parsing ───────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors({ origin: [CLIENT, 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], credentials: true }));
app.use(compression());
app.use(morgan('dev'));

// Raw body for Razorpay webhook signature verification
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON for everything else
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Static file serving ──────────────────────────────────────────────────────
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// ─── Rate limits ──────────────────────────────────────────────────────────────
const limiter     = rateLimit({ windowMs: 15 * 60000, max: 200 });
const authLimiter = rateLimit({ windowMs: 15 * 60000, max: 20 });
app.use('/api/', limiter);
app.use('/api/auth/', authLimiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/products',  productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',      cartRoutes);
app.use('/api/orders',    orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/profile',   profileRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/banners',   bannerRoutes);
app.use('/api/trading',   tradingRoutes);
app.use('/api/expenses',  expenseRoutes);
app.use('/api/shipping',  shippingRoutes);
app.use('/api/admin',     adminRoutes);
app.use('/api/settings',  settingRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV }));

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`\n🥭 Mango King API Server`);
  console.log(`   ✓ Running on http://localhost:${PORT}`);
  console.log(`   ✓ Environment: ${process.env.NODE_ENV}`);
  console.log(`   ✓ DB: ${process.env.DATABASE_URL?.split('@')[1] || 'connected'}`);
  console.log(`   ✓ Shiprocket: ${process.env.SHIPROCKET_EMAIL ? 'configured' : '⚠️  not configured'}`);
  console.log(`   ✓ Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'configured' : '⚠️  not configured'}\n`);
});

export default app;
