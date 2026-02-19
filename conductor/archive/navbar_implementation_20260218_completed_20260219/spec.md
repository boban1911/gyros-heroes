# Specification: Navbar Component Implementation

## Overview
Implement a high-fidelity, responsive Navbar component for the \"Gyros Heroes\" application based on the provided Figma design. The Navbar will serve as the primary navigation tool for the single-page application.

**Figma Source:** [Navbar Component](https://www.figma.com/design/uzYDVotBocay6NyJ4h8hiE/Gyros-Heroes-bdj?node-id=1-4598)

## Functional Requirements
- **Navigation Links:** Implement hardcoded links: \"Hero\", \"O nama\", \"Meni\", \"Lokacije\", \"Posao\", and \"Testimonijali\".
- **Responsive Behavior:** 
    - **Desktop:** Display a horizontal list of links.
    - **Mobile:** Transition to a Hamburger menu icon when the viewport width is restricted.
- **Hamburger Menu:** 
    - Clicking the icon opens a **Slide-over** sidebar menu from the right.
    - The slide-over includes all navigation links and a close button.
- **Sticky Header:** The Navbar remains fixed (sticky) at the top of the viewport during scrolling.
- **Interactions:** 
    - Clicking a link triggers a **Smooth Scroll** to the corresponding section on the page.
    - Hover effects on links should match the brand's aesthetic (using defined tokens).

## Visual Requirements
- **Design Parity:** Match Figma specifications for spacing, typography, and colors (Hero Blue, Hero Yellow, etc.).
- **Logo:** Display the \"Gyros Heroes\" logo prominently on the left.
- **Shadow/Effect:** Apply a subtle shadow or border-bottom when sticky (if indicated by design or for better separation).

## Technical Details
- **Framework:** React (TypeScript).
- **Styling:** Tailwind CSS using established design tokens.
- **Icons:** Use `Lucide React` for the Hamburger and Close icons.
- **Animation:** Use simple CSS transitions or a lightweight library (like Framer Motion) for the slide-over menu if needed for smoothness.

## Acceptance Criteria
- [ ] Navbar is visually consistent with the Figma design.
- [ ] Responsive breakpoint correctly triggers the hamburger icon.
- [ ] Slide-over menu opens/closes smoothly.
- [ ] Clicking links scrolls to the correct placeholder sections.
- [ ] Navbar stays fixed at the top during scrolling.
- [ ] 100% test coverage for core navigation logic and responsive state changes.
