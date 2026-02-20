# Implementation Plan - About Us Section Implementation

## Phase 1: Setup and Assets
- [x] Task: Export and optimize assets from Figma (Node: 1-4543). [d34bc8a]
    - [x] Sub-task: Export the "Gyros Heroes" circular mascot (as `about-us-mascot.svg` or `png` if complex).
    - [x] Sub-task: Export the 4 icons for the feature cards (Gyros, Heroes Special, Kids Menu, Pića i Namazi).
    - [x] Sub-task: Add assets to `src/assets/`.
- [x] Task: Verify/Update Tailwind config. [d34bc8a]
    - [x] Sub-task: Ensure the blue background color (#4A6FA5 or similar from Figma) and green card color are defined in `tailwind.config.js`.
- [x] Task: Conductor - User Manual Verification 'Setup and Assets' (Protocol in workflow.md) [d34bc8a]

## Phase 2: Implementation (TDD)
- [ ] Task: Create `AboutUs` component structure.
    - [ ] Sub-task: Create `src/components/AboutUs.tsx`.
    - [ ] Sub-task: Create `tests/components/AboutUs.test.tsx`.
- [ ] Task: Implement the Header and Description.
    - [ ] Sub-task: Write a failing test for the "O Nama" heading and descriptive text.
    - [ ] Sub-task: Implement the component to render the text content.
- [ ] Task: Implement the Feature Cards.
    - [ ] Sub-task: Write a failing test ensuring 4 feature cards are rendered with correct titles and icons.
    - [ ] Sub-task: Implement the feature cards using a responsive grid/flex layout.
- [ ] Task: Implement the Mascot and Layout Logic.
    - [ ] Sub-task: Write a failing test for the presence of the mascot image.
    - [ ] Sub-task: Implement the desktop layout (Centered mascot, 2 cards left, 2 cards right).
    - [ ] Sub-task: Implement the mobile layout (Vertical stack, mascot overlapping the first card).
- [ ] Task: Integrate `AboutUs` into `App.tsx`.
    - [ ] Sub-task: Add `AboutUs` component below the existing `Hero` and `SuperheroMascot` sections.
    - [ ] Sub-task: Update integration tests in `tests/integration/App.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Implementation (TDD)' (Protocol in workflow.md)

## Phase 3: Final Verification
- [ ] Task: Run full test suite (`npm test`).
- [ ] Task: Visual verification on Desktop and Mobile viewports against Figma design.
    - [ ] Sub-task: Verify the specific mobile overlap requirement.
- [ ] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)
