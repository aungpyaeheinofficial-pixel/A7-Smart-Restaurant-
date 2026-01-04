import type { RequestHandler } from 'express';
import { HttpError } from '../utils/httpError.js';
import { verifyToken } from '../auth/jwt.js';
import { hasPermission, type Permission, type StaffRole } from '../auth/rolePermissions.js';
import { withRestaurantContext } from '../db/prisma.js';

declare global {
  // eslint-disable-next-line no-var
  var __A7_AUTH__: undefined;
}

export type AuthedUser = {
  staffId: string;
  role: StaffRole;
  restaurantId: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthedUser;
  }
}

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.header('authorization');
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing Authorization header', { code: 'UNAUTHORIZED' }));
  }
  const token = header.slice('Bearer '.length).trim();
  try {
    const payload = verifyToken(token);
    req.user = {
      staffId: payload.sub,
      role: payload.role as StaffRole,
      restaurantId: payload.restaurantId,
    };
    
    // Set restaurantId in async context for automatic Prisma filtering
    // All Prisma queries in this request will automatically filter by restaurantId
    return withRestaurantContext(payload.restaurantId, () => {
      next();
    });
  } catch {
    return next(new HttpError(401, 'Invalid token', { code: 'UNAUTHORIZED' }));
  }
};

export function requirePermission(permission: Permission): RequestHandler {
  return (req, _res, next) => {
    if (!req.user) return next(new HttpError(401, 'Unauthorized', { code: 'UNAUTHORIZED' }));
    if (!hasPermission(req.user.role, permission)) {
      return next(
        new HttpError(403, 'Forbidden', {
          code: 'FORBIDDEN',
          details: { required: permission, role: req.user.role },
        })
      );
    }
    return next();
  };
}


