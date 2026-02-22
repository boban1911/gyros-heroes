// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeAll } from 'vitest';
import TestimonialSlider from '../../src/components/TestimonialSlider';
import React from 'react';

describe('TestimonialSlider', () => {
  it('renders slider container', () => {
    render(<TestimonialSlider />);
    const cards = screen.getAllByText(/—/i); // Looking for the dash before author name
    expect(cards.length).toBeGreaterThan(0);
  });
  
  it('has alignment classes for staggered layout', () => {
    render(<TestimonialSlider />);
    
    // Radoš (Index 0) -> mt-12 md:mt-16
    const radosElement = screen.getAllByText(/Radoš/i)[0];
    const radosWrapper = radosElement.parentElement?.parentElement;
    expect(radosWrapper).toHaveClass('mt-12'); 

    // Maša (Index 1) -> mt-0
    const masaElement = screen.getAllByText(/Maša/i)[0];
    const masaWrapper = masaElement.parentElement?.parentElement;
    expect(masaWrapper).toHaveClass('mt-0'); 

    // Vuk (Index 2) -> mt-6 md:mt-8
    const vukElement = screen.getAllByText(/Vuk/i)[0];
    const vukWrapper = vukElement.parentElement?.parentElement;
    expect(vukWrapper).toHaveClass('mt-6'); 
  });
});
