# Garvit Gaur Portfolio

Personal portfolio, served by a small Node/Express backend instead of a static host, because a backend engineer's portfolio should have at least one real backend in it.

**Live:** _(https://cezium55-portolio.vercel.app/ )_

## Why Express instead of just static HTML

The site is mostly static content, but it's served through Express with two real endpoints:

- `GET /api/projects` — pulls repo data (stars, description, last-updated, topics) live from the GitHub API, with a 30-minute in-memory cache. The projects list on the page is never hand-typed or stale, it reflects what's actually on GitHub.
- `POST /api/contact` — validates and rate-limits contact form submissions server-side (basic in-memory rate limiter, 3 requests / 10 min per IP).
- `GET /api/health` — trivial uptime/health check, the kind you'd want before deploying anything behind a load balancer.

## Stack

- Node.js + Express
- Vanilla HTML/CSS/JS on the frontend (no framework, kept intentionally simple)
- GitHub REST API for live project data

## Running locally

```bash
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:3000`.

## Project structure

```
.
├── server.js              # Express app entrypoint
├── routes/
│   ├── projects.js        # GET /api/projects — GitHub API proxy + cache
│   └── contact.js         # POST /api/contact — validation + rate limiting
└── public/
    ├── index.html
    ├── styles.css
    └── main.js
```

## Deploying

Any Node host works (Render, Railway, Fly.io, a VPS). No build step required, just `npm install && npm start`.

## Wiring up real email delivery

`routes/contact.js` currently logs submissions to the console instead of sending email, so the repo doesn't need real credentials committed. To make it functional:

1. Add SMTP credentials (or an API key for Resend/SendGrid) to `.env`
2. Use the already-installed `nodemailer` package inside the route handler to send the message

## About me

BCA graduate from GGSIPU. I build backend systems from first principles to understand how they actually work, see [mini-redis](https://github.com/cezium55/mini-redis) and the other projects on this site. Looking for backend / full-stack roles at startups.

- GitHub: [github.com/cezium55](https://github.com/cezium55)
- LinkedIn: [garvit-gaur-81507525b](https://www.linkedin.com/in/garvit-gaur-81507525b)
- Email: garvitgaur47@gmail.com
