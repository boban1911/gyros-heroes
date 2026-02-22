// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import Testimonials from '../../src/components/Testimonials';
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

describe('Testimonials Section', () => {
  it('renders section title correctly', () => {
    render(<Testimonials />);
    expect(screen.getByText(/Šta naši/i)).toBeInTheDocument();
    expect(screen.getByText(/gosti/i)).toBeInTheDocument();
    expect(screen.getByText(/kažu/i)).toBeInTheDocument();
  });

  it('renders testimonial slider with content', () => {
    render(<Testimonials />);
    // Check for author names from the static data
    // Use getAllByText if duplicates exist, but there shouldn't be
    expect(screen.getByText(/Radoš/i)).toBeInTheDocument();
    expect(screen.getByText(/Maša/i)).toBeInTheDocument();
    expect(screen.getByText(/Vuk/i)).toBeInTheDocument();
  });
});