@AGENTS.md

# Oura Dashboard

Multi-bruger health dashboard for Oura Ring. Brugere logger ind med OAuth2 og ser kun egne data.

## Tech stack

- **Next.js 16** (App Router) — kræver Node.js >=22
- **NextAuth v5** (Auth.js beta) med custom Oura OAuth2 provider
- **Prisma 7** — kræver `@prisma/adapter-pg`, URL sættes IKKE i schema.prisma men i `prisma.config.ts`
- **PostgreSQL** (Railway plugin i produktion, lokal Postgres til dev)
- **Recharts** til alle grafer
- **Tailwind CSS v4**

## Vigtige afvigelser fra standard Next.js

- `proxy.ts` bruges i stedet for `middleware.ts` (renamed i Next.js 16)
- Prisma 7 genererer client til `src/generated/prisma/client` — import derfra, ikke fra `@prisma/client`
- Prisma 7 kræver adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`

## Projektstruktur

```
src/
├── app/
│   ├── page.tsx                    # Landing/login side
│   ├── auth/[...nextauth]/route.ts # NextAuth handler
│   ├── dashboard/                  # Alle dashboard sider (protected)
│   │   ├── page.tsx                # Overblik
│   │   ├── sleep/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── readiness/page.tsx
│   │   ├── heart-rate/page.tsx
│   │   └── compare/page.tsx
│   └── api/oura/                   # API routes (sleep, activity, readiness, heart-rate)
├── components/
│   ├── charts/                     # Recharts komponenter
│   └── ui/                         # Sidebar, ScoreCard, PeriodSelector
├── lib/
│   ├── auth.ts                     # NextAuth config + Oura OAuth2 provider
│   ├── prisma.ts                   # Prisma client singleton med pg adapter
│   ├── utils.ts                    # Dato-hjælpere, scoreColor, formatDuration
│   └── oura/
│       ├── client.ts               # OuraClient (token refresh + pagination + cache)
│       └── types.ts                # TypeScript interfaces for Oura API responses
└── proxy.ts                        # Route protection (erstatter middleware.ts)
```

## Oura API

- Base URL: `https://api.ouraring.com/v2/usercollection/`
- OAuth2 authorize: `https://cloud.ouraring.com/oauth/authorize`
- Token: `https://api.ouraring.com/oauth/token`
- Scopes: `email personal daily heartrate workout tag session spo2`
- Pagination via `next_token` cursor — `OuraClient.fetchAll()` håndterer dette automatisk
- Token refresh: proaktiv (5 min før udløb) + reaktiv (ved 401)

## Environment variables

| Variabel | Beskrivelse |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Tilfældig 32-byte streng (`openssl rand -base64 32`) |
| `NEXTAUTH_URL` | App URL (f.eks. `https://oura-dashboard-production-eb60.up.railway.app`) |
| `OURA_CLIENT_ID` | Fra cloud.ouraring.com/oauth/applications |
| `OURA_CLIENT_SECRET` | Fra cloud.ouraring.com/oauth/applications |

## Deployment (Railway)

- Hosted på: https://oura-dashboard-production-eb60.up.railway.app
- GitHub repo: https://github.com/ReimerDK/oura-dashboard
- Start command: `npx prisma migrate deploy && node .next/standalone/server.js`
- `NIXPACKS_NODE_VERSION=22` er sat i Railway env vars

## Lokal udvikling

```bash
# Kræver lokal Postgres
# Start Postgres (f.eks. med Docker):
docker run -p 5432:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=oura_dashboard postgres

# Sæt credentials i .env (se .env.example)
# Kør migrations:
npx prisma migrate dev

# Start dev server:
npm run dev
```
