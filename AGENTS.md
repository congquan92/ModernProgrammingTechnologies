<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# 🎬 UI & DESIGN SYSTEM CONTRACT (MANDATORY FOR ALL AGENTS)

When developing or modifying any user interface, layout, component, or route in this repository, you **MUST ALWAYS** read and strictly follow [`DESIGN.md`](./DESIGN.md) (and [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)).

- **Visual Theme:** Netflix Dark Cinema (Background `#141414`, Brand Red `#E50914`, Text `#FFFFFF`).
- **Component Contracts:** Follow exact button variants, badges, horizontal `MovieRow` sliders, and `MovieCard` specifications defined in `DESIGN.md`.
- **Navbar Rule:** Header must start transparent and smoothly transition to `#141414` on scroll.
- **Architectural Rules:** Default to Server Components, keep `TMDB_API_KEY` on the server, use ISR caching with `next: { revalidate }`, and ensure zero CLS with `next/image`.
