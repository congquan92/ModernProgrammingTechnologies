---
name: "MovieHub Netflix Dark Cinema Design System"
version: "1.0.0"
theme: "dark"
framework: "Next.js 16 (App Router) + React 19 + Tailwind CSS v4"
author: "Nguyen Quan, Dai, Thai"
tokens:
  colors:
    background:
      main: "#141414"
      surface: "#181818"
      elevated: "#232323"
      overlay: "rgba(0, 0, 0, 0.85)"
    brand:
      primary: "#E50914"
      hover: "#B80710"
    text:
      primary: "#FFFFFF"
      secondary: "#A3A3A3"
      muted: "#737373"
      inverted: "#000000"
    accent:
      matchScore: "#46D369"
      starRating: "#FACC15"
      infoLink: "#54B9C5"
      borderSubtle: "#2E2E2E"
  typography:
    fontFamily: "var(--font-geist-sans), -apple-system, BlinkMacSystemFont, sans-serif"
    heroTitle: { fontSize: "3.5rem", fontWeight: "900", lineHeight: "1.1" }
    sectionTitle: { fontSize: "1.5rem", fontWeight: "700", lineHeight: "1.25" }
    cardTitle: { fontSize: "0.875rem", fontWeight: "700", lineHeight: "1.2" }
    metadata: { fontSize: "0.75rem", fontWeight: "600", lineHeight: "1.4" }
  radii:
    card: "6px"
    button: "4px"
    badge: "3px"
    avatar: "4px"
  elevation:
    headerScrolled: "0 10px 25px -5px rgba(0, 0, 0, 0.9)"
    cardHover: "0 20px 30px -10px rgba(0, 0, 0, 0.95)"
---

# 🎬 MOVIEHUB DESIGN SYSTEM SPECIFICATION (DESIGN.md)

> **CONTRACT FOR ALL AI AGENTS & DEVELOPERS:**  
> This specification is the single source of truth for all UI, layout, styling, and Next.js 16 architecture within this project.  
> You must follow these constraints strictly. Do not invent new colors, do not alter button shapes, and do not break Server/Client boundaries.

---

## 1. DESIGN PHILOSOPHY: NETFLIX DARK CINEMA

* **Immersion First:** The interface recedes into the background; posters and backdrops are the hero content.
* **No Pure Black Backgrounds:** Always use `--bg-main` (`#141414`). Never use `#000000` for container backgrounds as it creates OLED motion blur (black smearing).
* **Controlled Elevation:** Use dark surface variations (`#181818`, `#232323`) and soft ambient shadows instead of harsh borders.
* **Cinematic Micro-Interactions:** Smooth scale transforms (`hover:scale-105`), subtle brightness lifts, and responsive horizontal rows.

---

## 2. COLOR CONTRACT & TOKEN MAPPING

| Token Key | Hex Value | Tailwind Utility | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `background.main` | `#141414` | `bg-[#141414]` | Global page background, body background |
| `background.surface`| `#181818` | `bg-[#181818]` | MovieCard base, Search input container |
| `background.elevated`| `#232323` | `bg-[#232323]` | Modals, popup info cards, detail drawer |
| `brand.primary` | `#E50914` | `text-[#E50914]`, `bg-[#E50914]` | MOVIEHUB Logo, TOP 10 badge, active favorites |
| `brand.hover` | `#B80710` | `hover:bg-[#B80710]` | Active state for brand buttons |
| `text.primary` | `#FFFFFF` | `text-white` | Movie titles, active nav links, primary buttons |
| `text.secondary` | `#A3A3A3` | `text-gray-300`, `text-zinc-400` | Movie overviews, secondary nav links |
| `text.muted` | `#737373` | `text-gray-500`, `text-zinc-600` | Release dates, copyright, footnote text |
| `accent.matchScore`| `#46D369` | `text-emerald-400` | Netflix match percentage indicator (e.g. `98% Phù hợp`) |
| `accent.starRating`| `#FACC15` | `text-yellow-400` | TMDB star rating indicator ⭐ |

