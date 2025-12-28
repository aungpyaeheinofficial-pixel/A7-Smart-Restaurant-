import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';

export function restaurantRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const restaurant = await prisma.restaurant.findUnique({ where: { id: req.user!.restaurantId } });
      res.json(restaurant);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/', requireAuth, requirePermission('manage_restaurant'), async (req, res, next) => {
    try {
      const updates = z
        .object({
          name: z.string().min(1).optional(),
          timezone: z.string().min(1).optional(),
          currency: z.string().min(1).optional(),
          email: z.string().email().optional(),
          phone: z.string().min(1).optional(),
          address: z.string().min(1).optional(),
        })
        .parse(req.body);

      const restaurant = await prisma.restaurant.update({
        where: { id: req.user!.restaurantId },
        data: updates,
      });
      res.json(restaurant);
    } catch (e) {
      next(e);
    }
  });

  return router;
}


