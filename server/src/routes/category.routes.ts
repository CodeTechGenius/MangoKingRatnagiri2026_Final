import { Router } from 'express';
import prisma from '../config/database';
const router = Router();
router.get('/', async (_req, res, next) => {
  try { res.json(await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })); } catch (e) { next(e); }
});
router.get('/:slug', async (req, res, next) => {
  try {
    const cat = await prisma.category.findUnique({ where: { slug: req.params.slug, isActive: true } });
    if (!cat) return res.status(404).json({ error: 'Category not found' });
    res.json(cat);
  } catch (e) { next(e); }
});
export default router;
