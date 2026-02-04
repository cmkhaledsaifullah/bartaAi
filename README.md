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
├─ App.tsx          # Root wrapper + mock article seed + prop wiring
├─ Home.tsx         # BanglaNews RAG explorer UI (chat, chunk visualizer, Gemini hook)
├─ types.ts         # Shared type declarations (articles, chat, RAG pipeline)
├─ App.css          # Supplemental utility classes (line clamp, animations)
├─ index.css        # Tailwind entry point + global tokens
└─ main.tsx         # React entry point
```

Adjust the structure as the app grows (e.g., add `features/`, `components/`, or `routes/`).

### Data & Type Flow

- `App.tsx` now hosts the `MOCK_ARTICLES` array so you can swap in live data sources (REST, Firestore, etc.) without touching the presentation layer.
- `Home.tsx` receives the articles via props and only contains UI logic/state, making it easy to reuse in other shells.
- All domain models—articles, retrieved chunks, chat messages, Gemini responses, and prop types—live in `src/types.ts` for a single source of truth when expanding the RAG pipeline.

## BanglaNews RAG Explorer Overview

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
- Add your preferred testing stack (Vitest, Jest, Playwright) when you introduce runtime or UI tests.

## Deploying to a Traditional Server

1. Copy the `dist/` folder to your server.
2. Configure your web server to serve `index.html` for unknown paths to support SPA routing.
3. Enable gzip or brotli compression to match `npm run preview` performance.

You're ready to start building on top of this base.
