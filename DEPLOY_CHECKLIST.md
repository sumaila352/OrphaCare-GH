# Deploy checklist — OrphaCare GH

Use this **in order** with the full guide in [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## Before you deploy

- [ ] Code works locally (`npm run dev`)
- [ ] Production builds pass:
  ```powershell
  npm run build -w apps/api
  npm run build -w apps/web
  ```
- [ ] **No secrets in Git** — `.env` and `.env.local` are gitignored
- [ ] **Rotate secrets** used in dev/chat (Cloudinary, Paystack, Neon password) before going live
- [ ] Generate production **JWT_SECRET** (32+ chars) — see [DEPLOYMENT.md](./DEPLOYMENT.md#2-jwt-secret-required)
- [ ] Push latest code to **GitHub** (`main` branch)

---

## Step 1 — Render: PostgreSQL

- [ ] Render → **New +** → **PostgreSQL** → name `orphacare-db`
- [ ] Note the **Internal Database URL** (for the API service)

---

## Step 2 — Render: API

- [ ] **New +** → **Web Service** → connect GitHub repo
- [ ] Build: `npm install --include=dev && npm run build:production -w apps/api`
- [ ] Start: `npm run start -w apps/api`
- [ ] Health check: `/health`
- [ ] Set environment variables (Render dashboard):

| Variable | Value |
|----------|--------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | From Render Postgres (link DB to service) |
| `JWT_SECRET` | New random 32+ char string |
| `CLIENT_URL` | *Set after Vercel — placeholder OK for first deploy* |
| `CLOUDINARY_CLOUD_NAME` | From Cloudinary |
| `CLOUDINARY_API_KEY` | From Cloudinary |
| `CLOUDINARY_API_SECRET` | From Cloudinary |
| `GOOGLE_CLIENT_ID` | Same as local OAuth client |
| `PAYSTACK_SECRET_KEY` | `sk_live_...` (or `sk_test_...` for staging) |
| `PAYSTACK_PUBLIC_KEY` | `pk_live_...` (or `pk_test_...`) |
| `SEED_ADMIN_EMAIL` | Your production admin email |
| `SEED_ADMIN_PASSWORD` | Strong password (remove after seed) |

- [ ] Deploy → open `https://YOUR-API.onrender.com/health` → expect `{"ok":true,"db":"up"}`

---

## Step 3 — Render: Seed admin (one time)

- [ ] Render → API service → **Shell**
- [ ] Run: `npm run db:seed -w apps/api`
- [ ] Remove `SEED_ADMIN_PASSWORD` from Render env after seed (optional but recommended)

---

## Step 4 — Vercel: Web

- [ ] [vercel.com](https://vercel.com) → **Add Project** → import same GitHub repo
- [ ] **Before Deploy:** click **Edit** next to **Root Directory** → enter **`apps/web`**
  - If Root Directory is empty, Vercel looks at the repo root and fails with *“No Next.js version detected”*
  - You should see **Next.js** detected after setting `apps/web`
- [ ] Leave Build Command / Output as **defaults** (Next.js auto-detect)
- [ ] Environment variables:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-API.onrender.com` (no trailing `/`) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same as `GOOGLE_CLIENT_ID` on Render |
| `NEXT_PUBLIC_SHOW_DEMO_HINT` | `false` |

- [ ] Deploy → copy production URL (e.g. `https://orphacare-gh.vercel.app`)

---

## Step 5 — Connect web ↔ API

- [ ] Render → API → **Environment** → set `CLIENT_URL` to exact Vercel URL (no trailing `/`)
- [ ] **Redeploy API**
- [ ] Google Cloud → OAuth client → add Vercel URL to **Authorized JavaScript origins**
- [ ] Paystack → Webhook URL: `https://YOUR-API.onrender.com/api/webhooks/paystack`

---

## Step 6 — Verify production

| Test | URL / action |
|------|----------------|
| API health | `GET .../health` |
| Home page stats | Vercel `/` |
| Admin login | Vercel `/login` |
| Donor register | Vercel `/register` |
| Google sign-in | Login / register |
| Online donate | `/donate` → Pay online |
| Child photo upload | Admin → children (Cloudinary) |

---

## Custom domain (optional)

- [ ] Vercel → Domains → add your domain
- [ ] Update `CLIENT_URL` on Render to `https://yourdomain.com`
- [ ] Add `https://yourdomain.com` to Google OAuth origins
- [ ] Redeploy API

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Build fails at `tsc` / `command sh -c tsc` | Build Command must be `npm install --include=dev && npm run build:production -w apps/api` (see below) |
| Login works locally, not on Vercel | Check `NEXT_PUBLIC_API_URL` and `CLIENT_URL` match exact https URLs |
| CORS error | `CLIENT_URL` must match browser address bar exactly |
| Google button missing | Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` on **Vercel**, redeploy web |
| Google `origin_mismatch` | Add Vercel URL to Google OAuth JavaScript origins |
| API cold start ~30s | Render free tier — first request wakes the service |
| Paystack not confirming | Webhook URL + live/test keys must match same Paystack mode |
