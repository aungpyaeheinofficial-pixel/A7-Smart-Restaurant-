import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { healthRoutes } from './health.js';
import { authRoutes } from './api/auth.js';
import { restaurantRoutes } from './api/restaurant.js';
import { settingsRoutes } from './api/settings.js';
import { menuRoutes } from './api/menu.js';
import { ordersRoutes } from './api/orders.js';
import { tablesRoutes } from './api/tables.js';
import { inventoryRoutes } from './api/inventory.js';
import { staffRoutes } from './api/staff.js';

export function routes(): Router {
  const router = createRouter();

  router.use(healthRoutes());

  router.use('/api/v1/auth', authRoutes());
  router.use('/api/v1/restaurant', restaurantRoutes());
  router.use('/api/v1/settings', settingsRoutes());
  router.use('/api/v1/menu', menuRoutes());
  router.use('/api/v1/orders', ordersRoutes());
  router.use('/api/v1/tables', tablesRoutes());
  router.use('/api/v1/inventory', inventoryRoutes());
  router.use('/api/v1/staff', staffRoutes());

  return router;
}


