# 🌿 Plant Pal

A shared plant watering tracker. You and a friend see the same plants in real time.

---

## Setup (takes ~15 minutes)

### Step 1 — Supabase (database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. "plantpal"), set a password, choose a region close to you
3. Wait ~2 minutes for it to provision
4. Go to **SQL Editor** → **New Query**, paste the contents of `supabase_schema.sql`, and click **Run**
5. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon public** key (long string under "Project API keys")

### Step 2 — Configure the app

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3 — Run locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) — the app should load and ask for your name.

### Step 4 — Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Push this project to a GitHub repo:

```bash
git init
git add .
git commit -m "Initial commit"
gh repo create plantpal --public --push
# or manually create a repo on github.com and follow the push instructions
```

3. In Vercel: **Add New Project** → import your `plantpal` repo
4. Under **Environment Variables**, add both `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY`
5. Click **Deploy**

Vercel gives you a URL like `plantpal.vercel.app`. Share that with your friend — that's it!

---

## Sharing with your friend

Just send them the Vercel URL. They open it, enter their name, and you're both connected to the same garden. When either of you waters a plant, it appears in real time for both of you.

---

## Features

- Add plants with emoji, color, watering frequency, and notes
- One-tap watering log with your name
- Overdue / due soon / happy status indicators
- Full watering history per plant
- Real-time sync (no refresh needed)
- Works great on iPhone — use Safari → Share → Add to Home Screen

---

## Project structure

```
src/
  App.js                  # Main app, routing, Supabase queries
  supabaseClient.js       # Supabase connection
  index.css               # Global styles
  components/
    PlantCard.js          # Plant row with status bar
    PlantDetail.js        # Detail view + watering history
    AddPlant.js           # Add plant form
    Settings.js           # Name + share link
    Onboarding.js         # First-time name entry
    Toast.js              # Notification popup
supabase_schema.sql       # Run this once in Supabase SQL editor
```
