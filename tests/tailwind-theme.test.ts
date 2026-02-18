
import { describe, it, expect } from 'vitest';
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../tailwind.config.js';

const theme = resolveConfig(tailwindConfig).theme;

describe('Tailwind Theme Configuration', () => {
  it('should have custom colors defined', () => {
    // Expected colors based on Figma analysis
    // Using simple semantic names
    // resolveConfig merges extend into theme, so we check theme.colors directly
    expect(theme?.colors).toHaveProperty('hero-blue-dark', '#1F3B81');
    expect(theme?.colors).toHaveProperty('hero-blue', '#4866B0');
    expect(theme?.colors).toHaveProperty('hero-yellow-dark', '#B07400');
    expect(theme?.colors).toHaveProperty('hero-yellow', '#FBAD18');
    expect(theme?.colors).toHaveProperty('grey-black', '#212121');
    expect(theme?.colors).toHaveProperty('grey-middle', '#9596A4');
    expect(theme?.colors).toHaveProperty('grey-light', '#D0D1DD');
  });

  it('should have custom font families defined', () => {
    // resolveConfig merges extend into theme
    expect(theme?.fontFamily).toHaveProperty('montserrat');
    // @ts-ignore
    expect(theme?.fontFamily?.montserrat).toContain('Montserrat');
  });
});
