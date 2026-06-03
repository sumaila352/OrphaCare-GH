import jwt from 'jsonwebtoken';

export type AuthTokenPayload = {
  sub: number;
  email: string;
  roles: string[];
};

export function signToken(payload: AuthTokenPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === 'string' || !decoded || typeof decoded !== 'object') {
    throw new Error('Invalid token');
  }
  const p = decoded as jwt.JwtPayload & Partial<AuthTokenPayload>;
  if (typeof p.sub !== 'number' || typeof p.email !== 'string' || !Array.isArray(p.roles)) {
    throw new Error('Invalid token payload');
  }
  return { sub: p.sub, email: p.email, roles: p.roles as string[] };
}
