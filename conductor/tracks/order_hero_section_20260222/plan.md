# Implementation Plan: Order Hero Section

- [x] **Analyze Design**
    - [x] Fetch Figma design context for Desktop (`1:4643`) and Mobile (`1:5010`) to understand layout, spacing, and styling.
    - [x] Identify background colors and exact button labels.

- [x] **Component Implementation**
    - [x] Create `src/components/OrderHero.tsx`.
    - [x] Implement responsive layout (Mobile -> Desktop).
    - [x] Add Title, Description, and Buttons.
    - [x] Use existing `buttons` styles or Tailwind classes matching the design tokens.

- [x] **Integration**
    - [x] Add `OrderHero` to `src/App.tsx` (before `Footer`, after `Testimonials` or `LocationsGallery` - check Figma order).

- [x] **Verification**
    - [x] Visual check against Figma.
    - [x] Responsive check.
    - [x] Unit tests in `tests/components/OrderHero.test.tsx`.
