# Contributing to 创客星球 (PCG Maker Planet)

Thanks for your interest in contributing! This guide covers the basics for
getting a development environment running and submitting changes.

## Development setup

```bash
# 1. Clone and enter the frontend workspace
git clone <your-fork-url>
cd <repo>/app

# 2. Install dependencies
npm install

# 3. Configure environment
cp ../.env.example .env        # then fill in your GLM_API_KEY

# 4. Start the dev server (http://localhost:3000)
npm run dev
```

See the [root README](./README.md) for the full architecture overview and
environment variable reference.

## Project conventions

- **TypeScript + React 19** throughout `app/src`.
- Keep secrets out of the client. Any call to the GLM API **must** go through
  the serverless proxies in [`api/glm/`](./api/glm) — never embed a key in
  frontend code.
- Follow the existing component structure under `app/src/components` and
  `app/src/pages`.
- Run `npm run lint` before opening a pull request.

## Pull requests

1. Fork the repo and create a feature branch: `git checkout -b feat/my-feature`.
2. Make focused commits with clear messages.
3. Ensure `npm run build` and `npm run lint` pass.
4. Open a PR describing **what** changed and **why**.

## Reporting issues

Please include reproduction steps, expected vs. actual behavior, and your
environment (OS, Node version, browser) when filing an issue.
