# Specification: Sun Background Implementation

Add the `src/assets/sun.webp` image as a background element positioned between the "Testimonials" and "Order Hero" (CTA) sections, matching the provided design screenshot.

## Visual Requirements
- **Image:** `src/assets/sun.webp`
- **Position:** Between `Testimonials` and `OrderHero` components in `App.tsx`.
- **Layering:** It should be behind the content of both sections, acting as a decorative background element.
- **Scaling:** It needs to span across the transition of these sections.
- **Opacity/Blend:** Check if any opacity or blend modes are needed based on the screenshot (it looks like a standard overlay or background layer).

## Implementation Strategy
- Since `Testimonials` and `OrderHero` are siblings in `App.tsx`, we might need a wrapper or an absolute positioned element in `App.tsx` relative to their container.
- Alternatively, we can add it to one of the components (e.g., `Testimonials` bottom or `OrderHero` top) with absolute positioning. Given it bridges them, `App.tsx` or a wrapper component might be best.
- The screenshot shows the sun pattern (rays) covering the blue background behind "Šta naši gosti kažu" and the green "Poruči svoj Hero" card. Wait, the green card is on top of the blue background. The sun is likely on the blue background layer.

## Assets
- `src/assets/sun.webp` (Verified existence)
