# EasyMesse

EasyMesse is a platform that connects believers to Catholic parishes for offering and requesting masses — with parish, priest, and diocese administration, and integrated collection/withdrawal of mass-offering payments — built on Nx, NestJS, and Next.js.

## 📚 Documentation

- [Getting Started](#-getting-started) — prerequisites, local setup, running the stack
- [Project Structure](#-project-structure) — apps, libraries, and where things live
- [Payments & Notifications](#-payments--notifications) — checkout flow, invoice delivery, reconciliation
- [Common Nx Tasks](#-common-nx-tasks) — build, test, lint, and explore the project graph
- [Contributing](#-contributing) — branching model and PR workflow

There is no separate `docs/` directory yet — this README is the single source of truth for setup and workflow. If that changes, update the links above accordingly.

## 📦 Project Structure

```
.
├── apps/
│   ├── easy-messe/        # Public site: offer/find masses, checkout (Next.js)
│   ├── admin-ui/          # Platform admin dashboard — parishes, masses,
│   │                      #   priests, cities, administrators, finances,
│   │                      #   platform settings (Next.js, JWT-authenticated)
│   ├── diocese-ui/        # Read-only diocese view over its parishes' masses (Next.js)
│   ├── backend/           # API: auth, parishes, priests, masses, mass orders,
│   │                      #   payments (NotchPay/PayPal), invoicing (SMS/email),
│   │                      #   transactions/ledger, admin dashboard (NestJS)
│   │   └── src/prisma/    # Prisma schema, migrations, and seed script
│   └── *-e2e/             # Cypress E2E suites for each frontend
├── libs/
│   ├── shared-ui/         # Shared React components (admin layout, auth forms, etc.)
│   ├── theme/             # Theming, language/i18n, and shared contexts
│   └── utils/             # Shared utilities
└── prisma.config.ts       # Prisma CLI config (schema/migrations/seed location)
```

## 🛠 Getting Started

### Clone the repository

```bash
git clone https://github.com/Poukam-Pierre/EasyMass.git
cd EasyMass
```

### Prerequisites

You need a Node version matching the one pinned in `.nvmrc` (`22.21.1`). Any Node version manager that reads `.nvmrc` works — [nvm](https://github.com/nvm-sh/nvm), [fnm](https://github.com/Schniz/fnm), [volta](https://volta.sh/), [asdf](https://asdf-vm.com/), etc. — or a system-wide Node install of that version if you'd rather not use one at all. With nvm:

```bash
nvm install   # only needed the first time, if that Node version isn't installed yet
nvm use
```

`nvm use` picks up the version pinned in `.nvmrc` automatically. If `npx`/`node` are "command not found" even after this, `nvm` itself isn't loaded in your shell — check that `~/.bashrc` (or `~/.zshrc`) sources `$NVM_DIR/nvm.sh`, open a new terminal, and run `nvm use` again before any `npx nx ...` command. Don't fall back to `sudo apt install npm` — that installs a separate system Node/npm that will conflict with the nvm-managed one.

### Install & configure

```bash
npm install
```

You'll also need a `.env` file at the repo root — copy [`.env.example`](.env.example) and fill in real values (ask a teammate, or use your own sandbox credentials for the payment/SMS/email providers below):

```bash
cp .env.example .env
```

`.env.example` is the source of truth for every variable the backend reads — keep it in sync when you add a new one. A few of them are third-party integrations, each optional in the sense that the app still boots without them, but the feature they back will silently fail (usually just logged, not thrown) until configured:

| Variable(s) | Used for |
|---|---|
| `DATABASE_URL` | Postgres connection (Prisma) |
| `JWT_SECRET_KEY` | Signing access tokens |
| `NOTCH_PUBLIC_KEY` | NotchPay mobile-money checkout |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` / `PAYPAL_MODE` / `PAYPAL_WEBHOOK_ID` | PayPal checkout + webhook verification |
| `FRONTEND_CHECKOUT_RETURN_URL` | Where a payer lands after checkout — **required**, mobile-money checkout throws without it |
| `ORANGE_CLIENT_ID` / `ORANGE_CLIENT_SECRET` / `ORANGE_SENDER_NUMBER` | Orange SMS — invoice delivery for mobile-money payers (Cameroon-only) |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Email — invoice delivery for PayPal payers |

See [Payments & Notifications](#-payments--notifications) below for how these fit together.

Prisma CLI settings (schema path, migrations, seed command) live in [`prisma.config.ts`](prisma.config.ts) at the repo root, not in `package.json`. Generate the client:

```bash
npx prisma generate
```

Other common Prisma commands (all read config from `prisma.config.ts` automatically):

```bash
npx prisma migrate dev      # create/apply a migration in development
npx prisma migrate deploy   # apply pending migrations (CI/production)
npx prisma db seed          # run the seed script — no longer runs automatically after migrate
npx prisma studio           # browse the database
```

### Run the apps

This is an Nx monorepo with one backend API and three separate Next.js frontends. Run each one in its own terminal (remember to `nvm use` first in each):

```bash
# Backend (NestJS API) — reads PORT from .env, defaults to http://localhost:5000/api
npx nx serve backend

# Public site for offering/finding masses
npx nx serve easy-messe --port=4200

# Admin dashboard — already pinned to 4300 in project.json, no --port needed
npx nx serve admin-ui

# Diocese-facing frontend
npx nx serve diocese-ui --port=4202
```

`easy-messe` and `diocese-ui` both default to Next's port 4200 if you don't pass `--port` — required when running more than one at once, or only the first will bind successfully. `admin-ui` is the exception: its port is fixed to `4300` in `apps/admin-ui/project.json` since the backend's CORS config (`apps/backend/src/main.ts`) allowlists that origin explicitly. If you add a fixed port for another frontend, remember to add its origin to that same CORS list.

### Build for production

```bash
npx nx build <project>   # e.g. npx nx build backend
```

Build artifacts land in `dist/apps/<project>`.

## 💳 Payments & Notifications

A believer pays for a mass offering one of two ways, and the delivery of their invoice depends on which:

- **Mobile money** (Orange Money / MTN, via [NotchPay](https://notchpay.co)) — Cameroon numbers only. On completion, the receipt is sent by **SMS** (Orange's SMS API) with a link to download the invoice PDF, rather than the invoice text itself.
- **PayPal** — for international payers. On completion, the receipt PDF is **emailed** as an attachment (SMTP).

Both paths converge on the same PDF generation (`PdfService`) and the same invoice-download endpoint (`GET /payment/:reference/invoice`, public — the link an SMS/email recipient clicks), so a payer can always re-download their receipt even if the original SMS/email didn't arrive.

Mobile-money payments aren't always confirmed synchronously — NotchPay's webhook can be missed. A scheduled job (`PaymentSchedulerService`, every minute) re-polls any payment still `PENDING` past its expected window and reconciles it the same way the webhook would. `MassSchedulerService` runs a similar per-minute sweep for mass lifecycle transitions (closing ordering, marking a mass processing/completed) and for emailing a parish its gathered intentions once ordering closes.

## 🧪 Common Nx Tasks

```bash
npx nx <target> <project> <...options>       # run one target for one project
npx nx run-many -t <target1> <target2>       # run multiple targets across all projects
npx nx run-many -t <target1> -p <proj1> <proj2>   # ...filtered to specific projects
npx nx graph                                 # visualize the project graph
```

Targets are defined per-project in each `apps/*/project.json`. See the [Nx docs](https://nx.dev/features/run-tasks) for more.

## 🤝 Contributing

Active development happens on `develop`; `main` reflects the released state. Create a branch from `develop` (e.g. `feat/...`, `fix/...`) and submit a PR back into `develop`.
