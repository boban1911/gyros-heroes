import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Menu from '../../src/components/Menu';

// Mock matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

describe('Menu Filtering Integration', () => {
  it('should filter items when a category button is clicked in mobile view', () => {
    render(<Menu />);
    
    const mobileContainer = screen.getByTestId('menu-mobile');
    const mobileView = within(mobileContainer);

    // Initial state (All category)
    expect(mobileView.getAllByText(/Classic Hero/i).length).toBeGreaterThan(0);

    // Click 'Sides' (Dodaci) category
    const sidesButton = screen.getByRole('button', { name: /dodaci/i });
    fireEvent.click(sidesButton);

    // Verify 'Classic Hero' is gone from MOBILE container and a side is shown
    expect(mobileView.queryAllByText(/Classic Hero/i)).toHaveLength(0);
    expect(mobileView.getAllByText(/POMFRIT/i).length).toBeGreaterThan(0);
  });

  it('should handle special "Vege Hero" exception in Gyros category', () => {
    render(<Menu />);
    
    // Click 'Gyros' category
    const gyrosButton = screen.getByRole('button', { name: /gyros/i });
    fireEvent.click(gyrosButton);

    const mobileContainer = screen.getByTestId('menu-mobile');
    const mobileView = within(mobileContainer);

    // 'Vege Hero' is category 'meals' but should show in 'Gyros' mobile filter
    expect(mobileView.getAllByText(/Vege Hero/i).length).toBeGreaterThan(0);
  });
});
