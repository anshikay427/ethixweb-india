# Ethixweb India — Full-stack assessment project

A premium, India-focused redesign concept for Ethixweb. Built with React + Vite on the frontend and Express + PostgreSQL on the backend. This is an intermediate-level implementation intended to be understandable, extensible, and demonstrable in an interview.

## What is included
- Responsive Home, Services, About, Contact and protected Admin pages.
- India-focused positioning for startups, D2C brands, local service businesses and growing SMEs.
- Enquiry form with client/server validation, a honeypot spam field and rate limiting.
- PostgreSQL lead storage (no hardcoded lead records).
- Admin login using a JWT stored in session storage; leads can be viewed, filtered, marked as contacted, or deleted.
- Helmet security headers, CORS allow-list, parameterized SQL, environment-based secrets and consistent API errors.
- Reduced-motion support and lightweight CSS animations.

## Stack
React, Vite, React Router, custom CSS, Node.js, Express, PostgreSQL (`pg`), `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `helmet`, `express-validator`.

## Run locally
Requirements: Node.js 20+ and PostgreSQL 14+.

1. Create a PostgreSQL database, e.g. `ethixweb_india`.
2. Copy `.env.example` to `server/.env` and update `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `CLIENT_ORIGIN`. Never commit `.env`.
3. Install dependencies from the project root: `npm install`, then `npm --prefix server install` and `npm --prefix client install`.
4. Start both apps: `npm run dev`. Frontend: `http://localhost:5173`; API: `http://localhost:4000/api/health`.
5. Open `/admin` and sign in using the admin credentials configured in `server/.env`. The server creates the leads table on startup.

## Environment variables
- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_SECRET`: long, random secret used to sign admin tokens.
- `ADMIN_EMAIL` and `ADMIN_PASSWORD`: demo admin login. The password is hashed in memory at startup and is never sent to the client. For production, use a proper user table and managed identity provider.
- `CLIENT_ORIGIN`: exact frontend origin allowed by CORS.
- `PGSSL=true`: enable TLS for hosted PostgreSQL.

## API overview
- `GET /api/health` — health check.
- `POST /api/leads` — validates and stores an enquiry; honeypot submissions are quietly accepted without being stored.
- `POST /api/admin/login` — verifies configured admin credentials and returns a short-lived JWT.
- `GET /api/admin/leads` — protected lead list.
- `PATCH /api/admin/leads/:id` — protected status update (`new`, `contacted`, `qualified`, `closed`).
- `DELETE /api/admin/leads/:id` — protected lead deletion.

## Design rationale
**India-specific without clichés:** the visual system pairs a confident Ethixweb red with warm ivory, ink and restrained saffron/green accents. Copy speaks to Indian startups, D2C brands and service businesses; examples include UPI-ready checkout, WhatsApp-first journeys, mobile-first browsing and local discovery. The layout uses clear pricing conversations rather than unsupported fixed promises. The design avoids flag-heavy decoration and aims to feel premium and internationally credible.

**What this concept improves:** the current Ethixweb site positions the company as a broad digital-operations partner with AI agents, websites, CRM, SEO and ads. This redesign retains that full-stack breadth but makes the India audience explicit, simplifies the first-screen message, surfaces a repeatable delivery process, and gives visitors one obvious path to submit a qualified enquiry. The original brief weights design/India fit at 30%, UI/UX at 20%, backend/code at 20%, PageSpeed at 20%, and detail/polish at 10%.

## Before submitting
- Run through the enquiry and admin flows against a real PostgreSQL database.
- Add your own real project screenshots/case studies; sample work cards on the homepage are clearly presented as concept examples, not client claims.
- Deploy frontend and API, configure environment variables and production CORS, and use managed PostgreSQL with TLS.
- Run Google PageSpeed Insights on mobile and desktop and include genuine screenshots. A score of 90+ is a target, not something this source code can guarantee without testing the deployed site.
- Replace demo admin credentials with a strong unique secret and do not publish credentials in the public README/repository.
- Add your actual live URL and repository URL to the submission form.
