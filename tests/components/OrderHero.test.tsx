import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import OrderHero from '../../src/components/OrderHero';
import React from 'react';

describe('OrderHero', () => {
  it('renders the component', () => {
    render(<OrderHero />);
    expect(screen.getAllByText(/Poruči svoj/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Hero!/i)).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<OrderHero />);
    expect(screen.getByText(/Poruči svoj omiljeni gyros brzo i jednostavno/i)).toBeInTheDocument();
  });

  it('renders ordering buttons', () => {
    render(<OrderHero />);
    
    // Check for button text parts
    expect(screen.getAllByText('Poruči Glovo -')).toHaveLength(2);
    expect(screen.getByText('Poruči Wolt -')).toBeInTheDocument();
    expect(screen.getAllByText('NI')).toHaveLength(1);
    expect(screen.getAllByText('NS')).toHaveLength(2);

    // Check for links
    const buttons = screen.getAllByRole('link');
    expect(buttons[0]).toHaveAttribute('href', 'https://glovoapp.com/rs/sr/nis/gyros-heroes-nis/');
    expect(buttons[1]).toHaveAttribute('href', '#'); // Placeholder
    expect(buttons[2]).toHaveAttribute('href', 'https://wolt.com/sr/srb/novi-sad/restaurant/gyros-heroes-ns');
  });

  it('has correct layout classes', () => {
    const { container } = render(<OrderHero />);
    const section = container.querySelector('section');
    expect(section).toHaveClass('w-full', 'px-[20px]', 'pb-20');
  });
});