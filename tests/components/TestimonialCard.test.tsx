// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import TestimonialCard, { TestimonialCardProps } from '../../src/components/TestimonialCard';
import React from 'react';

describe('TestimonialCard', () => {
  const defaultProps: TestimonialCardProps = {
    author: 'Test Author',
    quote: 'This is a test quote',
    color: 'yellow'
  };

  it('renders author and quote', () => {
    render(<TestimonialCard {...defaultProps} />);
    expect(screen.getByText(/Test Author/i)).toBeInTheDocument();
    expect(screen.getByText(/This is a test quote/i)).toBeInTheDocument();
  });

  it('applies correct background color classes', () => {
    const { rerender, container } = render(<TestimonialCard {...defaultProps} color="yellow" />);
    expect(container.firstChild).toHaveClass('bg-hero-yellow');

    rerender(<TestimonialCard {...defaultProps} color="green" />);
    expect(container.firstChild).toHaveClass('bg-hero-green');

    rerender(<TestimonialCard {...defaultProps} color="blue" />);
    expect(container.firstChild).toHaveClass('bg-hero-blue-dark');
  });

  it('has square-ish aspect ratio or min-height', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    // We check for aspect-square OR a specific min-height/width class that enforces the shape
    // Based on Figma, it's roughly 578x545 which is almost square.
    // So 'aspect-square' or 'h-full' with a wrapper constraints.
    // Let's check for 'aspect-square' as a starting point for "square-ish".
    // Or check if it has w-full and h-full to fill a square container.
    // Let's check for a class that implies size.
    expect(container.firstChild).toHaveClass('h-full'); 
    expect(container.firstChild).toHaveClass('justify-center'); // Content centered vertically
  });
});