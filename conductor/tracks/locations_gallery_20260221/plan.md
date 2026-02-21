# Implementation Plan: Locations & Gallery Section

## Phase 1: Setup & Assets
- [ ] Task: Install `embla-carousel-react`.
    - [ ] `npm install embla-carousel-react`
- [ ] Task: Export and Optimize Images.
    - [ ] Export ~4-6 interior gallery images from Figma as PNG.
    - [ ] Convert images to WebP format (`src/assets/gallery/*.webp`).
    - [ ] Add `alt` descriptions to a data file or constants.
- [ ] Task: Create Component Structure.
    - [ ] Create `src/components/LocationsGallery.tsx`.
    - [ ] Create `src/components/GallerySlider.tsx` (using Embla).
    - [ ] Import `LocationsGallery` into `App.tsx` (place after `Menu` section).

## Phase 2: Implementation
- [ ] Task: Implement Layout & Typography.
    - [ ] Replicate Figma layout: Title, Description, Buttons container.
    - [ ] Apply Tailwind classes for typography (Montserrat, sizes, colors).
- [ ] Task: Implement Action Buttons.
    - [ ] Add the 3 "Poruči i pokupi" buttons.
    - [ ] Ensure correct external URLs (Niš Centar, Niš Park, Novi Sad).
    - [ ] Style buttons to match Hero CTA style (yellow background, rounded, shadow).
- [ ] Task: Implement Gallery Slider.
    - [ ] Setup `embla-carousel-react` in `GallerySlider.tsx`.
    - [ ] Create slides using the exported WebP images.
    - [ ] Configure Embla options (dragFree: true, containScroll: 'trimSnaps', slidesToScroll: 1, align: 'start').
    - [ ] Add responsive styles (show ~1.2 images on mobile, ~3 on desktop).
- [ ] Task: Verify & Polish.
    - [ ] Verify responsiveness on Mobile (375px), Tablet (768px), and Desktop (1440px).
    - [ ] Verify button links open in new tabs.
    - [ ] Ensure semantic HTML structure.
