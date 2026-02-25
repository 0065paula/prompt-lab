# AGENTS.md

## Cursor Cloud specific instructions

**Prompt Lab** is a client-side-only Vue 3 SPA for AI prompt optimization. There is no backend, database, or external API — all data is stored in browser `localStorage` and optimization logic is simulated.

### Services

| Service | Command | Port |
|---------|---------|------|
| Vite Dev Server | `npm run dev` | 3000 |

### Key commands

- `npm run dev` — Start Vite dev server on port 3000 (with `host: true` for external access)
- `npm run build` — Production build to `dist/`
- `npm run preview` — Preview production build

### Notes

- No lint, test, or formatting scripts are configured in `package.json`.
- The project uses npm (lockfile: `package-lock.json`). Do not use yarn or pnpm.
- Node 18+ is required (Vite 5 dependency).
- All app routes use HTML5 history mode via Vue Router (`createWebHistory`).
