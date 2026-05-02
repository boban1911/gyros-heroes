import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; message: string };

const errorCopyByCode: Record<string, string> = {
  missing_token: 'Link nije važeći. Pokušaj ponovo.',
  invalid_or_expired: 'Link je istekao ili je već iskorišćen. Zatraži novi.',
};

const Loyalty: React.FC = () => {
  const [params] = useSearchParams();
  const initialError = params.get('error');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) return;
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, consent }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'unknown_error');
      }
      setState({ kind: 'success' });
    } catch (err) {
      setState({ kind: 'error', message: (err as Error).message });
    }
  }

  return (
    <div className="relative min-h-screen bg-hero-blue">
      <Navbar />
      <main className="px-5 pt-[120px] pb-[80px] flex justify-center">
        <section className="w-full max-w-[560px] bg-white rounded-[40px] p-8 md:p-12 shadow-hero-xs">
          <h1 className="font-montserrat font-bold text-[40px] md:text-[56px] leading-[1.05] text-hero-blue-dark">
            Postani <span className="italic text-hero-yellow">Hero</span>
          </h1>
          <p className="font-montserrat text-grey-black text-base md:text-lg mt-4 leading-relaxed">
            Registruj se i preuzmi Hero karticu u Google Wallet. Sakupljaj pečate i osvoji 10. gyros besplatno.
          </p>

          {initialError && state.kind === 'idle' && (
            <p className="mt-6 px-4 py-3 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
              {errorCopyByCode[initialError] ?? 'Došlo je do greške. Pokušaj ponovo.'}
            </p>
          )}

          {state.kind === 'success' ? (
            <div className="mt-8 px-5 py-6 rounded-3xl bg-hero-green/10 text-hero-blue-dark">
              <h2 className="font-montserrat font-bold text-2xl">Proveri inbox!</h2>
              <p className="mt-2 text-grey-black">
                Poslali smo ti link na <strong>{email}</strong>. Klikni na njega da aktiviraš karticu.
              </p>
              <p className="mt-2 text-sm text-grey-middle">Link važi 24 sata.</p>
            </div>
          ) : (
            <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit}>
              <label className="flex flex-col gap-2">
                <span className="font-montserrat font-semibold text-grey-black">Ime i prezime</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-[50px] rounded-full border border-grey-light px-5 font-inter text-grey-black focus:outline-none focus:shadow-hero-focus focus:border-hero-yellow transition-shadow duration-fast"
                  autoComplete="name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="font-montserrat font-semibold text-grey-black">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[50px] rounded-full border border-grey-light px-5 font-inter text-grey-black focus:outline-none focus:shadow-hero-focus focus:border-hero-yellow transition-shadow duration-fast"
                  autoComplete="email"
                />
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-5 h-5 accent-hero-yellow"
                />
                <span className="font-inter text-sm text-grey-black leading-relaxed">
                  Slažem se sa obradom mojih podataka u svrhu programa lojalnosti i prijema email obaveštenja.
                </span>
              </label>

              {state.kind === 'error' && (
                <p className="px-4 py-3 rounded-2xl bg-red-50 text-red-700 text-sm font-medium">
                  Nešto nije u redu. Pokušaj ponovo. ({state.message})
                </p>
              )}

              <button
                type="submit"
                disabled={state.kind === 'submitting' || !consent}
                className="bg-hero-yellow text-grey-black font-montserrat font-semibold text-base h-[60px] px-8 rounded-full shadow-hero-xs hover:bg-hero-blue-dark hover:text-white transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {state.kind === 'submitting' ? 'Šaljem…' : 'Pošalji link za aktivaciju'}
              </button>
            </form>
          )}
        </section>
      </main>
    </div>
  );
};

export default Loyalty;
