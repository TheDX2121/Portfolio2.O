# Portfolio 3.O — README

## 1. Project overview

This project is a **full-stack Next.js 16.2.6 portfolio/CMS application** using:

- **Next.js 16.2.6** with App Router
- **React 19.2.6**
- **TypeScript 5.9.3**
- **Tailwind CSS 4.1.17**
- **PostgreSQL**
- **Drizzle ORM 0.45.2**
- **Node.js runtime** for server-side API routes
- Cookie-based admin authentication
- Server-side dynamic rendering from PostgreSQL
- Admin dashboard for editing portfolio content
- Image/video/audio upload support

The site is not a static portfolio. It has a database-backed CMS, protected admin area, API routes, and file uploads.

---

## 2. What is included

### Public website

The public homepage is:

```text
/
```

It loads the latest portfolio content directly from PostgreSQL on every request.

The homepage is deliberately configured as dynamic:

```ts
export const dynamic = "force-dynamic";
export const revalidate = 0;
```

This means admin changes can appear on the public site without a separate publish step.

### Admin panel

The admin area is:

```text
/admin
```

It contains:

- Admin login
- Hero/content editing
- About/Info editing
- Navigation configuration
- Work/portfolio item management
- Collaboration management
- Experience management
- New-launch countdown/content
- Currently-working-on section
- Social links/contact settings
- Site settings
- Music settings
- Media uploads

The admin session is stored in an HTTP-only cookie and expires after 7 days.

---

## 3. Main project structure

```text
.
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   └── page.tsx
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── collabs/
│   │   │   │   ├── content/
│   │   │   │   ├── experiences/
│   │   │   │   ├── login/
│   │   │   │   ├── logout/
│   │   │   │   └── work/
│   │   │   ├── health/
│   │   │   ├── public/
│   │   │   └── upload/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── PublicSite.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminLogin.tsx
│   │       └── FileUpload.tsx
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   └── lib/
│       ├── auth.ts
│       ├── content.ts
│       └── types.ts
├── drizzle.config.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── eslint.config.mjs
└── tsconfig.json
```

---

## 4. Database design

The project uses PostgreSQL through Drizzle ORM.

There are four database tables.

### `site_content`

A singleton row containing global portfolio settings:

- Hero text
- Hero image/video
- About text
- Skills
- Navigation
- Launch information
- Current project
- Social links
- Email
- Favicon/title
- Grain/cursor settings
- Music settings
- Updated timestamp

The application expects the singleton row to use:

```text
id = 1
```

If the row does not exist, the application creates it automatically.

### `work_items`

Portfolio/work entries:

- title
- category
- year
- cover
- video
- gallery
- description
- link
- featured flag
- visibility
- display order
- creation timestamp

### `collabs`

Collaboration entries:

- name
- role
- year
- logo
- description
- visibility
- display order
- creation timestamp

### `experiences`

Experience entries:

- company
- role
- experience
- about
- my role
- visibility
- display order
- creation timestamp

---

## 5. API routes

### Public

```text
GET /api/public/content
```

Returns the public portfolio content.

### Health check

```text
GET /api/health
```

Runs:

```sql
select 1
```

and returns:

```json
{ "ok": true }
```

when PostgreSQL is reachable.

### Authentication

```text
POST /api/admin/login
POST /api/admin/logout
```

Login requires `ADMIN_PASSWORD`.

The server creates a signed session cookie:

```text
portfolio_admin_session
```

### Admin content

```text
GET /api/admin/content
PUT /api/admin/content
```

### Work

```text
GET    /api/admin/work
POST   /api/admin/work
PUT    /api/admin/work/:id
DELETE /api/admin/work/:id
```

### Collaborations

```text
GET    /api/admin/collabs
POST   /api/admin/collabs
PUT    /api/admin/collabs/:id
DELETE /api/admin/collabs/:id
```

### Experiences

```text
GET    /api/admin/experiences
POST   /api/admin/experiences
PUT    /api/admin/experiences/:id
DELETE /api/admin/experiences/:id
```

### Upload

```text
POST /api/upload
```

The current implementation accepts:

