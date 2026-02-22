# Implementation Plan: About Us Castle Background

## Phase 1: Assets
- [x] Task: Get Design Context.
    - [x] Retrieve image URL for node `1:4411` ("Dizajn") using `get_design_context`.
- [x] Task: Download and Optimize Asset.
    - [x] Download the image.
    - [x] Convert to `src/assets/about-us-bg.webp`.

## Phase 2: Implementation
- [x] Task: Update `AboutUs.tsx`.
    - [x] Import the new background image.
    - [x] Add an absolute positioned `<img>` container behind the content.
    - [x] Configure responsiveness (scaling, positioning) to match Figma.
- [x] Task: Verify.
    - [x] Check overlap with text (ensure text is readable/on top).
    - [x] Check mobile view.
