import React, { useCallback, useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QrTokenResponse {
  token: string;
  jti: string;
  iat: number;
  exp: number;
}

type QrState =
  | { kind: 'loading' }
  | { kind: 'unauth' }
  | { kind: 'error' }
  | { kind: 'ready'; dataUrl: string; exp: number };

const REFRESH_LEAD_SECONDS = 10;
const RETRY_DELAY_MS = 2000;

const CardQr: React.FC = () => {
  const [state, setState] = useState<QrState>({ kind: 'loading' });
  const [now, setNow] = useState<number>(() => Math.floor(Date.now() / 1000));

  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cancelledRef = useRef<boolean>(false);
  const attemptRef = useRef<number>(0);

  const clearAllTimers = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }
    if (tickTimerRef.current) {
      clearInterval(tickTimerRef.current);
      tickTimerRef.current = null;
    }
  }, []);

  const loadToken = useCallback(async () => {
    try {
      const res = await fetch('/api/wallet/google/qr-token', { credentials: 'same-origin' });
      if (cancelledRef.current) return;

      if (res.status === 401) {
        clearAllTimers();
        setState({ kind: 'unauth' });
        return;
      }

      if (!res.ok) {
        if (attemptRef.current === 0) {
          attemptRef.current = 1;
          retryTimerRef.current = setTimeout(() => {
            if (!cancelledRef.current) void loadToken();
          }, RETRY_DELAY_MS);
          return;
        }
        attemptRef.current = 0;
        setState({ kind: 'error' });
        return;
      }

      const body = (await res.json()) as QrTokenResponse;
      if (cancelledRef.current) return;

      const dataUrl = await QRCode.toDataURL(body.token, {
        margin: 1,
        width: 320,
        errorCorrectionLevel: 'M',
      });
      if (cancelledRef.current) return;

      attemptRef.current = 0;
      setState({ kind: 'ready', dataUrl, exp: body.exp });

      const nowSec = Math.floor(Date.now() / 1000);
      const refreshInSec = Math.max(1, body.exp - nowSec - REFRESH_LEAD_SECONDS);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = setTimeout(() => {
        if (!cancelledRef.current) void loadToken();
      }, refreshInSec * 1000);
    } catch {
      if (cancelledRef.current) return;
      if (attemptRef.current === 0) {
        attemptRef.current = 1;
        retryTimerRef.current = setTimeout(() => {
          if (!cancelledRef.current) void loadToken();
        }, RETRY_DELAY_MS);
        return;
      }
      attemptRef.current = 0;
      setState({ kind: 'error' });
    }
  }, [clearAllTimers]);

  useEffect(() => {
    cancelledRef.current = false;
    void loadToken();

    tickTimerRef.current = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);

    return () => {
      cancelledRef.current = true;
      clearAllTimers();
    };
  }, [loadToken, clearAllTimers]);

  function handleRetry() {
    attemptRef.current = 0;
    setState({ kind: 'loading' });
    void loadToken();
  }

  return (
    <div className="w-full bg-white rounded-[24px] lg:rounded-[28px] px-5 md:px-6 py-5 md:py-6 flex flex-col items-center gap-3 shadow-hero-xs">
      <p className="font-montserrat font-bold text-grey-black text-[13px] md:text-[14px] tracking-[1.5px] uppercase">
        Pokaži na kasi
      </p>

      <div className="w-[220px] h-[220px] md:w-[240px] md:h-[240px] flex items-center justify-center">
        {state.kind === 'loading' && (
          <p className="font-montserrat text-grey-black/70 text-sm">Generišem QR…</p>
        )}

        {state.kind === 'unauth' && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="font-montserrat text-grey-black text-sm">Sesija je istekla.</p>
            <a
              href="/loyalty"
              className="font-montserrat font-bold text-hero-blue-dark text-sm underline"
            >
              Prijavi se ponovo
            </a>
          </div>
        )}

        {state.kind === 'error' && (
          <div className="flex flex-col items-center gap-3 text-center">
            <p className="font-montserrat text-grey-black text-sm">QR nije dostupan.</p>
            <button
              type="button"
              onClick={handleRetry}
              className="bg-hero-blue-dark text-white font-montserrat font-bold text-[13px] px-4 py-2 rounded-full shadow-hero-xs hover:bg-hero-blue transition-colors duration-base"
            >
              Pokušaj ponovo
            </button>
          </div>
        )}

        {state.kind === 'ready' && (
          <img
            src={state.dataUrl}
            alt="QR kod za Hero karticu"
            className="w-full h-full"
          />
        )}
      </div>

      {state.kind === 'ready' && (
        <p className="font-montserrat text-grey-black/70 text-[12px] md:text-[13px]">
          {(() => {
            const remaining = Math.max(0, state.exp - now);
            return `Osvežava za ${remaining}s`;
          })()}
        </p>
      )}
    </div>
  );
};

export default CardQr;
