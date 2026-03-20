# ⚡ snip.ly — URL Shortener with Analytics

A full-stack URL shortener with real-time click analytics, built with Node/Express, PostgreSQL, Redis, and React.

## Features

- **Link shortening** — generate a 6-char nanoid slug or set a custom one
- **Instant redirects** — Redis-first lookup keeps redirect latency under 20ms
- **Async click capture** — analytics never block the redirect path
- **Per-click analytics** — country (via geoip-lite), browser/OS/device (via ua-parser-js), referrer
- **Dashboard** — clicks over time, device split, top referrers, top country
- **JWT auth** — users only see and manage their own links
- **Rate limiting** — 30 req/15min on shorten, 10 req/15min on auth
- **Docker ready** — single `docker compose up` spins up Node + Postgres + Redis

## Tech Stack

| Layer | Tech |
|---|---|
| Backend | Node.js, Express |
| Database | PostgreSQL + Prisma ORM |
| Cache | Redis (ioredis) |
| Auth | JWT + bcryptjs |
| Analytics | geoip-lite, ua-parser-js |
| Frontend | React + Vite |
| Charts | Chart.js + react-chartjs-2 |
| Infra | Docker, docker-compose |

## Project Structure

```
url-shortener/
├── server/
│   ├── src/
│   │   ├── routes/         # shorten.js, redirect.js, analytics.js, auth.js
│   │   ├── services/       # redis.js, geo.js, clickWorker.js
│   │   ├── db/             # schema.sql, client.js
│   │   └── middleware/     # auth.js, rateLimiter.js, errorHandler.js
│   ├── prisma/
│   │   └── schema.prisma
│   └── Dockerfile
├── client/
│   └── src/
│       ├── pages/          # Dashboard.jsx, LinkDetail.jsx, Login.jsx
│       ├── components/     # LinkForm.jsx, StatsChart.jsx, LinkTable.jsx, Navbar.jsx
│       ├── hooks/          # useLinks.js, useAuth.js, useDashboard.js
│       └── lib/            # api.js, utils.js
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Getting Started

### With Docker (recommended)

```bash
git clone https://github.com/your-username/snip.ly
cd snip.ly
cp .env.example .env        # fill in JWT_SECRET and BASE_URL
docker compose up --build
```

App runs at `http://localhost:5173`, API at `http://localhost:3000`.

### Manual setup

**Prerequisites:** Node 18+, PostgreSQL, Redis

```bash
# 1. Clone
git clone https://github.com/your-username/snip.ly
cd snip.ly

# 2. Server
cd server
cp .env.example .env        # fill in DATABASE_URL, REDIS_HOST, JWT_SECRET, BASE_URL
npm install
npx prisma db push
npm run dev

# 3. Client (new terminal)
cd client
cp .env.example .env        # set VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

## Environment Variables

### server/.env

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/urlshortener
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_super_secret_key_change_this
BASE_URL=http://localhost:3000
CLIENT_URL=http://localhost:5173
PORT=3000
NODE_ENV=development
```

### client/.env

```env
VITE_API_URL=http://localhost:3000
```

## API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login, returns JWT |

### Links
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/shorten` | Create short link |
| GET | `/api/shorten` | List user's links |
| DELETE | `/api/shorten/:id` | Delete a link |
| GET | `/:slug` | Redirect + capture click |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/overview` | Dashboard summary |
| GET | `/api/analytics/:urlId` | Per-link breakdown |

## How the Redirect Works

```
GET /:slug
    │
    ▼
Redis check ──hit──▶ 302 redirect ──async──▶ capture click
    │                                          (geo + UA + referrer)
   miss
    │
    ▼
Postgres lookup ──▶ warm Redis cache ──▶ 302 redirect
```

The async click capture never blocks the redirect — latency stays under 20ms even while geo lookups and DB writes happen in the background.

## Running Tests

```bash
cd server
npm test
```

## License

MIT
