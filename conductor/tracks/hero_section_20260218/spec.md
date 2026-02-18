# Specification: Hero Section Implementation

## Overview
Implement the "Hero" section of the Gyros Heroes landing page based on the Figma design. This section is the primary entry point for users and features the main value proposition along with direct ordering links for specific cities.

**Figma Source:** [Hero Section](https://www.figma.com/design/uzYDVotBocay6NyJ4h8hiE/Gyros-Heroes-bdj?node-id=1-4542)

## Functional Requirements
- **Headline:** Display "HERO IS IN TOWN!" using the brand's typography.
- **City-Specific Ordering:**
    - **Niš Block:** Title "Poruči Niš" with two ordering buttons (e.g., Glovo and Wolt).
    - **Novi Sad Block:** Title "Poruči Novi Sad" with one ordering button.
- **External Linking:** Buttons will hardcode direct links to external delivery platforms as per the Product Definition.
- **Responsive Layout:** The section must adapt gracefully to mobile viewports (stacking blocks and resizing text).

## Visual Requirements
- **Background Decorations:** Use a static asset (exported from Figma) for the "sun" and other illustrative background elements.
- **Design Parity:** Strictly follow the spacing, font sizes (80px headline on desktop), and color tokens (`hero-blue`, `hero-yellow`) defined in the project.
- **Buttons:** Use the standard `buttons/basic yellow` style seen in the Figma design.

## Technical Details
- **Component:** `src/components/Hero.tsx`.
- **Styling:** Tailwind CSS.
- **Assets:** Background decoration SVG/Image stored in `src/assets/`.

## Acceptance Criteria
- [ ] Hero section matches the Figma design 1:1 visually.
- [ ] All 3 ordering buttons are functional and link to correct external URLs.
- [ ] Background graphics are correctly positioned and do not interfere with text readability.
- [ ] Section is fully responsive.
