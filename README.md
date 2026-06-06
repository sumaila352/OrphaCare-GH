# OrphaCare GH

Orphanage management platform for Ghana: public donor site, staff admin portal, and REST API.

## Stack

| Layer | Tech |
|--------|------|
| Web | Next.js 15, React 19, Bootstrap 5 |
| API | Express, Prisma, JWT |
| DB (dev) | SQLite (`apps/api/prisma/dev.db`) |
| DB (prod) | PostgreSQL |
| Media | Cloudinary |

## Local development

### Requirements

- Node.js 20+
- npm

### Setup

```powershell
cd "C:\Users\ISMAEL\OneDrive\Desktop\Orphanage System"
npm install
```

Copy environment files:

```powershell
copy apps\api\.env.example apps\api\.env
copy apps\web\.env.example apps\web\.env.local
```

Edit `apps/api/.env` (database, JWT, Cloudinary). Then:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

- **Web:** http://localhost:3000  
- **API:** http://localhost:4000  
- **Health:** http://localhost:4000/health  

### Default dev admin

| Email | Password |
|--------|----------|
| `admin@orphacare.local` | `Admin@123` |

## Production deployment (Render + Vercel)

**Step-by-step checklist:** [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)  
**Full guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

### 1. PostgreSQL database

Use a managed Postgres instance. Set in `apps/api/.env`:

```env
NODE_ENV=production
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/orphacare?sslmode=require
```

Apply schema (first deploy):

```powershell
npm run db:generate:pg -w apps/api
npm run db:push:pg -w apps/api
```

Or maintain Postgres migrations separately and use `prisma migrate deploy` with `schema.postgresql.prisma`.

### 2. API environment (`apps/api/.env`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | PostgreSQL URL |
| `JWT_SECRET` | Yes | 32+ random characters |
| `CLIENT_URL` | Yes | Public web URL, e.g. `https://orphacare.example.com` |
| `PORT` | No | Default `4000` |
| `CLOUDINARY_*` | For uploads | Child photos |

First-time seed (roles + admin only):

```powershell
set SEED_ADMIN_EMAIL=admin@yourdomain.com
set SEED_ADMIN_PASSWORD=YourStrongPassword
npm run db:seed -w apps/api
```

Do **not** set `SEED_DEMO_DATA=true` in production.

### 3. Web environment

Build with the public API URL:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 4. Build and run

```powershell
npm run build
npm run start
```

Run API and web as separate processes behind a reverse proxy (nginx, Caddy, Railway, Render, etc.).

- Proxy `/` → Next.js (port 3000)  
- Proxy `/api` → Express (port 4000) **or** set `NEXT_PUBLIC_API_URL` to the API host  

### 5. Security checklist

- [ ] Strong `JWT_SECRET` (never commit `.env`)
- [ ] HTTPS on web and API
- [ ] `CLIENT_URL` matches exact frontend origin
- [ ] Cloudinary keys in server env only
- [ ] Rotate any secrets exposed in chat or logs
- [ ] Disable demo seed data in production

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | API + web in development |
| `npm run build` | Production build both apps |
| `npm run start` | Run production builds |
| `npm run db:migrate` | SQLite migrations (dev) |
| `npm run db:seed` | Seed roles, admin, optional demo data |
| `npm run db:deploy` | Apply migrations (prod SQLite path) |

## Project structure

```
apps/api/     Express API, Prisma, SQLite/Postgres
apps/web/     Next.js public site + admin + donor portal
```

## License

Private — OrphaCare GH.
