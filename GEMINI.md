# Gyros Heroes - AI Assistant Context

## Project Overview
**Name:** Gyros Heroes
**Type:** React Web Application
**Purpose:** Marketing/Menu site for a fast-food brand. Primarily a long-scrolling landing page structure (`Home.tsx`).

## Tech Stack
- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Custom config: `tailwind.config.js`)
- **Routing:** React Router v7 (`react-router-dom`)
- **Testing:** Vitest, React Testing Library (`@testing-library/react`)
- **Key Libraries:** `embla-carousel-react` (Sliders), `lucide-react` (Icons)

## Architecture & Conventions
- **Component Pattern:** Reusable components are primarily in `src/components/`, heavily relying on composition. Lazy loading and React `Suspense` are used for components "below the fold" in `Home.tsx` to optimize performance.
- **Data Management:** Static data storage pattern. Content such as the restaurant menu is modeled as strong-typed objects residing in `src/data/` (e.g., `src/data/menu.ts` exporting `MenuItem` models) instead of a live API.
- **Styling Standards:** Avoid arbitrary Tailwind values. Utilize predefined theme settings from `tailwind.config.js`:
  - **Colors:** `hero-blue`, `hero-blue-dark`, `hero-yellow`, `hero-green`, `dandelion`
  - **Fonts:** `montserrat`, `inter`
  - **Shadows:** `hero-focus`, `hero-xs`
- **Asset Optimization:** Assets (like `.webp` images) are managed under `src/assets/` and optimized on build via `vite-plugin-image-optimizer`.

## Figma MCP Guidelines (If APPLICABLE)
- Treat the Figma MCP output as a representation of design and behavior.
- Replace Tailwind utility classes with the project's preferred design‑system tokens.
- Reuse existing components (buttons, typography, icon wrappers) and adhere strictly to 1:1 visual parity.
