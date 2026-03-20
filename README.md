<div align="center">

# ⚡ snip.ly

### URL shortener with real-time analytics

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7+-red.svg)](https://redis.io)

**[Report a Bug](https://github.com/didulabhanuka/snip.ly---URL-Shortener-with-Analytics/issues) · [Request a Feature](https://github.com/didulabhanuka/snip.ly---URL-Shortener-with-Analytics/issues)**

</div>

---

## What is snip.ly?

snip.ly turns long URLs into short, trackable links. Every click is captured asynchronously — geo-located, device-parsed, and stored — without ever slowing down the redirect. The analytics dashboard gives you a real-time breakdown of who's clicking, from where, on what device, and how they found you.

Built as a portfolio project demonstrating production patterns: async job processing, Redis caching, JWT auth, role-based access control, and a clean React frontend.

---

## Features

| | Feature | Details |
|---|---|---|
| 🔗 | **Link shortening** | 6-char nanoid slug or custom alias |
| 🔒 | **Password protection** | Bcrypt-hashed gate on any link |
| ⚡ | **Fast redirects** | DB-first with Redis cache warming |
| 📊 | **Click analytics** | Country, browser, device, referrer per click |
| 📈 | **Dashboard** | Clicks over time, device split, top referrers |
| 🔑 | **Admin panel** | Platform stats, manage all users and links |
| 🛡️ | **Rate limiting** | Per-endpoint limits to prevent abuse |
| 🔐 | **JWT auth** | Stateless auth, role-based access (user / admin) |

---

## Architecture

```
┌─────────────┐     ┌──────────────────────────────────────┐
│ React + Vite│────▶│           Express API                 │
│  (Vite 5)   │     │                                       │
└─────────────┘     │  /api/auth      JWT register/login    │
                    │  /api/shorten   Create & list links   │
                    │  /api/analytics Per-link stats         │
                    │  /api/admin     Admin operations       │
                    │  /:slug         Redirect endpoint      │
                    └──────────┬───────────────┬────────────┘
                               │               │
                    ┌──────────▼───┐   ┌───────▼────────┐
                    │  PostgreSQL  │   │     Redis       │
                    │  (Prisma 7)  │   │  (slug cache)   │
                    └──────────────┘   └────────────────┘
```

### Redirect flow

```
GET /:slug
    │
    ▼
DB lookup → has password?
    │
    ├─── YES ──▶ 302 → /p/:slug (password gate page)
    │
    └─── NO ───▶ Redis hit? ──YES──▶ 302 redirect
                     │                    │
                    NO                 [async]
                     │              capture click
                     ▼            (geo + UA + referrer)
               warm Redis
                     │
                     ▼
               302 redirect
```

> The async click capture never blocks the redirect. Protected links always hit the DB so the password check cannot be bypassed via cache.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4 |
| **Database** | PostgreSQL 15 + Prisma ORM v7 |
| **Cache** | Redis 7 (ioredis) |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Analytics** | geoip-lite · ua-parser-js |
| **Frontend** | React 18 + Vite 5 |
| **Charts** | Chart.js + react-chartjs-2 |
| **Styling** | Plain CSS with CSS variables |

---

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional — app runs without it, cache disabled)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/didulabhanuka/snip.ly---URL-Shortener-with-Analytics
cd snip.ly---URL-Shortener-with-Analytics

# 2. Set up the server
cd server
cp .env.example .env       # edit with your values
npm install
npx prisma db push         # create tables
npx prisma generate        # generate Prisma client
npm run dev                # starts on :3000

# 3. Set up the client (new terminal)
cd client
cp .env.example .env       # set VITE_API_URL=http://localhost:3000
npm install
npm run dev                # starts on :5173
```

### Environment Variables

**`server/.env`**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/urlshortener
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key_change_this
BASE_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:5173
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:3000
```

### Promoting to Admin

After registering, run this once in psql:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Then log out and back in. The `🔑 Admin` link will appear in the navbar.

---

## API Reference

<details>
<summary><strong>Auth</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |

</details>

<details>
<summary><strong>Links</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/shorten` | ✅ | Create short link (optional password) |
| GET | `/api/shorten` | ✅ | List your links |
| DELETE | `/api/shorten/:id` | ✅ | Delete a link |
| GET | `/:slug` | — | Redirect + capture click |
| POST | `/api/verify/:slug` | — | Unlock a password-protected link |

</details>

<details>
<summary><strong>Analytics</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/analytics/overview` | ✅ | Dashboard summary |
| GET | `/api/analytics/:urlId` | ✅ | Per-link breakdown |

</details>

<details>
<summary><strong>Admin</strong></summary>

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | 🔑 Admin | Platform-wide stats |
| GET | `/api/admin/users` | 🔑 Admin | All users |
| DELETE | `/api/admin/users/:id` | 🔑 Admin | Delete a user |
| PATCH | `/api/admin/users/:id/role` | 🔑 Admin | Promote / demote |
| GET | `/api/admin/links` | 🔑 Admin | All links |
| DELETE | `/api/admin/links/:id` | 🔑 Admin | Delete any link |

</details>

---

## Project Structure

```
├── server/
│   ├── prisma/
│   │   ├── schema.prisma          # DB models
│   │   └── prisma.config.ts       # Prisma 7 config
│   └── src/
│       ├── routes/
│       │   ├── auth.js            # Register, login
│       │   ├── shorten.js         # Create, list, delete links
│       │   ├── redirect.js        # Slug redirect + verify
│       │   ├── analytics.js       # Overview + per-link stats
│       │   └── admin.js           # Admin operations
│       ├── services/
│       │   ├── redis.js           # Cache helpers
│       │   ├── geo.js             # IP → country, UA → device
│       │   └── clickWorker.js     # Async click capture
│       ├── middleware/
│       │   ├── auth.js            # JWT verification
│       │   ├── requireAdmin.js    # Role guard
│       │   ├── rateLimiter.js     # Per-route limits
│       │   └── errorHandler.js    # Global error handler
│       ├── db/
│       │   ├── schema.sql         # Raw DDL
│       │   └── client.js          # Prisma client singleton
│       ├── app.js                 # Express app setup
│       └── index.js               # Server entry point
│
└── client/
    └── src/
        ├── pages/
        │   ├── Dashboard.jsx      # Main analytics dashboard
        │   ├── LinkDetail.jsx     # Per-link stats
        │   ├── Login.jsx          # Auth page
        │   ├── PasswordGate.jsx   # Password unlock page
        │   └── Admin.jsx          # Admin panel
        ├── components/
        │   ├── LinkForm.jsx       # URL + options form
        │   ├── LinkTable.jsx      # Links list
        │   ├── StatsChart.jsx     # Chart.js wrappers
        │   └── Navbar.jsx         # Top navigation
        ├── hooks/
        │   ├── useAuth.js         # Login, register, logout
        │   ├── useLinks.js        # Link CRUD
        │   └── useDashboard.js    # Overview stats
        └── lib/
            ├── api.js             # Axios instance + interceptors
            └── utils.js           # Date, truncate, clipboard helpers
```

---

## Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Security

If you discover a security vulnerability, please open a [GitHub issue](https://github.com/didulabhanuka/snip.ly---URL-Shortener-with-Analytics/issues) marked as **security**. Do not post credentials or sensitive data publicly.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
Made with ☕ by <a href="https://github.com/didulabhanuka">didulabhanuka</a>
</div>
