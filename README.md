# Visora

> GEO visibility tool for indie hackers and small SaaS — get cited by ChatGPT, Perplexity, and Claude.

**Live:** [visoraapp.com](https://visoraapp.com) · [dashboard.visoraapp.com](https://dashboard.visoraapp.com)

---

## What it does

Visora scans AI search engines to measure how often your brand appears in responses, scores your GEO visibility across 4 dimensions, and tells you exactly what to fix.

**Pricing:** Builder $29/mo · Growth $79/mo (competitors start at $99+)

---

## Stack

| Layer | Tech |
|-------|------|
| Landing | Static HTML, GitHub Pages |
| Dashboard | Next.js 14, Supabase Auth, Vercel |
| Backend API | Node.js + Express, VPS (pm2 + nginx) |
| AI Scanning | OpenRouter API |
| Payments | Creem |
| Database | Supabase (PostgreSQL) |

---

## Local dev

```bash
# Backend (port 3001)
cd mvp && npm install && npm run dev

# Dashboard (port 3002)
cd dashboard && npm install && npm run dev
```

Copy `mvp/.env.example` → `mvp/.env` and fill in keys.

---

## Project docs

For session continuity and detailed context, see [`project_context.md`](./project_context.md).
