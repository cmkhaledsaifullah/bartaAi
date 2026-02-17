# BartaAI

বার্তাAI একটি বুদ্ধিমান এআই-চালিত অ্যাপ, যা বাংলাদেশের বিশ্বস্ত সংবাদ প্রবন্ধগুলোকে জ্ঞানভিত্তি হিসেবে ব্যবহার করে। এই অ্যাপে ব্যবহারকারীরা যেকোনো সাম্প্রতিক বা গুরুত্বপূর্ণ বিষয় নিয়ে প্রশ্ন করতে পারেন এবং খবরের প্রেক্ষাপটে সঠিক উত্তর পেতে পারেন। বার্তাAI জটিল সংবাদকে সহজ ও বোধগম্য ভাষায় ব্যাখ্যা করে, যাতে তথ্য বোঝা হয় দ্রুত ও স্পষ্টভাবে। প্রতিটি উত্তরই যাচাইকৃত সংবাদ উৎস থেকে নেওয়া তথ্যের উপর ভিত্তি করে তৈরি হওয়ায় বিশ্বাসযোগ্যতা বজায় থাকে। বার্তাAI — খবর থেকে উত্তর আপনাকে খবর পড়ার বাইরে গিয়ে খবর বুঝতে, বিশ্লেষণ করতে এবং সিদ্ধান্ত নিতে সহায়তা করে।

## Prerequisites

- Node.js ^20
- npm ^10

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server with hot reloading. Use `-- --host` to expose to your LAN. |
| `npm run build` | Generate an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally to mirror hosted behavior. |
| `npm run preview:serve` | Helper used by e2e/CI to run preview on `127.0.0.1:4173`. |
| `npm run lint` | Run ESLint across the project. |
| `npm run test` | Execute the Vitest suite in watch mode. |
| `npm run test:coverage` | Run Vitest once with Istanbul coverage (HTML + text reports under `coverage/`). |
| `npm run test:mutation` | Launch Stryker mutation testing against `src/Home.tsx`. |
| `npm run test:e2e:run` | Execute the Vitest+Selenium WebDriver suite (expects an app already running). |
| `npm run test:e2e` | Build the app, start the preview server, then launch Chromedriver-backed e2e specs. |
| `npm run ci` | Convenience script used by GitHub Actions (lint → coverage → mutation → e2e). |

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
├─ App.tsx               # Root wrapper + mock article seed + prop wiring
├─ Home.tsx              # BanglaNews RAG explorer UI (chat, chunk visualizer, Gemini hook)
├─ ChunkVisualizer.tsx   # Component for visualizing retrieved chunks
├─ Prompt.tsx            # Prompt input component with suggestions
├─ homeHelpers.ts        # Helper functions for RAG pipeline (keywords, context, Gemini API)
├─ types.ts              # Shared type declarations (articles, chat, RAG pipeline)
├─ App.css               # Supplemental utility classes (line clamp, animations)
├─ index.css             # Tailwind entry point + global tokens
└─ main.tsx              # React entry point
```

Adjust the structure as the app grows (e.g., add `features/`, `components/`, or `routes/`).

### Data & Type Flow

- `App.tsx` now hosts the `MOCK_ARTICLES` array so you can swap in live data sources (REST, Firestore, etc.) without touching the presentation layer.
- `Home.tsx` receives the articles via props and only contains UI logic/state, making it easy to reuse in other shells.
- All domain models—articles, retrieved chunks, chat messages, Gemini responses, and prop types—live in `src/types.ts` for a single source of truth when expanding the RAG pipeline.

## BartaAI Overview

- Three mock Bangla news articles simulate a knowledge base, with sidebar previews and chunk toggles.
- Chat panel shows user/bot turns plus retrieved chunks, and a live pipeline list tracks RAG steps.
- Optional Gemini API key field triggers real responses via `gemini-2.5-flash-preview-09-2025`; without a key the UI falls back to scripted answers.
- Example prompts (“মেট্রোরেল…”, “How is Bangladesh doing in Cricket?”) help demo the flow instantly.

## Styling Stack

- Tailwind CSS 3 drives layout/typography via utility classes; `src/index.css` wires in `@tailwind` directives.
- `src/App.css` only defines helper utilities (line clamp + motion presets) to keep Tailwind as the primary styling mechanism.
- Lucide icons supply the visual language for sections (database, CPU, bot avatar, etc.).

## Testing & Linting

- ESLint is configured via `eslint.config.js`. Extend as needed for stricter rules.
- Vitest powers the unit tests (see `npm run test`/`npm run test:coverage`) and enforces 95% thresholds across statements/branches/functions/lines.
- End-to-end coverage uses Selenium WebDriver + headless Chrome, orchestrated through Vitest (`npm run test:e2e`). Selenium Manager automatically provisions the matching Chromedriver, so you only need a local Chrome install. Override the target URL with `E2E_BASE_URL` if you serve the app elsewhere.
- Mutation coverage is enforced with [Stryker](https://stryker-mutator.io/); run `npm run test:mutation` to see surviving mutants in `reports/mutation`.

## Continuous Integration & Deployment

### CI Pipeline (`.github/workflows/ci.yml`)
Runs on every push and pull request to `main`. Provisions Chrome, installs dependencies, lints, executes the coverage suite, runs Stryker mutation testing, and exercises the Selenium WebDriver e2e flow. Coverage, mutation, and generated reports upload as artifacts for inspection.

### CD Pipeline (`.github/workflows/cd.yml`)
Automatically deploys to GitHub Pages on every push to `main`. The workflow runs in three stages:

1. **Test Stage**: Runs the complete test suite as integration tests
   - Linting
   - Unit tests with coverage
   - Mutation testing
   - End-to-end tests with Selenium
   - Uploads test reports as artifacts
2. **Build Stage**: Only runs if all tests pass
   - Builds the production bundle (`dist/`)
   - Prepares artifacts for deployment
3. **Deploy Stage**: Only runs if build succeeds
   - Deploys to GitHub Pages environment

This ensures only fully tested code reaches production.

#### GitHub Pages Setup
To enable deployment:
1. Go to your repository Settings → Pages
2. Under "Build and deployment", set Source to **GitHub Actions**
3. Push to `main` branch to trigger the first deployment
4. Your app will be available at `https://<username>.github.io/<repo-name>/`

If deploying to a repository subdirectory (e.g., `https://<username>.github.io/bartaAi/`), update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/bartaAi/', // Match your repository name
  // ... rest of config
})
```

## Deploying to Other Platforms

### Traditional Server

1. Copy the `dist/` folder to your server.
2. Configure your web server to serve `index.html` for unknown paths to support SPA routing.
3. Enable gzip or brotli compression to match `npm run preview` performance.

You're ready to start building on top of this base.
