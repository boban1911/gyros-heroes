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
    expect(container.firstChild).toHaveClass('aspect-square'); 
    expect(container.firstChild).toHaveClass('justify-center');
  });

  it('has overflow handling', () => {
    const { container } = render(<TestimonialCard {...defaultProps} />);
    // Check for overflow-hidden or similar
    // Actually we want text to FIT, so maybe flex-shrink or clamping?
    // Or just overflow-hidden to prevent spilling out.
    // The safest check is overflow-hidden on the card container.
    // Or on a text wrapper.
    expect(container.firstChild).toHaveClass('overflow-hidden');
  });
});
