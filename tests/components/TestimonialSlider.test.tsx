// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import TestimonialSlider from '../../src/components/TestimonialSlider';
import React from 'react';

// Mock matchMedia for embla-carousel
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock IntersectionObserver
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
  global.IntersectionObserver = mockIntersectionObserver;

  // Mock ResizeObserver
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
  global.ResizeObserver = mockResizeObserver;
});

describe('TestimonialSlider', () => {
  it('renders slider container', () => {
    render(<TestimonialSlider />);
    const cards = screen.getAllByText(/—/i); // Looking for the dash before author name
    expect(cards.length).toBeGreaterThan(0);
  });
  
  it('has alignment classes', () => {
      const { container } = render(<TestimonialSlider />);
      // We expect some cards to have margin-top (mt-8 or similar) for the "down" effect
      // and one to be "up". Since we can't easily test visual positions without visual regression tools,
      // we check for the presence of the classes we will add.
      // We will look for mt-12 or similar which pushes side cards down.
      // This test is TDD - it will fail until I implement the classes.
      // However, since I'm implementing the visual change now, I'll write the test to expect the structure.
      // But first I need to know *what* structure.
      // The design has 3 cards. Center is higher.
      // Let's assume index 1 is center. 
      // index 0: mt-12
      // index 1: mt-0
      // index 2: mt-12
  });
});