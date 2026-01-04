import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { HttpError } from '../../utils/httpError.js';

const tableSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  capacity: z.number().int().min(1),
  status: z.enum(['vacant', 'seated', 'served', 'cleaning']),
  section: z.string().min(1).optional().nullable(),
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
        // Get existing table IDs
        const existingTables = await tx.table.findMany({
          where: { restaurantId },
          select: { id: true },
        });
        const existingIds = new Set(existingTables.map(t => t.id));
        const incomingIds = new Set(body.map(t => t.id));

        // Delete tables that are not in the incoming list
        const toDelete = Array.from(existingIds).filter(id => !incomingIds.has(id));
        if (toDelete.length > 0) {
          await tx.table.deleteMany({
            where: { id: { in: toDelete }, restaurantId },
          });
        }

        // Upsert all tables (create or update)
        for (const table of body) {
          await tx.table.upsert({
            where: { id: table.id },
            update: {
              label: table.label,
              capacity: table.capacity,
              status: table.status,
              section: table.section ?? null,
              serverId: table.serverId ?? null,
              currentOrderId: table.currentOrderId ?? null,
              x: table.x ?? null,
              y: table.y ?? null,
            },
            create: {
              ...table,
              restaurantId,
              section: table.section ?? null,
              serverId: table.serverId ?? null,
              currentOrderId: table.currentOrderId ?? null,
              x: table.x ?? null,
              y: table.y ?? null,
            },
          });
        }
      });

      const tables = await prisma.table.findMany({ where: { restaurantId }, orderBy: { label: 'asc' } });
      res.json(tables);
    } catch (e) {
      next(e);
    }
  });

  // Update individual table (status, label, capacity, etc.)
  router.patch('/:id', requireAuth, requirePermission('manage_tables'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const body = z
        .object({
          label: z.string().min(1).optional(),
          capacity: z.number().int().min(1).optional(),
          status: z.enum(['vacant', 'seated', 'served', 'cleaning']).optional(),
          section: z.string().min(1).optional().nullable(),
          serverId: z.string().min(1).optional().nullable(),
          currentOrderId: z.string().min(1).optional().nullable(),
          x: z.number().int().optional().nullable(),
          y: z.number().int().optional().nullable(),
        })
        .parse(req.body);

      const existing = await prisma.table.findFirst({
        where: { id, restaurantId: req.user!.restaurantId },
      });
      if (!existing) {
        throw new HttpError(404, 'Table not found', { code: 'NOT_FOUND' });
      }

      const updated = await prisma.table.update({
        where: { id },
        data: {
          ...(body.label !== undefined && { label: body.label }),
          ...(body.capacity !== undefined && { capacity: body.capacity }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.section !== undefined && { section: body.section ?? null }),
          ...(body.serverId !== undefined && { serverId: body.serverId ?? null }),
          ...(body.currentOrderId !== undefined && { currentOrderId: body.currentOrderId ?? null }),
          ...(body.x !== undefined && { x: body.x ?? null }),
          ...(body.y !== undefined && { y: body.y ?? null }),
        },
      });

      res.json({
        id: updated.id,
        label: updated.label,
        capacity: updated.capacity,
        status: updated.status,
        section: updated.section ?? undefined,
        serverId: updated.serverId ?? undefined,
        currentOrderId: updated.currentOrderId ?? undefined,
        x: updated.x ?? undefined,
        y: updated.y ?? undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}