- jpg
- jpeg
- png
- gif
- webp
- svg
- avif
- mp4
- webm
- mov
- mp3
- wav
- ogg
- m4a

The code currently allows files up to 50 MB.

---

## 6. Environment variables

Create a `.env.local` file for local development.

### `.env.example`

```env
# PostgreSQL connection string
# Example:
# postgresql://USERNAME:PASSWORD@HOST:5432/DATABASE_NAME
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio"

# Password used by /admin
# Use a long random password in production.
ADMIN_PASSWORD="change-this-to-a-strong-admin-password"

# Secret used to sign admin session cookies.
# Generate a long random value for production.
ADMIN_SESSION_SECRET="change-this-to-a-long-random-secret"
```

### Important

Do **not** commit these real values to Git:

```text
.env
.env.local
.env.production
```

Commit only:

```text
.env.example
```

No `NEXT_PUBLIC_` variables are currently required by this project.

`DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` must remain server-only secrets.

---

## 7. Local development

### Requirements

Use:

- Node.js **20.9+**
- npm
- PostgreSQL

Next.js 16 requires Node.js 20.9 or newer.

### Install dependencies

```bash
npm install
```

### Create environment file

```bash
cp .env.example .env.local
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local` with your real PostgreSQL credentials and admin password.

### Create the database

Create a PostgreSQL database, for example:

```text
portfolio
```

Then set:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio"
```

### Important Drizzle configuration change

The supplied project currently has a hard-coded local PostgreSQL URL inside `drizzle.config.json`.

Before production deployment, change the Drizzle configuration so migrations use `DATABASE_URL` instead of:

```text
postgresql://postgres:postgres@127.0.0.1:5432/app_db
```

A recommended `drizzle.config.ts` is:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

Then you can use the same environment variable locally and in production.

### Create/update database tables

After installing dependencies:

```bash
npx drizzle-kit push
```

Alternatively, use a migration workflow:

```bash
npx drizzle-kit generate
npx drizzle-kit migrate
```

For a simple single-server portfolio, `push` is convenient during initial setup. For a team/production migration workflow, generated migrations are preferable.

### Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Admin:

```text
http://localhost:3000/admin
```

---

## 8. Production build

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

Then:

```bash
npm start
```

The production server listens on the configured Next.js port, normally:

```text
http://localhost:3000
```

The current `package.json` already contains the required Next.js production scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit"
  }
}
```

---

# 9. Vercel deployment

Vercel has first-class Next.js support, so the Next.js application itself can be deployed with little configuration.

## Critical warning about uploads

The current upload implementation writes files here:

```text
public/uploads/
```

using Node's filesystem APIs.

That is **not a durable storage strategy for Vercel Functions**. Vercel Functions have a read-only filesystem apart from temporary `/tmp` storage.

Also, Vercel Functions have a **4.5 MB request/response payload limit**, so the current 50 MB upload setting cannot be used through the current `/api/upload` route on Vercel.

For Vercel, replace the local filesystem upload implementation with direct-to-storage uploads such as:

- Vercel Blob
- Amazon S3
- Cloudflare R2
- another object/media storage service

For videos especially, direct client uploads are recommended.

## Vercel steps

### 1. Push the project to GitHub

```bash
git init
git add .
git commit -m "Initial portfolio"
git branch -M main
git remote add origin YOUR_REPOSITORY_URL
git push -u origin main
```

### 2. Import into Vercel

In Vercel:

```text
Add New Project
→ Import Git Repository
→ Select your repository
```

Vercel should detect Next.js automatically.

### 3. Set environment variables

Add:

```text
DATABASE_URL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

for the Production environment.

Also configure them for Preview/Development if those environments need to access the database.

### 4. Deploy

Use the default build configuration:

```text
Framework: Next.js
Build Command: next build
```

You normally do not need a custom `vercel.json`.

### 5. Initialize the database

Run the Drizzle migration/push against the production PostgreSQL database.

For example:

```bash
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL" npx drizzle-kit push
```

Do this from a trusted machine/CI environment rather than exposing the database URL to the browser.

### 6. Test

Check:

```text
/
 /admin
 /api/health
