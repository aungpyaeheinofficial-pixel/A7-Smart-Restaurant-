# Backend Structure Prompt - Reusable Template

Use this prompt to create a production-ready Node.js + TypeScript + Express + Prisma + PostgreSQL backend for any system.

## Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod
- **Logging**: Pino
- **Security**: Helmet, CORS
- **Process Manager**: PM2 (production)

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup (CORS, middleware, routes)
│   ├── index.ts               # Server entry point
│   ├── env.ts                 # Environment variable validation (Zod)
│   ├── db/
│   │   └── prisma.ts          # Prisma client singleton
│   ├── auth/
│   │   └── jwt.ts             # JWT sign/verify utilities
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware (requireAuth, requirePermission)
│   │   └── errorHandler.ts    # Global error handler
│   ├── routes/
│   │   ├── index.ts           # Main router (combines all routes)
│   │   ├── health.ts           # Health check endpoint
│   │   └── api/
│   │       ├── auth.ts        # Authentication routes (login, /me)
│   │       ├── [resource].ts  # Resource CRUD routes
│   │       └── ...
│   └── utils/
│       └── httpError.ts       # Custom HTTP error class
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.mjs               # Database seed script
│   └── migrations/            # Prisma migrations
├── dist/                      # Compiled TypeScript output
├── ecosystem.config.cjs        # PM2 configuration
├── env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md

```

## Key Patterns & Conventions

### 1. Environment Variables (env.ts)

```typescript
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${msg}`);
  }
  return parsed.data;
}
```

### 2. Express App Setup (app.ts)

```typescript
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
        if (!origin) return cb(null, true);
        const allowList = env.CORS_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);
        if (allowList.includes('*')) return cb(null, true);
        if (allowList.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
      },
      credentials: true,
    })
  );

  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger, quietReqLogger: env.NODE_ENV === 'production' }));

  app.use(routes());

  app.use((_req, res) => {
    res.status(404).json({ error: { message: 'Not found', code: 'NOT_FOUND' } });
  });

  app.use(errorHandler);

  return app;
}
```

### 3. Authentication Middleware (middleware/auth.ts)

```typescript
import type { RequestHandler } from 'express';
import { verifyToken } from '../auth/jwt.js';
import { HttpError } from '../utils/httpError.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      staffId: string;
      role: string;
      restaurantId: string;
    };
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new HttpError(401, 'Unauthorized', { code: 'UNAUTHORIZED' });
  }
  const token = authHeader.slice(7);
  try {
    const payload = verifyToken(token);
    req.user = {
      staffId: payload.sub,
      role: payload.role,
      restaurantId: payload.restaurantId,
    };
    next();
  } catch {
    throw new HttpError(401, 'Unauthorized', { code: 'UNAUTHORIZED' });
  }
};

export const requirePermission = (permission: string): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      throw new HttpError(401, 'Unauthorized', { code: 'UNAUTHORIZED' });
    }
    // Implement your permission logic here
    // For now, just check if user exists
    next();
  };
};
```

### 4. Error Handler (middleware/errorHandler.ts)

```typescript
import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HttpError } from '../utils/httpError.js';

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.issues,
      },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      error: {
        message: err.message,
        code: err.code ?? 'HTTP_ERROR',
        details: err.details,
      },
    });
  }

  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : (err?.message ?? 'Internal server error');
  
  return res.status(500).json({
    error: {
      message,
      code: 'INTERNAL_ERROR',
    },
  });
};
```

### 5. Route Pattern (routes/api/[resource].ts)

```typescript
import type { Router } from 'express';
import { Router as createRouter } from 'express';
import { z } from 'zod';
import { prisma } from '../../db/prisma.js';
import { HttpError } from '../../utils/httpError.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';

export function resourceRoutes(): Router {
  const router = createRouter();

  // GET /api/v1/resource
  router.get('/', requireAuth, requirePermission('view_resource'), async (req, res, next) => {
    try {
      const items = await prisma.resource.findMany({
        where: { restaurantId: req.user!.restaurantId },
      });
      res.json(items);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/v1/resource
  router.post('/', requireAuth, requirePermission('manage_resource'), async (req, res, next) => {
    try {
      const body = z.object({
        name: z.string().min(1),
        // ... other fields
      }).parse(req.body);

      const item = await prisma.resource.create({
        data: {
          ...body,
          restaurantId: req.user!.restaurantId,
        },
      });
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  });

  // PATCH /api/v1/resource/:id
  router.patch('/:id', requireAuth, requirePermission('manage_resource'), async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = z.object({
        name: z.string().min(1).optional(),
        // ... other optional fields
      }).parse(req.body);

      const item = await prisma.resource.update({
        where: { id, restaurantId: req.user!.restaurantId },
        data: body,
      });
      res.json(item);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
```

