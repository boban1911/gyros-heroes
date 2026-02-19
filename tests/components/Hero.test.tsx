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

  it('renders ordering links', () => {
    render(<Hero />);
    // We expect 3 links: 2 for Niš, 1 for Novi Sad
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThanOrEqual(3);
    expect(links[0]).toHaveAttribute('href');
    expect(links[0]).toHaveTextContent(/Poruči i pokupi/i);
  });
});
