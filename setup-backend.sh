#!/bin/bash
set -e

# 1. Python virtual environment
if [ ! -d ".venv" ]; then
  echo "Creating Python virtual environment..."
  python3 -m venv .venv
fi
source .venv/bin/activate

# 2. Install Python dependencies
if [ -f "requirements.txt" ]; then
  echo "Installing Python dependencies..."
  pip install -r requirements.txt
else
  echo "No requirements.txt found, skipping Python package install."
fi

# 3. Node.js dependencies
if [ -f "package.json" ]; then
  if command -v pnpm &> /dev/null; then
    echo "Installing Node.js dependencies with pnpm..."
    pnpm install
  else
    echo "Installing Node.js dependencies with npm..."
    npm install
  fi
else
  echo "No package.json found, skipping Node.js install."
fi

# 4. Environment variables
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  echo "Copying .env.example to .env..."
  cp .env.example .env
fi

# 5. Prisma migrations and generate
if [ -f "prisma/schema.prisma" ]; then
  echo "Running Prisma migrate and generate..."
  npx prisma migrate deploy
  npx prisma generate
else
  echo "No prisma/schema.prisma found, skipping Prisma setup."
fi

# 6. Seed database (optional)
if [ -f "prisma/seed.ts" ]; then
  echo "Seeding database..."
  npx ts-node prisma/seed.ts
else
  echo "No seed.ts found, skipping database seed."
fi

echo "Backend setup complete!"
