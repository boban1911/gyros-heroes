import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import superheroTortilla from '../assets/superhero-tortilla.svg';

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
    <div className="relative min-h-screen bg-hero-blue overflow-hidden">
      <Navbar />

      <main className="relative z-10 px-5 pt-[140px] md:pt-[180px] pb-[100px]">
        <div className="max-w-[900px] mx-auto">
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

          {state.kind === 'ready' && <CardView data={state.data} />}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const CardView: React.FC<{ data: CardState }> = ({ data }) => {
  const { customer, card } = data;
  const ready = card.status === 'ready_to_redeem';
  const firstName = customer.name.split(' ')[0];

  return (
    <>
      {/* Greeting headline */}
      <div className="text-center mb-10">
        <h1 className="font-montserrat font-bold text-[48px] md:text-[80px] xl:text-[96px] leading-[0.95] tracking-[-2px] md:tracking-[-4px] text-white">
          <span className="block">Zdravo,</span>
          <span className="block text-hero-yellow italic">{firstName}!</span>
        </h1>
        <p className="mt-4 font-montserrat font-medium text-white/90 text-[16px] md:text-[20px]">
          Tvoja Hero kartica je aktivna.
        </p>
      </div>

      {/* The loyalty card */}
      <div
        className={`relative rounded-[40px] lg:rounded-lg p-6 md:p-10 lg:p-[40px] overflow-hidden ${
          ready ? 'bg-hero-yellow' : 'bg-hero-green'
        }`}
      >
        {/* Decorative mascot in corner */}
        <div className="absolute -right-12 -bottom-16 w-[220px] md:w-[280px] opacity-30 pointer-events-none">
          <img
            src={superheroTortilla}
            alt=""
            className="w-full h-auto"
            style={{ transform: 'rotate(15deg)' }}
          />
        </div>

        <div className="relative z-10">
          <div className="flex items-baseline justify-between flex-wrap gap-4">
            <div>
              <p className={`font-montserrat font-bold text-sm tracking-widest uppercase ${ready ? 'text-grey-black/70' : 'text-white/70'}`}>
                Hero kartica
              </p>
              <p className={`font-montserrat font-black text-[64px] md:text-[88px] leading-none mt-2 ${ready ? 'text-grey-black' : 'text-white'}`}>
                {card.stampsCount}
                <span className={`text-[32px] md:text-[40px] font-bold ${ready ? 'text-grey-black/50' : 'text-white/50'}`}>
                  /{card.stampsRequired}
                </span>
              </p>
            </div>
            {ready && (
              <div className="bg-hero-blue-dark text-white font-montserrat font-bold px-5 py-2 rounded-full text-sm md:text-base shadow-hero-xs">
                🎉 SPREMNO!
              </div>
            )}
          </div>

          {/* Stamp grid */}
          <div className="mt-8 grid grid-cols-5 gap-3 md:gap-4 max-w-[480px]">
            {Array.from({ length: card.stampsRequired }).map((_, i) => {
              const filled = i < card.stampsCount;
              return (
                <div
                  key={i}
                  className={`aspect-square rounded-full flex items-center justify-center font-montserrat font-black text-xl md:text-2xl transition-colors duration-base ${
                    filled
                      ? ready
                        ? 'bg-hero-blue-dark text-hero-yellow'
                        : 'bg-hero-yellow text-grey-black'
                      : ready
                        ? 'bg-grey-black/10 border-2 border-grey-black/20 text-transparent'
                        : 'bg-white/10 border-2 border-white/30 text-transparent'
                  }`}
                  aria-label={filled ? 'Sakupljen pečat' : 'Prazan pečat'}
                >
                  {filled ? '★' : '·'}
                </div>
              );
            })}
          </div>

          {ready && (
            <p className="mt-8 font-montserrat font-bold text-grey-black text-[18px] md:text-[22px] leading-[1.3]">
              {card.rewardDescription} — pokaži ovu karticu na kasi!
            </p>
          )}

          {!ready && (
            <p className="mt-8 font-montserrat font-medium text-white/90 text-[15px] md:text-[17px] leading-[1.4]">
              Još {card.stampsRequired - card.stampsCount}{' '}
              {card.stampsRequired - card.stampsCount === 1 ? 'pečat' : 'pečata'} do nagrade:{' '}
              <span className="font-bold text-hero-yellow">{card.rewardDescription}</span>.
            </p>
          )}
        </div>
      </div>

      {/* Wallet CTA */}
      <div className="mt-8 bg-hero-blue-dark rounded-[40px] lg:rounded-lg p-6 md:p-8 text-center">
        <p className="font-montserrat font-bold text-white text-[18px] md:text-[20px] mb-2">
          Dodaj karticu u Google Wallet
        </p>
        <p className="font-montserrat text-white/70 text-sm mb-5">
          Sa karticom u telefonu ne moraš da pamtiš ništa — samo skeniraj na kasi.
        </p>
        <button
          type="button"
          disabled
          className="bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 rounded-full shadow-hero-xs disabled:opacity-60 disabled:cursor-not-allowed"
          title="Dostupno uskoro"
        >
          🔒 Uskoro dostupno
        </button>
      </div>

      {card.totalRedemptions > 0 && (
        <p className="mt-6 text-center font-montserrat text-white/70 text-sm">
          Do sada si iskoristio nagradu {card.totalRedemptions}{' '}
          {card.totalRedemptions === 1 ? 'put' : 'puta'}. Hero status: ⚡
        </p>
      )}
    </>
  );
};

export default LoyaltyCard;
