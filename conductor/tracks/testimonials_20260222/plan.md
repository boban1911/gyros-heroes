# Implementation Plan - Implement Testimonials Section

## Phase 1: Setup and Test Structure
- [x] Task: Create initial component files (skeletons). [commit: c63034b]
    - [x] Create `src/components/Testimonials.tsx`
    - [x] Create `src/components/TestimonialSlider.tsx`
    - [x] Create `src/components/TestimonialCard.tsx`
- [x] Task: Create test file `src/tests/components/Testimonials.test.tsx`. [commit: 366c591]
    - [x] Define initial failing tests (render check, key elements presence).
- [x] Task: Conductor - User Manual Verification 'Setup and Test Structure' (Protocol in workflow.md) [commit: 366c591]

## Phase 2: Component Implementation (TDD)
- [x] Task: Implement `TestimonialCard`. [commit: ffe7fa4]
    - [x] Match Figma design (colors, typography, layout).
    - [x] Props: `author`, `quote`, `color` (Yellow/Green/Blue).
- [x] Task: Implement `TestimonialSlider`. [commit: 4999c88]
    - [x] Use `embla-carousel-react` (following `GallerySlider` pattern).
    - [x] Implement responsive behavior (cards per view).
    - [x] Add navigation buttons/controls.
- [x] Task: Implement `Testimonials` section wrapper. [commit: d61fa69]
    - [x] Add Section Header "Šta naši gosti kažu".
    - [x] Integrate `TestimonialSlider` with static data.
- [x] Task: Verify tests pass. [commit: d61fa69]
- [x] Task: Conductor - User Manual Verification 'Component Implementation' (Protocol in workflow.md) [checkpoint: ae06410]

## Phase 3: Integration and Polish
- [x] Task: Integrate `Testimonials` into `src/App.tsx`. [commit: 73d383a]
- [x] Task: Verify and polish responsiveness (Mobile/Desktop). [commit: 73d383a]
- [x] Task: Ensure visual parity with Figma design. [commit: 73d383a]
- [x] Task: Fix layout: Implement staggered card positioning (center card higher, sides lower). [commit: 3c5e315]
- [x] Task: Fix visual style: Make testimonial cards square-ish (match Figma dimensions/aspect ratio). [commit: 0a7fac8]
- [x] Task: Fix text overflow: Ensure text stays within card boundaries (responsive font/padding). [commit: 701b01a]
- [x] Task: Fix slider loop: Make looping smooth and prevent "jumping" (adjust embla alignment/containScroll). [commit: bbf1f3e]
- [x] Task: Add navigation arrows: Add Left/Right arrows for desktop/iPad Pro (reusing style from GallerySlider). [commit: 9294e76]
- [x] Task: Fix scroll physics: Enable `dragFree: true` to match GallerySlider flow. [commit: 4c5b6f7]
- [x] Task: Refine layout rhythm: Adjust stagger logic to `i % 3` and remove transition for stability. [commit: 4c5b6f7]
- [x] Task: Fix background color: Change section background to lighter blue (`bg-hero-blue`). [commit: 46675b1]
- [x] Task: Adjust Blue card stagger: Make Blue card intermediate height (between Yellow and Green). [commit: 7e99b5d]
- [x] Task: Fix font size: Reduce font sizes for iPad Pro/Tablet (optimize responsive text). [commit: 908f6b0]
- [x] Task: Adjust grid columns: Show 2 cards on `lg` (iPad Pro Portrait), 3 cards on `xl` (Desktop). [commit: 90e586b]
- [x] Task: Revert grid columns: Show 3 cards on `lg`, but drastically reduce font/padding to fit content. [commit: dad3a20]
- [x] Task: Adjust mobile typography: Increase font size on mobile to fill the card better. [commit: 0e56b10]
- [x] Task: Conductor - User Manual Verification 'Integration and Polish' (Protocol in workflow.md) [checkpoint: 0e56b10]
