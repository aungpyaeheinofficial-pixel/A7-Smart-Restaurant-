import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';

const tableSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  capacity: z.number().int().min(1),
  status: z.enum(['vacant', 'seated', 'served', 'cleaning']),
  serverId: z.string().min(1).optional().nullable(),
  currentOrderId: z.string().min(1).optional().nullable(),
  x: z.number().int().optional().nullable(),
  y: z.number().int().optional().nullable(),
});

export function tablesRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const tables = await prisma.table.findMany({ where: { restaurantId: req.user!.restaurantId }, orderBy: { label: 'asc' } });
      res.json(tables);
    } catch (e) {
      next(e);
    }
  });

  // Bulk replace tables (used by the floor plan editor)
  router.put('/', requireAuth, requirePermission('manage_tables'), async (req, res, next) => {
    try {
      const body = z.array(tableSchema).parse(req.body);
      const restaurantId = req.user!.restaurantId;

      await prisma.$transaction(async (tx) => {
        await tx.table.deleteMany({ where: { restaurantId } });
        if (body.length > 0) {
          await tx.table.createMany({
            data: body.map((t) => ({
              ...t,
              restaurantId,
              serverId: t.serverId ?? null,
              currentOrderId: t.currentOrderId ?? null,
              x: t.x ?? null,
              y: t.y ?? null,
            })),
          });
        }
      });

      const tables = await prisma.table.findMany({ where: { restaurantId }, orderBy: { label: 'asc' } });
      res.json(tables);
    } catch (e) {
      next(e);
    }
  });

  return router;
}


