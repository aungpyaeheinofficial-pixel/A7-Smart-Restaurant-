import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../../db/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { signToken } from '../../auth/jwt.js';
import { requireAuth } from '../../middleware/auth.js';

export function authRoutes(): Router {
  const router = createRouter();

  router.post('/login', async (req, res, next) => {
    try {
      const body = z
        .object({
          email: z.string().email(),
          password: z.string().min(1),
        })
        .parse(req.body);

      const staff = await prisma.staffMember.findFirst({
        where: { email: body.email },
      });
      if (!staff || !staff.passwordHash) {
        throw new HttpError(401, 'Invalid credentials', { code: 'UNAUTHORIZED' });
      }

      const ok = await bcrypt.compare(body.password, staff.passwordHash);
      if (!ok) throw new HttpError(401, 'Invalid credentials', { code: 'UNAUTHORIZED' });

      const token = signToken({ sub: staff.id, role: staff.role, restaurantId: staff.restaurantId });
      res.json({
        token,
        user: {
          id: staff.id,
          name: staff.name,
          role: staff.role,
          restaurantId: staff.restaurantId,
        },
      });
    } catch (err) {
      next(err);
    }
  });

  router.get('/me', requireAuth, async (req, res, next) => {
    try {
      const staff = await prisma.staffMember.findUnique({ where: { id: req.user!.staffId } });
      if (!staff) throw new HttpError(401, 'Unauthorized', { code: 'UNAUTHORIZED' });
      res.json({
        id: staff.id,
        name: staff.name,
        role: staff.role,
        restaurantId: staff.restaurantId,
      });
    } catch (err) {
      next(err);
    }
  });

  return router;
}


