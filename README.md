# BartaAI React Starter

Opinionated Vite + React + TypeScript setup that runs locally with Vite's dev server and ships a static bundle ready for any static host or file server.

## Prerequisites

- Node.js ^20
- npm ^10

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reloading. Use `-- --host` to expose to your LAN. |
| `npm run build` | Generate an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally to mirror hosted behavior. |
| `npm run lint` | Run ESLint across the project. |

## Local Development

1. Install dependencies: `npm install`
2. Start the dev server: `npm run dev`
3. Open the printed URL (default http://localhost:5173)

## Production Build & Hosting

1. Run `npm run build` to emit static assets under `dist/`.
2. Serve everything inside `dist/` from any static web host (Vercel, Netlify, GitHub Pages, S3, nginx, etc.).
3. When hosting under a sub-path, update the `base` option in `vite.config.ts` or set `VITE_BASE` and read it inside the config.
4. Use `npm run preview` locally for a production-like server that mirrors most hosting environments.

## Environment Variables

- Prefix runtime variables with `VITE_` (e.g., `VITE_API_URL`).
- Create `.env`, `.env.local`, or environment-specific files such as `.env.production`. Vite injects them at build time.

## Project Structure

```
src/
├─ App.tsx          # Main UI shell with quick-start guidance
├─ App.css          # Custom styling for the landing screen
├─ main.tsx         # React entry point
└─ assets/          # Static assets (favicons, SVGs, etc.)
```

Adjust the structure as the app grows (e.g., add `features/`, `components/`, or `routes/`).

## Testing & Linting

- ESLint is configured via `eslint.config.js`. Extend as needed for stricter rules.
- Add your preferred testing stack (Vitest, Jest, Playwright) when you introduce runtime or UI tests.

## Deploying to a Traditional Server

1. Copy the `dist/` folder to your server.
2. Configure your web server to serve `index.html` for unknown paths to support SPA routing.
3. Enable gzip or brotli compression to match `npm run preview` performance.

You're ready to start building on top of this base.
