# CapTrack V2.0 — Production Setup Guide

Zero-to-live in 15 minutes. No backend knowledge required.

---

## What changed in V2.0

| Before (V1) | After (V2) |
|-------------|------------|
| Data trapped in one browser | Real-time sync across all devices |
| Hardcoded passwords | Supabase Auth with RLS security |
| `localStorage` only | PostgreSQL + live push to all clients |
| Localhost only | Hosted free on GitHub Pages |
| No backups | Automatic cloud persistence |

---

## Prerequisites

1. A **GitHub** account (free)
2. A **Supabase** account (free tier is enough forever for this app)

---

## Step 1 — Create the Supabase project

1. Go to [https://supabase.com](https://supabase.com) and sign up/log in.
2. Click **New project**.
3. Choose any organization name.
4. **Project name**: `captrack` (or anything you like).
5. **Database password**: generate a strong one, save it in a password manager.
6. **Region**: choose the closest to Bangladesh (e.g. `Southeast Asia (Singapore)`).
7. Click **Create new project** and wait ~2 minutes.

---

## Step 2 — Run the database schema

1. In your Supabase project dashboard, click **SQL Editor** (left sidebar).
2. Click **New query**.
3. Open the file `supabase/migrations/001_initial_schema.sql` from this repo.
4. Copy the **entire contents** and paste it into the SQL Editor.
5. Click **Run**.
6. You should see green checkmarks. If you see errors, refresh the page and try again — sometimes the first run times out.

> What this does: creates all tables, security policies, and enables live real-time channels.

---

## Step 3 — Get your API keys

1. In the Supabase dashboard, go to **Project Settings** (gear icon at bottom left).
2. Click **API** in the left menu.
3. Copy these two values:
   - **Project URL** — looks like `https://abcdefgh12345678.supabase.co`
   - **anon public** API key — starts with `eyJ...`
4. Keep this tab open — you need them in Step 5.

---

## Step 4 — Seed the database

This uploads all 5 teams, 30 students, tasks, files, and meetings into Supabase.

### Install Node.js (one time only)

If you don't have Node.js:
1. Go to [https://nodejs.org](https://nodejs.org)
2. Download the **LTS** version (the big green button on the left).
3. Install it with default settings.

### Run the seed script

Open your terminal / PowerShell in this project folder and run:

```bash
# 1. Install the Supabase JS client (one time)
npm install @supabase/supabase-js

# 2. Set your credentials as environment variables
# Windows PowerShell:
$env:SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# macOS / Linux / Git Bash:
export SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# 3. Run the seed
node scripts/seed-supabase.js
```

**Where do I get the Service Role Key?**
- In the same **API** settings page from Step 3, scroll down.
- Copy the **`service_role` secret** (NOT the `anon` key).
- This key is powerful — never share it publicly.

You should see output like:

```
🌱 Seeding CapTrack into Supabase...
  ✅ Team 01 + 6 members
  ✅ Team 02 + 6 members
  ...
  ✅ Auth user team01@captrack.local (team)
  ✅ Auth user supervisor@captrack.local (supervisor)
🎉 Seed complete.
```

---

## Step 5 — Wire the app to your Supabase project

Open `index.html` in any text editor (Notepad, VS Code, etc.).

Find these lines near the top:

```html
<script>
  window.CAPTRACK_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
  window.CAPTRACK_SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
</script>
```

Replace them with the real values from Step 3:

```html
<script>
  window.CAPTRACK_SUPABASE_URL = 'https://abcdefgh12345678.supabase.co';
  window.CAPTRACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIs...your-key...';
</script>
```

Save the file.

---

## Step 6 — Host on GitHub Pages (free, forever)

### Create the repo

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `captrack` (or anything)
3. **Visibility**: Public (required for free GitHub Pages)
4. Click **Create repository**.
5. On the next page, follow the **"…or push an existing repository from the command line"** instructions:

```bash
git init
git add .
git commit -m "CapTrack V2.0 production"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/captrack.git
git push -u origin main
```

### Enable GitHub Pages

1. In your GitHub repo, click **Settings**.
2. In the left sidebar, click **Pages**.
3. Under **Build and deployment** → **Source**, select **GitHub Actions**.
4. That's it — the workflow file `.github/workflows/deploy.yml` is already in this repo. The next push to `main` will auto-deploy.

### Check the live URL

- After the first push, go to **Actions** tab in your repo.
- Wait for the green checkmark (takes ~1 minute).
- Your site is live at: `https://YOUR_USERNAME.github.io/captrack/`

---

## Step 7 — For your non-technical teammate

Once the app is live, your teammate can edit data in two ways:

### Option A — Use the app directly (recommended for teams)
- Go to the live URL.
- Log in as any team.
- Add tasks, files, meetings — changes appear instantly for everyone else logged in.

### Option B — Use the Supabase Table Editor (recommended for quick edits)
1. Log into [https://supabase.com](https://supabase.com) → your project.
2. Click **Table Editor** (left sidebar).
3. Click any table: `tasks`, `files`, `comments`, `meetings`.
4. Double-click any cell to edit. Click **Save**.
5. Every browser with the app open receives the change in real time.

> **Security note**: The RLS policies ensure that even if someone guesses a table name, they can only read/write their own team's data. The supervisor account sees everything.

---

## Login credentials (pre-seeded)

| Role | Email | Password |
|------|-------|----------|
| Team 01 | `team01@captrack.local` | `capstone2026` |
| Team 02 | `team02@captrack.local` | `capstone2026` |
| Team 03 | `team03@captrack.local` | `capstone2026` |
| Team 04 | `team04@captrack.local` | `capstone2026` |
| Team 05 | `team05@captrack.local` | `capstone2026` |
| Supervisor | `supervisor@captrack.local` | `supervisor` |

---

## Security checklist

| Control | Status |
|---------|--------|
| HTTPS only | ✅ Enforced in `index.html` |
| Content Security Policy | ✅ Blocks external scripts except known CDNs |
| Row-Level Security (RLS) | ✅ Teams cannot read other teams' data |
| Auth required for DB writes | ✅ Every write is tied to a signed JWT |
| Input sanitization | ✅ React JSX auto-escapes; DOMPurify loaded as defense-in-depth |
| No secrets in client code | ✅ Only the `anon` key is public by design |
| Offline fallback | ✅ App works with `localStorage` if Supabase is unreachable |

---

## Troubleshooting

**"Supabase not configured" in browser console**
→ You forgot Step 5. Open `index.html` and paste your real `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

**Seed script says "Auth user already exists"**
→ Normal if you run the seed twice. Safe to ignore.

**GitHub Pages shows a 404**
→ Wait 1–2 minutes after the Actions run completes. Then hard-refresh (`Ctrl+Shift+R`).

**Realtime updates don't appear**
→ Check that you copied the **anon** key (not the service_role key) into `index.html`. Realtime requires the anon key.

---

## Cost

| Service | Cost |
|---------|------|
| Supabase free tier | $0 (500MB DB, 500K realtime messages/month) |
| GitHub Pages | $0 |
| **Total** | **$0** |

Your data volume (~1MB text) will never hit the free tier limits.

---

*CapTrack V2.0 · IUT IPE Capstone · Built for production, maintained by zero code.*
