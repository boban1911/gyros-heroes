# Implementation Plan - Implement Testimonials Section

## Phase 1: Setup and Test Structure
- [ ] Task: Create initial component files (skeletons).
    - [ ] Create `src/components/Testimonials.tsx`
    - [ ] Create `src/components/TestimonialSlider.tsx`
    - [ ] Create `src/components/TestimonialCard.tsx`
- [ ] Task: Create test file `src/tests/components/Testimonials.test.tsx`.
    - [ ] Define initial failing tests (render check, key elements presence).
- [ ] Task: Conductor - User Manual Verification 'Setup and Test Structure' (Protocol in workflow.md)

## Phase 2: Component Implementation (TDD)
- [ ] Task: Implement `TestimonialCard`.
    - [ ] Match Figma design (colors, typography, layout).
    - [ ] Props: `author`, `quote`, `color` (Yellow/Green/Blue).
- [ ] Task: Implement `TestimonialSlider`.
    - [ ] Use `embla-carousel-react` (following `GallerySlider` pattern).
    - [ ] Implement responsive behavior (cards per view).
    - [ ] Add navigation buttons/controls.
- [ ] Task: Implement `Testimonials` section wrapper.
    - [ ] Add Section Header "Šta naši gosti kažu".
    - [ ] Integrate `TestimonialSlider` with static data.
- [ ] Task: Verify tests pass.
- [ ] Task: Conductor - User Manual Verification 'Component Implementation' (Protocol in workflow.md)

## Phase 3: Integration and Polish
- [ ] Task: Integrate `Testimonials` into `src/App.tsx`.
- [ ] Task: Verify and polish responsiveness (Mobile/Desktop).
- [ ] Task: Ensure visual parity with Figma design.
- [ ] Task: Conductor - User Manual Verification 'Integration and Polish' (Protocol in workflow.md)
