#!/usr/bin/env bash
# One-shot bootstrap for installing codeshare on a fresh Raspberry Pi (Debian / Raspberry Pi OS).
# Run on the Pi:  bash deploy/install-pi.sh
# Edit the variables at the top first!

set -euo pipefail

DB_USER="codeshare"
DB_NAME="codeshare"
DB_PASSWORD="$(openssl rand -base64 24 | tr -d '=+/' | cut -c1-24)"
APP_DIR="$HOME/codeshare"
APP_USER="$USER"
APP_PORT="3000"

echo "==> Updating system"
sudo apt update
sudo apt full-upgrade -y

echo "==> Installing build essentials"
sudo apt install -y build-essential git curl ca-certificates openssl

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js 20"
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo "    Node version: $(node -v)"

echo "==> Installing PostgreSQL"
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql

if ! sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
  echo "==> Creating database role and database"
  sudo -u postgres psql <<SQL
CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';
CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL
else
  echo "==> Database role already exists, skipping"
fi

if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: $APP_DIR does not exist. Copy the project there first."
  echo "  rsync -avz --exclude node_modules --exclude .next codeshare/ ${USER}@<pi>:${APP_DIR}/"
  exit 1
fi

cd "$APP_DIR"

if [ ! -f .env ]; then
  echo "==> Creating .env"
  SECRET="$(openssl rand -base64 32)"
  cat > .env <<EOF
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="http://$(hostname).local:${APP_PORT}"
NEXT_PUBLIC_DISCOVER_ENABLED="true"
EOF
  echo "    .env written. Review it: $APP_DIR/.env"
fi

echo "==> Installing npm dependencies"
npm install

echo "==> Running database migrations"
npx prisma migrate deploy

echo "==> Building"
npm run build

echo "==> Installing systemd unit"
sudo cp deploy/codeshare.service /etc/systemd/system/codeshare.service
sudo sed -i "s|/home/pi/codeshare|${APP_DIR}|g; s|User=pi|User=${APP_USER}|g" \
  /etc/systemd/system/codeshare.service
sudo systemctl daemon-reload
sudo systemctl enable --now codeshare

echo
echo "Done. Check status with:"
echo "  systemctl status codeshare"
echo "  journalctl -u codeshare -f"
echo
echo "Open http://$(hostname).local:${APP_PORT} in your browser."
