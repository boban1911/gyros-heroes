import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import cityBg from '../assets/footer/footer-bg-new.svg';

interface CardState {
  customer: { id: string; name: string; email: string };
  card: {
    id: string;
    stampsCount: number;
    totalRedemptions: number;
    status: 'active' | 'ready_to_redeem';
    stampsRequired: number;
    rewardDescription: string;
  };
}

type FetchState =
  | { kind: 'loading' }
  | { kind: 'unauth' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; data: CardState };

const LoyaltyCard: React.FC = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<FetchState>({ kind: 'loading' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/me', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.status === 401) {
          setState({ kind: 'unauth' });
          return;
        }
        if (!res.ok) {
          setState({ kind: 'error', message: `HTTP ${res.status}` });
          return;
        }
        const data = (await res.json()) as CardState;
        setState({ kind: 'ready', data });
      } catch (err) {
        if (!cancelled) setState({ kind: 'error', message: (err as Error).message });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (state.kind === 'unauth') navigate('/loyalty', { replace: true });
  }, [state.kind, navigate]);

  return (
    <div className="relative min-h-screen bg-hero-blue overflow-x-clip">
      <Navbar />

      {/* City silhouette backdrop */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img
          src={cityBg}
          alt=""
          className="w-full h-full object-contain object-top opacity-20 md:opacity-30"
        />
      </div>

      <main className="relative z-10 px-5 pt-[100px] md:pt-[110px] pb-12 lg:pb-16">
        <div className="max-w-[760px] mx-auto">
          {state.kind === 'loading' && (
            <div className="h-[400px] flex items-center justify-center">
              <p className="font-montserrat text-white/80 text-lg">Učitavam karticu…</p>
            </div>
          )}

          {state.kind === 'error' && (
            <div className="bg-hero-green rounded-[40px] p-8 md:p-10">
              <p className="font-montserrat text-white text-center">
                Greška pri učitavanju kartice. ({state.message})
              </p>
            </div>
          )}

          {state.kind === 'ready' && <CardLayout data={state.data} />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const CardLayout: React.FC<{ data: CardState }> = ({ data }) => {
  const { customer, card } = data;
  const ready = card.status === 'ready_to_redeem';
  const firstName = customer.name.split(' ')[0];
  const remaining = card.stampsRequired - card.stampsCount;

  return (
    <div className="flex flex-col items-center text-center gap-6 md:gap-8">
      {/* Greeting */}
      <div>
        <h1 className="font-montserrat font-bold text-[32px] md:text-[44px] leading-[1.05] tracking-[-1px] md:tracking-[-1.5px] text-white">
          Zdravo, <span className="text-hero-yellow italic">{firstName}!</span>
        </h1>
        <p className="mt-2 font-montserrat font-medium text-white/85 text-[15px] md:text-[17px]">
          {ready ? (
            <>Tvoja <span className="text-hero-yellow font-bold">Hero kartica</span> je spremna — sledeća poseta = besplatan gyros 🎉</>
          ) : (
            <>Još <span className="text-hero-yellow font-bold">{remaining} {remaining === 1 ? 'pečat' : 'pečata'}</span> do nagrade.</>
          )}
        </p>
      </div>

      {/* Big card */}
      <ActiveCard card={card} ready={ready} />

      {/* Wallet CTA */}
      <WalletCta />

      {card.totalRedemptions > 0 && (
        <p className="font-montserrat text-white/70 text-sm">
          Iskorišćenih nagrada: <span className="font-bold text-hero-yellow">{card.totalRedemptions}</span> ⚡
        </p>
      )}
    </div>
  );
};

interface ActiveCardProps {
  card: CardState['card'];
  ready: boolean;
}

const ActiveCard: React.FC<ActiveCardProps> = ({ card, ready }) => (
  <div
    className={`w-full rounded-[32px] lg:rounded-[40px] p-6 md:p-8 shadow-hero-xs ${
      ready ? 'bg-hero-yellow' : 'bg-hero-green'
    }`}
  >
    {/* Top row: label + status */}
    <div className="flex items-baseline justify-between gap-3 mb-5 md:mb-6">
      <span
        className={`font-montserrat font-bold text-[12px] md:text-[13px] tracking-[1.5px] uppercase ${
          ready ? 'text-grey-black/70' : 'text-white/75'
        }`}
      >
        Hero kartica
      </span>
      {ready ? (
        <span className="bg-hero-blue-dark text-hero-yellow font-montserrat font-bold px-3 py-1 rounded-full text-[11px] md:text-[12px] tracking-wide shadow-hero-xs">
          🎉 SPREMNO
        </span>
      ) : (
        <span className={`font-montserrat font-black text-[18px] md:text-[22px] ${ready ? 'text-grey-black' : 'text-white'}`}>
          {card.stampsCount}
          <span className={ready ? 'text-grey-black/50' : 'text-white/55'}> / {card.stampsRequired}</span>
        </span>
      )}
    </div>

    {/* Stamp strip — 1×10 on desktop, 5×2 on mobile */}
    <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-3">
      {Array.from({ length: card.stampsRequired }).map((_, i) => {
        const filled = i < card.stampsCount;
        return (
          <div
            key={i}
            className={`aspect-square rounded-full flex items-center justify-center font-montserrat font-black text-[20px] md:text-[18px] ${
              filled
                ? ready
                  ? 'bg-hero-blue-dark text-hero-yellow shadow-hero-xs'
                  : 'bg-hero-yellow text-grey-black shadow-hero-xs'
                : ready
                  ? 'border-2 border-dashed border-grey-black/25 text-transparent'
                  : 'border-2 border-dashed border-white/35 text-transparent'
            }`}
            aria-label={filled ? 'Sakupljen pečat' : 'Prazan pečat'}
          >
            {filled ? '★' : '·'}
          </div>
        );
      })}
    </div>

    {/* Reward line */}
    <div className={`mt-5 md:mt-6 pt-5 md:pt-6 border-t ${ready ? 'border-grey-black/15' : 'border-white/20'}`}>
      <p
        className={`font-montserrat font-medium text-[14px] md:text-[15px] leading-[1.4] ${
          ready ? 'text-grey-black' : 'text-white/90'
        }`}
      >
        {ready ? (
          <><strong>{card.rewardDescription}</strong> — pokaži ovu karticu na kasi!</>
        ) : (
          <>Nagrada: <span className="font-bold text-hero-yellow">{card.rewardDescription}</span></>
        )}
      </p>
    </div>
  </div>
);

const WalletCta: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'loading' | 'error'>('idle');

  async function handleSave() {
    if (phase === 'loading') return;
    setPhase('loading');
    try {
      const res = await fetch('/api/wallet/google/save-url', { credentials: 'same-origin' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const body = (await res.json()) as { url: string };
      setPhase('idle');
      window.open(body.url, '_blank', 'noopener');
    } catch {
      setPhase('error');
    }
  }

  return (
    <div className="w-full bg-hero-blue-dark rounded-[24px] lg:rounded-[28px] px-5 md:px-6 py-4 flex items-center gap-4 shadow-hero-xs">
      <div className="flex-1 min-w-0 text-left">
        <p className="font-montserrat font-bold text-white text-[15px] md:text-[16px] leading-tight">Google Wallet</p>
        <p className="font-montserrat text-white/70 text-[12px] md:text-[13px] mt-0.5">
          {phase === 'error' ? 'Trenutno nedostupno. Pokušaj ponovo.' : 'Sačuvaj karticu u telefon'}
        </p>
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={phase === 'loading'}
        className="flex-shrink-0 bg-hero-yellow text-grey-black font-montserrat font-bold text-[13px] md:text-[14px] h-[40px] md:h-[44px] px-4 md:px-5 rounded-full shadow-hero-xs hover:bg-white transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {phase === 'loading' ? '…' : 'Sačuvaj'}
      </button>
    </div>
  );
};

export default LoyaltyCard;
