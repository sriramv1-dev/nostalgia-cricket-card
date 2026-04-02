# DevOps Notes

## Vercel Deployment Configuration

### Root Directory Setting
When importing the GitHub repo into Vercel, set the **Root Directory** to `apps/web`. This tells Vercel where `package.json` lives.

In the Vercel project settings:
- **Root Directory:** `apps/web`
- **Framework Preset:** Next.js (auto-detected)
- **Build Command:** `npm run build` (default)
- **Output Directory:** `.next` (default)
- **Install Command:** `npm ci`

### Environment Variables in Vercel
Add these in Vercel project → Settings → Environment Variables:

| Variable | Environment | Notes |
|----------|-------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Production, Preview, Development | From Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production, Preview, Development | Public anon key (safe to expose) |
| `SUPABASE_SERVICE_ROLE_KEY` | None (local only) | NEVER add to Vercel — only for sync-job |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Production, Preview, Development | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Production, Preview | Server-side only |
| `CLOUDINARY_API_SECRET` | Production, Preview | Server-side only, treat as secret |

### Preview Deployments
Vercel auto-deploys every branch. Use Preview URLs for testing before merging to main.

---

## Environment Variables Checklist

### Local Development (`apps/web/.env.local`)
Copy from `.env.example` and fill in:
```bash
cp apps/web/.env.example apps/web/.env.local
```

Then edit `.env.local`:
1. Go to [app.supabase.com](https://app.supabase.com) → your project → Settings → API
2. Copy "Project URL" → `NEXT_PUBLIC_SUPABASE_URL`
3. Copy "anon public" key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Copy "service_role" key → `SUPABASE_SERVICE_ROLE_KEY` (local only!)
5. Go to [cloudinary.com](https://cloudinary.com) → Dashboard
6. Copy Cloud Name → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
7. Copy API Key → `CLOUDINARY_API_KEY`
8. Copy API Secret → `CLOUDINARY_API_SECRET`

### For sync-job (local only)
Create `sync-job/.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=<same as above>
SUPABASE_SERVICE_ROLE_KEY=<same as above>
```

---

## Supabase CLI Usage for Migrations

### Initial Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project (get project ref from Supabase dashboard URL)
supabase link --project-ref <your-project-ref>
```

### Running Migrations
```bash
# Push the migration to your Supabase project
supabase db push

# Or run just the seed after migration
supabase db seed
```

### Local Development with Supabase (optional)
```bash
# Start local Supabase (Docker required)
supabase start

# This gives you a local Postgres, Auth, Realtime, and Studio
# Local Studio runs at http://localhost:54323
```

### Migration Workflow
1. Make changes in `supabase/migrations/` (create a new numbered file)
2. Test locally with `supabase db reset` (resets and re-runs all migrations + seed)
3. Push to production with `supabase db push`

**Naming convention:** `NNN_description.sql` (e.g., `002_add_pack_history.sql`)

---

## Free Tier Monitoring Tips

### Supabase
- Dashboard → Project → Settings → Usage
- Watch: **Database size** (alert threshold: 400 MB of 500 MB free)
- Watch: **Bandwidth** (edge functions + REST API calls)
- Enable email alerts in Supabase dashboard for 80% thresholds

### Vercel
- Dashboard → Project → Analytics → Usage
- Watch: **Function invocations** (100 GB bandwidth on Hobby)
- Watch: **Build minutes** (6,000 min/month on Hobby)
- The CI workflow runs on GitHub Actions (not Vercel build), so builds on PRs don't consume Vercel minutes

### Cloudinary
- Dashboard → Usage
- Watch: **Transformations** (25 credits/month free)
- Watch: **Bandwidth** (25 GB/month free)
- Always append `f_auto,q_auto` to all Cloudinary image URLs to serve WebP/AVIF automatically

### GitHub Actions
- Settings → Actions → Usage
- Free tier: 2,000 minutes/month for public repos, 500 for private
- The CI job (lint + type-check) runs in ~1-2 minutes per push

---

## Useful Commands

```bash
# Start Next.js dev server
cd apps/web && npm run dev

# Type check without building
cd apps/web && npm run type-check

# Run linter
cd apps/web && npm run lint

# Run seed script (upsert cards)
cd sync-job && npx ts-node seed-cards.ts

# Reset Supabase local DB
supabase db reset

# Check Supabase migration status
supabase migration list
```

---

## Git Branching Strategy (Solo Dev)

Since this is solo, keep it simple:
- `main` — always deployable, Vercel auto-deploys
- `feat/[feature-name]` — feature branches, merge via PR
- The GitHub Actions CI runs on every PR to catch lint/type errors before merge
