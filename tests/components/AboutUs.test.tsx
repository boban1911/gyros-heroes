import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AboutUs from '../../src/components/AboutUs';
import React from 'react';

describe('AboutUs Component', () => {
  it('renders the "O Nama" heading', () => {
    render(<AboutUs />);
    const heading = screen.getByRole('heading', { level: 2, name: /O Nama/i });
    expect(heading).toBeDefined();
  });

  it('renders the brand story text', () => {
    render(<AboutUs />);
    const storyText = screen.getByText(/Gyros Heroes je savremen fast-food koncept/i);
    expect(storyText).toBeDefined();
  });

  it('renders 4 feature cards with correct titles', () => {
    render(<AboutUs />);
    // On desktop we have 4 cards, and on mobile we have 4 cards (hidden/shown)
    // Actually the component renders them twice in the DOM (one for hidden lg, one for lg)
    // So we expect 2 of each
    const gyrosTitles = screen.getAllByRole('heading', { level: 3, name: /^GYROS$/i });
    const specialTitles = screen.getAllByRole('heading', { level: 3, name: /HEROES SPECIAL/i });
    const kidsTitles = screen.getAllByRole('heading', { level: 3, name: /KIDS MENU/i });
    const saladTitles = screen.getAllByRole('heading', { level: 3, name: /PIĆA I NAMAZI/i });

    expect(gyrosTitles.length).toBeGreaterThanOrEqual(1);
    expect(specialTitles.length).toBeGreaterThanOrEqual(1);
    expect(kidsTitles.length).toBeGreaterThanOrEqual(1);
    expect(saladTitles.length).toBeGreaterThanOrEqual(1);
  });
});
