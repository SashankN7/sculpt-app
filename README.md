# Sculpt

**AI hair grooming platform** — upload a photo, answer a short questionnaire, and get ranked hairstyle recommendations with barber-ready cutting specs.

**[Live app →](https://v0-sculpt-app.vercel.app)**

Built with Next.js 16 (App Router), TypeScript, Supabase, and the OpenAI API. Mobile-first, deployed on Vercel.

---

## What it does

1. **Analyze** — a user photo goes to GPT-4o Vision, which returns face shape, hair texture, and density signals. Users who skip the photo fall back to questionnaire-only inference, so the flow never dead-ends.
2. **Score** — a weighted engine ranks all 100 styles in the catalog against the user's profile.
3. **Recommend** — top matches are returned with a compatibility score, a written rationale, and a **barber card**: cutting metrics for top / sides / boundary, styling protocols, and warnings to hand to a barber.
4. **Extras** — style chat, Google Trends–informed trend scoring, PDF export, daily grooming tips, and gamification.

## The recommendation engine

`lib/recommendation-engine.ts` scores every style on five weighted criteria:

| Criterion | Weight |
|---|---|
| Physical compatibility (face shape, texture, density) | 40% |
| Maintenance match | 15% |
| Boldness alignment | 15% |
| Professionalism | 15% |
| Trend alignment | 15% |

Scores are normalized to a 45–98 range, with a trending bonus of up to 8 points. The final set is diversified across categories — a candidate must clear a compatibility floor of 50 to be surfaced, so the app declines to force a bad match rather than filling slots.

The catalog (`lib/hairstyle-db.ts`) holds 100 entries, each typed with face-shape and texture compatibility, maintenance and styling effort, professionalism and trendiness ratings, barber difficulty, density thresholds, and the barber-card spec.

## Architecture

```
app/api/
  analyze/          GPT-4o Vision facial analysis
  recommend/        scoring + ranking
  barber-card/      cutting specs for a chosen style
  chat/             styling Q&A
  trends/           Google Trends signal
  checkout/         Stripe Checkout session
  webhooks/stripe/  subscription lifecycle
  config/  health/
lib/                engine, catalog, rate limiting, Supabase clients, PDF export
middleware.ts       auth session refresh + global per-IP rate limit
supabase/migrations/
```

**Rate limiting** runs at two layers. `middleware.ts` applies an in-memory sliding window keyed by IP, with a periodic sweep so the map can't grow unbounded. Per-user limits are persisted in Supabase and enforced per endpoint, with tiered ceilings for free, trial, and premium accounts. If the database layer is unreachable the app degrades to the in-memory limiter rather than failing the request.

**Data** lives in Supabase Postgres with Row-Level Security on every table — `user_profiles`, `user_data`, `scan_usage`, and `grooming_tips` — so a user's rows are unreachable from another user's session. Privileged paths use the service-role client server-side only.

**Payments** use Stripe Checkout with a webhook driving subscription state. Without Stripe keys configured, checkout runs in simulation mode so the app stays usable locally.

## Running locally

```bash
git clone https://github.com/SashankN7/sculpt-app.git
cd sculpt-app
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Public client key (RLS-protected) |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | Server-side privileged client — never expose |
| `OPENAI_API_KEY` | for photo analysis | Falls back to questionnaire inference if unset |
| `STRIPE_SECRET_KEY` | for payments | Checkout is simulated if unset |
| `STRIPE_WEBHOOK_SECRET` | for payments | Verifies webhook signatures |
| `STRIPE_PRICE_ID_MONTHLY` / `_ANNUAL` | for payments | Stripe price IDs |
| `REPLICATE_API_TOKEN` | for previews | Haircut previews use fallback mode if unset |
| `NEXT_PUBLIC_APP_URL` | yes | Stripe redirects and OAuth callbacks |

Apply the SQL in `supabase/migrations/` to your Supabase project before first run.

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind + Radix UI · Framer Motion · Supabase (Postgres, Auth, RLS) · OpenAI · Stripe · PostHog · Vercel
