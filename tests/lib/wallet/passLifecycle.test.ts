// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const patchLoyaltyObjectMock = vi.fn();

vi.mock('../../../lib/wallet/google', () => ({
  patchLoyaltyObject: (...args: unknown[]) => patchLoyaltyObjectMock(...args),
}));

beforeEach(() => {
  patchLoyaltyObjectMock.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('expirePass', () => {
  it('patches the loyalty object with state: EXPIRED', async () => {
    patchLoyaltyObjectMock.mockResolvedValueOnce({});
    const { expirePass } = await import('../../../lib/wallet/passLifecycle');
    await expirePass('issuer.obj-123');
    expect(patchLoyaltyObjectMock).toHaveBeenCalledTimes(1);
    expect(patchLoyaltyObjectMock).toHaveBeenCalledWith('issuer.obj-123', { state: 'EXPIRED' });
  });

  it('swallows errors from patchLoyaltyObject', async () => {
    patchLoyaltyObjectMock.mockRejectedValueOnce(new Error('wallet 500'));
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { expirePass } = await import('../../../lib/wallet/passLifecycle');
    await expect(expirePass('issuer.obj-456')).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalledWith('[wallet]', expect.any(Error));
  });
});
