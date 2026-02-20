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

## Phase 4: Feedback Fixes [checkpoint: 8e7f201]
- [x] Task: Fix logo overlap on text issues. [f401d2f]
    - [x] Sub-task: Change desktop split layout breakpoint from `lg` (1024px) to `xl` (1280px) to prevent card overlap on smaller desktop screens.
    - [x] Sub-task: Adjust mobile/stacked layout z-index to place mascot *behind* (z-0) the cards (z-10) to ensure text readability, or increase top padding of the first card if mascot must be on top.
    - [x] Sub-task: Verify no text is obscured on any screen size.

## Phase 5: Refine Mobile Layout [checkpoint: 1c40506]
- [x] Task: Reduce vertical padding on mobile first card. [91d1165]
    - [x] Sub-task: Change top padding of the first card from `140px` to a responsive value (e.g., `pt-[90px] md:pt-[140px]`) to reduce excessive whitespace on mobile.
    - [x] Sub-task: Verify text is still not covered by mascot.

## Phase 6: Optimize Mobile Spacing [checkpoint: 29c71f1]
- [x] Task: Reduce overlap and card height on mobile. [69f7890]
    - [x] Sub-task: Change negative margin from `-mt-20 md:-mt-24` to `-mt-12 md:-mt-16`.
    - [x] Sub-task: Reduce top padding of first card from `pt-[90px] md:pt-[140px]` to `pt-[70px] md:pt-[100px]`.
    - [x] Sub-task: Ensure layout still looks intentional (slight overlap) but minimizes wasted space.

## Phase 7: Finalize Mobile Padding [checkpoint: 10fd5fa]
- [x] Task: Set mobile padding top to fixed 100px. [fcf2d34]
    - [x] Sub-task: Update `src/components/AboutUs.tsx` to set the first card's top padding to `pt-[100px]` on all stacked breakpoints (mobile/tablet/lg).
    - [x] Sub-task: Adjust negative margin to `-mt-20` (80px) to balance the layout.

## Phase 8: Remove Excessive Mobile Spacing
- [x] Task: Remove top padding and negative margin from mobile layout. [deccf38]
    - [x] Sub-task: Update `src/components/AboutUs.tsx` to remove `pt-[100px]` from the first card in stacked view.
    - [x] Sub-task: Remove `-mt-16 md:-mt-20` from the cards stack container to eliminate overlap and wasted space.
    - [x] Sub-task: Confirm all green sections have uniform height and fit text perfectly.

## Phase 9: Restore Overlap Correctly [checkpoint: b8ded8d]
- [x] Task: Re-introduce overlap and padding to match Figma reference. [ddc5492]
    - [x] Sub-task: Set negative margin to `-mt-24` (96px) on mobile stack to pull cards up under mascot.
    - [x] Sub-task: Set first card top padding to `pt-[120px]` (96px overlap + 24px clearance) to position text below mascot.
    - [x] Sub-task: Verify mascot is `z-20` and cards are `z-10` for correct layering.

## Phase 10: Place Mascot Behind Cards [checkpoint: 868fa8b]
- [x] Task: Adjust z-index and padding for "behind" layering. [292c21b]
    - [x] Sub-task: Change mobile mascot z-index to `z-0` (behind) and cards container to `z-10` (front).
    - [x] Sub-task: Remove `pt-[120px]` from the first card, as text won't be covered by mascot anymore.
    - [x] Sub-task: Keep `-mt-24` overlap so cards visually cover the bottom of the mascot.

## Phase 11: Adapt to Specific Mobile Design [checkpoint: 1486fe2]
- [x] Task: Match precise mobile design from node 1-4923. [2c66abd]
    - [x] Sub-task: Fetch design context and screenshot for node `1-4923` to get exact spacing and overlap values.
    - [x] Sub-task: Update `src/components/AboutUs.tsx` negative margin and padding to match the design.
    - [x] Sub-task: Verify visual fidelity with the new reference screenshot.

## Phase 12: Fix Gap Conflict
- [x] Task: Remove gap from mobile container to allow overlap. [4ea585e]
    - [x] Sub-task: Update `src/components/AboutUs.tsx` to remove `gap-10` from the mobile flex container, setting it to `gap-0` to let `-mt-[38px]` create the true overlap.
    - [x] Sub-task: Verify no unintentional gaps appear.

## Phase 13: Tablet Layout (2x2 Grid)
- [x] Task: Implement responsive 2x2 grid for tablet screens. [d6c80d0]
    - [x] Sub-task: Update `src/components/AboutUs.tsx` to change the cards container to a responsive grid: `grid grid-cols-1 md:grid-cols-2`.
    - [x] Sub-task: Increase `max-w` on `md` screens (e.g., `md:max-w-[800px]`) to accommodate two columns.
    - [x] Sub-task: Ensure `-mt-[38px]` overlap applies to the top row (both cards) on tablet view.
    - [x] Sub-task: Verify mobile remains single column (`grid-cols-1`) and desktop remains split (`hidden xl:flex`).

## Phase 14: Adjust Section Spacing
- [x] Task: Reduce space between Hero button and About Us title. [711bb75]
    - [x] Sub-task: Fetch design context for node `1-4774` to determine correct spacing.
    - [x] Sub-task: Update `src/components/AboutUs.tsx` top padding (`py`) to match design.
    - [x] Sub-task: Verify visual fidelity with screenshot.
