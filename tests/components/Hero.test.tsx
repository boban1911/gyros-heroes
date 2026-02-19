import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Hero from '../../src/components/Hero';

describe('Hero Component', () => {
  it('renders the main headline', () => {
    render(<Hero />);
    expect(screen.getByText(/HERO/i)).toBeInTheDocument();
    expect(screen.getByText(/IS IN TOWN!/i)).toBeInTheDocument();
  });

  it('renders location blocks', () => {
    render(<Hero />);
    expect(screen.getAllByText(/Poruči/i).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/Niš/i)).toBeInTheDocument();
    expect(screen.getByText(/Novi Sad/i)).toBeInTheDocument();
  });

  it('renders ordering buttons', () => {
    render(<Hero />);
    // We expect 3 buttons: 2 for Niš, 1 for Novi Sad
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    expect(buttons[0]).toHaveTextContent(/Glovo|Wolt|Button CTA/i);
  });
});
