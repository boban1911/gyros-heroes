# Implementation Plan - Menu Section

## Phase 1: Assets & Setup
- [x] Task: Extract menu item images from Figma and save to `src/assets/menu/`.
    - [x] Sub-task: Identify all necessary images from Node 1:4444.
    - [x] Sub-task: Check asset formats (e.g., SVGs vs. Raster) and optimize appropriately (WebP for raster, clean SVGs).
- [x] Task: Define Menu Data Structure.
    - [x] Sub-task: Create the hardcoded data array within `src/components/Menu.tsx` (or a co-located `menu.data.ts`).

## Phase 2: Menu Item Component (TDD)
- [x] Task: Create `MenuItem` component.
    - [x] Sub-task: Write failing test for `MenuItem` (renders title, price, description, image).
    - [x] Sub-task: Implement `MenuItem` component with Tailwind styling matching Figma.
    - [x] Sub-task: Verify tests pass.

## Phase 3: Menu Section & Logic (TDD)
- [x] Task: Create Main `Menu` Container & Category Logic.
    - [x] Sub-task: Write failing test for category filtering (selecting a tab updates the view).
    - [x] Sub-task: Implement state for active category.
    - [x] Sub-task: Implement `MenuTabs` (Mobile: Horizontal Scroll).
    - [x] Sub-task: Implement Desktop Grid Layout for items.
    - [x] Sub-task: Verify tests pass.

## Phase 4: Final Polish & Integration
- [x] Task: Responsive Design Adjustments.
    - [x] Sub-task: Ensure 1:1 match with Figma on Mobile and Desktop.
- [x] Task: Conductor - User Manual Verification 'Menu Section' (Protocol in workflow.md).