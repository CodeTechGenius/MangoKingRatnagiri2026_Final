import { Request, Response } from 'express';
import prisma from '../config/database';

export async function getProducts(req: Request, res: Response) {
  try {
    const { category, filter, limit = '20', page = '1', q, sort = 'latest', minPrice, maxPrice } = req.query as Record<string,string>;
    const take = Math.min(parseInt(limit) || 20, 100);
    const skip = (Math.max(parseInt(page) || 1, 1) - 1) * take;

    const where: any = { isActive: true };

    if (category) {
      const cat = await prisma.category.findUnique({ where: { slug: category } });
      if (cat) where.categoryId = cat.id;
    }
    if (filter === 'featured')   where.isFeatured  = true;
    if (filter === 'trending')   where.isTrending  = true;
    if (filter === 'new')        where.isNewLaunch = true;
    if (q) where.name = { contains: q, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.OR = [
        { discountPrice: { gte: minPrice ? parseFloat(minPrice) : 0, ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}) } },
        { mrp: { gte: minPrice ? parseFloat(minPrice) : 0, ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}) } },
      ];
    }

    const orderBy: any = sort === 'price_asc' ? { discountPrice: 'asc' } : sort === 'price_desc' ? { discountPrice: 'desc' } : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where, take, skip, orderBy,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          images: { orderBy: { sortOrder: 'asc' }, take: 3 },
          variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({ products, pagination: { total, page: parseInt(page), totalPages: Math.ceil(total / take), limit: take } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getProduct(req: Request, res: Response) {
  try {
    const product = await prisma.product.findFirst({
      where: { slug: req.params.slug, isActive: true },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, orderBy: { price: 'asc' } },
      }
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const related = await prisma.product.findMany({
      where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
      take: 4,
      include: { images: { take: 1 }, variants: { take: 1, orderBy: { price: 'asc' } } }
    });

    res.json({ product, related });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
