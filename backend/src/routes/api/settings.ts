import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { serializeSettings } from '../../utils/serialize.js';

export function settingsRoutes(): Router {
  const router = createRouter();

  router.get('/', requireAuth, async (req, res, next) => {
    try {
      const settings = await prisma.systemSettings.findFirst({
        where: { restaurantId: req.user!.restaurantId },
      });
      res.json(settings ? serializeSettings(settings) : null);
    } catch (e) {
      next(e);
    }
  });

  router.patch('/', requireAuth, requirePermission('manage_settings'), async (req, res, next) => {
    try {
      const updates = z
        .object({
          taxRate: z.number().min(0).max(1).optional(), // stored as fraction in frontend menu items; settings UI shows percent but we normalize on frontend later
          currencySymbol: z.string().min(1).optional(),
          autoClockOut: z.boolean().optional(),
          pinLength: z.number().int().min(4).max(6).optional(),
          primaryColor: z.string().min(1).optional(),
          enableKitchenAudio: z.boolean().optional(),
          kdsRefreshRate: z.number().int().min(1).max(120).optional(),
        })
        .parse(req.body);

      const existing = await prisma.systemSettings.findFirst({ where: { restaurantId: req.user!.restaurantId } });
      if (!existing) {
        const created = await prisma.systemSettings.create({
          data: {
            id: `settings-${Date.now()}`,
            restaurantId: req.user!.restaurantId,
            taxRate: updates.taxRate ?? 0.08,
            currencySymbol: updates.currencySymbol ?? '$',
            autoClockOut: updates.autoClockOut ?? true,
            pinLength: updates.pinLength ?? 4,
            primaryColor: updates.primaryColor ?? '#E63946',
            enableKitchenAudio: updates.enableKitchenAudio ?? true,
            kdsRefreshRate: updates.kdsRefreshRate ?? 5,
          },
        });
        return res.json(serializeSettings(created));
      }

      const updated = await prisma.systemSettings.update({
        where: { id: existing.id },
        data: updates,
      });
      res.json(serializeSettings(updated));
    } catch (e) {
      next(e);
    }
  });

  return router;
}


