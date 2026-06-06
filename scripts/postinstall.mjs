import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

if (process.env.VERCEL) {
  console.log('postinstall: skipping API Prisma generate on Vercel (web-only deploy)');
  process.exit(0);
}

execSync('npm run db:generate -w apps/api', { cwd: root, stdio: 'inherit' });
