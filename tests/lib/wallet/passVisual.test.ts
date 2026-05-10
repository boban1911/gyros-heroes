// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';

const patchLoyaltyObjectMock = vi.fn();

vi.mock('../../../lib/wallet/google', () => ({
  patchLoyaltyObject: patchLoyaltyObjectMock,
}));

const OBJECT_ID = '1234567890.card_abc';

describe('lib/wallet/passVisual', () => {
  beforeEach(() => {
    patchLoyaltyObjectMock.mockReset();
    patchLoyaltyObjectMock.mockResolvedValue({});
  });

  it('applyReadyToRedeemVisual patches a celebratory yellow background and adds the reward banner', async () => {
    const { applyReadyToRedeemVisual } = await import('../../../lib/wallet/passVisual');
    await applyReadyToRedeemVisual(OBJECT_ID);

    expect(patchLoyaltyObjectMock).toHaveBeenCalledTimes(1);
    const [id, patch] = patchLoyaltyObjectMock.mock.calls[0];
    expect(id).toBe(OBJECT_ID);
    expect(patch).toMatchObject({
      state: 'ACTIVE',
      hexBackgroundColor: '#FBAD18',
      textModulesData: [
        {
          id: 'reward_status',
          header: 'Spremno za nagradu!',
          body: 'Pokaži ovo osoblju.',
        },
      ],
    });
  });

  it('applyActiveVisual reverts to brand-blue background and clears the banner', async () => {
    const { applyActiveVisual } = await import('../../../lib/wallet/passVisual');
    await applyActiveVisual(OBJECT_ID);

    expect(patchLoyaltyObjectMock).toHaveBeenCalledTimes(1);
    const [id, patch] = patchLoyaltyObjectMock.mock.calls[0];
    expect(id).toBe(OBJECT_ID);
    expect(patch).toMatchObject({
      state: 'ACTIVE',
      hexBackgroundColor: '#4866B0',
      textModulesData: [],
    });
  });

  it('swallows errors thrown by patchLoyaltyObject (ready)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    patchLoyaltyObjectMock.mockRejectedValueOnce(new Error('wallet down'));
    const { applyReadyToRedeemVisual } = await import('../../../lib/wallet/passVisual');
    await expect(applyReadyToRedeemVisual(OBJECT_ID)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('swallows errors thrown by patchLoyaltyObject (active)', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    patchLoyaltyObjectMock.mockRejectedValueOnce(new Error('wallet down'));
    const { applyActiveVisual } = await import('../../../lib/wallet/passVisual');
    await expect(applyActiveVisual(OBJECT_ID)).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalled();
    errorSpy.mockRestore();
  });
});
