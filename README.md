# MOSI-OA TUNYA SOUTHERN AWARDS — Voting Platform

A professional online awards voting platform supporting paid nominee registration, public voting, sponsor applications, real-time vote counting, and a full admin dashboard.

---

## Quick Start (3 Steps)

### 1. Install dependencies
```bash
npm install
```

### 2. Start the development server
```bash
npm run dev
```

### 3. Open in browser
```
http://localhost:5173
```

> ✅ The `.env` file with live Supabase credentials is already included — no extra setup needed.

---

## Admin Access

- Go to `/admin` after logging in with an admin account
- First registered user: **topkuchalo@gmail.com** (already promoted to admin)

---

## Tech Stack

| Layer       | Technology                          |
|-------------|-------------------------------------|
| Frontend    | React 18 + TypeScript + Vite        |
| UI          | Tailwind CSS + shadcn/ui            |
| Backend     | Supabase (Auth, Database, Storage)  |
| Charts      | Recharts                            |
| Animations  | Framer Motion                       |
| Toasts      | Sonner                              |

---

## Build for Production

```bash
npm run build
```
Output goes to the `dist/` folder — deploy to Vercel, Netlify, or any static host.

---

## Key Pages

| Route                  | Description                          |
|------------------------|--------------------------------------|
| `/`                    | Home / Landing page                  |
| `/nominees`            | Browse all nominees                  |
| `/vote`                | Public voting page                   |
| `/register-nominee`    | Nominee registration (WhatsApp flow) |
| `/sponsors`            | Sponsors showcase                    |
| `/partners`            | Partners showcase                    |
| `/admin`               | Admin dashboard                      |
| `/admin/nominees`      | Manage nominees                      |
| `/admin/sponsors`      | Manage sponsors                      |
| `/admin/partners`      | Manage partners                      |
| `/admin/voters`        | Voter leaderboard                    |
| `/admin/payments`      | Payment management                   |
| `/admin/settings`      | Platform settings                    |