---

## 3. COMPONENT CONTRACTS

### 3.1. Navbar Header (`components/client/Header.tsx`)
* **Position:** Fixed to top `fixed top-0 left-0 right-0 z-50 w-full`.
* **State 1 - At Top (`scrollY <= 30`):**
  - Background must be transparent with subtle downward gradient: `bg-gradient-to-b from-black/80 via-black/30 to-transparent`.
  - The hero image must bleed through underneath the navbar.
* **State 2 - Scrolled (`scrollY > 30`):**
  - Background must transition to solid Netflix dark: `bg-[#141414] shadow-xl shadow-black/80`.
  - Transition duration: `transition-all duration-500 ease-in-out`.
* **Logo:** `MOVIEHUB` with `MOVIE` in `#E50914` and `HUB` in `#FFFFFF`, tracking tight.
* **Avatar:** Classic square `w-8 h-8 rounded` with gradient and tiny chevron dropdown.

### 3.2. Billboard Hero Banner (`components/server/HeroBanner.tsx`)
* **Dimensions:** `h-[80vh] sm:h-[90vh]` minimum `550px`.
* **Image Contract:** Uses `<Image fill priority sizes="100vw" className="object-cover" />` for LCP optimization.
* **Gradients:**
  - Top fade: `bg-gradient-to-b from-black/80 via-transparent to-transparent h-32`
  - Bottom fade: `bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent` (seamless blend into rows)
  - Left vignette: `bg-gradient-to-r from-[#141414]/90 via-[#141414]/30 to-transparent`
* **Buttons Required:**
  - **Play Button (Primary):** White background, black bold text, play triangle icon (`bg-white hover:bg-white/80 text-black font-extrabold px-6 sm:px-8 py-2.5 sm:py-3 rounded-md`).
  - **Info Button (Secondary):** Translucent glass, white text, info icon (`bg-white/30 hover:bg-white/20 text-white font-bold px-5 sm:px-7 py-2.5 sm:py-3 rounded-md backdrop-blur-md`).

### 3.3. Horizontal Movie Rows (`components/client/MovieRow.tsx`)
* **Behavior:** Smooth horizontal scroll container (`flex overflow-x-auto no-scrollbar scroll-smooth`).
* **Navigation Arrows:** Left `‹` and right `›` arrows that appear on row hover (`group-hover:opacity-100`).
* **Special Mode - Top 10 Row (`isTop10={true}`):**
  - Must render giant outlined rank numbers `1` through `10` using `.netflix-number` side-by-side with each poster.

### 3.4. Movie Card (`components/server/MovieCard.tsx`)
* **Aspect Ratio:** Fixed `aspect-[2/3]` parent with `relative w-full bg-[#202020]` to guarantee **CLS = 0.00**.
* **Next.js Image:** `<Image fill sizes="(max-width: 640px) 40vw, 20vw" loading="lazy" />`.
* **Badges:**
  - Red **N** logo in top-left corner.
  - Star rating ⭐ in top-right corner.
  - `% Match score` (emerald), `HD` label, and release year in bottom caption bar.
* **Hover Interaction:** Scale `scale-105`, elevate `z-30`, shadow `shadow-2xl shadow-black/80`.

### 3.5. Detail Page & Cast List (For Dai: `app/movie/[id]/page.tsx`)
* **Cast Card Contract:** Horizontal scrolling list of actor profiles, `w-28 sm:w-32 aspect-[3/4]` rounded image, bold white name, muted gray character name.
* **Suspense Streaming:** Wrap `<CastList />` and `<SimilarMovies />` in React `<Suspense fallback={<CastSkeleton />} />`.

