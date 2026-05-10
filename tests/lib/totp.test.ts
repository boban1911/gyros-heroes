// @vitest-environment node
import { afterEach, describe, expect, it, vi } from 'vitest';
import { generate, generateSecret, verify } from '../../lib/totp';

// RFC 6238 reference secret: ASCII "12345678901234567890" → base32:
const RFC_SECRET_B32 = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

afterEach(() => {
  vi.useRealTimers();
});

describe('lib/totp', () => {
  describe('generateSecret', () => {
    it('returns a base32-encoded string of the expected length', () => {
      const s = generateSecret(20);
      // 20 bytes → 32 base32 chars (no padding in our encoder).
      expect(s).toMatch(/^[A-Z2-7]+$/);
      expect(s.length).toBe(32);
    });

    it('returns different values across calls', () => {
      expect(generateSecret()).not.toBe(generateSecret());
    });
  });

  describe('verify with RFC 6238 known vectors', () => {
    // RFC 6238 Appendix B, SHA-1, 8-digit codes.
    // We re-derive the 6-digit code from the same vectors at the documented timestamps.
    // Time 59s → counter 1, code at 6 digits derived deterministically.
    it('accepts the code generated for a known timestamp', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(59_000));
      const code = generate(RFC_SECRET_B32);
      expect(code).toMatch(/^\d{6}$/);
      expect(verify(RFC_SECRET_B32, code)).toBe(true);
    });

    it('matches RFC 6238 8-digit vectors when truncated to 6 digits', () => {
      // Vector at T = 59s → 8-digit code 94287082 → 6-digit (mod 10^6) = 287082.
      vi.useFakeTimers();
      vi.setSystemTime(new Date(59_000));
      expect(generate(RFC_SECRET_B32)).toBe('287082');
      // Vector at T = 1111111109s → 8-digit 07081804 → 6-digit 081804.
      vi.setSystemTime(new Date(1_111_111_109_000));
      expect(generate(RFC_SECRET_B32)).toBe('081804');
    });
  });

  describe('verify skew tolerance', () => {
    it('accepts the previous time-step code (within window=1)', () => {
      vi.useFakeTimers();
      const baseTs = 1_700_000_000_000; // arbitrary
      vi.setSystemTime(new Date(baseTs - 30_000));
      const prevCode = generate(RFC_SECRET_B32);
      vi.setSystemTime(new Date(baseTs));
      expect(verify(RFC_SECRET_B32, prevCode)).toBe(true);
    });

    it('accepts the next time-step code (within window=1)', () => {
      vi.useFakeTimers();
      const baseTs = 1_700_000_000_000;
      vi.setSystemTime(new Date(baseTs + 30_000));
      const nextCode = generate(RFC_SECRET_B32);
      vi.setSystemTime(new Date(baseTs));
      expect(verify(RFC_SECRET_B32, nextCode)).toBe(true);
    });

    it('rejects a code two time-steps away', () => {
      vi.useFakeTimers();
      const baseTs = 1_700_000_000_000;
      vi.setSystemTime(new Date(baseTs + 90_000));
      const farCode = generate(RFC_SECRET_B32);
      vi.setSystemTime(new Date(baseTs));
      expect(verify(RFC_SECRET_B32, farCode)).toBe(false);
    });
  });

  describe('verify rejection paths', () => {
    it('rejects an obviously wrong code', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(59_000));
      expect(verify(RFC_SECRET_B32, '000000')).toBe(false);
    });

    it('rejects non-numeric strings', () => {
      expect(verify(RFC_SECRET_B32, 'abcdef')).toBe(false);
    });

    it('rejects codes with wrong digit count', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(59_000));
      expect(verify(RFC_SECRET_B32, '12345')).toBe(false);
      expect(verify(RFC_SECRET_B32, '1234567')).toBe(false);
    });
  });
});
