import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Menu from '../../src/components/Menu';

describe('Menu Component', () => {
  it('renders the main title', () => {
    render(<Menu />);
    expect(screen.getByText(/Pogledaj/i)).toBeInTheDocument();
    expect(screen.getByText(/Meni/i)).toBeInTheDocument();
  });

  it('renders menu items from data', () => {
    render(<Menu />);
    // Check for a few known items from the data
    const classicHeroes = screen.getAllByText('CLASSIC HERO');
    expect(classicHeroes.length).toBeGreaterThan(0);
    
    const pomfrits = screen.getAllByText('POMFRIT');
    expect(pomfrits.length).toBeGreaterThan(0);
  });
});