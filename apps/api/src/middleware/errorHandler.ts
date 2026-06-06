import type { NextFunction, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { isProduction } from '../env.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const message = err.issues[0]?.message ?? 'Validation failed';
    return res.status(400).json({
      error: message,
      ...(isProduction() ? {} : { details: err.flatten() }),
    });
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'A record with this value already exists' });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Record not found' });
    }
  }

  if (err instanceof Error) {
    const clientError =
      /not configured|minimum|not successful|not found|not allowed|timed out|could not reach paystack|could not start paystack|verification failed|paid amount/i.test(
        err.message,
      );
    return res.status(clientError ? 400 : 502).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
