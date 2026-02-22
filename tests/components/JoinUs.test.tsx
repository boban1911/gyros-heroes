import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import JoinUs from '../../src/components/JoinUs';
import React from 'react';

describe('JoinUs component', () => {
  it('renders correctly with title and description', () => {
    const { container } = render(<JoinUs />);
    
    // Check for section id for navigation
    const section = container.querySelector('#posao');
    expect(section).toBeDefined();

    // Check for title parts
    expect(screen.getAllByText(/Pridruži se/i)).toBeDefined();
    expect(screen.getByText(/Hero timu!/i)).toBeDefined();
    
    // Check for description keywords
    expect(screen.getByText(/postani deo brenda/i)).toBeDefined();
    
    // Check for CTA buttons
    expect(screen.getByText(/Popuni Anketu - NI/i)).toBeDefined();
    expect(screen.getByText(/Popuni Anketu - NS/i)).toBeDefined();
  });
});
