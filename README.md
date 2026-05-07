# codeshare

A private, self-hosted code-sharing platform — share snippets with public, unlisted, or private visibility. Built to run comfortably on a Raspberry Pi 5.

- **Frontend:** Next.js 14 (App Router) · TypeScript · Tailwind · custom dark UI
- **Backend:** Next.js API routes · NextAuth.js · Prisma · PostgreSQL
- **Editor:** Monaco (client) for editing, highlight.js (server) for read-only
- **Auth:** Email + password (bcrypt) · optional GitHub / Google OAuth

---

## Features

- Email + password sign-up / sign-in (optional GitHub / Google OAuth)
- Multi-file snippets with file tree
- Editor (Monaco) with auto-detected language by extension
- Server-rendered syntax highlighting for read-only views
- Visibility per snippet: `public`, `unlisted`, `private`
- Short, shareable links: `/s/aB3xK9`
- Dashboard with search, language / visibility filter, sort
- Public discover feed
- Profile pages with public snippets
- Copy, raw, download (single file or zip), fork
- Owner check on every read/write of private content
- Rate limiting on auth & create endpoints
- bcrypt password hashing
- CSRF via NextAuth · sanitized rendering

---

## Local development

Prerequisites: Node 20+, Postgres 14+ running locally.

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env
# edit .env — set DATABASE_URL and a NEXTAUTH_SECRET

# 3. Initialize the database
npx prisma migrate dev --name init

# 4. Start dev server
npm run dev
```

Visit http://localhost:3000.

---

## Project structure

```
codeshare/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login & register pages (shared layout)
│   ├── api/                # REST endpoints
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── register/route.ts
│   │   └── snippets/...
│   ├── dashboard/page.tsx
│   ├── discover/page.tsx
│   ├── new/page.tsx
│   ├── s/[shortId]/page.tsx, edit/page.tsx
│   ├── u/[username]/page.tsx
│   ├── layout.tsx, page.tsx, globals.css, providers.tsx
├── components/             # UI components
│   ├── ui/                 # Button, Input, Card, ...
│   ├── code-editor.tsx     # Monaco editor (client)
│   ├── code-viewer.tsx     # highlight.js (server)
│   ├── snippet-form.tsx    # New / edit form
│   ├── ...
├── lib/                    # auth, prisma, snippet validation, rate-limit, ...
├── prisma/schema.prisma
├── .env.example
└── README.md
```

---

## Raspberry Pi 5 deployment guide

This walks through hosting `codeshare` on a Pi 5 reachable on your local network or the internet.

### 1. Prepare the Pi

```bash
# Update everything
sudo apt update && sudo apt full-upgrade -y

# Common build deps (some npm packages compile native bits)
sudo apt install -y build-essential git curl ca-certificates
```

### 2. Install Node.js 20 LTS

NodeSource has prebuilt arm64 binaries for the Pi 5:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v   # should print v20.x
```

### 3. Install PostgreSQL

```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

Create the DB and user:

```bash
sudo -u postgres psql <<'SQL'
CREATE USER codeshare WITH PASSWORD 'pick-a-strong-password';
CREATE DATABASE codeshare OWNER codeshare;
GRANT ALL PRIVILEGES ON DATABASE codeshare TO codeshare;
SQL
```

### 4. Copy the project to the Pi

From your dev machine:

```bash
# Either copy the folder over SSH...
rsync -avz --exclude node_modules --exclude .next codeshare/ pi@<pi-host>:~/codeshare/

# ...or push to a git repo and clone it on the Pi
ssh pi@<pi-host> 'git clone <your-repo-url> ~/codeshare'
```

### 5. Configure & install

```bash
ssh pi@<pi-host>
cd ~/codeshare

cp .env.example .env
nano .env
# DATABASE_URL="postgresql://codeshare:pick-a-strong-password@localhost:5432/codeshare?schema=public"
# NEXTAUTH_SECRET="<output of: openssl rand -base64 32>"
# NEXTAUTH_URL="http://<pi-host>:3000"          # or your domain

npm install --omit=dev=false      # install everything including build deps
```

> Tip: native modules like `bcryptjs` compile fine on arm64. If you ever swap to `argon2`, install `python3` + `make` first.

### 6. Run migrations + build

```bash
npx prisma migrate deploy
npm run build
```

### 7. Run as a service (systemd)

Create `/etc/systemd/system/codeshare.service`:

```ini
[Unit]
Description=codeshare web app
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/codeshare
EnvironmentFile=/home/pi/codeshare/.env
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable + start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now codeshare
sudo systemctl status codeshare
journalctl -u codeshare -f      # live logs
```

App is now reachable at `http://<pi-host>:3000`.

### 8. (Recommended) Reverse proxy with nginx + HTTPS

```bash
sudo apt install -y nginx
```

Create `/etc/nginx/sites-available/codeshare`:

```nginx
server {
    listen 80;
    server_name your-domain.example;          # or pi-host.local

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/codeshare /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

For HTTPS via Let's Encrypt (only works if the Pi is reachable from the internet on port 80/443):

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.example
```

After issuing a cert, update `.env`:

```
NEXTAUTH_URL="https://your-domain.example"
```

then `sudo systemctl restart codeshare`.

### 9. Updating later

```bash
cd ~/codeshare
git pull              # if you used git
npm install
npx prisma migrate deploy
npm run build
sudo systemctl restart codeshare
```

### 10. Backups

```bash
# Dump
sudo -u postgres pg_dump codeshare > codeshare-$(date +%F).sql

# Restore
sudo -u postgres psql codeshare < codeshare-2026-05-07.sql
```

---

## Configuration reference (`.env`)

| Variable                  | Required | Notes                                                       |
| ------------------------- | -------- | ----------------------------------------------------------- |
| `DATABASE_URL`            | yes      | Postgres connection string                                  |
| `NEXTAUTH_SECRET`         | yes      | `openssl rand -base64 32`                                   |
| `NEXTAUTH_URL`            | yes      | Public URL of your install                                  |
| `GITHUB_CLIENT_ID/SECRET` | no       | Enables GitHub OAuth when both are set                      |
| `GOOGLE_CLIENT_ID/SECRET` | no       | Enables Google OAuth when both are set                      |

---

## Security notes

- Passwords are hashed with bcrypt (cost 12).
- Auth and create endpoints are rate-limited per IP / user (in-memory; swap for Redis in multi-instance setups).
- All private snippet reads/writes verify ownership via the session.
- Code is rendered server-side via highlight.js into pre-escaped HTML — no user content is ever passed through `eval` or unsanitized DOM injection.
- NextAuth provides CSRF protection on its routes by default; the credentials provider relies on the same protections.
- Set strong `NEXTAUTH_SECRET` and a strong DB password before exposing to the internet.

---

## License

MIT — do whatever, no warranty.
