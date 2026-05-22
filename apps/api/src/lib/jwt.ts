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
  return jwt.verify(token, secret) as AuthTokenPayload;
}
