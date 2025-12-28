## A7 Restaurant OS Backend

Production-oriented Node.js + TypeScript API intended to be hosted on a DigitalOcean VPS and managed by **PM2**.

### Local dev

```bash
cd backend
npm install
```

#### Option A: Run Postgres via Docker

```bash
docker compose up -d
```

#### Option B: Use your own Postgres

Set `DATABASE_URL` in your environment.

#### Run migrations + seed + start

```bash
cd backend
# set env vars (examples)
# DATABASE_URL=postgresql://a7:a7password@127.0.0.1:5432/a7_restaurant
# JWT_SECRET=change-me-please-change-me-please
# PORT=7500
# CORS_ORIGIN=http://localhost:3401

npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run dev
```

### API

- `GET /healthz`
- `POST /api/v1/auth/login` → returns `{ token, user }`
- `GET /api/v1/auth/me` (Bearer token)
- `GET/PATCH /api/v1/restaurant`
- `GET/PATCH /api/v1/settings`
- `GET /api/v1/menu`
- `POST /api/v1/menu/categories`
- `PATCH /api/v1/menu/items/:id`
- `GET/POST/PATCH /api/v1/inventory` (+ `POST /api/v1/inventory/bulk`)
- `GET/POST/PATCH /api/v1/staff` (+ `POST /api/v1/staff/:id/clock`)
- `GET/POST /api/v1/orders` (+ `PATCH /api/v1/orders/:id/status`)

### Build + run (prod)

```bash
cd backend
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run build
node dist/index.js
```

### PM2 (recommended on VPS)

```bash
cd backend
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run build
pm2 start ecosystem.config.cjs --env production
pm2 logs a7-backend
pm2 save
```

### Env vars

See `backend/env.example`.

**No domain yet?** Set `CORS_ORIGIN="*"` temporarily, or set it to `http://YOUR_SERVER_PUBLIC_IP`.

### DigitalOcean VPS deploy workflow (git pull)

On the VPS:

```bash
cd /var/www/A7-Smart-Restaurant-/backend
git pull
npm ci
npm run db:generate
npm run db:migrate:deploy
npm run build
pm2 start ecosystem.config.cjs --env production || pm2 restart a7-backend
pm2 save
```


