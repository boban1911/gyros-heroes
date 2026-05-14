import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buf: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const byte of buf) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += BASE32_ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += BASE32_ALPHABET[(value << (5 - bits)) & 0x1f];
  }
  return out;
}

function base32Decode(str: string): Uint8Array {
  const clean = str.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  const bytes: number[] = [];
  let bits = 0;
  let value = 0;
  for (const ch of clean) {
    const idx = BASE32_ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('Invalid base32 character');
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Uint8Array.from(bytes);
}

export function generateSecret(byteLength = 20): string {
  return base32Encode(new Uint8Array(randomBytes(byteLength)));
}

/**
 * Convert a Base32-encoded TOTP secret to a Base16 (hex) string. Google
 * Wallet's `totpDetails.parameters[].key` requires Base16; our internal
 * storage uses Base32 to stay compatible with standard authenticator apps
 * and our own verifier.
 */
export function base32ToHex(secret: string): string {
  return Buffer.from(base32Decode(secret)).toString('hex');
}

interface VerifyOptions {
  window?: number;
  periodSeconds?: number;
  digits?: number;
  algorithm?: 'sha1';
}

function hotp(secret: Uint8Array, counter: number, digits: number, algorithm: 'sha1'): string {
  const counterBuf = new Uint8Array(8);
  const view = new DataView(counterBuf.buffer);
  // Counter is 64-bit big-endian; JS bitwise ops only safe to 32 bits, so split.
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);
  const hmac = createHmac(algorithm, secret).update(counterBuf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = (bin % 10 ** digits).toString().padStart(digits, '0');
  return code;
}

export function verify(secret: string, code: string, opts: VerifyOptions = {}): boolean {
  const window = opts.window ?? 1;
  const periodSeconds = opts.periodSeconds ?? 30;
  const digits = opts.digits ?? 6;
  const algorithm = opts.algorithm ?? 'sha1';
  if (!/^\d+$/.test(code) || code.length !== digits) return false;
  const key = base32Decode(secret);
  const counter = Math.floor(Date.now() / 1000 / periodSeconds);
  const expectedBuf = new TextEncoder().encode(code);
  for (let i = -window; i <= window; i++) {
    const candidate = hotp(key, counter + i, digits, algorithm);
    const candidateBuf = new TextEncoder().encode(candidate);
    if (candidateBuf.length === expectedBuf.length && timingSafeEqual(candidateBuf, expectedBuf)) {
      return true;
    }
  }
  return false;
}

/** Exposed for tests — generate the current TOTP code for a secret. */
export function generate(secret: string, opts: { periodSeconds?: number; digits?: number; algorithm?: 'sha1'; timestampMs?: number } = {}): string {
  const periodSeconds = opts.periodSeconds ?? 30;
  const digits = opts.digits ?? 6;
  const algorithm = opts.algorithm ?? 'sha1';
  const ts = opts.timestampMs ?? Date.now();
  const counter = Math.floor(ts / 1000 / periodSeconds);
  return hotp(base32Decode(secret), counter, digits, algorithm);
}