### 6. JWT Utilities (auth/jwt.ts)

```typescript
import jwt from 'jsonwebtoken';
import { getEnv } from '../env.js';

export interface TokenPayload {
  sub: string; // user ID
  role: string;
  restaurantId: string;
}

export function signToken(payload: TokenPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
```

### 7. Prisma Setup (db/prisma.ts)

```typescript
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

## Package.json Scripts

```json
{
  "scripts": {
    "dev": "node --env-file=env.local --watch --watch-path=src --loader ts-node/esm src/index.ts",
    "postinstall": "prisma generate",
    "prebuild": "prisma generate",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "node prisma/seed.mjs"
  }
}
```

## Environment Variables (env.example)

```env
# Server
NODE_ENV=production
PORT=7500

# CORS
# Comma-separated list. Use "*" temporarily if you don't have a domain yet.
CORS_ORIGIN=*

# Auth
JWT_SECRET=change-me-please-change-me-please-use-a-long-random-string

# Database
DATABASE_URL=postgresql://user:password@127.0.0.1:5432/database_name

# Optional: seed admin password (defaults to "password")
SEED_ADMIN_PASSWORD=password
```

## PM2 Configuration (ecosystem.config.cjs)

```javascript
module.exports = {
  apps: [
    {
      name: 'app-backend',
      script: './dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_restarts: 10,
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 7500,
        CORS_ORIGIN: 'http://localhost:3000',
        DATABASE_URL: 'postgresql://user:password@127.0.0.1:5432/database_name',
        JWT_SECRET: 'change-me-please-change-me-please'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 7500,
        // IMPORTANT: Set these on the server environment instead of hardcoding
        // - DATABASE_URL
        // - JWT_SECRET
        // - CORS_ORIGIN
      }
    }
  ]
};
```

## Deployment Workflow

### Local Development

```bash
cd backend
npm install
export DATABASE_URL="postgresql://user:password@127.0.0.1:5432/database_name"
export JWT_SECRET="your-secret"
npm run db:generate
npm run db:migrate:dev
npm run db:seed
npm run dev
```

### Production (VPS)

```bash
cd /path/to/backend
git pull
npm ci
export DATABASE_URL="postgresql://user:password@127.0.0.1:5432/database_name"
export JWT_SECRET="your-secret"
export CORS_ORIGIN="*"
npm run db:generate
npm run db:migrate:deploy
npm run build
pm2 start ecosystem.config.cjs --env production --update-env
pm2 save
```

## Nginx Proxy Configuration

```nginx
server {
    listen 3401;
    server_name your_domain_or_ip;

    root /usr/share/nginx/html;
    index index.html;

    # API proxy - forward /api requests to backend
    location /api {
        proxy_pass http://127.0.0.1:7500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend routes
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Key Features

1. **Type Safety**: Full TypeScript with Zod validation
2. **Security**: Helmet, CORS, JWT authentication, bcrypt password hashing
3. **Error Handling**: Centralized error handler with proper HTTP status codes
4. **Logging**: Structured logging with Pino
5. **Database**: Prisma ORM with migrations
6. **Production Ready**: PM2 process management, environment validation
7. **Scalable**: Modular route structure, middleware pattern

## Extending the Backend

1. **Add a new resource**:
   - Create `routes/api/[resource].ts` following the pattern above
   - Add route to `routes/index.ts`
   - Create Prisma model in `schema.prisma`
   - Run `npm run db:migrate:dev`

2. **Add authentication**:
   - Use `requireAuth` middleware for protected routes
   - Use `requirePermission(permission)` for role-based access

3. **Add validation**:
   - Use Zod schemas in route handlers
   - Errors are automatically handled by errorHandler

4. **Add logging**:
   - Use `req.log` (from pino-http) in route handlers
   - Example: `req.log.info({ userId: req.user?.staffId }, 'Action performed')`

## Common Patterns

- **Multi-tenant**: Filter by `restaurantId` (or your tenant field) in all queries
- **Soft deletes**: Add `deletedAt` field and filter in Prisma queries
- **Pagination**: Use `skip` and `take` in Prisma queries
- **Search**: Use Prisma's `contains` or full-text search
- **File uploads**: Use `multer` middleware, store paths in database

---

**Copy this entire document and adapt it for your new project!**