```

The health endpoint should return:

```json
{ "ok": true }
```

### Vercel upload recommendation

The best architecture is:

```text
Browser
   ↓
Admin login
   ↓
Next.js API creates upload authorization
   ↓
Browser uploads directly
   ↓
Vercel Blob / S3 / R2
   ↓
Returned file URL saved in PostgreSQL
```

Do not send large video files through `/api/upload` on Vercel.

---

# 10. Netlify deployment

Netlify supports modern Next.js applications through its Next.js/OpenNext integration.

## Critical warning about uploads

The same upload issue applies here.

The current code:

```ts
writeFile(filePath, ...)
```

writes into the application's local filesystem.

Serverless functions should not be treated as permanent file storage.

Netlify's buffered function payload limit is 6 MB, and binary uploads effectively have a lower practical limit because of encoding overhead.

Therefore, the current 50 MB upload feature should also be changed to external object storage before using Netlify for production uploads.

## Netlify steps

### 1. Push to Git

Push the project to GitHub, GitLab, or another supported Git provider.

### 2. Create a Netlify site

In Netlify:

```text
Add new project
→ Import an existing project
→ Select your Git repository
```

Netlify should detect Next.js.

Typical settings are:

```text
Build command:
npm run build
```

For modern Next.js projects, Netlify handles the Next.js runtime through its framework adapter.

### 3. Add environment variables

In:

```text
Project configuration
→ Environment variables
```

add:

```text
DATABASE_URL
ADMIN_PASSWORD
ADMIN_SESSION_SECRET
```

Make sure the variables are available to the runtime/functions where needed.

### 4. Configure PostgreSQL

Use a hosted PostgreSQL provider and set:

```env
DATABASE_URL="YOUR_PRODUCTION_DATABASE_URL"
```

### 5. Initialize database

Run:

```bash
npx drizzle-kit push
```

against the production database, or use generated migrations.

### 6. Deploy

Push a commit:

```bash
git add .
git commit -m "Deploy portfolio"
git push
```

Netlify will build and deploy the site.

### 7. Test

Check:

```text
/
 /admin
 /api/health
```

---

# 11. cPanel deployment

For the current codebase, a cPanel server with Node.js + PostgreSQL is the hosting model that most closely matches the application's existing filesystem upload implementation.

This assumes your hosting provider supports:

- Node.js 20.9+
- Next.js/Node applications
- Passenger or cPanel Application Manager
- PostgreSQL
- SSH/Terminal access
- Persistent writable application storage

## Important

Not every shared cPanel host supports modern Next.js 16.

Before purchasing/using a cPanel plan, confirm that it supports:

```text
Node.js 20.9+
PostgreSQL
Node.js applications / Passenger
```

## Step 1 — Create PostgreSQL database

Create a PostgreSQL database and user in your hosting control panel.

Record:

```text
database name
database user
database password
database host
database port
```

Create:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
```

## Step 2 — Upload the project

Upload the project to an application directory, for example:

```text
/home/USERNAME/portfolio
```

Do not put the whole source project directly into `public_html` unless your hosting setup specifically requires that.

## Step 3 — Install Node.js

Select Node.js 20.9+.

Node.js 22 is also suitable if supported by the hosting provider.

## Step 4 — Install dependencies

Open cPanel Terminal/SSH:

```bash
cd ~/portfolio
npm install
```

## Step 5 — Configure environment variables

Create:

```text
.env
```

or configure environment variables through cPanel's Node.js Application Manager.

Example:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"
ADMIN_PASSWORD="YOUR_STRONG_ADMIN_PASSWORD"
ADMIN_SESSION_SECRET="YOUR_LONG_RANDOM_SECRET"
NODE_ENV="production"
```

Do not expose this file publicly.

## Step 6 — Fix Drizzle configuration

Use the environment-based `drizzle.config.ts` described earlier.

Then initialize/update the database:

```bash
npx drizzle-kit push
```

## Step 7 — Build

```bash
npm run build
```

## Step 8 — Configure the Node.js application

In cPanel Application Manager / Node.js application settings, configure approximately:

```text
Application root:
portfolio

Application URL:
your-domain.com

Application startup file:
app.js

