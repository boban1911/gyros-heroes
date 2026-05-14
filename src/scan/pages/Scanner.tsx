import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, LogOut, ScanLine, Sparkles } from 'lucide-react';
import Logo from '../../components/Logo';
import cityBg from '../../assets/footer/footer-bg-new.svg';
import { useStaffSession } from '../hooks/useStaffSession';

const TOAST_DURATION_MS = 3200;

type ToastTone = 'success' | 'celebrate' | 'warning' | 'error';

interface ToastState {
  message: string;
  tone: ToastTone;
}

interface ScanStampedResponse {
  action: 'stamped';
  cardId: string;
  customerName: string;
  stampsCount: number;
  stampsRequired: number;
  status: 'active' | 'ready_to_redeem';
  justBecameRedeemable: boolean;
}

interface ScanAwaitingRedeemResponse {
  action: 'awaiting_redeem';
  cardId: string;
  customerName: string;
  stampsCount: number;
  stampsRequired: number;
  status: 'ready_to_redeem';
}

type ScanSuccessResponse = ScanStampedResponse | ScanAwaitingRedeemResponse;

interface ScanErrorResponse {
  error: string;
  retryAfterSeconds?: number;
  details?: unknown;
}

interface RedeemPrompt {
  cardId: string;
  customerName: string;
  stampsCount: number;
  stampsRequired: number;
}

