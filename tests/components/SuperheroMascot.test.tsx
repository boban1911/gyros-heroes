import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SuperheroMascot from '../../src/components/SuperheroMascot';

describe('SuperheroMascot', () => {
  it('renders the superhero tortilla image with correct attributes', () => {
    render(<SuperheroMascot />);
    const img = screen.getByAltText(/superhero tortilla/i);
    expect(img).toBeDefined();
    expect(img.getAttribute('src')).toContain('superhero-tortilla.svg');
  });

  it('has responsive classes to hide on mobile', () => {
    const { container } = render(<SuperheroMascot />);
    const div = container.firstChild as HTMLElement;
    // Mobile hidden, desktop visible (e.g., md:block or similar)
    expect(div.className).toContain('hidden');
    expect(div.className).toContain('md:block');
  });

  it('has absolute positioning classes', () => {
    const { container } = render(<SuperheroMascot />);
    const div = container.firstChild as HTMLElement;
    expect(div.className).toContain('absolute');
  });
});