Node.js version:
20.9+ / supported version
```

Because cPanel Passenger commonly expects an `app.js` entry point, create one if your hosting panel requires it.

Example `app.js`:

```js
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3000", 10);
const hostname = "0.0.0.0";

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, () => {
    console.log(`Next.js running on ${hostname}:${port}`);
  });
});
```

If your cPanel provider has a specific Passenger startup-file procedure, follow the provider's configuration because cPanel/Passenger setups vary between hosts.

## Step 9 — Restart

After changes, restart the Node.js application from cPanel.

Some Passenger installations also use:

```bash
mkdir -p tmp
touch tmp/restart.txt
```

to trigger an application restart.

## Step 10 — Test

Open:

```text
https://your-domain.com
https://your-domain.com/admin
https://your-domain.com/api/health
```

---

# 12. File upload architecture

This is the most important deployment difference in this project.

## Current implementation

```text
Admin browser
   ↓
POST /api/upload
   ↓
Next.js server
   ↓
public/uploads/
   ↓
PostgreSQL stores /uploads/filename
```

This is reasonable on a persistent Node.js server such as a suitable cPanel VPS/server.

It is **not a reliable production storage design for serverless hosting**.

## Recommended production architecture

```text
Admin browser
       │
       ├── image/video/audio
       ↓
Object storage
(Vercel Blob / S3 / R2 / Cloudinary)
       │
       ↓
Permanent HTTPS URL
       │
       ↓
PostgreSQL
```

Then PostgreSQL stores only the URL.

This also prevents the database from becoming a media storage system.

---

# 13. Security review

The project already has several good security foundations:

- Admin APIs check authentication.
- Session cookie is HTTP-only.
- Session cookie uses `sameSite: "lax"`.
- Production cookies use `secure: true`.
- Password comparison uses timing-safe comparison.
- Session tokens use HMAC-SHA256.
- Client cannot directly set the database `id` or `updatedAt` fields for site content.
- Uploads require an authenticated admin session.
- Upload extensions are allow-listed.
- Upload size is checked server-side.

However, the following improvements are recommended before a public production launch.

## 13.1 Add login rate limiting

`POST /api/admin/login` currently has no visible brute-force protection.

Add rate limiting based on:

- IP
- account/admin endpoint
- optionally both

A persistent/shared rate limiter is preferable on serverless platforms.

## 13.2 Improve upload validation

The upload endpoint checks the file extension but does not fully validate the actual file MIME/content.

For production:

- Validate MIME type.
- Validate file signatures where appropriate.
- Reject dangerous content.
- Consider disallowing SVG unless it is sanitized.
- Consider serving uploaded media from a separate asset domain.

SVG is particularly worth reviewing because active content can create security problems when served from the same origin.

## 13.3 Move media storage outside the application filesystem

This is required for reliable Vercel/Netlify deployment.

## 13.4 Use a strong session secret

Do not rely on:

```text
dev-secret-change-me
```

in production.

Set:

```env
ADMIN_SESSION_SECRET="a-long-random-secret"
```

and keep it separate from the admin password.

## 13.5 Use HTTPS

Admin login and session cookies should always be served through HTTPS in production.

## 13.6 Protect PostgreSQL

Do not expose PostgreSQL publicly unless necessary.

Prefer:

- provider private networking
- IP restrictions
- SSL/TLS database connections
- strong database credentials

---

# 14. Recommended `.gitignore`

Make sure the repository ignores:

```gitignore
node_modules/
.next/
.env
.env.local
.env.*.local
.vercel/
.netlify/
public/uploads/
*.log
```

If you intentionally keep permanent seed assets in `public/uploads`, do not ignore those specific files.

---

# 15. Deployment checklist

## Before deployment

- [ ] Node.js 20.9+ available
- [ ] PostgreSQL database created
- [ ] `DATABASE_URL` configured
- [ ] `ADMIN_PASSWORD` configured
- [ ] `ADMIN_SESSION_SECRET` configured
- [ ] Drizzle config no longer contains a hard-coded local database URL
- [ ] `.env` files are not committed
- [ ] Database schema has been pushed/migrated
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Admin login tested
- [ ] Public site tested
- [ ] `/api/health` tested
- [ ] Upload behavior tested for the selected hosting platform

## For Vercel

- [ ] Replace local filesystem uploads
- [ ] Use Vercel Blob/S3/R2/etc.
- [ ] Use direct browser uploads for large files
- [ ] Remember Vercel's 4.5 MB function payload limit
- [ ] Add production and preview environment variables as needed

## For Netlify

- [ ] Replace local filesystem uploads
- [ ] Use external object storage
- [ ] Add runtime/function environment variables
- [ ] Remember the practical binary upload payload limitation

## For cPanel

- [ ] Confirm Node.js 20.9+ support
- [ ] Confirm Passenger/Application Manager support
- [ ] Confirm PostgreSQL support
- [ ] Confirm persistent writable storage
- [ ] Configure startup file
- [ ] Run production build
- [ ] Restart Passenger/Node application
- [ ] Enable HTTPS

---

# 16. Useful commands

### Development

```bash
npm install
npm run dev
```

### Lint

```bash
npm run lint
```

### Type check

```bash
npm run typecheck
```

### Production build

```bash
npm run build
```

### Production server

```bash
npm start
```

### Drizzle schema push

```bash
npx drizzle-kit push
```

### Generate migrations

```bash
npx drizzle-kit generate
```

### Run migrations

```bash
npx drizzle-kit migrate
```

---

# 17. Overall technical assessment

The project is a **database-driven portfolio CMS rather than a simple static portfolio**.

Its architecture is:

```text
                    ┌────────────────────┐
                    │     PostgreSQL     │
                    │                    │
                    │ site_content       │
                    │ work_items         │
                    │ collabs             │
                    │ experiences         │
                    └─────────▲──────────┘
                              │
                              │ Drizzle ORM
                              │
