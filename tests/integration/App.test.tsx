import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('App Integration', () => {
  it('renders the Hero component', () => {
    render(<App />);
    const heroElements = screen.getAllByText(/HERO/i);
    expect(heroElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/IS IN TOWN!/i)).toBeInTheDocument();
  });
});
