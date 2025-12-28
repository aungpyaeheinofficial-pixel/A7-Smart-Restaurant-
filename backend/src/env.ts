import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(7500),
  CORS_ORIGIN: z.string().default('http://localhost:3401'),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16).optional(),
});

export type Env = z.infer<typeof envSchema>;

export function getEnv(): Env {
  // `dotenv` is optional; in production on a VPS you typically set env vars in systemd/pm2 ecosystem.
  // But if you want to load from a file locally, you can still use Node's `--env-file`.
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Invalid environment:\n${msg}`);
  }
  const env = parsed.data;

  // Hard requirements for a real backend.
  if (!env.DATABASE_URL) {
    throw new Error('Missing DATABASE_URL (required to connect to Postgres)');
  }
  if (!env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET (required for auth tokens)');
  }
  return env;
}


