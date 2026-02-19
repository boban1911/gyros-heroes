# Implementation Plan - Floating Superhero Tortilla Implementation

## Phase 1: Setup and Assets [checkpoint: f7a7782]
- [x] Task: Export and optimize the "superhero tortilla" image from Figma (Node: 1:4726) as `superhero-tortilla.svg` (better scalability). [b9eb8d2]
    - [x] Sub-task: Verify dimensions and optimization (e.g., using svgo or similar) to ensure small file size without visual loss.
- [x] Task: Add the image to `src/assets/`.
- [x] Task: Conductor - User Manual Verification 'Setup and Assets' (Protocol in workflow.md)

## Phase 2: Implementation (TDD)
- [x] Task: Create a new component `SuperheroMascot.tsx` in `src/components/` to encapsulate the image logic. [46ee551]
    - [x] Sub-task: Create `tests/components/SuperheroMascot.test.tsx`.
    - [x] Sub-task: Write a failing test to verify the component renders the image with the correct `src` and `alt` text.
    - [x] Sub-task: Write a failing test to verify the component has the base styling classes for positioning (e.g., `absolute`, `z-10`, etc. - checking class names or styles).
    - [x] Sub-task: Implement the `SuperheroMascot` component to pass the tests.
- [~] Task: Integrate `SuperheroMascot` into `App.tsx` (or the relevant parent component) between the Hero and About Us sections.
    - [ ] Sub-task: Write/Update integration test in `tests/integration/App.test.tsx` (or similar) to ensure `SuperheroMascot` is present in the document.
    - [ ] Sub-task: Add the component to the JSX in `App.tsx`.
- [ ] Task: Apply responsive styling.
    - [ ] Sub-task: Update `SuperheroMascot` to include `hidden` on mobile breakpoints (e.g., `md:block` or similar Tailwind classes) and `block` on desktop.
    - [ ] Sub-task: Add a test case in `tests/components/SuperheroMascot.test.tsx` to verify the responsive classes are applied (e.g., checking for `hidden md:block`).
- [ ] Task: Fine-tune positioning.
    - [ ] Sub-task: Adjust `top`, `left`/`right`, or `margin` classes on `SuperheroMascot` to match the visual reference (overlapping sections).
    - [ ] Sub-task: Verify visually against `src/assets/screenshoots/Monosnap Gyros Heroes bdj – Figma 2026-02-19 12-22-32.png`.
- [ ] Task: Conductor - User Manual Verification 'Implementation (TDD)' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: Run full test suite (`npm test`) to ensure no regressions.
- [ ] Task: Verify visually on both Desktop and Mobile viewports.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
