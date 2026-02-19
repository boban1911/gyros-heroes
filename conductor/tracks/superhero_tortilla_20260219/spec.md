# Track: Floating Superhero Tortilla Implementation

## Overview
This track involves adding a decorative, floating "superhero tortilla" image to the landing page, positioned between the Hero section and the "About Us" ("O Nama") section. This element is purely aesthetic and serves to reinforce the brand's heroic theme.

## Functional Requirements
- **Visual Integration:** Export and implement the "superhero tortilla" illustration from Figma (node `1:4726`).
- **Positioning:** The image must float between the Hero section and the "O Nama" section, overlapping or bridging the transition as seen in the design reference (`src/assets/screenshoots/Monosnap Gyros Heroes bdj – Figma 2026-02-19 12-22-32.png`).
- **Responsive Behavior:** 
    - **Desktop/Tablet:** Visible and correctly positioned relative to the sections.
    - **Mobile:** The image must be hidden to maintain a clean layout and prioritize content on smaller screens.

## Non-Functional Requirements
- **Performance:** Ensure the image is optimized (e.g., WebP format) to minimize impact on page load speed.
- **Accessibility:** Provide appropriate `alt` text (e.g., "Superhero tortilla character mascot") or mark as decorative.

## Acceptance Criteria
- [ ] Superhero tortilla image is correctly exported and added to assets.
- [ ] Image is visible on desktop and positioned between Hero and About Us sections.
- [ ] Image is hidden on mobile devices.
- [ ] Visual parity with the provided screenshot and Figma design.

## Out of Scope
- Any changes to the Hero or "O Nama" section content itself.
- Animations or interactive behaviors for the tortilla (unless basic hover effects are requested later).
