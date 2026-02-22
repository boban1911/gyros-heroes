# Footer Section Specification

## Objective
Create a responsive footer for the Gyros Heroes website.

## Design Requirements
- **Color**: `hero-blue-dark` background with white text (`text-white` or `text-grey-light`).
- **Layout**:
  - **Logo**: Should be prominent.
  - **Social Links**: Icons for social media (Facebook, Instagram).
  - **Contact**: Address, Phone, Email.
  - **Navigation**: Links to main sections (About, Menu, Locations, Testimonials).
  - **Copyright**: Centered at the bottom with a small disclaimer.
- **Responsiveness**:
  - **Desktop**: Grid layout with logo, social, contact, and nav.
  - **Mobile**: Stacked vertically, centered.

## Components
- `Footer.tsx` in `src/components/`.
- `Logo.tsx` (reused).
- Icons (Facebook, Instagram, etc.). Need to check if icons exist or use placeholders.

## Content
- **Address**: Trg Republike 5, 11000 Beograd (Example)
- **Phone**: +381 11 123 4567 (Example)
- **Email**: info@gyrosheroes.com (Example)
- **Social Links**:
  - Facebook: https://facebook.com/gyrosheroes
  - Instagram: https://instagram.com/gyrosheroes
- **Copyright**: © 2026 Gyros Heroes. All rights reserved.

## Technical Details
- Use `bg-hero-blue-dark`.
- Use `text-white` for main text.
- Use `hover:text-hero-yellow` for links.
- Use `flex` or `grid` for layout.
