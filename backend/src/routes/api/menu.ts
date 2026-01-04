import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { HttpError } from '../../utils/httpError.js';
import { serializeMenuItem } from '../../utils/serialize.js';

export function menuRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const [categories, items] = await Promise.all([
        prisma.category.findMany({ where: { restaurantId: req.user!.restaurantId }, orderBy: { createdAt: 'asc' } }),
        prisma.menuItem.findMany({ where: { restaurantId: req.user!.restaurantId }, orderBy: { createdAt: 'asc' } }),
      ]);
      res.json({ categories, items: items.map(serializeMenuItem) });
    } catch (e) {
      next(e);
    }
  });

  router.post('/categories', requireAuth, requirePermission('manage_menu'), async (req, res, next) => {
    try {
      const body = z
        .object({
          id: z.string().min(1).optional(),
          name: z.string().min(1),
          icon: z.string().min(1).optional(),
        })
        .parse(req.body);

      const category = await prisma.category.create({
        data: {
          id: body.id ?? `cat-${Date.now()}`,
          restaurantId: req.user!.restaurantId,
          name: body.name,
          icon: body.icon,
        },
      });
      res.status(201).json(category);
    } catch (e) {
      next(e);
    }
  });

  router.post('/items', requireAuth, requirePermission('manage_menu'), async (req, res, next) => {
    try {
      const body = z
        .object({
          id: z.string().min(1).optional(),
          categoryId: z.string().min(1),
          name: z.string().min(1),
          description: z.string().min(1),
          prices: z.any(),
          cost: z.number().nonnegative().optional(),
          image: z.string().url().optional().or(z.string().min(1).optional()),
          taxRate: z.number().min(0).max(1),
          active: z.boolean().optional(),
          is86d: z.boolean().optional(),
          recipe: z.any().optional(),
        })
        .parse(req.body);

      // Verify category exists and belongs to restaurant
      const category = await prisma.category.findFirst({
        where: { id: body.categoryId, restaurantId: req.user!.restaurantId },
      });
      if (!category) {
        throw new HttpError(404, 'Category not found', { code: 'NOT_FOUND' });
      }

      const created = await prisma.menuItem.create({
        data: {
          id: body.id ?? `item-${Date.now()}`,
          restaurantId: req.user!.restaurantId,
          categoryId: body.categoryId,
          name: body.name,
          description: body.description,
          prices: body.prices,
          cost: body.cost,
          image: body.image,
          taxRate: body.taxRate,
          active: body.active ?? true,
          is86d: body.is86d ?? false,
          recipe: body.recipe,
        },
      });

      res.status(201).json(serializeMenuItem(created));
    } catch (e) {
      next(e);
    }
  });

  router.patch('/items/:id', requireAuth, requirePermission('manage_menu'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const body = z
        .object({
          categoryId: z.string().min(1).optional(),
          name: z.string().min(1).optional(),
          description: z.string().min(1).optional(),
          prices: z.any().optional(),
          cost: z.number().nonnegative().optional(),
          image: z.string().url().optional().or(z.string().min(1).optional()),
          taxRate: z.number().min(0).max(1).optional(),
          active: z.boolean().optional(),
          is86d: z.boolean().optional(),
          recipe: z.any().optional(),
        })
        .parse(req.body);

      const item = await prisma.menuItem.findFirst({ where: { id, restaurantId: req.user!.restaurantId } });
      if (!item) throw new HttpError(404, 'Menu item not found', { code: 'NOT_FOUND' });

      const updated = await prisma.menuItem.update({
        where: { id },
        data: {
          ...body,
          cost: body.cost === undefined ? undefined : body.cost,
        } as any,
      });

      res.json(serializeMenuItem(updated));
    } catch (e) {
      next(e);
    }
  });

  return router;
}


