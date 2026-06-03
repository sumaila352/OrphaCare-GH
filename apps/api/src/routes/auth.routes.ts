import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { createHash, randomBytes } from 'crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { ensureDonorForUser } from '../lib/donor.js';
import { signToken } from '../lib/jwt.js';
import { isGoogleAuthConfigured, verifyGoogleCredential } from '../lib/googleAuth.js';
import { findOrCreateUserFromGoogle } from '../lib/googleUser.js';
import type { AuthedRequest } from '../middleware/auth.js';
import { requireAuth } from '../middleware/auth.js';
import { isProduction } from '../env.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2).max(120),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

authRouter.post('/login', async (req, res, next) => {
  try {
    const { email: rawEmail, password } = loginSchema.parse(req.body);
    const email = rawEmail.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email },
      include: { roles: { include: { role: true } } },
    });

    if (!user || user.status !== 'active') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: 'This account uses Google sign-in. Continue with Google.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.slug),
    });

    return res.json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.slug),
      },
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/google', async (req, res, next) => {
  try {
    if (!isGoogleAuthConfigured()) {
      return res.status(503).json({ error: 'Google sign-in is not configured' });
    }

    const { credential } = z.object({ credential: z.string().min(10) }).parse(req.body);
    const profile = await verifyGoogleCredential(credential);
    const user = await findOrCreateUserFromGoogle(profile);

    const token = signToken({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return res.json({ token, user });
  } catch (e) {
    if (e instanceof Error && e.message.includes('Google')) {
      return res.status(401).json({ error: e.message });
    }
    return next(e);
  }
});

authRouter.post('/register', async (req, res, next) => {
  try {
    const { fullName, email: rawEmail, password } = registerSchema.parse(req.body);
    const email = rawEmail.trim().toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already exists' });

    const donorRole = await prisma.role.findUnique({ where: { slug: 'donor' } });
    if (!donorRole) return res.status(500).json({ error: 'Donor role missing. Run seed.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        roles: { create: [{ roleId: donorRole.id }] },
      },
      include: { roles: { include: { role: true } } },
    });

    await ensureDonorForUser(user.id, user.fullName, user.email);

    const token = signToken({
      sub: user.id,
      email: user.email,
      roles: user.roles.map((ur) => ur.role.slug),
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        roles: user.roles.map((ur) => ur.role.slug),
      },
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.sub },
    include: { roles: { include: { role: true } } },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  return res.json({
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    roles: user.roles.map((ur) => ur.role.slug),
  });
});

authRouter.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    let resetUrl: string | null = null;
    if (user) {
      const token = randomBytes(32).toString('hex');
      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token: createHash('sha256').update(token).digest('hex'),
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
      resetUrl = `${process.env.CLIENT_URL ?? 'http://localhost:3000'}/reset-password?token=${token}`;
    }

    return res.json({
      message: 'If the email exists, a reset link has been generated.',
      ...(!isProduction() && resetUrl ? { resetUrl } : {}),
    });
  } catch (e) {
    return next(e);
  }
});

authRouter.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = z
      .object({ token: z.string().min(10), password: z.string().min(8) })
      .parse(req.body);

    const row = await prisma.passwordReset.findFirst({
      where: {
        token: createHash('sha256').update(token).digest('hex'),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { id: 'desc' },
    });

    if (!row) return res.status(400).json({ error: 'Invalid or expired reset link' });

    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.$transaction([
      prisma.user.update({ where: { id: row.userId }, data: { passwordHash } }),
      prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
    ]);

    return res.json({ message: 'Password updated. You can log in now.' });
  } catch (e) {
    return next(e);
  }
});
