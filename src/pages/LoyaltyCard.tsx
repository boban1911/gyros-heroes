import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

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
    <div className="relative min-h-screen bg-hero-blue">
      <Navbar />
      <main className="px-5 pt-[120px] pb-[80px] flex justify-center">
        <section className="w-full max-w-[560px] bg-white rounded-[40px] p-8 md:p-12 shadow-hero-xs">
          {state.kind === 'loading' && (
            <div className="h-[300px] flex items-center justify-center">
              <p className="font-montserrat text-grey-middle">Učitavam…</p>
            </div>
          )}

          {state.kind === 'error' && (
            <p className="px-4 py-3 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
              Greška pri učitavanju kartice. ({state.message})
            </p>
          )}

          {state.kind === 'ready' && <CardView data={state.data} />}
        </section>
      </main>
    </div>
  );
};

const CardView: React.FC<{ data: CardState }> = ({ data }) => {
  const { customer, card } = data;
  const ready = card.status === 'ready_to_redeem';

  return (
    <>
      <h1 className="font-montserrat font-bold text-[36px] md:text-[48px] leading-[1.05] text-hero-blue-dark">
        Zdravo, <span className="italic text-hero-yellow">{customer.name.split(' ')[0]}</span>!
      </h1>
      <p className="font-montserrat text-grey-black mt-3">
        Tvoja Hero kartica je aktivna.
      </p>

      <div
        className={`mt-8 rounded-[32px] p-6 md:p-8 ${ready ? 'bg-hero-green text-white' : 'bg-hero-blue-dark text-white'}`}
      >
        <p className="font-montserrat text-sm opacity-80">Pečati</p>
        <p className="font-montserrat font-bold text-5xl md:text-6xl mt-1">
          {card.stampsCount} <span className="text-2xl opacity-60">/ {card.stampsRequired}</span>
        </p>

        <div className="mt-6 grid grid-cols-5 gap-2">
          {Array.from({ length: card.stampsRequired }).map((_, i) => (
            <div
              key={i}
              className={`aspect-square rounded-full border-2 ${
                i < card.stampsCount
                  ? 'bg-hero-yellow border-hero-yellow'
                  : 'border-white/40 bg-transparent'
              }`}
              aria-label={i < card.stampsCount ? 'Sakupljen pečat' : 'Prazan pečat'}
            />
          ))}
        </div>

        {ready && (
          <p className="mt-6 font-montserrat font-semibold text-lg">
            🎉 {card.rewardDescription} — pokaži ovu karticu na kasi!
          </p>
        )}
      </div>

      <div className="mt-8">
        <button
          type="button"
          disabled
          className="w-full bg-hero-yellow text-grey-black font-montserrat font-semibold text-base h-[60px] px-8 rounded-full shadow-hero-xs disabled:opacity-50 disabled:cursor-not-allowed"
          title="Dostupno uskoro"
        >
          Dodaj u Google Wallet (uskoro)
        </button>
        <p className="mt-3 text-sm text-grey-middle text-center">
          Integracija sa Google Wallet biće dostupna u sledećoj fazi.
        </p>
      </div>
    </>
  );
};

export default LoyaltyCard;