### 3.6. Search Bar & Watchlist (For Thai: `components/client/SearchBar.tsx`, `WatchlistButton.tsx`)
* **SearchBar Contract:** Pill or rounded-md input with dark background `bg-[#242424]`, white text, yellow/red focus ring, debounced URL query update.
* **Watchlist Button Contract:** Heart icon, toggles between "Lưu xem sau" (border-gray-500) and "❤️ Đã lưu" (border-red-600 bg-red-600/20 text-white).

---

## 4. NEXT.JS 16 ARCHITECTURAL CONTRACTS

1. **Default to Server Components:**
   - Every page (`page.tsx`), layout (`layout.tsx`), and static display component MUST remain a Server Component.
   - Do NOT add `"use client"` unless the component directly interacts with the browser (`window`, `localStorage`, `onClick`, `onChange`, `useState`, `useRef`).
2. **Zero Client-Side TMDB Keys:**
   - `TMDB_API_KEY` must NEVER be prefixed with `NEXT_PUBLIC_`.
   - Never call TMDB directly from Client Components. All fetches go through `services/tmdb.ts`.
3. **ISR Caching Mandate:**
   - Every `fetch()` in `services/tmdb.ts` must declare `{ next: { revalidate: N } }`.
4. **Image Optimization & CLS Prevention:**
   - Never use raw `<img>` tags. Always use `next/image` with predefined `width/height` or `fill` with parent `aspect-ratio`.

---

## 5. STRICT GUARDRAILS: DO'S AND DON'TS

### ❌ FORBIDDEN PATTERNS:
* **NEVER** use pure `#000000` for main page backgrounds (use `#141414`).
* **NEVER** use rounded-2xl or rounded-3xl for movie cards (use `rounded-md` or `rounded`).
* **NEVER** add inline CSS styles (`style={{ ... }}`); use Tailwind utility tokens.
* **NEVER** convert a Server Component to Client Component just to add a small button. Split the interactive button into its own small Client Component file.
* **NEVER** break the navbar scroll behavior (it must start transparent and turn solid `#141414` on scroll).

### ✅ REQUIRED PATTERNS:
* **ALWAYS** keep the MOVIEHUB logo red `#E50914`.
* **ALWAYS** wrap lazy-loaded server components in `<Suspense fallback={<Skeleton />} />`.
* **ALWAYS** check TypeScript compilation with `npx tsc --noEmit` and lint with `npm run lint`.

---

## 6. PROJECT DIRECTORY MAP

```text
modern-programming-technologies/
├── DESIGN.md                   # 🌟 THIS CONTRACT SPECIFICATION
├── DESIGN_SYSTEM.md            # Mirror / Vietnamese documentation reference
├── app/
│   ├── layout.tsx              # Root Layout (Fixed Netflix Navbar + Footer)
│   ├── page.tsx                # Home Page (Billboard + Horizontal Sliders)
│   ├── loading.tsx             # Global Page Skeleton
│   ├── globals.css             # Tailored palette: #141414, no-scrollbar, .netflix-number
│   ├── movie/[id]/             # [Dai] Movie details dynamic route
│   ├── search/                 # [Thai] Search page with searchParams
│   └── watchlist/              # [Thai] Watchlist page backed by cookies
├── components/
│   ├── client/
│   │   ├── Header.tsx          # Dynamic transparent-to-solid scroll header
│   │   ├── MovieRow.tsx        # Horizontal slider with Top 10 number mode
│   │   ├── SearchBar.tsx       # [Thai] Debounced URL sync search
│   │   └── WatchlistButton.tsx # [Thai] Server Action bookmark trigger
│   └── server/
│       ├── HeroBanner.tsx      # Billboard hero banner with Play/Info buttons
│       ├── MovieCard.tsx       # 2:3 Netflix poster card with hover zoom
│       ├── MovieCardSkeleton.tsx
│       └── Footer.tsx          # Minimal Netflix footer
├── services/
│   └── tmdb.ts                 # Server-only TMDB fetcher with ISR caching
└── types/
    └── tmdb.d.ts               # TypeScript types for Movie, Credits, Details
```
