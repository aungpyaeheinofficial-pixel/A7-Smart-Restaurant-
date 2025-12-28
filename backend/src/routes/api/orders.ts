import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { HttpError } from '../../utils/httpError.js';

const orderItemSchema = z.object({
  id: z.string().min(1),
  menuItemId: z.string().min(1),
  name: z.string().min(1),
  qty: z.number().int().min(1),
  unitPrice: z.number().nonnegative(),
  modifiers: z.any().optional(),
  notes: z.string().optional(),
});

const createOrderSchema = z.object({
  id: z.string().min(1),
  orderNumber: z.string().min(1),
  type: z.enum(['dine-in', 'takeout', 'delivery']),
  tableId: z.string().optional(),
  status: z.enum(['pending', 'preparing', 'ready', 'served', 'paid']),
  items: z.array(orderItemSchema).min(1),
  subtotal: z.number().nonnegative(),
  tax: z.number().nonnegative(),
  tip: z.number().nonnegative(),
  total: z.number().nonnegative(),
  createdAt: z.string().datetime().optional(),
});

export function ordersRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, requirePermission('view_orders'), async (req, res, next) => {
    try {
      const orders = await prisma.order.findMany({
        where: { restaurantId: req.user!.restaurantId },
        include: { items: true },
        orderBy: { createdAt: 'desc' },
      });

      // Match frontend shape (createdAt as Date-ish string is fine for new Date())
      res.json(
        orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          type: o.type === 'dine_in' ? 'dine-in' : o.type,
          tableId: o.tableId ?? undefined,
          status: o.status,
          items: o.items.map((it) => ({
            id: it.id,
            menuItemId: it.menuItemId,
            name: it.name,
            qty: it.qty,
            unitPrice: Number(it.unitPrice),
            modifiers: it.modifiers ?? undefined,
            notes: it.notes ?? undefined,
          })),
          subtotal: Number(o.subtotal),
          tax: Number(o.tax),
          tip: Number(o.tip),
          total: Number(o.total),
          createdAt: o.createdAt.toISOString(),
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  router.post('/', requireAuth, requirePermission('create_order'), async (req, res, next) => {
    try {
      const body = createOrderSchema.parse(req.body);
      const restaurantId = req.user!.restaurantId;

      const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

      const order = await prisma.$transaction(async (tx) => {
        const created = await tx.order.create({
          data: {
            id: body.id,
            restaurantId,
            orderNumber: body.orderNumber,
            type: body.type === 'dine-in' ? 'dine_in' : body.type,
            tableId: body.tableId ?? null,
            status: body.status,
            subtotal: body.subtotal,
            tax: body.tax,
            tip: body.tip,
            total: body.total,
            createdAt,
            items: {
              create: body.items.map((it) => ({
                id: it.id,
                menuItemId: it.menuItemId,
                name: it.name,
                qty: it.qty,
                unitPrice: it.unitPrice,
                modifiers: it.modifiers ?? undefined,
                notes: it.notes ?? undefined,
              })),
            },
          } as any,
          include: { items: true },
        });

        if (body.tableId) {
          // Seat table and link current order
          await tx.table.update({
            where: { id: body.tableId },
            data: { status: 'seated', currentOrderId: created.id },
          });
        }

        return created;
      });

      res.status(201).json({
        id: order.id,
        orderNumber: order.orderNumber,
        type: order.type === 'dine_in' ? 'dine-in' : order.type,
        tableId: order.tableId ?? undefined,
        status: order.status,
        items: order.items.map((it) => ({
          id: it.id,
          menuItemId: it.menuItemId,
          name: it.name,
          qty: it.qty,
          unitPrice: Number(it.unitPrice),
          modifiers: it.modifiers ?? undefined,
          notes: it.notes ?? undefined,
        })),
        subtotal: Number(order.subtotal),
        tax: Number(order.tax),
        tip: Number(order.tip),
        total: Number(order.total),
        createdAt: order.createdAt.toISOString(),
      });
    } catch (e) {
      next(e);
    }
  });

  router.patch('/:id/status', requireAuth, requirePermission('manage_orders'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const body = z.object({ status: z.enum(['pending', 'preparing', 'ready', 'served', 'paid']) }).parse(req.body);

      const order = await prisma.order.findFirst({ where: { id, restaurantId: req.user!.restaurantId } });
      if (!order) throw new HttpError(404, 'Order not found', { code: 'NOT_FOUND' });

      await prisma.$transaction(async (tx) => {
        await tx.order.update({ where: { id }, data: { status: body.status } });

        if (order.tableId) {
          if (body.status === 'served') {
            await tx.table.update({ where: { id: order.tableId }, data: { status: 'served' } });
          }
          if (body.status === 'paid') {
            await tx.table.update({ where: { id: order.tableId }, data: { status: 'cleaning', currentOrderId: null } });
          }
        }
      });

      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  });

  return router;
}


