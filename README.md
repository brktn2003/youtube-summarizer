# YouTube Summarizer

Next.js app that pulls **public YouTube captions**, sends the transcript to **Google Gemini**, and returns a short summary with bullet points and timestamp highlights. Usage limits and saved summaries are stored in **Supabase**.

## Setup

1. **Environment variables** — copy `.env.local.example` to `.env.local` and fill in:

   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase project
   - `GEMINI_API_KEY` — [Google AI Studio](https://aistudio.google.com/apikey)
   - Optional: `NEXT_PUBLIC_CONTACT_EMAIL` (mailto for Pro inquiries), `NEXT_PUBLIC_GITHUB_REPO_URL` (footer link)

2. **Database** — run `supabase/schema.sql` in the Supabase SQL editor (tables, RLS, profile trigger).

3. **Auth redirects** — in Supabase → Authentication → URL configuration, set **Site URL** to your app origin (e.g. `http://localhost:3000` in development) and add the same under **Redirect URLs**, including `http://localhost:3000/api/auth/callback` (and your production callback URL).

4. **Run locally** — Node.js **v20.9+** (required by Next.js 16), then:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How it works

- **Guests**: up to **2** summaries total (tracked by a browser fingerprint in `localStorage`).
- **Signed-in** (`profiles.plan = 'free'`): **5** summaries per calendar day.
- **Pro** (`profiles.plan = 'pro'` in Supabase): unlimited in app logic; Pro is assigned manually in the database or via your own billing.

The summarize API resolves the user from the **session cookie**, not from the request body, so clients cannot impersonate another account by sending a fake `userId`.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Development server |
| `npm run build`| Production build   |
| `npm start`    | Run production     |
| `npm run lint` | ESLint             |

## Stack

Next.js 16, React 19, Tailwind CSS 4, `@google/generative-ai`, `youtube-transcript`, Supabase Auth + Postgres.
