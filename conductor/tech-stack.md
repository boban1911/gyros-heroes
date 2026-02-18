# Technology Stack

## Frontend
- **Framework:** React (Vite-based for speed).
- **Styling:** Tailwind CSS (for mapping Figma tokens and handling responsiveness).
- **Icons:** Lucide React or similar (to match Figma iconography).
- **State Management:** React Context (if needed for simple UI states).

## Infrastructure
- **Hosting:** Vercel or Netlify (Static site deployment).
- **CI/CD:** Automated deployments on every push to `main`.
- **Version Control:** Git.

## Data & Content
- **Strategy:** Fully Static. Content (menu, locations, translations) will be stored in local JSON/TS files within the repository.
- **Assets:** Optimized images (WebP) served from the local project structure.

## Tools
- **Build Tool:** Vite.
- **Linting:** ESLint + Prettier.
- **Testing:** Vitest + React Testing Library (for core component verification).