┌───────────────┐       ┌─────┴───────────┐
│ Public Client │◄──────┤    Next.js      │
└───────────────┘       │                 │
                        │ Server Components
┌───────────────┐       │ Route Handlers  │
│ Admin Client  │──────►│ Auth / Cookies  │
└───────────────┘       │ Upload API      │
                        └─────┬───────────┘
                              │
                              ▼
                     Current local storage
                     public/uploads/
```

The database/content architecture is suitable for production.

The main hosting concern is **media uploads**, because the current implementation assumes a persistent server filesystem. For Vercel and Netlify, move uploads to object storage before production.

For a traditional persistent Node.js server, the current upload design is much closer to what the application expects.

---

# 18. Final recommended production architecture

If choosing a modern managed deployment:

```text
Vercel
   │
   ├── Next.js
   ├── Admin authentication
   ├── API routes
   │
   ├──────────────► PostgreSQL
   │
   └──────────────► Vercel Blob / S3 / R2
```

If choosing a traditional server:

```text
cPanel / VPS
   │
   ├── Next.js Node server
   ├── PostgreSQL
   ├── persistent media storage
   └── HTTPS / reverse proxy
```

For the current source code with minimal architectural changes, a **persistent Node.js server with PostgreSQL** is the closest match. For Vercel/Netlify, keep the Next.js + PostgreSQL architecture but replace the local file upload endpoint with external object storage.

---

## Official documentation

- Next.js deployment: https://nextjs.org/docs/app/getting-started/deploying
- Next.js self-hosting: https://nextjs.org/docs/app/guides/self-hosting
- Next.js installation/system requirements: https://nextjs.org/docs/app/getting-started/installation
- Vercel + Next.js: https://vercel.com/docs/frameworks/full-stack/nextjs
- Vercel environment variables: https://vercel.com/docs/environment-variables
- Vercel function limits: https://vercel.com/docs/functions/limitations
- Vercel file uploads: https://vercel.com/docs/vercel-blob/server-upload
- Netlify + Next.js: https://docs.netlify.com/build/frameworks/framework-setup-guides/nextjs/overview/
- Netlify environment variables: https://docs.netlify.com/build/environment-variables/overview/
- cPanel Node.js applications: https://docs.cpanel.net/knowledge-base/web-services/how-to-install-a-node.js-application/
