import { Router, Request, Response } from 'express';
import prisma from '../config/database';
import { authenticate, isAdmin, isSuperAdmin } from '../middleware/auth.middleware';

const router = Router();

// GET /api/settings → all settings as key-value object (admin only)
router.get('/', authenticate, isAdmin, async (_req: Request, res: Response) => {
  try {
    const rows = await prisma.setting.findMany();
    const obj: Record<string, string> = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/settings/public → only public settings (no auth)
router.get('/public', async (_req: Request, res: Response) => {
  try {
    const publicKeys = ['store_name', 'whatsapp_number', 'free_shipping_above', 'default_shipping_charge'];
    const rows = await prisma.setting.findMany({ where: { key: { in: publicKeys } } });
    const obj: Record<string, string> = {};
    rows.forEach(r => { obj[r.key] = r.value; });
    res.json(obj);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/settings/:key → update one setting (admin)
router.patch('/:key', authenticate, isAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) return res.status(400).json({ error: 'value required' });
    const s = await prisma.setting.upsert({
      where: { key },
      create: { key, value, updatedAt: new Date() },
      update: { value, updatedAt: new Date() },
    });
    res.json(s);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/settings → update multiple settings (super admin)
router.patch('/', authenticate, isSuperAdmin, async (req: Request, res: Response) => {
  try {
    const settings = req.body as Record<string, string>;
    const ops = Object.entries(settings).map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value, updatedAt: new Date() },
        update: { value, updatedAt: new Date() },
      })
    );
    await Promise.all(ops);
    res.json({ updated: ops.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
