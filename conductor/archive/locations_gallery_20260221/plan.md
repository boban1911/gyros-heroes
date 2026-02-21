# Implementation Plan: Locations & Gallery Section

## Phase 1: Setup & Assets
- [x] Task: Install `embla-carousel-react`.
    - [x] `npm install embla-carousel-react`
- [x] Task: Export and Optimize Images.
    - [x] Export ~4-6 interior gallery images from Figma as PNG.
    - [x] Convert images to WebP format (`src/assets/gallery/*.webp`).
    - [x] Add `alt` descriptions to a data file or constants.
- [x] Task: Create Component Structure.
    - [x] Create `src/components/LocationsGallery.tsx`.
    - [x] Create `src/components/GallerySlider.tsx` (using Embla).
    - [x] Import `LocationsGallery` into `App.tsx` (place after `Menu` section).

## Phase 2: Implementation
- [x] Task: Implement Layout & Typography.
    - [x] Replicate Figma layout: Title, Description, Buttons container.
    - [x] Apply Tailwind classes for typography (Montserrat, sizes, colors).
- [x] Task: Implement Action Buttons.
    - [x] Add the 3 "Poruči i pokupi" buttons.
    - [x] Ensure correct external URLs (Niš Centar, Niš Park, Novi Sad).
    - [x] Style buttons to match Hero CTA style (yellow background, rounded, shadow).
- [x] Task: Implement Gallery Slider.
    - [x] Setup `embla-carousel-react` in `GallerySlider.tsx`.
    - [x] Create slides using the exported WebP images.
    - [x] Configure Embla options (dragFree: true, containScroll: 'trimSnaps', slidesToScroll: 1, align: 'start', loop: true).
    - [x] Add responsive styles (show ~1.2 images on mobile, ~3 on desktop).
    - [x] Make images wider (adjust flex basis).
    - [x] Add navigation arrows (Previous/Next) visible on larger screens.
- [x] Task: Verify & Polish.
    - [x] Verify responsiveness on Mobile (375px), Tablet (768px), and Desktop (1440px).
    - [x] Verify button links open in new tabs.
    - [x] Ensure semantic HTML structure.