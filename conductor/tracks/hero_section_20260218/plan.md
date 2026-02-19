# Implementation Plan: Hero Section Implementation

This plan details the steps to build the high-fidelity Hero section, including assets extraction and responsive layout.

## Phase 1: Asset Extraction & Layout
Retrieve necessary visuals and build the primary structure.

- [x] Task: Export and optimize Hero background assets from Figma [e876f68]
    - [ ] Run `get_design_context` on the Hero node (`1:4542`)
    - [ ] Download the background illustrative elements (sun, etc.)
- [x] Task: Implement basic Hero component structure [e876f68]
    - [ ] Create `src/components/Hero.tsx`
    - [ ] Add the "HERO IS IN TOWN!" headline with Montserrat font
    - [ ] Implement the city-specific ordering blocks (Niš and Novi Sad)
- [ ] Task: Conductor - User Manual Verification 'Asset Extraction & Layout' (Protocol in workflow.md)

## Phase 2: Logic & Styling
Add interactive elements and refine the visual design.

- [ ] Task: Write tests for Hero section components
    - [ ] Create `tests/components/Hero.test.tsx`
    - [ ] Verify the headline text and presence of 3 ordering buttons
- [ ] Task: Implement ordering buttons with external links
    - [ ] Apply the yellow button styles using Tailwind tokens
    - [ ] Add hardcoded URLs for delivery platforms
- [ ] Task: Apply responsive styling and background assets
    - [ ] Position background graphics relative to content
    - [ ] Adjust font sizes and stacking behavior for mobile viewports
- [ ] Task: Conductor - User Manual Verification 'Logic & Styling' (Protocol in workflow.md)

## Phase 3: Final Integration
Connect the section to the main landing page.

- [ ] Task: Integrate Hero section into `src/App.tsx`
    - [ ] Replace the placeholder `#hero` section with the new `Hero` component
- [ ] Task: Perform visual audit and cross-browser check
    - [ ] Verify 1:1 parity with Figma screenshot
- [ ] Task: Conductor - User Manual Verification 'Final Integration' (Protocol in workflow.md)
