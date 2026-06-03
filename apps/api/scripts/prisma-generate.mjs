import { config } from 'dotenv';
import { execSync } from 'child_process';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(apiRoot, '.env') });

const url = (process.env.DATABASE_URL ?? '').trim();
const usePostgres = url.startsWith('postgresql://') || url.startsWith('postgres://');
const schema = usePostgres ? 'prisma/schema.postgresql.prisma' : 'prisma/schema.prisma';

console.log(`Prisma generate → ${schema} (${usePostgres ? 'PostgreSQL' : 'SQLite'})`);
execSync(`npx prisma generate --schema=${schema}`, { cwd: apiRoot, stdio: 'inherit' });
