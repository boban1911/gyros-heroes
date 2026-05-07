import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

const READER_ELEMENT_ID = 'gh-scan-reader';
const TOAST_DURATION_MS = 2400;

type ToastTone = 'success' | 'celebrate' | 'warning' | 'error';

interface ToastState {
  message: string;
  tone: ToastTone;
}

interface ScanSuccessResponse {
  customerName: string;
  stampsCount: number;
  stampsRequired: number;
  status: 'active' | 'redeemable' | 'redeemed';
  justBecameRedeemable: boolean;
}

interface ScanErrorResponse {
  error: string;
  retryAfterSeconds?: number;
  details?: unknown;
}

type CameraStatus = 'idle' | 'starting' | 'running' | 'denied' | 'unavailable' | 'error';

function classNamesForToast(tone: ToastTone): string {
  switch (tone) {
    case 'celebrate':
      return 'bg-hero-yellow text-grey-black border-white/40';
    case 'success':
      return 'bg-hero-green text-white border-white/30';
    case 'warning':
      return 'bg-hero-yellow-dark text-white border-white/30';
    case 'error':
      return 'bg-hero-blue-dark text-white border-hero-yellow/60';
    default:
      return 'bg-hero-blue-dark text-white border-white/30';
  }
}

function Scanner() {
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanInFlight = useRef(false);
  const lastDecodedRef = useRef<{ text: string; at: number } | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    setToastVisible(true);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastVisible(false);
      // Allow the slide-out transition to finish before unmounting.
      window.setTimeout(() => setToast(null), 350);
    }, TOAST_DURATION_MS);
  }, []);

  const handleScanResult = useCallback(
    async (decoded: string) => {
      // Debounce identical decodes within ~3s and ignore burst-fire while a
      // request is in flight — html5-qrcode keeps the camera running.
      if (isScanInFlight.current) return;
      const now = Date.now();
      const last = lastDecodedRef.current;
      if (last && last.text === decoded && now - last.at < 3000) return;
      lastDecodedRef.current = { text: decoded, at: now };

      isScanInFlight.current = true;
      try {
        scannerRef.current?.pause(true);
      } catch {
        // pause() throws if already paused — ignore.
      }

      try {
        const res = await fetch('/api/staff/scan', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ qrToken: decoded }),
        });

        if (res.ok) {
          const data = (await res.json()) as ScanSuccessResponse;
          if (data.justBecameRedeemable || data.status === 'redeemable') {
            showToast({
              tone: 'celebrate',
              message: `Spremno za besplatan gyros! (${data.stampsCount}/${data.stampsRequired})`,
            });
          } else {
            showToast({
              tone: 'success',
              message: `${data.customerName} +1 → ${data.stampsCount}/${data.stampsRequired}`,
            });
          }
        } else if (res.status === 401) {
          showToast({ tone: 'error', message: 'Sesija je istekla. Prijavi se ponovo.' });
          window.setTimeout(() => navigate('/scan/login', { replace: true }), 1200);
          return;
        } else {
          const data = (await res.json().catch(() => ({}) as ScanErrorResponse)) as ScanErrorResponse;
          if (res.status === 429 && data.retryAfterSeconds !== undefined) {
            showToast({
              tone: 'warning',
              message: `Već skenirano (sačekaj ${data.retryAfterSeconds}s)`,
            });
          } else if (data.error === 'token_already_used') {
            showToast({ tone: 'warning', message: 'QR kod je već iskorišćen.' });
          } else if (data.error === 'token_expired') {
            showToast({ tone: 'error', message: 'QR kod je istekao.' });
          } else if (data.error === 'invalid_token') {
            showToast({ tone: 'error', message: 'Neispravan QR kod.' });
          } else if (res.status === 404) {
            showToast({ tone: 'error', message: 'Kartica nije pronađena.' });
          } else {
            showToast({ tone: 'error', message: 'Greška pri skeniranju.' });
          }
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        // Resume after a short pause so users can read the toast and to
        // avoid re-triggering on the same barcode still in frame.
        window.setTimeout(() => {
          try {
            scannerRef.current?.resume();
          } catch {
            // Already running or stopped — ignore.
          }
          isScanInFlight.current = false;
        }, 1200);
      }
    },
    [navigate, showToast],
  );

  // Mount the camera scanner once.
  useEffect(() => {
    let cancelled = false;
    const scanner = new Html5Qrcode(READER_ELEMENT_ID, {
      verbose: false,
      formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
    });
    scannerRef.current = scanner;
    setCameraStatus('starting');
    setCameraError(null);

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 }, aspectRatio: 1.7777 },
        (decodedText) => {
          if (cancelled) return;
          void handleScanResult(decodedText);
        },
        () => {
          // Per-frame decode failures are noisy — ignore.
        },
      )
      .then(() => {
        if (!cancelled) setCameraStatus('running');
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : String(err);
        setCameraError(message);
        if (/permission|denied|NotAllowed/i.test(message)) {
          setCameraStatus('denied');
        } else if (/NotFound|no camera|no media/i.test(message)) {
          setCameraStatus('unavailable');
        } else {
          setCameraStatus('error');
        }
      });

    return () => {
      cancelled = true;
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
      const current = scannerRef.current;
      scannerRef.current = null;
      if (current) {
        current
          .stop()
          .catch(() => undefined)
          .finally(() => {
            try {
              current.clear();
            } catch {
              // ignore
            }
          });
      }
    };
  }, [handleScanResult]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/staff/logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch {
      // Even if logout fails server-side, send the user back to login.
    }
    navigate('/scan/login', { replace: true });
  }, [loggingOut, navigate]);

  return (
    <main className="relative min-h-screen w-full bg-black text-white font-montserrat overflow-hidden">
      <div
        id={READER_ELEMENT_ID}
        className="absolute inset-0 w-full h-full"
        aria-label="Skener kamere"
      />

      {/* Top bar */}
      <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 pt-[max(env(safe-area-inset-top),16px)] pb-3 bg-gradient-to-b from-black/60 to-transparent">
        <span className="font-extrabold text-base tracking-wide">
          <span className="text-hero-yellow italic">Hero</span> Scanner
        </span>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="bg-white/10 hover:bg-white/20 transition-colors duration-base text-white text-xs font-bold uppercase tracking-widest rounded-full px-4 py-2 border border-white/20 disabled:opacity-60"
        >
          {loggingOut ? 'Izlazim…' : 'Odjavi se'}
        </button>
      </div>

      {/* Camera-state overlays */}
      {cameraStatus !== 'running' ? (
        <div className="absolute inset-0 z-10 bg-hero-blue-dark/90 flex items-center justify-center px-6 text-center">
          <div className="max-w-sm flex flex-col gap-4">
            {cameraStatus === 'starting' || cameraStatus === 'idle' ? (
              <>
                <h2 className="text-xl font-bold uppercase tracking-wider">Pokrećem kameru…</h2>
                <p className="text-white/80 text-sm">
                  Dozvoli pristup kameri kada te telefon pita.
                </p>
              </>
            ) : null}
            {cameraStatus === 'denied' ? (
              <>
                <h2 className="text-xl font-bold uppercase tracking-wider text-hero-yellow">
                  Kamera nije dozvoljena
                </h2>
                <p className="text-white/85 text-sm">
                  Otvori podešavanja pregledača i dozvoli pristup kameri za ovu stranicu, pa
                  osveži.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-hero-yellow text-grey-black font-bold rounded-full h-12 px-6 uppercase tracking-widest text-sm hover:bg-white transition-colors duration-base"
                >
                  Osveži
                </button>
              </>
            ) : null}
            {cameraStatus === 'unavailable' ? (
              <>
                <h2 className="text-xl font-bold uppercase tracking-wider text-hero-yellow">
                  Nema dostupne kamere
                </h2>
                <p className="text-white/85 text-sm">
                  Ovaj uređaj nema kameru ili je zauzeta drugom aplikacijom.
                </p>
              </>
            ) : null}
            {cameraStatus === 'error' ? (
              <>
                <h2 className="text-xl font-bold uppercase tracking-wider text-hero-yellow">
                  Greška pri pokretanju kamere
                </h2>
                {cameraError ? (
                  <p className="text-white/70 text-xs break-words">{cameraError}</p>
                ) : null}
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="bg-hero-yellow text-grey-black font-bold rounded-full h-12 px-6 uppercase tracking-widest text-sm hover:bg-white transition-colors duration-base"
                >
                  Pokušaj ponovo
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Reticle */}
      {cameraStatus === 'running' ? (
        <div
          aria-hidden
          className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
        >
          <div className="w-[260px] h-[260px] rounded-3xl border-2 border-hero-yellow/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
        </div>
      ) : null}

      {/* Bottom hint */}
      {cameraStatus === 'running' ? (
        <div className="absolute bottom-[max(env(safe-area-inset-bottom),20px)] inset-x-0 z-10 flex justify-center px-6 pointer-events-none">
          <p className="bg-black/55 backdrop-blur-sm border border-white/15 rounded-full px-5 py-2 text-sm text-white/90">
            Uperi kameru u QR kod sa wallet kartice
          </p>
        </div>
      ) : null}

      {/* Toast — animation pattern mirrors CookieBanner */}
      {toast ? (
        <div
          className={`fixed top-[max(env(safe-area-inset-top),12px)] left-0 right-0 z-30 px-4 flex justify-center transform transition-all duration-500 ease-in-out ${
            toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`max-w-md w-full rounded-2xl border px-5 py-4 shadow-2xl text-center font-bold text-base ${classNamesForToast(toast.tone)}`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default Scanner;
