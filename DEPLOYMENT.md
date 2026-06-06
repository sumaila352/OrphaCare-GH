# Production deployment: Render (API) + Vercel (Web)

This guide deploys **OrphaCare GH** as two services:

| Service | Host | What runs |
|---------|------|-----------|
| **API** | [Render](https://render.com) | Express + Prisma + PostgreSQL |
| **Web** | [Vercel](https://vercel.com) | Next.js (public site, admin, donor portal) |

**Do not paste secrets into chat, GitHub issues, or commit `.env` files.** Set them only in Render and Vercel dashboards (or a password manager).

**Quick checklist:** [DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) — tick boxes in order while deploying.

**Deploy order:** GitHub push → Render Postgres + API → seed admin → Vercel web → set `CLIENT_URL` → Google origins + Paystack webhook → verify.

## What you need before starting

Gather or create these **once** (checklist):

### 1. PostgreSQL database (required)

- **Option A (recommended):** Render → **New +** → **PostgreSQL** (same account as the API).
- **Option B:** [Neon](https://neon.tech), [Supabase](https://supabase.com), or any Postgres 14+ host.

You will get a connection string like:

```text
postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require
```

Render often provides `DATABASE_URL` automatically when you link the database to the web service.

### 2. JWT secret (required)

Generate a random string **at least 32 characters** (PowerShell example):

```powershell
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }) -as [byte[]])
```

Save it as `JWT_SECRET` — you cannot recover it from the app later.

### 3. Public URLs (required after first deploy)

| Variable | Where | Example |
|----------|--------|---------|
| Vercel site URL | Vercel → Project → Domains | `https://orphacare.vercel.app` |
| Render API URL | Render → Web Service → URL | `https://orphacare-api.onrender.com` |

- **`CLIENT_URL`** (Render) = exact Vercel URL(s), **no trailing slash**
- **`NEXT_PUBLIC_API_URL`** (Vercel) = exact Render API URL, **no trailing slash**

For Vercel **preview** deployments, add extra origins comma-separated:

```env
CLIENT_URL=https://orphacare.vercel.app,https://orphacare-git-main-youruser.vercel.app
```

### 4. Google sign-in (required for “Continue with Google”)

1. [Google Cloud Console](https://console.cloud.google.com/) → create/select a project  
2. **APIs & Services** → **OAuth consent screen** → External → add app name + support email  
3. **Credentials** → **Create credentials** → **OAuth client ID** → type **Web application**  
4. **Authorized JavaScript origins** (add each URL you use):
   - `http://localhost:3000`
   - `http://localhost:3001` (if Next uses 3001)
   - `https://YOUR-APP.vercel.app`
5. Copy the **Client ID** (not the secret — GIS uses public client ID only)

| Where | Variable | Value |
|-------|----------|--------|
| Render (API) | `GOOGLE_CLIENT_ID` | Same Client ID |
| Vercel (web) | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Client ID |

After changing the schema, run on Postgres: `npm run db:push:pg -w apps/api` (or redeploy API so `build:production` runs `db push`).

### 5. Cloudinary (required for child photo uploads)

From [Cloudinary Console](https://console.cloudinary.com) → Dashboard:

| Key | Env name |
|-----|----------|
| Cloud name | `CLOUDINARY_CLOUD_NAME` |
| API Key | `CLOUDINARY_API_KEY` |
| API Secret | `CLOUDINARY_API_SECRET` |

Optional: `CLOUDINARY_FOLDER=orphacare/children` (default).

If any of the three are missing, the API still runs; uploads will fail until configured.

### 6. Admin login (env-driven)

**Local (`apps/api/.env`):**

```env
SEED_ADMIN_EMAIL=admin@orphacare.local
SEED_ADMIN_PASSWORD=Admin@123
SEED_ADMIN_NAME=System Administrator
```

Run `npm run db:seed` after changing these.

**Production (Render):** set the same `SEED_ADMIN_*` keys for the one-time seed (see below). Do **not** put admin passwords in Vercel — `NEXT_PUBLIC_*` is visible in the browser bundle.

Set only for the **first** database seed on production:

| Variable | Example |
|----------|---------|
| `SEED_ADMIN_EMAIL` | `admin@yourorphanage.org` |
| `SEED_ADMIN_PASSWORD` | Strong password (12+ chars) |
| `SEED_ADMIN_NAME` | `System Administrator` (optional) |

**Never** set `SEED_DEMO_DATA=true` in production.

### 7. Vercel web env (required)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_SHOW_DEMO_HINT` | `false` |

---

## Step 1 — Push code to GitHub

Ensure the repo is on GitHub (e.g. `sumaila352/OrphaCare-GH`). Both Render and Vercel deploy from Git.

---

## Step 2 — Deploy API on Render

### 2a. PostgreSQL (if not created)

1. Render Dashboard → **New +** → **PostgreSQL**
2. Name: `orphacare-db` (or similar), region near your users
3. Copy **Internal Database URL** (for Render services) or **External** if API is elsewhere

### 2b. Web Service (API)

1. **New +** → **Web Service** → connect your GitHub repo
2. Settings:

| Setting | Value |
|---------|--------|
| **Name** | `orphacare-api` |
| **Region** | Same as database |
| **Branch** | `main` |
| **Root Directory** | *(leave empty — repo root)* |
| **Runtime** | Node |
| **Build Command** | `npm install --include=dev && npm run build:production -w apps/api` |
| **Start Command** | `npm run start -w apps/api` |
| **Health Check Path** | `/health` |

3. **Environment** → add variables:

| Key | Value |
|-----|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Postgres URL from step 2a (Render can link automatically) |
| `JWT_SECRET` | Your 32+ char secret |
| `JWT_EXPIRES_IN` | `7d` (optional) |
| `CLIENT_URL` | `https://YOUR-VERCEL-DOMAIN.vercel.app` *(update after Vercel deploy)* |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary |
| `CLOUDINARY_API_KEY` | From Cloudinary |
| `CLOUDINARY_API_SECRET` | From Cloudinary |
| `CLOUDINARY_FOLDER` | `orphacare/children` (optional) |
| `GOOGLE_CLIENT_ID` | OAuth Web client ID (same as Vercel) |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` from Paystack |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` from Paystack |
| `SEED_ADMIN_EMAIL` | Admin email for first seed |
| `SEED_ADMIN_PASSWORD` | Strong password (remove after seed) |

Render sets `PORT` automatically — do not override unless you know why.

**Build note:** Because `NODE_ENV=production` is set on Render, a plain `npm install` skips `devDependencies` (`typescript`, `prisma`, `@types/*`) and `tsc` fails. Always use `npm install --include=dev` in the **Build Command** (not needed at runtime).

4. Deploy and wait for build to finish. Open `https://YOUR-SERVICE.onrender.com/health` — expect `{"ok":true,"db":"up"}`.

### 2c. First-time database seed (one time)

After the first successful deploy with a working DB:

1. Render → your API service → **Shell** (or one-off **Job**)
2. Run:

```bash
cd /opt/render/project/src
SEED_ADMIN_EMAIL=admin@yourdomain.com SEED_ADMIN_PASSWORD='YourStrongPassword!' npm run db:seed -w apps/api
```

Or set `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` in Render env temporarily, run `npm run db:seed -w apps/api`, then remove `SEED_ADMIN_PASSWORD` from env.

3. Log in on the Vercel site with that admin email/password.

---

## Step 3 — Deploy Web on Vercel

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import the same GitHub repo
2. Settings:

| Setting | Value |
|---------|--------|
| **Framework Preset** | Next.js *(auto-detected after root dir is set)* |
| **Root Directory** | **`apps/web`** — click **Edit**, type `apps/web`, confirm |
| **Build Command** | *(default)* leave empty or `next build` |
| **Output** | *(default)* leave empty |

**Important:** If you see *“No Next.js version detected”*, Root Directory is wrong. It must be `apps/web`, not the repo root.

3. **Environment Variables** (Production + Preview recommended):

| Key | Value |
|-----|--------|
| `NEXT_PUBLIC_API_URL` | `https://orphacare-api.onrender.com` *(your Render URL)* |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as Render `GOOGLE_CLIENT_ID` |
| `NEXT_PUBLIC_SHOW_DEMO_HINT` | `false` |

4. Deploy. Copy the production URL (e.g. `https://orphacare-gh.vercel.app`).

5. Go back to **Render** → API → Environment → set `CLIENT_URL` to that exact URL → **Save & redeploy**.

6. Optional: Vercel → **Domains** → add custom domain; then update `CLIENT_URL` and redeploy API.

---

## Step 4 — Verify end-to-end

| Check | How |
|--------|-----|
| API health | `GET https://YOUR-API.onrender.com/health` |
| CORS / login | Open Vercel URL → `/login` → admin credentials |
| Public stats | Home page loads donation/children stats |
| Uploads | Admin → child photo (needs Cloudinary) |
| Donor signup | `/register` → `/my/donations` |
| Online donation | `/donate` → Pay online → Paystack test card/MoMo |

If login works on localhost but not Vercel:

- `NEXT_PUBLIC_API_URL` must match Render URL (https, no trailing `/`)
- `CLIENT_URL` on Render must match the browser address bar origin exactly
- Redeploy **both** after changing URLs

---

## Environment reference

### Render (`apps/api`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NODE_ENV` | Yes | `production` |
| `DATABASE_URL` | Yes | `postgresql://...` (not SQLite `file:`) |
| `JWT_SECRET` | Yes | 32+ chars, not `dev-secret-change-me` |
| `CLIENT_URL` | Yes | Vercel URL(s), comma-separated for previews |
| `PORT` | Auto | Set by Render |
| `JWT_EXPIRES_IN` | No | Default `7d` |
| `CLOUDINARY_*` | For photos | All three credentials |
| `SEED_ADMIN_EMAIL` | First seed | Remove password from env after seed |
| `SEED_ADMIN_PASSWORD` | First seed | Only for initial `db:seed` |
| `SEED_DEMO_DATA` | No | Must be unset or `false` in prod |
| `PAYSTACK_SECRET_KEY` | For online donations | `sk_live_...` from Paystack dashboard |
| `PAYSTACK_PUBLIC_KEY` | For online donations | `pk_live_...` (same account) |

### Paystack setup

1. Create an account at [Paystack](https://paystack.com) and complete business verification for live GHS payments.
2. **Settings → API Keys & Webhooks** — copy **Public** and **Secret** keys into Render (`PAYSTACK_PUBLIC_KEY`, `PAYSTACK_SECRET_KEY`).
3. **Webhook URL** (live): `https://YOUR-API.onrender.com/api/webhooks/paystack`
4. Enable events: `charge.success` and `charge.failed`.
5. For local testing, use **test keys** (`pk_test_`, `sk_test_`) and Paystack’s [test cards / MoMo](https://paystack.com/docs/payments/test-payments).

Donors use **Pay online (card / MoMo)** on `/donate`. Payments are verified via webhook and the `/api/me/payments/verify` endpoint after checkout.

### Vercel (`apps/web`)

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_API_URL` | Yes | Full Render API origin |
| `NEXT_PUBLIC_SHOW_DEMO_HINT` | No | `false` in production |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | For Google sign-in | Same as API `GOOGLE_CLIENT_ID` |

---

## Optional: `render.yaml` Blueprint

The repo includes `render.yaml` for Infrastructure-as-Code. On Render: **New +** → **Blueprint** → connect repo. You still must set secrets in the dashboard (JWT, Cloudinary, seed password).

---

## Production notes

- **Render free tier:** API sleeps after inactivity; first request may take ~30s (cold start).
- **HTTPS:** Both platforms provide TLS; always use `https://` in env URLs.
- **Rotate secrets** if they were ever shared in chat or screenshots.
- **Backups:** Enable automated backups on Render Postgres (paid plans) or your provider’s backup feature.
- **Email:** Password-reset links use `CLIENT_URL` but email sending is not implemented.
- **Paystack:** Requires `PAYSTACK_*` keys on the API and webhook URL pointing to `/api/webhooks/paystack`.

---

## Quick copy template (fill in locally — do not commit)

```env
# === RENDER (API) ===
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=
CLIENT_URL=https://....vercel.app
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
SEED_ADMIN_EMAIL=
SEED_ADMIN_PASSWORD=
PAYSTACK_SECRET_KEY=
PAYSTACK_PUBLIC_KEY=

# === VERCEL (WEB) ===
NEXT_PUBLIC_API_URL=https://....onrender.com
NEXT_PUBLIC_SHOW_DEMO_HINT=false
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
```

Keep this file on your machine only; enter values into Render/Vercel UI.
