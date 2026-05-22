import type { NextFunction, Request, Response } from 'express';
import { verifyToken, type AuthTokenPayload } from '../lib/jwt.js';

export type AuthedRequest = Request & { user?: AuthTokenPayload };

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    (header?.startsWith('Bearer ') ? header.slice(7) : null) ??
    (typeof req.cookies?.token === 'string' ? req.cookies.token : null);

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    req.user = verifyToken(token);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const allowed = req.user.roles.some((r) => roles.includes(r));
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}
