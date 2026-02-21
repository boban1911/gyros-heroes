# Specification: Locations & Gallery Section

## Overview
Implement the "Locations & Gallery" section as depicted in the Figma design. This section serves as a visual showcase of the restaurant's locations and atmosphere, featuring descriptive text, call-to-action buttons for ordering, and an interactive horizontal image gallery.

## Goals
- Provide users with quick access to ordering links for specific locations.
- Showcase the restaurant's interior/atmosphere through a gallery.
- Maintain a responsive design that works seamlessly across mobile and desktop.

## Functional Requirements

### 1. Header & Text Content
- **Title:** "Pogledaj naše Lokacije & galeriju" (styled per Figma).
- **Description:** Display the paragraph text describing the modern interior and quality service (copy text from Figma).

### 2. Action Buttons (Locations)
- Display three primary CTA buttons:
    1.  **Label:** "Poruči i pokupi NI CENTAR" -> **Link:** (Same URL as Hero Section: `https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/`)
    2.  **Label:** "Poruči i pokupi NI PARK SV.SAVE" -> **Link:** (Same URL as Hero Section: `https://wolt.com/sr/srb/nis/restaurant/gyros-heroes-nis`)
    3.  **Label:** "Poruči i pokupi NS" -> **Link:** (Same URL as Hero Section: `https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns`)
- **Behavior:** Open links in a new tab (`target="_blank"`).
- **Styling:** Use the project's primary yellow button style (rounded-full, shadow, hover effects).

### 3. Image Gallery Slider
- **Technology:** Use `embla-carousel-react` for robust touch/swipe support.
- **Content:** Display a horizontal list of interior/location images (exported from Figma).
- **Interaction:**
    - **Swipe/Drag:** Users can swipe left/right to view more images.
    - **No Auto-play:** The slider remains static until interacted with.
    - **No Lightbox:** Clicking an image does *not* open a larger view.
- **Layout:**
    - Images should be displayed in a single row.
    - On mobile: show ~1.2 images (peek next slide).
    - On desktop: show ~3 images at a time.

## Non-Functional Requirements
- **Performance:** Images must be optimized (WebP format).
- **Responsiveness:** Layout must adapt gracefully from mobile (stacked text/buttons) to desktop.
- **Accessibility:** Images must have `alt` text. Buttons must have accessible labels.

## Assets
- Export the gallery images from Figma node `1:4634` (or individual image nodes).
- Use existing `buttons/basic yellow` component styles if available, or create a reusable button component.
