import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import superheroTortilla from '../assets/superhero-tortilla.svg';

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
    <div className="relative min-h-screen bg-hero-blue overflow-hidden">
      <Navbar />

      <main className="relative z-10 px-5 pt-[100px] md:pt-[110px] pb-12 lg:pb-16">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

          {/* LEFT: Headline + mascot */}
          <div className="order-2 lg:order-1 w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left lg:pr-4 relative">
            <h1 className="font-montserrat font-bold text-[56px] md:text-[88px] xl:text-[110px] leading-[0.95] tracking-[-2px] md:tracking-[-4px] text-white">
              <span className="block">Postani</span>
              <span className="block text-hero-yellow italic">Hero</span>
            </h1>
            <p className="mt-5 max-w-[480px] font-montserrat font-medium text-white/90 text-[16px] md:text-[20px] leading-[1.4]">
              Sakupljaj pečate uz svaku porciju i osvoji
              <span className="text-hero-yellow font-bold"> 10. gyros besplatno</span>.
              Bez plastične kartice — pravo u tvoj Google Wallet.
            </p>

            <div className="hidden lg:block absolute -bottom-12 -left-6 w-[220px] xl:w-[280px] pointer-events-none">
              <img
                src={superheroTortilla}
                alt="Gyros Heroes mascot"
                className="w-full h-auto drop-shadow-2xl"
                style={{ transform: 'rotate(-8deg)' }}
              />
            </div>
          </div>

          {/* RIGHT: Form card */}
          <div className="order-1 lg:order-2 w-full lg:flex-1 lg:max-w-[560px]">
            <div className="bg-hero-green rounded-[40px] lg:rounded-lg p-6 md:p-8 lg:p-[36px] shadow-hero-xs">
              {initialError && state.kind === 'idle' && (
                <p className="mb-6 px-5 py-4 rounded-3xl bg-white/15 border border-white/30 text-white text-sm font-montserrat font-medium">
                  {errorCopyByCode[initialError] ?? 'Došlo je do greške. Pokušaj ponovo.'}
                </p>
              )}

              {state.kind === 'success' ? (
                <div className="text-center py-8">
                  <div className="text-[64px] mb-4">✉️</div>
                  <h2 className="font-montserrat font-black text-[36px] md:text-[44px] text-white leading-[1.05]">
                    Proveri inbox!
                  </h2>
                  <p className="mt-4 font-montserrat text-white/95 text-[17px] leading-[1.5]">
                    Poslali smo aktivacioni link na
                    <br />
                    <span className="font-bold text-hero-blue-dark bg-white/20 px-3 py-1 rounded-full inline-block mt-2">
                      {email}
                    </span>
                  </p>
                  <p className="mt-6 font-montserrat text-white/70 text-sm">
                    Link važi 24 sata.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="font-montserrat font-black text-[24px] md:text-[28px] text-white leading-[1.05] mb-5">
                    Aktiviraj svoju Hero karticu
                  </h2>

                  <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                    <Field
                      label="Ime i prezime"
                      type="text"
                      value={name}
                      onChange={setName}
                      required
                      minLength={2}
                      maxLength={80}
                      autoComplete="name"
                    />

                    <Field
                      label="Email"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      required
                      autoComplete="email"
                    />

                    <label className="flex items-start gap-3 cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        required
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                        className="mt-1 w-5 h-5 accent-hero-yellow flex-shrink-0"
                      />
                      <span className="font-montserrat text-sm text-white/90 leading-[1.5]">
                        Slažem se sa obradom mojih podataka u svrhu programa lojalnosti
                        i prijema email obaveštenja od Gyros Heroes.
                      </span>
                    </label>

                    {state.kind === 'error' && (
                      <p className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-300/40 text-white text-sm font-montserrat font-medium">
                        Nešto nije u redu. Pokušaj ponovo.
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={state.kind === 'submitting' || !consent}
                      className="mt-2 bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
                    >
                      {state.kind === 'submitting' ? 'Šaljem…' : 'Pošalji aktivacioni link'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

interface FieldProps {
  label: string;
  type: 'text' | 'email';
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  autoComplete?: string;
}

const Field: React.FC<FieldProps> = ({ label, type, value, onChange, required, minLength, maxLength, autoComplete }) => (
  <label className="flex flex-col gap-2">
    <span className="font-montserrat font-semibold text-white text-[14px] tracking-wide">{label}</span>
    <input
      type={type}
      required={required}
      minLength={minLength}
      maxLength={maxLength}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoComplete={autoComplete}
      className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black placeholder:text-grey-middle border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast"
    />
  </label>
);

export default Loyalty;
