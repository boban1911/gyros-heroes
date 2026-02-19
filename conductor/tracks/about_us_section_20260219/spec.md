# Specification - About Us Section Implementation

## Overview
Implement the "About Us" ("O Nama") section of the Gyros Heroes landing page, strictly following the provided Figma design. This section introduces the brand story and highlights key menu categories (Gyros, Heroes Special, Kids Menu, Pića i Namazi).

## Functional Requirements
- **Content:**
    - Main heading: "O Nama".
    - Brand story descriptive text.
    - Large "Gyros Heroes" circular mascot/logo.
    - Four feature cards (green background) with icons and descriptions:
        1. **Gyros:** "Sočno meso u autentičnoj..."
        2. **Heroes Special:** "Za one koji žele nešto drugačije..."
        3. **Kids Menu:** "Sve što deca vole..."
        4. **Pića i Namazi:** "Izaberi neki od pravih grčkih..."
- **Layout (Desktop):**
    - The "O Nama" heading and descriptive text are centered at the top.
    - The large circular mascot is centered below the text.
    - Two feature cards are positioned to the left of the mascot, and two to the right.
- **Layout (Mobile):**
    - Vertical stack: Heading -> Text -> Mascot -> 4 Feature Cards.
    - The mascot should be positioned above the first feature card, with a slight overlap (the first card starts slightly above the lower edge of the mascot).
    - Feature cards stack vertically in a single column.

## Non-Functional Requirements
- **Responsive Design:** Smooth transition between mobile and desktop layouts using Tailwind CSS breakpoints.
- **Visual Fidelity:** 1:1 match with Figma regarding typography, colors (blue background, green cards, yellow/white logo), and spacing.
- **Accessibility:** Semantic HTML (e.g., `<section>`, `<h2>`, `<h3>`, `<p>`), and appropriate `alt` tags for images/icons.

## Acceptance Criteria
- [ ] The section renders correctly on desktop as per Figma (mascot centered between 2x2 cards).
- [ ] The section renders correctly on mobile (stacked with overlap).
- [ ] All text content matches the Figma design exactly.
- [ ] Icons for the feature cards are extracted and rendered correctly.
- [ ] No regressions in existing sections (Hero, Navbar).

## Out of Scope
- Call to Action (CTA) buttons (as per user request).
- Animated transitions (unless specifically requested later).
