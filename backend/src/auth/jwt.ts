import jwt from 'jsonwebtoken';
import { getEnv } from '../env.js';

export interface AuthTokenPayload {
  sub: string; // staffId
  role: string;
  restaurantId: string;
}

export function signToken(payload: AuthTokenPayload): string {
  const env = getEnv();
  return jwt.sign(payload, env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): AuthTokenPayload {
  const env = getEnv();
  return jwt.verify(token, env.JWT_SECRET!) as AuthTokenPayload;
}


