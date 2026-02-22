// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
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
    // Check for yellow bg
    expect(container.firstChild).toHaveClass('bg-hero-yellow');

    rerender(<TestimonialCard {...defaultProps} color="green" />);
    expect(container.firstChild).toHaveClass('bg-hero-green');

    rerender(<TestimonialCard {...defaultProps} color="blue" />);
    expect(container.firstChild).toHaveClass('bg-hero-blue-dark');
  });
});
