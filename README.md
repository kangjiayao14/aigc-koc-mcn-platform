<div align="center">

# 创客星球 · PCG Maker Planet

**The full-chain AI partner for KOC content creators — from idea to monetization.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Deploy: Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)

</div>

---

## Overview

**创客星球 (PCG Maker Planet)** is a gamified, AI-native web platform that
accompanies individual content creators (KOCs) across their entire journey —
from *"what should I post?"* all the way to *"how do I earn from it?"*.

Unlike tools that only help creators *save time*, Maker Planet is designed to
help them *make money*, closing the loop from content ideation → creation →
social distribution → monetization, wrapped in an immersive cyberpunk,
game-like experience.

> **Differentiation formula:** Depth (KOC-focused) × Closed loop (full-chain) × Personality (AI partner)

## ✨ Key features

| Module | What it does |
| --- | --- |
| 🛰️ **Topic Radar** | Data-driven, personalized topic discovery pulling live trends (Zhihu, Bilibili, etc.) so creators always know what to post. |
| 🧬 **Persona Engine** | Builds and maintains a stable personal content style / brand DNA. |
| 💬 **Interaction Agent** | Assists with comment replies and audience interaction. |
| 🚀 **One-click Seeding Workflow** | Turns content into monetizable "种草" campaigns — the full-chain closed loop. |
| 📈 **Virality Simulator** | Predicts a post's potential **before** publishing, not just after. |
| 🎮 **Social & Game Hub** | Cinema, friend system, murder-mystery (剧本杀), quests, and a leveling/economy system to lower the barrier to creation. |
| 🏪 **Marketplace** | Interstellar marketplace for creators. |

## 🧱 Tech stack

- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 7
- **Styling:** Tailwind CSS 3.4 + custom CSS animations
- **UI primitives:** Radix UI + custom component library
- **3D / motion:** Three.js · React Three Fiber · Drei · GSAP · Framer Motion · Lenis
- **Routing:** React Router 7
- **AI:** GLM (Zhipu AI) — chat + image generation
- **Hosting:** Vercel (static frontend + serverless API functions)

## 🏗️ Architecture

The GLM API key is **never exposed to the browser**. All model calls are
proxied through serverless functions, so the secret lives only on the server.

```
Browser (React SPA)
   │  fetch('/api/glm/chat')          ← no key in the client
   ▼
Serverless proxy  (api/glm/chat.ts, api/glm/images.ts)
   │  Authorization: Bearer ${GLM_API_KEY}   ← key injected from env
   ▼
GLM API (open.bigmodel.cn)
```

Additional serverless endpoints:

- `api/trending.ts` — aggregates hot lists from Zhihu & Bilibili.
- `api/bilibili/view.ts` — fetches Bilibili video metadata, tags & comments.

During local development, the same proxy behavior is provided by a Vite
middleware plugin (`glmProxyPlugin` in [`app/vite.config.ts`](./app/vite.config.ts)),
so you get identical behavior without deploying.

## 📂 Project structure

```
.
├── api/                     # Vercel serverless functions
│   ├── glm/
│   │   ├── chat.ts          # GLM chat completion proxy (key stays server-side)
│   │   └── images.ts        # GLM image generation proxy
│   ├── bilibili/view.ts     # Bilibili video metadata endpoint
│   └── trending.ts          # Zhihu / Bilibili trending aggregator
├── app/                     # Frontend (Vite + React)
│   ├── src/
│   │   ├── components/       # UI + feature components
│   │   ├── pages/            # Routed pages (Landing, AgentHub, ContentLab, …)
│   │   ├── services/         # glmClient, imageGen, aiMock
│   │   ├── hooks/            # Custom React hooks
│   │   └── config.ts         # Site content configuration
│   ├── public/               # Static assets (images, audio, video)
│   └── vite.config.ts        # Vite config + local GLM proxy middleware
├── docs/                    # Research & planning documentation
├── .env.example             # Environment variable template
├── vercel.json              # Vercel build & function configuration
└── LICENSE
```

## 🚀 Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (tested on 20)
- A **GLM API key** from [Zhipu AI / BigModel](https://open.bigmodel.cn/)

### 1. Install dependencies

```bash
cd app
npm install
```

### 2. Configure environment

```bash
# From the repository root:
cp .env.example app/.env
# Then edit app/.env and set GLM_API_KEY to your real key.
```

| Variable | Required | Description |
| --- | --- | --- |
| `GLM_API_KEY` | ✅ | Server-side GLM key used by the API proxies. |
| `VITE_GLM_API_KEY` | ✅ | Same key; used by the Vite dev proxy. |
| `VITE_GLM_MODEL` | – | Primary chat model (default `glm-4.7-flashx`). |
| `VITE_GLM_FALLBACK_MODEL` | – | Fallback chat model (default `glm-4.7`). |
| `VITE_GLM_IMAGE_MODEL` | – | Image model (default `glm-image`). |
| `VITE_GLM_BASE_URL` | – | GLM API base URL. |

> 🔐 `app/.env` is git-ignored — your real key will **never** be committed.

### 3. Run the dev server

```bash
cd app
npm run dev
```

Open http://localhost:3000.

### 4. Build for production

```bash
cd app
npm run build      # outputs to app/dist
npm run preview    # preview the production build locally
```

## ☁️ Deployment (Vercel)

This repo is Vercel-ready via [`vercel.json`](./vercel.json):

- **Install:** `npm --prefix app install`
- **Build:** `npm --prefix app run build`
- **Output:** `app/dist`
- **Functions:** everything under `api/`

**Steps:**

1. Import the GitHub repository into Vercel.
2. In **Project Settings → Environment Variables**, add `GLM_API_KEY`
   (and the other `VITE_GLM_*` variables as needed).
3. Deploy. The serverless functions in `api/` are picked up automatically.

## 📚 Documentation

Design research and planning notes live in [`docs/`](./docs/README.md).

## 📄 License

Released under the [MIT License](./LICENSE).
