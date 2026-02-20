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
- [x] Task: Create `AboutUs` component structure. [1cae242]
    - [x] Sub-task: Create `src/components/AboutUs.tsx`.
    - [x] Sub-task: Create `tests/components/AboutUs.test.tsx`.
- [x] Task: Implement the Header and Description. [1cae242]
    - [x] Sub-task: Write a failing test for the "O Nama" heading and descriptive text.
    - [x] Sub-task: Implement the component to render the text content.
- [x] Task: Implement the Feature Cards. [1cae242]
    - [x] Sub-task: Write a failing test ensuring 4 feature cards are rendered with correct titles and icons.
    - [x] Sub-task: Implement the feature cards using a responsive grid/flex layout.
- [x] Task: Implement the Mascot and Layout Logic. [1cae242]
    - [x] Sub-task: Write a failing test for the presence of the mascot image.
    - [x] Sub-task: Implement the desktop layout (Centered mascot, 2 cards left, 2 cards right).
    - [x] Sub-task: Implement the mobile layout (Vertical stack, mascot overlapping the first card).
- [x] Task: Integrate `AboutUs` into `App.tsx`. [1cae242]
    - [x] Sub-task: Add `AboutUs` component below the existing `Hero` and `SuperheroMascot` sections.
    - [x] Sub-task: Update integration tests in `tests/integration/App.test.tsx`.
- [ ] Task: Conductor - User Manual Verification 'Implementation (TDD)' (Protocol in workflow.md)

## Phase 3: Final Verification [checkpoint: c2b1632]
- [x] Task: Run full test suite (`npm test`).
- [x] Task: Visual verification on Desktop and Mobile viewports against Figma design.
    - [x] Sub-task: Verify the specific mobile overlap requirement.
- [x] Task: Conductor - User Manual Verification 'Final Verification' (Protocol in workflow.md)

## Phase 4: Feedback Fixes
- [x] Task: Fix logo overlap on text issues. [f401d2f]
    - [x] Sub-task: Change desktop split layout breakpoint from `lg` (1024px) to `xl` (1280px) to prevent card overlap on smaller desktop screens.
    - [x] Sub-task: Adjust mobile/stacked layout z-index to place mascot *behind* (z-0) the cards (z-10) to ensure text readability, or increase top padding of the first card if mascot must be on top.
    - [x] Sub-task: Verify no text is obscured on any screen size.
