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
  
  it('has alignment classes for staggered layout', () => {
    render(<TestimonialSlider />);
    
    // Radoš (Index 0) -> mt-12
    const radosElement = screen.getByText(/Radoš/i);
    // Find the wrapper div - we assume structure is: div.mt-XX > div > p(Author)
    // Actually structure is: div.mt-XX > TestimonialCard > div > p
    // So closest with the margin class should be 3 levels up?
    // Let's find the element that has the transition class which is on the same div as margin
    const radosWrapper = radosElement.closest('.transition-all');
    expect(radosWrapper).toHaveClass('mt-12'); 

    // Maša (Index 1) -> mt-0
    const masaWrapper = screen.getByText(/Maša/i).closest('.transition-all');
    expect(masaWrapper).toHaveClass('mt-0'); 

    // Vuk (Index 2) -> mt-12
    const vukWrapper = screen.getByText(/Vuk/i).closest('.transition-all');
    expect(vukWrapper).toHaveClass('mt-12'); 
  });
});
