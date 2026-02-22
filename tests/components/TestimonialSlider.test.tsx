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
});
