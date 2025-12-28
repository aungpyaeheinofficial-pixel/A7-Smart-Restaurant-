import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { HttpError } from '../../utils/httpError.js';
import { serializeInventoryItem } from '../../utils/serialize.js';

function computeStatus(onHand: number, parLevel: number): 'In_Stock' | 'Low_Stock' | 'Out_of_Stock' {
  if (onHand <= 0) return 'Out_of_Stock';
  if (onHand <= parLevel) return 'Low_Stock';
  return 'In_Stock';
}

const itemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  onHand: z.number(),
  parLevel: z.number(),
  unit: z.string().min(1),
  unitCost: z.number().nonnegative(),
});

export function inventoryRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, requirePermission('view_inventory'), async (req, res, next) => {
    try {
      const items = await prisma.inventoryItem.findMany({
        where: { restaurantId: req.user!.restaurantId },
        orderBy: { name: 'asc' },
      });
      res.json(items.map(serializeInventoryItem));
    } catch (e) {
      next(e);
    }
  });

  router.post('/', requireAuth, requirePermission('manage_inventory'), async (req, res, next) => {
    try {
      const body = itemSchema.parse(req.body);
      const restaurantId = req.user!.restaurantId;

      const status = computeStatus(body.onHand, body.parLevel);
      const created = await prisma.inventoryItem.create({
        data: { ...body, restaurantId, status } as any,
      });
      res.status(201).json(serializeInventoryItem(created));
    } catch (e) {
      next(e);
    }
  });

  router.post('/bulk', requireAuth, requirePermission('manage_inventory'), async (req, res, next) => {
    try {
      const body = z.array(itemSchema).parse(req.body);
      const restaurantId = req.user!.restaurantId;
      if (body.length === 0) return res.json({ ok: true, created: 0 });

      await prisma.inventoryItem.createMany({
        data: body.map((it) => ({
          ...it,
          restaurantId,
          status: computeStatus(it.onHand, it.parLevel),
        })) as any,
        skipDuplicates: true,
      });
      res.json({ ok: true, created: body.length });
    } catch (e) {
      next(e);
    }
  });

  router.patch('/:id', requireAuth, requirePermission('manage_inventory'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const updates = z
        .object({
          name: z.string().min(1).optional(),
          sku: z.string().min(1).optional(),
          onHand: z.number().optional(),
          parLevel: z.number().optional(),
          unit: z.string().min(1).optional(),
          unitCost: z.number().nonnegative().optional(),
        })
        .parse(req.body);

      const current = await prisma.inventoryItem.findFirst({ where: { id, restaurantId: req.user!.restaurantId } });
      if (!current) throw new HttpError(404, 'Inventory item not found', { code: 'NOT_FOUND' });

      const onHand = updates.onHand ?? Number(current.onHand);
      const parLevel = updates.parLevel ?? Number(current.parLevel);
      const status = computeStatus(onHand, parLevel);

      const updated = await prisma.inventoryItem.update({
        where: { id },
        data: { ...updates, status } as any,
      });
      res.json(serializeInventoryItem(updated));
    } catch (e) {
      next(e);
    }
  });

  return router;
}


