# Changelog

All notable changes to LaunchStack are documented here.

---

## [1.1.3] - 2026-03-14

### Fixed
- AI mode no longer overrides the project type selected by the user — if you pick Backend, the AI will never suggest a fullstack or frontend configuration
- AI prompt now explicitly instructs the model to respect the user's chosen project type

---

## [1.1.2] - 2026-03-14

### Fixed
- Removed `@nestjs/cli` from NestJS dev dependencies — it pulled in `webpack`, `@angular-devkit/*`, and `@electric-sql/pglite` (100MB+), causing installs to hang or fail. Users who need the NestJS CLI can install it globally: `npm i -g @nestjs/cli`

### Added
- `launchstack-templates` repo is now live at [github.com/Ennygabby01/launchstack-templates](https://github.com/Ennygabby01/launchstack-templates) — template updates can now be pulled independently of CLI releases

---

## [1.1.1] - 2026-03-14

### Fixed
- GitHub AI mode now uses the correct GitHub Models API endpoint (`models.inference.ai.azure.com`) instead of the Copilot-specific endpoint — regular GitHub PATs now work correctly
- AI error messages now include the response body for easier debugging

### Improved
- Ollama detection now checks MacPorts (`/opt/local/bin`), Homebrew Apple Silicon (`/opt/homebrew/bin`), and Intel/manual installs (`/usr/local/bin`) when `ollama` is not found in PATH
- GitHub Models is now the recommended AI provider (faster than Ollama, free tier available)
- README clarifies that `GITHUB_TOKEN` should be exported per session, not stored permanently — tokens expire

### Docs
- Added MacPorts install instructions for Ollama
- Added guidance on token expiry and session-scoped export

---

## [1.1.0] - 2026-03-13

### Added
- AI-Assisted Mode: describe your app in plain English and get a full stack configuration suggested automatically
- Ollama support (local AI, no API key required)
- GitHub Models API support (requires `GITHUB_TOKEN`)
- Freshness guard: warns before installing packages not updated in over 12 months
- Deprecated package detection with modern replacements suggested
- `launchstack doctor` command: environment check + template dependency freshness scan
- `launchstack templates update` / `launchstack templates list` commands
- Docker setup generation when Docker is detected
- Package manager selection: npm, pnpm, or yarn

---

## [1.0.2] - 2026-03-12

### Fixed
- Normalized `package.json` bin path and repository URL

---

## [1.0.1] - 2026-03-12

### Fixed
- LaunchStack branding casing
- Expanded AI-Assisted Mode documentation

---

## [1.0.0] - 2026-03-12

### Added
- Initial release
- Interactive project scaffolding wizard
- Backend frameworks: Express, Fastify, NestJS, Django, Flask
- Frontend frameworks: Next.js, React (Vite), Vue, Svelte, Alpine.js, Static
- Databases: PostgreSQL, MySQL, MongoDB, SQLite
- ORMs: Prisma, Drizzle, Sequelize, Mongoose
- Auth: JWT, OAuth (Passport)
- Modules: logging, rate-limit, email, Redis, queue, file storage
- Payments: Stripe, PayPal, Paystack, Flutterwave
- Docker support
- No pinned dependency versions — always installs latest stable
