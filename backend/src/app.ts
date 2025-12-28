import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import pino from 'pino';
import cookieParser from 'cookie-parser';
import { routes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { getEnv } from './env.js';

export function createApp() {
  const env = getEnv();

  const app = express();

  const logger = pino({
    level: env.NODE_ENV === 'production' ? 'info' : 'debug',
    redact: ['req.headers.authorization'],
  });

  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cookieParser());
  app.use(
    cors({
      origin: (origin, cb) => {
        // Allow non-browser clients (curl/postman) without origin.
        if (!origin) return cb(null, true);
        const allowList = env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
        // Support wildcard for quick setups (e.g. no domain yet)
        if (allowList.includes('*')) return cb(null, true);
        if (allowList.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(
    pinoHttp({
      logger,
      quietReqLogger: env.NODE_ENV === 'production',
    })
  );

  app.use(routes());

  // Not found
  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
  });

  // Error handler must be last
  app.use(errorHandler);

  return app;
}


