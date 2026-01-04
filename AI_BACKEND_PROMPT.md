# AI Prompt: Generate Production-Ready Backend Structure

Copy and paste this prompt to any AI assistant to generate a complete backend structure for your system.

---

## Prompt

Create a production-ready Node.js + TypeScript backend API with the following specifications:

### Tech Stack Requirements:
- **Runtime**: Node.js 20+
- **Language**: TypeScript with strict mode
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Zod for request/response validation
- **Logging**: Pino for structured logging
- **Security**: Helmet for security headers, CORS configuration
- **Process Manager**: PM2 configuration for production

### Project Structure:
```
backend/
├── src/
│   ├── app.ts                 # Express app setup (middleware, CORS, routes)
│   ├── index.ts               # Server entry point (listens on port)
│   ├── env.ts                 # Environment variable validation using Zod
│   ├── db/
│   │   └── prisma.ts          # Prisma client singleton export
│   ├── auth/
│   │   └── jwt.ts             # JWT sign/verify utilities
│   ├── middleware/
│   │   ├── auth.ts            # Authentication middleware (requireAuth, requirePermission)
│   │   └── errorHandler.ts    # Global error handler middleware
│   ├── routes/
│   │   ├── index.ts           # Main router (combines all route modules)
│   │   ├── health.ts           # Health check endpoint (/healthz)
│   │   └── api/
│   │       ├── auth.ts        # Auth routes (POST /login, GET /me)
│   │       └── [resources].ts # CRUD routes for each resource
│   └── utils/
│       └── httpError.ts       # Custom HTTP error class
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.mjs               # Database seed script
│   └── migrations/            # Prisma migration files
├── dist/                      # Compiled TypeScript output
├── ecosystem.config.cjs        # PM2 process manager config
├── env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

### Key Requirements:

1. **Environment Variables** (`src/env.ts`):
   - Use Zod schema for validation
   - Required: `NODE_ENV`, `PORT`, `CORS_ORIGIN`, `DATABASE_URL`, `JWT_SECRET`
   - Throw descriptive errors if validation fails
   - Export typed `Env` type and `getEnv()` function

2. **Express App Setup** (`src/app.ts`):
   - Disable `x-powered-by` header
   - Use Helmet for security
   - Configure CORS (support wildcard `*` for development)
   - JSON body parser (1MB limit)
   - Pino HTTP logging middleware
   - Mount all routes
   - 404 handler
   - Global error handler (must be last)

3. **Authentication** (`src/auth/jwt.ts`):
   - `signToken(payload)` - signs JWT with 7-day expiration
   - `verifyToken(token)` - verifies and returns payload
   - Payload interface: `{ sub: string, role: string, [custom fields] }`

4. **Authentication Middleware** (`src/middleware/auth.ts`):
   - `requireAuth` - validates Bearer token, attaches `user` to `req`
   - `requirePermission(permission)` - checks user permissions
   - Extend Express Request type to include `user` property
   - Return 401 with proper error format on failure

5. **Error Handler** (`src/middleware/errorHandler.ts`):
   - Handle Zod validation errors (400 status)
   - Handle custom HttpError instances
   - Handle unknown errors (500 status)
   - Hide error details in production
   - Return consistent error format: `{ error: { message, code, details? } }`

6. **Route Pattern** (for each resource in `src/routes/api/`):
   - GET `/api/v1/[resource]` - list all (with auth + permission check)
   - GET `/api/v1/[resource]/:id` - get one
   - POST `/api/v1/[resource]` - create (with Zod validation)
   - PATCH `/api/v1/[resource]/:id` - update (with Zod validation)
   - DELETE `/api/v1/[resource]/:id` - delete (optional)
   - All routes use `requireAuth` and appropriate `requirePermission`
   - Use try/catch, call `next(err)` on errors
   - Filter by tenant/user context when applicable

7. **Auth Routes** (`src/routes/api/auth.ts`):
   - POST `/api/v1/auth/login` - accepts `{ email, password }`, returns `{ token, user }`
   - GET `/api/v1/auth/me` - returns current user (requires auth)
   - Hash passwords with bcrypt (10 rounds)
   - Return 401 for invalid credentials

8. **Health Check** (`src/routes/health.ts`):
   - GET `/healthz` - returns `{ ok: true, service: "name", time: ISO string }`
   - No authentication required

9. **Prisma Setup** (`src/db/prisma.ts`):
   - Export singleton PrismaClient instance
   - Configure logging based on NODE_ENV

10. **Package.json Scripts**:
    - `dev` - development with watch mode
    - `build` - compile TypeScript
    - `start` - run compiled code
    - `db:generate` - generate Prisma client
    - `db:migrate:dev` - create migration
    - `db:migrate:deploy` - apply migrations (production)
    - `db:seed` - run seed script
    - `postinstall` - auto-generate Prisma client

11. **PM2 Config** (`ecosystem.config.cjs`):
    - Development and production environments
    - Production env vars loaded from system environment (not hardcoded)
    - Auto-restart on crash
    - Fork mode, single instance

12. **Error Format**:
    - All errors return: `{ error: { message: string, code: string, details?: any } }`
    - Use appropriate HTTP status codes (400, 401, 403, 404, 500)

13. **Security**:
    - Never log sensitive data (passwords, tokens)
    - Use parameterized queries (Prisma handles this)
    - Validate all inputs with Zod
    - Hash passwords with bcrypt
    - Use strong JWT secrets (min 32 chars)

14. **Logging**:
    - Use Pino for structured logging
    - Log level: `info` in production, `debug` in development
    - Redact sensitive headers (authorization)
    - Log request/response with pino-http

### Database Schema Requirements:
- Use Prisma schema format
- Include User/Staff model with: `id`, `email`, `passwordHash`, `role`, `isActive`
- Include multi-tenant support (e.g., `organizationId` or `tenantId` field)
- Use appropriate field types (String, Int, Decimal, DateTime, Boolean, Json)
- Add indexes for foreign keys and frequently queried fields
- Use `@default(uuid())` for IDs
- Use `@updatedAt` for updated timestamps

### Seed Script Requirements:
- Create at least one admin user
- Use environment variable for admin password (default: "password")
- Hash passwords with bcrypt
- Create sample data for all resources
- Use `upsert` to allow re-running safely

### Additional Notes:
- All code should be fully typed (TypeScript strict mode)
- Use ES modules (`"type": "module"` in package.json)
- Follow RESTful API conventions
- Support multi-tenancy (filter by tenant ID in all queries)
- Include proper TypeScript types for all functions
- Use async/await, not callbacks
- Handle errors gracefully, never expose stack traces in production

### Output Format:
Generate the complete backend structure with:
1. All source files with full implementation
2. Prisma schema with appropriate models
3. Seed script with sample data
4. Configuration files (package.json, tsconfig.json, ecosystem.config.cjs, env.example)
5. README.md with setup and deployment instructions

Make the code production-ready, well-commented, and follow best practices for security, performance, and maintainability.

---

## Usage Instructions

1. **Copy the prompt above** (everything between the "## Prompt" markers)
2. **Replace `[resources]` and `[resource]`** with your actual resource names (e.g., `products`, `orders`, `users`)
3. **Specify your domain requirements** (e.g., "for an e-commerce system" or "for a task management app")
4. **Paste to your AI assistant** (ChatGPT, Claude, etc.)
5. **Review and customize** the generated code for your specific needs

## Example Modifications

Before pasting, you can customize:

- **Domain**: "for a restaurant management system" → "for a hospital management system"
- **Resources**: Replace with your entities (patients, appointments, medications, etc.)
- **Multi-tenancy**: Change `organizationId` to `hospitalId` or `companyId`
- **Permissions**: Specify your permission system (e.g., "doctor", "nurse", "admin")

---

**This prompt is generic and can be used for any backend system!**

