# ⚡ LaunchStack

[![npm version](https://img.shields.io/npm/v/launchstack?color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/launchstack)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/Ennygabby01/launchstack?style=flat&logo=github)](https://github.com/Ennygabby01/launchstack)

> Production-ready project scaffolding for Node.js developers.

LaunchStack is an interactive CLI that generates fully structured, dependency-ready projects in seconds. It detects your environment, asks the right questions (or lets AI answer them for you), and outputs a project wired with the exact stack you chose — with no pinned outdated dependencies.

---

## Why LaunchStack?

Starting new projects usually means:

- manually creating folders
- installing and configuring dependencies
- wiring databases and authentication
- setting up Docker and environment variables
- writing repetitive boilerplate

LaunchStack removes that friction by generating a production-ready project structure in seconds.
Instead of spending time on setup, developers can start building immediately.

---

## Installation

```bash
# Run without installing
npx launchstack

# Or install globally
npm install -g launchstack
```

**Requires Node.js v20 or higher.**

---

## Quick Start

```bash
npx launchstack init my-app
```

LaunchStack will guide you through:

1. Selecting a project type
2. Choosing your stack (framework, database, ORM, auth, modules)
3. Optionally describing your app in plain English for AI-assisted configuration
4. Installing the latest stable dependencies automatically

---

## How LaunchStack Works

```
Developer
   │
   ▼
launchstack init
   │
   ▼
Environment Detection
(Node • Docker • Redis • Git • Ollama)
   │
   ▼
Interactive Wizard or AI Description
   │
   ▼
Stack Configuration
(Framework • DB • ORM • Auth • Modules)
   │
   ▼
Template Generator
   │
   ▼
Dependency Installer
(latest stable versions)
   │
   ▼
Production-ready project
```

---

## Commands

### `launchstack init [name]`

Launch the full interactive wizard. Optionally pass a project name.

```bash
launchstack init
launchstack init my-saas-app
launchstack init my-api --no-install
```

### `launchstack create <type>`

Quickly scaffold a project by type without going through the full wizard.

```bash
launchstack create backend
launchstack create frontend
launchstack create fullstack
launchstack create microservice
launchstack create worker
launchstack create cli
```

### `launchstack add <module>`

Add a module to an existing LaunchStack project.

```bash
launchstack add redis
launchstack add logging
launchstack add email
launchstack add rate-limit
launchstack add queue
launchstack add file-storage
launchstack add payments
```

Run this from inside a project created with LaunchStack (requires `launchstack.json`).

### `launchstack doctor`

Check your environment and scan all template dependencies for freshness.

```bash
launchstack doctor
```

Output example:

```
✔ Node detected
✔ npm detected
✔ Git detected
✔ Docker detected
✖ Redis not detected
✖ Ollama not detected

Checking template dependencies...

  ✔  express v5.0.0
  ✔  fastify v5.2.0
  ✔  prisma v6.3.1
  ⚠  mongoose — last updated >12 months ago
```

### `launchstack templates update`

Pull the latest templates from the remote registry.

```bash
launchstack templates update
```

### `launchstack templates list`

List all available template categories and variants.

```bash
launchstack templates list
```

Output example:

```
Available templates:

  backend/
    express
    fastify
    nest
    django

  frontend/
    next
    react-vite
    vue
    svelte
    alpine
    static

  modules/
    logging
    rate-limit
    email
    redis
    queue
    payments

  docker/
    node
    python
```

---

## Project Types

| Type | Description |
|---|---|
| `backend` | API server, SaaS backend, GraphQL API, AI server |
| `frontend` | Next.js, React (Vite), Vue, Svelte, Alpine.js, Static |
| `fullstack` | Combined frontend + backend in a monorepo |
| `microservice` | Lightweight service with optional framework |
| `worker` | Background job processor |
| `cli` | Node.js CLI tool |

---

## Supported Stack

### Backend Frameworks

**Node:** Express, Fastify, NestJS
**Python:** Django, Flask

### Frontend Frameworks
- Next.js
- React (Vite)
- Vue (Vite)
- Svelte
- Alpine.js (for lightweight interactive UIs)
- Static HTML

### Databases
PostgreSQL, MySQL, MongoDB, SQLite

### ORMs
Prisma, Drizzle, Sequelize, Mongoose

### Authentication
JWT, OAuth (Passport)

### Optional Modules
Rate limiting, Logging (Winston), Email (Nodemailer), Redis (ioredis), Background Jobs (BullMQ), File Storage (AWS S3)

### Payments
Stripe, PayPal, Paystack, Flutterwave

---

## AI-Assisted Mode

LaunchStack can automatically analyze your app description and suggest a stack configuration.
To enable AI mode, you must have at least one supported AI provider available.

### Enable AI Mode

LaunchStack supports multiple AI providers. It will automatically use the first available provider in this order:

1. **GitHub Models** *(recommended)* – fast, free tier available, no local setup required
2. **Ollama** – local AI, no API key required, but slower
3. **Manual prompts** – fallback when no AI provider is available

### Option 1: GitHub Models *(Recommended)*

GitHub Models is fast and free to use with a personal access token. Tokens are scoped to your session and can be revoked anytime from GitHub — do not store them permanently in your shell profile unless you understand the risk.

**Step 1 — Create a token:**

Go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → no special scopes required → set an expiry that suits you.

**Step 2 — Set the token for your current terminal session:**

This is the recommended approach — it lasts only for the session and never touches your disk:

**Mac/Linux (VSCode terminal or any shell session):**
```bash
export GITHUB_TOKEN=your_token_here
```

Then run LaunchStack immediately in the same terminal window.

**Windows (PowerShell session):**
```powershell
$env:GITHUB_TOKEN="your_token_here"
```

**Optional — Make it permanent (only if you trust your machine is secure):**

Mac/Linux:
```bash
echo 'export GITHUB_TOKEN=your_token_here' >> ~/.zshrc
source ~/.zshrc
```

Windows: Add via **System Properties → Environment Variables**.

> Tokens expire. If AI mode stops working, generate a new token and re-export it.

### Option 2: Ollama (Local AI)

Ollama runs AI models locally with no API key. It is slower than GitHub Models and requires downloading a model (~4GB+), but works fully offline.

Install Ollama:

**Mac (Homebrew):**
```bash
brew install ollama
```

**Mac (MacPorts):**
```bash
sudo port install ollama
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:** Download and run the installer from [ollama.com](https://ollama.com)

Start the service and pull a model:
```bash
ollama serve
ollama run llama3
```

After installation, LaunchStack will automatically detect Ollama during the environment check.

> If no AI provider is detected, LaunchStack will fall back to the manual interactive prompts.

**Example:**

```
Describe your app in one sentence:
> A SaaS for selling digital downloads with Stripe and user accounts

AI suggested configuration:
{
  "projectType": "backend",
  "backendFramework": "express",
  "database": "postgresql",
  "orm": "prisma",
  "auth": "jwt",
  "modules": ["email", "redis"],
  "payments": "stripe"
}
```

---

## Dependency Philosophy

LaunchStack **never pins outdated versions**. Dependencies are always installed at their latest stable versions at the time you run the CLI:

```bash
# LaunchStack runs this — no version pinning
npm install express prisma @prisma/client jsonwebtoken
```

Before installation, LaunchStack:

1. Resolves the latest version of each package from the npm registry for display
2. Runs a **freshness guard** that warns if any package hasn't been updated in over 12 months
3. Checks for and blocks deprecated packages (e.g. `request`, `node-sass`)

---

## Template System

Templates are automatically synced from the remote registry at `https://github.com/launchstack/templates`.

They are cached locally at `~/.launchstack/templates`. On each scaffold, LaunchStack:

1. Checks if a local cache exists
2. If online, pulls the latest templates (`git pull`)
3. If offline, uses the local cache
4. If no cache exists and the registry is unreachable, LaunchStack falls back to the bundled templates included with the CLI.

Templates are maintained in a [separate repository](https://github.com/Ennygabby01/launchstack-templates) and can be updated independently of CLI releases — no CLI update needed to get the latest template improvements.

```bash
# Manually update templates
launchstack templates update
```

---

## launchstack.json

Projects generated by LaunchStack include a small metadata file used by CLI commands such as `launchstack add`.

```json
{
  "projectType": "backend",
  "framework": "express",
  "database": "postgresql",
  "orm": "prisma",
  "modules": ["redis", "email"]
}
```

This file allows LaunchStack to understand the structure of the current project and safely apply additional modules later.

---

## Example Generated Backend Project

```
my-api/
  src/
    controllers/
    routes/
    services/
    middleware/
    utils/
    config/
  tests/
  .env.example
  Dockerfile
  docker-compose.yml
  launchstack.json
  README.md
```

The exact structure depends on the selected stack (framework, modules, and Docker configuration).

---

## Environment Variables

After scaffolding, copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Common variables generated based on your stack:

| Variable | When generated |
|---|---|
| `DATABASE_URL` | Any database selected |
| `JWT_SECRET` | JWT auth |
| `REDIS_URL` | Redis or queue modules |
| `STRIPE_SECRET_KEY` | Stripe payments |
| `SMTP_HOST` / `SMTP_USER` | Email module |
| `STORAGE_BUCKET` | File storage module |

---

## Docker

If Docker is detected, LaunchStack will offer to generate:

- `Dockerfile` — multi-stage Node.js or Python build
- `docker-compose.yml` — app + database + Redis (based on your stack)
- `.dockerignore`

```bash
docker-compose up -d
```

---

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for full version history.

---

## License

MIT
