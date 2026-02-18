
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '../../src/components/Navbar';
import { describe, it, expect, vi } from 'vitest';

describe('Navbar Responsiveness and Interactions', () => {
  it('renders all navigation links', () => {
    render(<Navbar />);
    // We check for both desktop and mobile versions if they are both in DOM
    // My implementation has them both in DOM (desktop in flex, mobile in side-over)
    const heroLinks = screen.getAllByText('Hero');
    expect(heroLinks.length).toBeGreaterThan(0);
  });

  it('opens mobile menu when hamburger is clicked', () => {
    render(<Navbar />);
    const hamburger = screen.getByLabelText(/Open menu/i);
    fireEvent.click(hamburger);
    expect(screen.getByText('Menu')).toBeInTheDocument();
    
    // Check that the slide-over is visible (opacity-100)
    const menuContainer = screen.getByText('Menu').closest('.fixed.inset-0');
    expect(menuContainer).toHaveClass('opacity-100');
  });

  it('closes mobile menu when close button is clicked', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText(/Open menu/i));
    fireEvent.click(screen.getByLabelText(/Close menu/i));
    
    const menuContainer = screen.getByText('Menu').closest('.fixed.inset-0');
    expect(menuContainer).toHaveClass('opacity-0');
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navbar />);
    fireEvent.click(screen.getByLabelText(/Open menu/i));
    
    // Click a link in the mobile menu
    const menuLink = screen.getAllByText('Meni').find(el => el.closest('.fixed.top-0.right-0'));
    if (menuLink) {
        fireEvent.click(menuLink);
    }
    
    const menuContainer = screen.getByText('Menu').closest('.fixed.inset-0');
    expect(menuContainer).toHaveClass('opacity-0');
  });
});
