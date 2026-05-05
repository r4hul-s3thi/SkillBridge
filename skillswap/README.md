# SkillBridge — Frontend

React 19 + TypeScript + Vite + Tailwind CSS v4 + Socket.io frontend for the SkillBridge platform.

## Stack

- React 19 + TypeScript
- Vite 7
- Tailwind CSS v4
- Zustand (state management)
- Socket.io Client (real-time)
- Shadcn/ui components
- React Router v7

## Setup

```bash
npm install
```

Create `.env`:

```env
VITE_API_URL=http://localhost:8080/api
```

```bash
npm run dev
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier format |

## Deployment

Set `VITE_API_URL` to your Render backend URL in Vercel environment variables.

See the [root README](../README.md) for full documentation.
