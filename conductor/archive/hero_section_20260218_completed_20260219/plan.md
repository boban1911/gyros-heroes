# Implementation Plan: Hero Section Implementation

This plan details the steps to build the high-fidelity Hero section, including assets extraction and responsive layout.

## Phase 1: Asset Extraction & Layout [checkpoint: 650531c]
Retrieve necessary visuals and build the primary structure.

- [x] Task: Export and optimize Hero background assets from Figma [e876f68]
    - [x] Run `get_design_context` on the Hero node (`1:4542`)
    - [x] Download the background illustrative elements (sun, etc.)
- [x] Task: Implement basic Hero component structure [e876f68]
    - [x] Create `src/components/Hero.tsx`
    - [x] Add the "HERO IS IN TOWN!" headline with Montserrat font
    - [x] Implement the city-specific ordering blocks (Niš and Novi Sad)
- [x] Task: Conductor - User Manual Verification 'Asset Extraction & Layout' (Protocol in workflow.md) [650531c]

## Phase 2: Logic & Styling [checkpoint: ee611ff]
Add interactive elements and refine the visual design.

- [x] Task: Write tests for Hero section components [e876f68]
    - [x] Create `tests/components/Hero.test.tsx`
    - [x] Verify the headline text and presence of 3 ordering buttons
- [x] Task: Implement ordering buttons with external links [5f816e9]
    - [x] Apply the yellow button styles using Tailwind tokens
    - [x] Add hardcoded URLs for delivery platforms
- [x] Task: Apply responsive styling and background assets [6a89b86]
    - [x] Position background graphics relative to content
    - [x] Adjust font sizes and stacking behavior for mobile viewports
- [x] Task: Conductor - User Manual Verification 'Logic & Styling' (Protocol in workflow.md) [ee611ff]

## Phase 3: Final Integration [checkpoint: ee611ff]
Connect the section to the main landing page.

- [x] Task: Integrate Hero section into `src/App.tsx` [73cb6f1]
    - [x] Replace the placeholder `#hero` section with the new `Hero` component
- [x] Task: Perform visual audit and cross-browser check [73cb6f1]
    - [x] Verify 1:1 parity with Figma screenshot
- [x] Task: Conductor - User Manual Verification 'Final Integration' (Protocol in workflow.md) [ee611ff]

## Phase 4: Design Refinement [checkpoint: 21fa77b]
Address visual discrepancies identified during review.

- [x] Task: Refine Hero container layout and border radius [21fa77b]
    - [x] Constraint background width to match Navbar (max-width 1400px)
    - [x] Apply rounded top corners (e.g., 100px or as per design)
    - [x] Ensure background image and overlay respect the border radius
- [x] Task: Conductor - User Manual Verification 'Design Refinement' (Protocol in workflow.md) [21fa77b]