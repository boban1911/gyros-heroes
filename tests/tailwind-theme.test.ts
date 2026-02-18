
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
    expect(theme?.colors).toHaveProperty('hero-green', '#3E9C5B');
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

  it('should have custom spacing defined', () => {
    expect(theme?.spacing).toHaveProperty('xs', '10px');
    expect(theme?.spacing).toHaveProperty('sm', '12px');
    expect(theme?.spacing).toHaveProperty('100', '100px');
    expect(theme?.spacing).toHaveProperty('200', '200px');
  });

  it('should have custom border radius defined', () => {
    expect(theme?.borderRadius).toHaveProperty('md', '60px');
    expect(theme?.borderRadius).toHaveProperty('lg', '80px');
  });

  it('should have custom box shadows defined', () => {
    // Check for presence of custom shadow keys
    expect(theme?.boxShadow).toHaveProperty('hero-xs');
    expect(theme?.boxShadow).toHaveProperty('hero-focus');
  });
});