function classNamesForToast(tone: ToastTone): string {
  switch (tone) {
    case 'celebrate':
      return 'bg-hero-yellow text-grey-black border-white/50';
    case 'success':
      return 'bg-hero-green text-white border-white/40';
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
  const { staff } = useStaffSession();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [tokenInput, setTokenInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [redeemPrompt, setRedeemPrompt] = useState<RedeemPrompt | null>(null);
  const [redeeming, setRedeeming] = useState(false);
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
      window.setTimeout(() => setToast(null), 350);
    }, TOAST_DURATION_MS);
  }, []);

  // Keep the input focused so a hardware QR scanner (which behaves like
  // a keyboard) can type the payload without the user clicking first.
  useEffect(() => {
    if (!redeemPrompt) inputRef.current?.focus();
    return () => {
      if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    };
  }, [redeemPrompt]);

  const submitToken = useCallback(
    async (decoded: string) => {
      const trimmed = decoded.trim();
      if (!trimmed || submitting) return;

      setSubmitting(true);
      try {
        const res = await fetch('/api/staff/scan', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({ qrToken: trimmed }),
        });

        if (res.ok) {
          const data = (await res.json()) as ScanSuccessResponse;
          if (data.action === 'awaiting_redeem' || data.justBecameRedeemable) {
            setRedeemPrompt({
              cardId: data.cardId,
              customerName: data.customerName,
              stampsCount: data.stampsCount,
              stampsRequired: data.stampsRequired,
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
        setSubmitting(false);
        setTokenInput('');
      }
    },
    [navigate, showToast, submitting],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      void submitToken(tokenInput);
    },
    [submitToken, tokenInput],
  );

  const confirmRedeem = useCallback(async () => {
    if (!redeemPrompt || redeeming) return;
    setRedeeming(true);
    try {
      const res = await fetch('/api/staff/redeem', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ cardId: redeemPrompt.cardId }),
      });
      if (res.ok) {
        showToast({
          tone: 'celebrate',
          message: `Nagrada uručena: ${redeemPrompt.customerName}!`,
        });
        setRedeemPrompt(null);
      } else if (res.status === 401) {
        showToast({ tone: 'error', message: 'Sesija je istekla. Prijavi se ponovo.' });
        window.setTimeout(() => navigate('/scan/login', { replace: true }), 1200);
        return;
      } else if (res.status === 409) {
        showToast({ tone: 'warning', message: 'Kartica nije više spremna za nagradu.' });
        setRedeemPrompt(null);
      } else {
        showToast({ tone: 'error', message: 'Greška pri davanju nagrade.' });
      }
    } catch {
      showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
    } finally {
      setRedeeming(false);
    }
  }, [navigate, redeemPrompt, redeeming, showToast]);

  const cancelRedeem = useCallback(() => {
    if (redeeming) return;
    setRedeemPrompt(null);
  }, [redeeming]);

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
    <div className="relative min-h-screen bg-hero-blue overflow-x-clip font-montserrat">
      <ScannerTopBar
        staffName={staff?.name ?? null}
        isAdmin={staff?.role === 'admin'}
        loggingOut={loggingOut}
        onLogout={handleLogout}
      />

      {/* City silhouette backdrop — matches Loyalty / Admin */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img
          src={cityBg}
          alt=""
          className="w-full h-full object-contain object-top opacity-20 md:opacity-30"
        />
      </div>

      <main className="relative z-10 px-5 pt-[40px] md:pt-[60px] pb-12 lg:pb-16">
        {redeemPrompt ? (
          <RedeemCard
            prompt={redeemPrompt}
            redeeming={redeeming}
            onConfirm={confirmRedeem}
            onCancel={cancelRedeem}
          />
        ) : (
          <ScanCard
            tokenInput={tokenInput}
            submitting={submitting}
            onChange={setTokenInput}
            onSubmit={handleSubmit}
            inputRef={inputRef}
          />
        )}
      </main>

      {toast ? (
        <div
          className={`fixed top-[max(env(safe-area-inset-top),12px)] left-0 right-0 z-50 px-4 flex justify-center transform transition-all duration-500 ease-in-out pointer-events-none ${
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
    </div>
  );
}

interface ScannerTopBarProps {
  staffName: string | null;
  isAdmin: boolean;
  loggingOut: boolean;
  onLogout: () => void;
}

const ScannerTopBar: React.FC<ScannerTopBarProps> = ({ staffName, isAdmin, loggingOut, onLogout }) => (
  <nav className="sticky top-0 z-40 flex justify-center w-full px-[20px] pt-[10px]">
    <div className="bg-hero-blue-dark w-full max-w-[1400px] rounded-[30px] py-[10px] px-[16px] sm:px-[20px] nav:px-[40px] flex items-center justify-between gap-2 sm:gap-3 shadow-hero-xs border border-white/10">
      <a
        href="/"
        className="h-[32px] sm:h-[40px] md:h-[60px] aspect-[355/60] relative shrink-0 cursor-pointer"
        aria-label="Gyros Heroes — početna"
      >
        <Logo className="w-full h-full" />
      </a>
      <div className="flex items-center gap-2 md:gap-3">
        {staffName && (
          <span className="hidden md:inline-flex items-center gap-1.5 bg-hero-yellow/15 text-hero-yellow border border-hero-yellow/40 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            <ScanLine className="w-3 h-3" strokeWidth={2.5} />
            {staffName.split(' ')[0]}
          </span>
        )}
        {isAdmin && (
          <a
            href="/admin"
            aria-label="Admin"
            className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-full px-3 md:px-4 w-[40px] sm:w-auto h-[36px] sm:h-[40px] md:h-[44px] text-[12px] font-bold uppercase tracking-widest transition-colors duration-base whitespace-nowrap"
          >
            <Crown className="w-3.5 h-3.5 shrink-0" strokeWidth={2.5} />
            <span className="hidden sm:inline">Admin</span>
          </a>
        )}
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          aria-label="Odjavi se"
          className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 rounded-full px-3 md:px-5 w-[40px] sm:w-auto h-[36px] sm:h-[40px] md:h-[44px] text-[12px] font-bold uppercase tracking-widest transition-colors duration-base disabled:opacity-60 whitespace-nowrap"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0 sm:hidden" strokeWidth={2.5} />
          <span className="hidden sm:inline">{loggingOut ? 'Izlazim…' : 'Odjavi se'}</span>
        </button>
      </div>
    </div>
  </nav>
);

interface ScanCardProps {
  tokenInput: string;
  submitting: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

const ScanCard: React.FC<ScanCardProps> = ({ tokenInput, submitting, onChange, onSubmit, inputRef }) => (
  <div className="max-w-[1100px] mx-auto px-[20px] nav:px-[60px] flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

    {/* LEFT: Hero copy */}
    <div className="order-2 lg:order-1 w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
      <p className="font-bold text-hero-yellow text-[12px] md:text-[14px] tracking-[2px] uppercase mb-2">
        Skeniranje aktivno
      </p>
      <h1 className="font-bold text-[56px] md:text-[80px] xl:text-[96px] leading-[0.95] tracking-[-2px] md:tracking-[-3px] text-white">
        <span className="block">Skeniraj</span>
        <span className="block text-hero-yellow italic">Hero kod</span>
      </h1>
      <p className="mt-5 max-w-[420px] font-medium text-white/90 text-[15px] md:text-[17px] leading-[1.45]">
        Skeniraj wallet pass ili
        <span className="text-hero-yellow font-bold"> nalepi token </span>
        u polje. Hardverski skener radi automatski — pritisne Enter za tebe.
      </p>
    </div>

    {/* RIGHT: Input panel */}
    <div className="order-1 lg:order-2 w-full lg:w-auto lg:flex-shrink-0 lg:max-w-[460px]">
      <div className="relative bg-hero-green rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[36px] shadow-hero-xs">
        <h2 className="font-black text-[24px] md:text-[28px] text-white leading-[1.05] mb-2">
          Hero <span className="text-hero-yellow italic">kod</span>
        </h2>
        <p className="text-white/85 text-[14px] mb-6">
          Skeniraj direktno ili nalepi vrednost iz Wallet QR-a.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <label className="flex flex-col gap-2">
            <span className="font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
              QR token
            </span>
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              value={tokenInput}
              onChange={(event) => onChange(event.target.value)}
              disabled={submitting}
              placeholder="eyJ… ili gh:card:…"
              className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-medium text-grey-black placeholder:text-grey-middle border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
            />
          </label>

          <button
            type="submit"
            disabled={submitting || !tokenInput.trim()}
            className="mt-2 bg-hero-yellow text-grey-black font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
          >
            {submitting ? 'Šaljem…' : 'Potvrdi skeniranje'}
          </button>
        </form>
      </div>
    </div>
  </div>
);

interface RedeemCardProps {
  prompt: RedeemPrompt;
  redeeming: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const RedeemCard: React.FC<RedeemCardProps> = ({ prompt, redeeming, onConfirm, onCancel }) => (
  <div className="max-w-[640px] mx-auto">
    <div className="relative bg-hero-yellow rounded-[40px] lg:rounded-[48px] p-7 md:p-10 shadow-2xl text-center">
      {/* Sparkles halo */}
      <div className="relative mx-auto mb-5 w-[88px] h-[88px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-grey-black/10" />
        <Sparkles className="relative w-12 h-12 text-grey-black" strokeWidth={2.25} />
      </div>

      <p className="font-bold text-grey-black/65 text-[12px] md:text-[14px] tracking-[2px] uppercase mb-2">
        Nagrada spremna
      </p>
      <h1 className="font-black text-[42px] md:text-[64px] text-grey-black leading-[0.95] tracking-[-1px] mb-3">
        {prompt.customerName}
        <span className="block text-hero-blue-dark italic">je Hero!</span>
      </h1>

      <StampGrid filled={prompt.stampsCount} total={prompt.stampsRequired} />

      <p className="font-medium text-grey-black/85 text-[15px] md:text-[17px] mb-7">
        Daj <span className="font-bold">besplatan Hero gyros</span> i potvrdi.
      </p>

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onConfirm}
          disabled={redeeming}
          className="bg-hero-blue-dark text-white font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 inline-flex items-center justify-center rounded-full shadow-hero-xs hover:bg-hero-blue transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {redeeming ? 'Šaljem…' : 'Daj nagradu 🎉'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={redeeming}
          className="bg-transparent text-grey-black font-bold text-[14px] h-[44px] px-8 inline-flex items-center justify-center rounded-full border border-grey-black/30 hover:bg-grey-black/5 transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Otkaži
        </button>
      </div>
    </div>
  </div>
);

interface StampGridProps {
  filled: number;
  total: number;
}

const StampGrid: React.FC<StampGridProps> = ({ filled, total }) => {
  const cells = Array.from({ length: total }, (_, i) => i < filled);
  // Wrap into rows of 5 for the typical "10 stamps" pattern; fall back to a single row.
  const rowSize = total % 5 === 0 ? 5 : Math.min(total, 5);
  return (
    <div className="my-6 inline-flex flex-col gap-2">
      {Array.from({ length: Math.ceil(total / rowSize) }, (_, rowIdx) => (
        <div key={rowIdx} className="flex justify-center gap-2">
          {cells.slice(rowIdx * rowSize, (rowIdx + 1) * rowSize).map((on, i) => (
            <span
              key={i}
              className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[11px] md:text-[12px] font-black ${
                on
                  ? 'bg-hero-blue-dark text-hero-yellow shadow-hero-xs'
                  : 'border-2 border-dashed border-grey-black/25 text-grey-black/30'
              }`}
              aria-hidden="true"
            >
              {on ? '★' : ''}
            </span>
          ))}
        </div>
      ))}
      <p className="font-bold text-grey-black/70 text-[12px] tracking-[1.5px] uppercase mt-1">
        {filled} / {total} pečata
      </p>
    </div>
  );
};

export default Scanner;
