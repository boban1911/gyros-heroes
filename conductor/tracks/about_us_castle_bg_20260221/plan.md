# Implementation Plan: About Us Castle Background

## Phase 1: Assets
- [ ] Task: Get Design Context.
    - [ ] Retrieve image URL for node `1:4411` ("Dizajn") using `get_design_context`.
- [ ] Task: Download and Optimize Asset.
    - [ ] Download the image.
    - [ ] Convert to `src/assets/about-us-bg.webp`.

## Phase 2: Implementation
- [ ] Task: Update `AboutUs.tsx`.
    - [ ] Import the new background image.
    - [ ] Add an absolute positioned `<img>` container behind the content.
    - [ ] Configure responsiveness (scaling, positioning) to match Figma.
- [ ] Task: Verify.
    - [ ] Check overlap with text (ensure text is readable/on top).
    - [ ] Check mobile view.
