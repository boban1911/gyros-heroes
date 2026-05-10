import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import CardQr from '../../../src/components/loyalty/CardQr';

vi.mock('qrcode', () => ({
  default: {
    toDataURL: vi.fn(async (_text: string) => 'data:image/png;base64,FAKE'),
  },
}));

interface MockResponseInit {
  ok?: boolean;
  status?: number;
  json?: () => Promise<unknown>;
}

function makeResponse(init: MockResponseInit): Response {
  return {
    ok: init.ok ?? true,
    status: init.status ?? 200,
    json: init.json ?? (async () => ({})),
  } as unknown as Response;
}

describe('CardQr', () => {
  const NOW_MS = 1_700_000_000_000;

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(NOW_MS);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders the QR image after the token fetch resolves', async () => {
    const nowSec = Math.floor(NOW_MS / 1000);
    const fetchMock = vi.fn(async () =>
      makeResponse({
        ok: true,
        status: 200,
        json: async () => ({
          token: 'jwt.token.here',
          jti: 'abc',
          iat: nowSec,
          exp: nowSec + 60,
        }),
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<CardQr />);

    await waitFor(() => {
      expect(screen.getByRole('img', { name: /QR kod/i })).toBeInTheDocument();
    });
    expect(screen.getByRole('img', { name: /QR kod/i })).toHaveAttribute(
      'src',
      'data:image/png;base64,FAKE',
    );
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/wallet/google/qr-token',
      expect.objectContaining({ credentials: 'same-origin' }),
    );
  });

  it('schedules a refresh roughly 10s before expiry', async () => {
    const nowSec = Math.floor(NOW_MS / 1000);
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(async () =>
        makeResponse({
          ok: true,
          json: async () => ({
            token: 'jwt.first',
            jti: 'a',
            iat: nowSec,
            exp: nowSec + 60,
          }),
        }),
      )
      .mockImplementationOnce(async () =>
        makeResponse({
          ok: true,
          json: async () => ({
            token: 'jwt.second',
            jti: 'b',
            iat: nowSec + 50,
            exp: nowSec + 110,
          }),
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    render(<CardQr />);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Advance to ~9s before expiry — refresh should not have fired yet.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(49_000);
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Cross the (exp - 10s) boundary -> refresh fires.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('shows the unauth message and login link on 401', async () => {
    const fetchMock = vi.fn(async () =>
      makeResponse({ ok: false, status: 401, json: async () => ({}) }),
    );
    vi.stubGlobal('fetch', fetchMock);

    render(<CardQr />);

    await waitFor(() => {
      expect(screen.getByText(/Sesija je istekla/i)).toBeInTheDocument();
    });
    const link = screen.getByRole('link', { name: /Prijavi se ponovo/i });
    expect(link).toHaveAttribute('href', '/loyalty');
  });
});
