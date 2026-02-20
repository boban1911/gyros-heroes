import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../src/App';

describe('App Integration', () => {
  it('renders the navbar and hero section', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeDefined();
    expect(screen.getByRole('heading', { name: /HERO.*IS.*IN.*TOWN/i })).toBeDefined();
  });

  it('renders the superhero mascot image', () => {
    render(<App />);
    expect(screen.getByAltText(/superhero tortilla/i)).toBeDefined();
  });

  it('renders the About Us section', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 2, name: /O Nama/i })).toBeDefined();
    expect(screen.getByText(/Gyros Heroes je savremen fast-food koncept/i)).toBeDefined();
  });
});
