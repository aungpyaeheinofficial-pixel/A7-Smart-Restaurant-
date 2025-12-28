import type { Router } from 'express';
import { Router as createRouter } from 'express';

export function healthRoutes(): Router {
  const router = createRouter();

  router.get('/healthz', (_req, res) => {
    res.json({
      ok: true,
      service: 'a7-restaurant-os-backend',
      time: new Date().toISOString(),
    });
  });

  return router;
}


