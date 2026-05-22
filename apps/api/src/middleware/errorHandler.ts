import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Validation failed';
    return res.status(400).json({ error: message, details: err.flatten() });
  }
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
