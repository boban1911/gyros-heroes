import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Setup and Assets Verification', () => {
  const assetsDir = path.join(__dirname, '../src/assets');

  it('should have about-us-mascot.svg', () => {
    expect(fs.existsSync(path.join(assetsDir, 'about-us-mascot.svg'))).toBe(true);
  });

  it('should have icon-gyros.svg', () => {
    expect(fs.existsSync(path.join(assetsDir, 'icon-gyros.svg'))).toBe(true);
  });

  it('should have icon-special.svg', () => {
    expect(fs.existsSync(path.join(assetsDir, 'icon-special.svg'))).toBe(true);
  });

  it('should have icon-kids.svg', () => {
    expect(fs.existsSync(path.join(assetsDir, 'icon-kids.svg'))).toBe(true);
  });

  it('should have icon-salad.svg', () => {
    expect(fs.existsSync(path.join(assetsDir, 'icon-salad.svg'))).toBe(true);
  });
});
