# Specification: About Us Castle Background

## Overview
Add the "Dizajn" (castle) illustration from the Figma design to the background of the **About Us** section. This adds visual depth and branding to the storytelling section.

## Requirements

### Visuals
- **Image:** The vector illustration located at Figma node `1:4411` ("Dizajn").
- **Placement:** Positioned in the background of the `#o-nama` section.
- **Z-Index:** Must be behind the text and content cards (`z-0` or lower), but visible.

### Responsiveness
- **Visibility:** Visible on **all screen sizes** (Mobile, Tablet, Desktop).
- **Scaling:** The image should scale adaptively to fit the container width while maintaining aspect ratio.

## Technical Implementation
- **Asset Format:** Export as high-quality WebP.
- **Component:** Modify `src/components/AboutUs.tsx`.
- **Styling:** Use Tailwind for absolute positioning and z-index management.