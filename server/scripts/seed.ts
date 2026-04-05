import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ── Settings ────────────────────────────────────────────────────────────────
  const settingsData = [
    { key: 'store_name',              value: 'Mango King Ratnagiri' },
    { key: 'whatsapp_number',         value: '919876543210' },
    { key: 'free_shipping_above',     value: '500' },
    { key: 'default_shipping_charge', value: '60' },
    // WhatsApp OTP provider — 'dummy' prints OTP to console (dev mode)
    { key: 'whatsapp_provider',       value: 'dummy' },
    { key: 'whatsapp_api_url',        value: '' },
    { key: 'whatsapp_api_key',        value: '' },
  ];
  for (const s of settingsData) {
    await prisma.setting.upsert({
      where:  { key: s.key },
      create: { ...s, updatedAt: new Date() },
      update: { value: s.value, updatedAt: new Date() },
    });
  }
  console.log('✅ Settings seeded');

  // ── Categories ───────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where:  { slug: 'alphonso-mangoes' },
      create: { name: 'Alphonso Mangoes', slug: 'alphonso-mangoes', description: 'Premium Alphonso mangoes from Ratnagiri', sortOrder: 1 },
      update: {},
    }),
    prisma.category.upsert({
      where:  { slug: 'mango-products' },
      create: { name: 'Mango Products', slug: 'mango-products', description: 'Aamras, pickles, and more', sortOrder: 2 },
      update: {},
    }),
    prisma.category.upsert({
      where:  { slug: 'konkan-specials' },
      create: { name: 'Konkan Specials', slug: 'konkan-specials', description: 'Traditional Konkan delicacies', sortOrder: 3 },
      update: {},
    }),
    prisma.category.upsert({
      where:  { slug: 'gift-boxes' },
      create: { name: 'Gift Boxes', slug: 'gift-boxes', description: 'Premium mango gift hampers', sortOrder: 4 },
      update: {},
    }),
  ]);
  console.log(`✅ ${categories.length} categories seeded`);

  // ── Super Admin ──────────────────────────────────────────────────────────────
  // ⚠️  CHANGE THIS to your real phone number (with 91 prefix) before seeding!
  const adminPhone = '919000000000';

  const admin = await prisma.user.upsert({
    where:  { phone: adminPhone },
    create: { phone: adminPhone, name: 'Admin', role: 'SUPER_ADMIN', isActive: true },
    update: { role: 'SUPER_ADMIN' },
  });
  console.log(`✅ Super Admin created: ${adminPhone}`);
  console.log(`   Login at /login with: ${adminPhone.slice(2)} (remove the 91 prefix)`);

  // ── Sample Product ───────────────────────────────────────────────────────────
  const existingProduct = await prisma.product.findUnique({
    where: { slug: 'premium-alphonso-mango' }
  });

  if (!existingProduct) {
    await prisma.product.create({
      data: {
        name:         'Premium Alphonso Mango',
        slug:         'premium-alphonso-mango',
        description:  'Hand-picked from century-old Ratnagiri orchards. Chemical-free, naturally ripened.',
        categoryId:   categories[0].id,
        mrp:          1200,
        discountPrice: 999,
        stock:        100,
        sku:          'MK-ALPHA-001',
        isFeatured:   true,
        isTrending:   true,
        isNewLaunch:  true,
        newLaunchAt:  new Date(),
        tags:         ['alphonso', 'premium', 'ratnagiri'],
        variants: {
          create: [
            { label: '1 kg',  quantity: 1, unit: 'kg', mrp: 450,  price: 399, stock: 50 },
            { label: '2 kg',  quantity: 2, unit: 'kg', mrp: 850,  price: 749, stock: 30 },
            { label: '5 kg',  quantity: 5, unit: 'kg', mrp: 1200, price: 999, stock: 20 },
          ],
        },
      },
    });
    console.log('✅ Sample product created');
  }

  // ── Mango Trading Prices (last 30 days) ─────────────────────────────────────
  const varieties = ['Alphonso', 'Kesar', 'Dasheri'];
  const basePrices: Record<string, number> = { Alphonso: 400, Kesar: 250, Dasheri: 150 };
  let pricesCreated = 0;

  for (const variety of varieties) {
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const base = basePrices[variety];
      const fluctuation = (Math.random() - 0.5) * 60;

      try {
        await prisma.mangoPrice.upsert({
          where:  { date_variety: { date, variety } },
          create: {
            date,
            variety,
            minPrice: Math.round(base + fluctuation - 30),
            maxPrice: Math.round(base + fluctuation + 30),
            avgPrice: Math.round(base + fluctuation),
            unit:     'kg',
          },
          update: {},
        });
        pricesCreated++;
      } catch {
        // skip duplicates
      }
    }
  }
  console.log(`✅ ${pricesCreated} mango price entries seeded`);

  // ── Payment Gateway Config ───────────────────────────────────────────────────
  const gwData = [
    { gateway: 'RAZORPAY', isActive: true,  isDefault: true,  config: { note: 'Configure RAZORPAY_KEY_ID in .env' } },
    { gateway: 'CASHFREE', isActive: false, isDefault: false, config: {} },
    { gateway: 'PAYTM',    isActive: false, isDefault: false, config: {} },
    { gateway: 'COD',      isActive: false, isDefault: false, config: {} },
  ] as const;
  for (const gw of gwData) {
    await prisma.paymentGatewayConfig.upsert({ where: { gateway: gw.gateway }, create: { ...gw, updatedAt: new Date() }, update: {} });
  }
  console.log('✅ Payment gateway configs seeded (RAZORPAY default, others off)');

  // Shiprocket settings
  const srSettings = [
    { key: 'shiprocket_email',    value: '' },
    { key: 'shiprocket_password', value: '' },
    { key: 'sr_pickup_location',  value: 'Primary' },
    { key: 'sr_pickup_pincode',   value: '415612' },
    { key: 'sr_package_weight',   value: '1.5' },
    { key: 'sr_package_length',   value: '30' },
    { key: 'sr_package_breadth',  value: '25' },
    { key: 'sr_package_height',   value: '15' },
    { key: 'whatsapp_provider',   value: 'dummy' },
    { key: 'whatsapp_api_url',    value: '' },
    { key: 'whatsapp_api_key',    value: '' },
  ];
  for (const s of srSettings) {
    await prisma.setting.upsert({ where: { key: s.key }, create: { ...s, updatedAt: new Date() }, update: {} });
  }
  console.log('✅ Shiprocket + WhatsApp settings seeded');

  console.log('\n🎉 Seed complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`👤 Super Admin phone : ${adminPhone}`);
  console.log(`🔑 Login at          : http://localhost:5173/login`);
  console.log(`📱 Enter phone       : ${adminPhone.slice(2)}  (without 91)`);
  console.log(`🛡️  After login go to : http://localhost:5173/admin/dashboard`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  Remember: change adminPhone before production!');
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
