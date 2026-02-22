# Specification: Order Hero Section

Implement the "Poruči svoj Hero" (CTA) section as designed in Figma. This section serves as the final call-to-action before the footer, encouraging users to order via delivery platforms.

## Figma Source
- **Desktop Node:** `1:4643` (Frame "CTA")
- **Mobile Node:** `1:5010` (Frame "CTA")

## Content
- **Title:** "Poruči svoj Hero!"
- **Description:** "Poruči svoj omiljeni gyros brzo i jednostavno putem Glovo/Wolt aplikacije. Dovoljno je da klikneš na dugme ispod, izabereš proizvod i potvrdiš porudžbinu — hranu pripremamo odmah, a dostava stiže sveža i topla. Tvoj sledeći giros je na jedan klik od tebe."
- **Buttons:**
  - Multiple buttons linking to delivery platforms (Glovo/Wolt) for different locations (Niš, Novi Sad).
  - Use the `buttons/basic yellow` component style.

## Layout & Styling
- **Background:** Verify if it has a specific background or if it's transparent/colored. The Figma node will reveal this.
- **Typography:** Match Figma font sizes (Montserrat), weights, and colors.
- **Responsiveness:** Ensure it adapts from the mobile layout (`1:5010`) to the desktop layout (`1:4643`).

## Functional Requirements
- **Links:** Buttons must open external links in a new tab (`target="_blank"`).
- **Hover Effects:** Standard button hover effects (as defined in the design system).

## Assets
- No new images expected, mostly text and buttons.
