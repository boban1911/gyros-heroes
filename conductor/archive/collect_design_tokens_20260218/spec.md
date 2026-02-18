# Specification: Collect Design Tokens from Figma

## Overview
Extract design tokens from the provided Figma design file and integrate them into the project's Tailwind CSS configuration to ensure visual consistency and ease of implementation for future tasks.

**Figma Source:** [Gyros Heroes Design](https://www.figma.com/design/uzYDVotBocay6NyJ4h8hiE/Gyros-Heroes-bdj?node-id=0-1&t=pnmFkwDUG6s9enOa-1)

## Functional Requirements
- **Token Extraction:** Retrieve the following categories from Figma:
    - **Colors:** Primary, secondary, background, and accent colors (including hex/rgba values).
    - **Typography:** Font families, font sizes, font weights, and line heights.
    - **Spacing & Sizing:** Standardized margins, paddings, and grid-related values.
    - **Effects:** Box shadows and blurs.
    - **Border Radius:** Global corner roundness tokens.
- **Integration:** Map these tokens directly into the `extend` object of `tailwind.config.js`.
- **Naming Convention:** Use semantic and descriptive names that match the Figma design (e.g., `hero-red`, `heading-1`, `shadow-soft`).

## Non-Functional Requirements
- **Consistency:** Ensure 1:1 parity between Figma variables/styles and the Tailwind configuration.
- **Maintainability:** Organize the configuration clearly so it's easy to add or update tokens later.

## Acceptance Criteria
- [ ] `tailwind.config.js` is updated with all extracted tokens.
- [ ] Colors are available as Tailwind utility classes (e.g., `text-hero-red`, `bg-primary`).
- [ ] Typography styles are accessible via standard Tailwind font/text utilities.
- [ ] Spacing, effects, and border-radius tokens are correctly mapped and usable.
- [ ] No existing Tailwind default styles are broken (only extended).

## Out of Scope
- Implementation of UI components using these tokens.
- Setup of complex design token transformation pipelines (e.g., Style Dictionary).
