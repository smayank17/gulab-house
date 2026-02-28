# Gulab House — Ordering Website

## 1) Local setup
1. Install deps:
   - `npm install`
2. Create `.env` from `.env.example` and fill values.
3. Prisma migrate + seed:
   - `npm run prisma:migrate`
   - `npm run prisma:seed`
4. Run dev:
   - `npm run dev`
5. Visit:
   - http://localhost:3000
   - Admin: http://localhost:3000/admin (Basic Auth)

## 2) Database
- Dev uses SQLite.
- Production recommended: Postgres.
  - Update `prisma/schema.prisma` datasource provider to `postgresql`.
  - Set `DATABASE_URL` accordingly.
  - Run migrations on deploy.

## 3) Email
- Uses Resend. Set:
  - `RESEND_API_KEY`
  - `EMAIL_FROM`
  - `OWNER_EMAIL`

## 4) Rate limiting
- Uses Upstash Redis REST.
- If env is not set, rate limiting is disabled (dev-friendly).
- For production, configure Upstash via Vercel integration and set env vars.

## 5) Cutoff rule
Orders must be placed by 6 PM (night before requested date).
- Client: date picker + messaging
- Server: validates; if invalid, auto-corrects to next available date