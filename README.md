# EasyMesse

EasyMesse is a platform that connects believers to Catholic parishes for offering and requesting masses — with parish, priest, and diocese administration, and integrated collection/withdrawal of mass-offering payments — built on Nx, NestJS, and Next.js.

## 📚 Documentation

- [Getting Started](#-getting-started) — prerequisites, local setup, running the stack
- [Project Structure](#-project-structure) — apps, libraries, and where things live
- [Common Nx Tasks](#-common-nx-tasks) — build, test, lint, and explore the project graph
- [Contributing](#-contributing) — branching model and PR workflow

There is no separate `docs/` directory yet — this README is the single source of truth for setup and workflow. If that changes, update the links above accordingly.

## 📦 Project Structure

```
.
├── apps/
│   ├── easy-messe/        # Public site: offer/find masses (Next.js)
│   ├── admin-ui/          # Admin dashboard (Next.js)
│   ├── diocese-ui/        # Diocese-facing frontend (Next.js)
│   ├── backend/           # API: auth, parishes, priests, masses,
│   │                      #   mass orders, payments, notifications (NestJS)
│   │   └── src/prisma/    # Prisma schema, migrations, and seed script
│   └── *-e2e/             # Cypress E2E suites for each frontend
├── libs/
│   ├── shared-ui/         # Shared React components
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

You'll also need a `.env` file at the repo root — ask a teammate for the values:

```
NODE_ENV=
PORT=                  # backend port, e.g. 5000
JWT_SECRET_KEY=
DATABASE_URL=          # Postgres connection string (Prisma)
NEXT_PUBLIC_API_URL=   # e.g. http://localhost:5000/api
```

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

# Admin dashboard
npx nx serve admin-ui --port=4201

# Diocese-facing frontend
npx nx serve diocese-ui --port=4202
```

The `--port` flags are required when running more than one frontend at once — without it, every Next.js app defaults to the same port (4200) and only the first one will bind successfully.

### Build for production

```bash
npx nx build <project>   # e.g. npx nx build backend
```

Build artifacts land in `dist/apps/<project>`.

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
