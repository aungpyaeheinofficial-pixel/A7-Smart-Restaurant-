import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { HttpError } from '../../utils/httpError.js';

export function staffRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, requirePermission('view_staff'), async (req, res, next) => {
    try {
      const staff = await prisma.staffMember.findMany({
        where: { restaurantId: req.user!.restaurantId },
        orderBy: { name: 'asc' },
      });
      res.json(
        staff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          isActive: s.isActive,
          avatar: s.avatar,
          lastClockIn: s.lastClockIn ? s.lastClockIn.toISOString() : undefined,
        }))
      );
    } catch (e) {
      next(e);
    }
  });

  router.post('/', requireAuth, requirePermission('manage_staff'), async (req, res, next) => {
    try {
      const body = z
        .object({
          id: z.string().min(1).optional(),
          name: z.string().min(1),
          role: z.enum(['Manager', 'Server', 'Kitchen', 'Cashier']),
          avatar: z.string().min(1),
          email: z.string().email().optional(),
          password: z.string().min(6).optional(),
        })
        .parse(req.body);

      const passwordHash = body.password ? await bcrypt.hash(body.password, 10) : undefined;

      const created = await prisma.staffMember.create({
        data: {
          id: body.id ?? `staff-${Date.now()}`,
          restaurantId: req.user!.restaurantId,
          name: body.name,
          role: body.role,
          avatar: body.avatar,
          email: body.email,
          passwordHash,
          isActive: false,
        },
      });

      res.status(201).json({
        id: created.id,
        name: created.name,
        role: created.role,
        isActive: created.isActive,
        avatar: created.avatar,
        lastClockIn: created.lastClockIn ? created.lastClockIn.toISOString() : undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  router.patch('/:id', requireAuth, requirePermission('manage_staff'), async (req, res, next) => {
    try {
      const id = req.params.id;
      const body = z
        .object({
          name: z.string().min(1).optional(),
          role: z.enum(['Manager', 'Server', 'Kitchen', 'Cashier']).optional(),
          avatar: z.string().min(1).optional(),
          email: z.string().email().optional().nullable(),
          password: z.string().min(6).optional().nullable(),
        })
        .parse(req.body);

      const existing = await prisma.staffMember.findFirst({ where: { id, restaurantId: req.user!.restaurantId } });
      if (!existing) throw new HttpError(404, 'Staff member not found', { code: 'NOT_FOUND' });

      const passwordHash =
        body.password === undefined ? undefined : body.password === null ? null : await bcrypt.hash(body.password, 10);

      const updated = await prisma.staffMember.update({
        where: { id },
        data: {
          name: body.name,
          role: body.role,
          avatar: body.avatar,
          email: body.email === undefined ? undefined : body.email,
          passwordHash,
        } as any,
      });

      res.json({
        id: updated.id,
        name: updated.name,
        role: updated.role,
        isActive: updated.isActive,
        avatar: updated.avatar,
        lastClockIn: updated.lastClockIn ? updated.lastClockIn.toISOString() : undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  // Toggle clock in/out.
  router.post('/:id/clock', requireAuth, async (req, res, next) => {
    try {
      const id = req.params.id;

      // Same rule as frontend: manager can clock anyone; otherwise only self.
      const isSelf = req.user!.staffId === id;
      const canManage = req.user!.role === 'Manager';
      if (!isSelf && !canManage) throw new HttpError(403, 'Forbidden', { code: 'FORBIDDEN' });

      const existing = await prisma.staffMember.findFirst({ where: { id, restaurantId: req.user!.restaurantId } });
      if (!existing) throw new HttpError(404, 'Staff member not found', { code: 'NOT_FOUND' });

      const nextActive = !existing.isActive;
      const updated = await prisma.staffMember.update({
        where: { id },
        data: {
          isActive: nextActive,
          lastClockIn: nextActive ? new Date() : existing.lastClockIn,
        },
      });

      res.json({
        id: updated.id,
        isActive: updated.isActive,
        lastClockIn: updated.lastClockIn ? updated.lastClockIn.toISOString() : undefined,
      });
    } catch (e) {
      next(e);
    }
  });

  return router;
}


