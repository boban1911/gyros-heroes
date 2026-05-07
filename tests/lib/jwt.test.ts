// @vitest-environment node
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const TEST_SECRET = 'test-secret-with-at-least-32-characters!!';

beforeAll(() => {
  process.env.JWT_SECRET = TEST_SECRET;
});

afterEach(() => {
  vi.useRealTimers();
});

async function loadJwt() {
  // Re-import inside each test so the cached secret is reset between
  // mutations of process.env. The module caches getSecret() result, so we
  // also call vi.resetModules() in tests that swap secrets.
  return await import('../../lib/jwt');
}

describe('signQrToken / verifyQrToken', () => {
  it('round-trips a freshly signed token', async () => {
    const { signQrToken, verifyQrToken } = await loadJwt();
    const cardId = '11111111-1111-1111-1111-111111111111';
    const { token, jti, iat, exp } = await signQrToken(cardId, 60);

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
    expect(typeof jti).toBe('string');
    expect(jti.length).toBeGreaterThan(0);
    expect(exp - iat).toBe(60);

    const claims = await verifyQrToken(token);
    expect(claims.cardId).toBe(cardId);
    expect(claims.jti).toBe(jti);
    expect(claims.iat).toBe(iat);
    expect(claims.exp).toBe(exp);
  });

  it('returns the documented payload shape (cardId, jti, iat, exp only)', async () => {
    const { signQrToken, verifyQrToken } = await loadJwt();
    const { token } = await signQrToken('22222222-2222-2222-2222-222222222222', 60);
    const claims = await verifyQrToken(token);

    expect(Object.keys(claims).sort()).toEqual(['cardId', 'exp', 'iat', 'jti']);
    expect(typeof claims.cardId).toBe('string');
    expect(typeof claims.jti).toBe('string');
    expect(typeof claims.iat).toBe('number');
    expect(typeof claims.exp).toBe('number');
  });

  it('rejects an expired token', async () => {
    const { signQrToken, verifyQrToken } = await loadJwt();
    // Sign a token whose exp is already in the past — jose enforces exp on verify.
    const { token } = await signQrToken('33333333-3333-3333-3333-333333333333', -10);
    await expect(verifyQrToken(token)).rejects.toThrow();
  });

  it('rejects a tampered signature', async () => {
    const { signQrToken, verifyQrToken } = await loadJwt();
    const { token } = await signQrToken('44444444-4444-4444-4444-444444444444', 60);
    const [header, payload, signature] = token.split('.');
    expect(signature).toBeTruthy();

    // Flip a couple of bytes at the end of the signature segment so it stays
    // base64url-shaped but no longer verifies.
    const flipped = signature.slice(0, -2) + (signature.endsWith('AA') ? 'BB' : 'AA');
    const tampered = `${header}.${payload}.${flipped}`;

    await expect(verifyQrToken(tampered)).rejects.toThrow();
  });

  it('rejects a token signed with a different secret', async () => {
    // Sign with one secret …
    process.env.JWT_SECRET = 'first-secret-with-at-least-32-characters!';
    vi.resetModules();
    const first = await import('../../lib/jwt');
    const { token } = await first.signQrToken('55555555-5555-5555-5555-555555555555', 60);

    // … then verify with another. Module cache must be reset so getSecret()
    // re-reads the new env var.
    process.env.JWT_SECRET = 'second-secret-with-at-least-32-character';
    vi.resetModules();
    const second = await import('../../lib/jwt');
    await expect(second.verifyQrToken(token)).rejects.toThrow();

    process.env.JWT_SECRET = TEST_SECRET;
    vi.resetModules();
  });
});

describe('signSession / verifySession', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = TEST_SECRET;
    vi.resetModules();
  });

  it('round-trips a customer session', async () => {
    const { signSession, verifySession } = await loadJwt();
    const token = await signSession({ sub: 'cust-123', kind: 'customer' }, 3600);
    const claims = await verifySession<{ sub: string; kind: 'customer' }>(token);
    expect(claims.sub).toBe('cust-123');
    expect(claims.kind).toBe('customer');
  });

  it('round-trips a staff session with role', async () => {
    const { signSession, verifySession } = await loadJwt();
    const token = await signSession(
      { sub: 'staff-1', kind: 'staff', role: 'admin' },
      3600,
    );
    const claims = await verifySession<{ sub: string; kind: 'staff'; role: 'admin' | 'staff' }>(token);
    expect(claims.sub).toBe('staff-1');
    expect(claims.kind).toBe('staff');
    expect(claims.role).toBe('admin');
  });
});

describe('newOpaqueToken / hashOpaqueToken', () => {
  it('produces a base64url token whose sha256 matches hashOpaqueToken', async () => {
    const { newOpaqueToken, hashOpaqueToken } = await loadJwt();
    const { token, hash } = newOpaqueToken();

    // base64url alphabet only: A-Z a-z 0-9 - _
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hashOpaqueToken(token)).toBe(hash);
  });

  it('produces unique tokens across calls', async () => {
    const { newOpaqueToken } = await loadJwt();
    const a = newOpaqueToken();
    const b = newOpaqueToken();
    expect(a.token).not.toBe(b.token);
    expect(a.hash).not.toBe(b.hash);
  });
});
