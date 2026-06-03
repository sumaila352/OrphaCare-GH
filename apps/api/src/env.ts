const WEAK_SECRETS = new Set(['dev-secret-change-me', 'change-me', 'secret']);

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function validateEnv(): void {
  const jwt = process.env.JWT_SECRET?.trim() ?? '';
  const db = process.env.DATABASE_URL?.trim() ?? '';
  const client = process.env.CLIENT_URL?.trim() ?? '';

  if (!jwt) {
    throw new Error('JWT_SECRET is required in apps/api/.env');
  }

  if (isProduction()) {
    if (jwt.length < 32 || WEAK_SECRETS.has(jwt)) {
      throw new Error('JWT_SECRET must be at least 32 characters and not a default value in production');
    }
    if (db.startsWith('file:')) {
      throw new Error('Use a PostgreSQL DATABASE_URL in production (not file: SQLite)');
    }
    if (!db.startsWith('postgresql://') && !db.startsWith('postgres://')) {
      throw new Error('DATABASE_URL must be a PostgreSQL connection string in production');
    }
    if (!client) {
      throw new Error('CLIENT_URL is required in production (your public web app URL)');
    }
  }
}

export function getCorsOrigins(): string[] {
  const raw = process.env.CLIENT_URL ?? 'http://localhost:3000';
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}
