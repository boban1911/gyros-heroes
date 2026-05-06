import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import cityBg from '../assets/footer/footer-bg-new.svg';
import superheroTortilla from '../assets/superhero-tortilla.svg';

type Mode = 'register' | 'login';

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
  const navigate = useNavigate();
  const initialError = params.get('error');

  const [sessionChecked, setSessionChecked] = useState(false);
  const [mode, setMode] = useState<Mode>('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  // Redirect already-logged-in users straight to their card.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/account/me', { credentials: 'same-origin' });
        if (cancelled) return;
        if (res.ok) {
          navigate('/loyalty/card', { replace: true });
          return;
        }
      } catch {
        // Treat network errors as not-logged-in; show the form.
      }
      if (!cancelled) setSessionChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  function switchMode(next: Mode) {
    setMode(next);
    setState({ kind: 'idle' });
  }

  async function onRegister(event: React.FormEvent<HTMLFormElement>) {
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

  async function onLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
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
    <div className="relative min-h-screen bg-hero-blue overflow-x-clip">
      <Navbar />

      {/* City silhouette backdrop — matches Footer rhythm */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img
          src={cityBg}
          alt=""
          className="w-full h-full object-contain object-top opacity-20 md:opacity-30"
        />
      </div>

      <main className="relative z-10 px-5 pt-[100px] md:pt-[110px] pb-12 lg:pb-16">
        {!sessionChecked ? (
          <div className="min-h-[60vh]" aria-hidden="true" />
        ) : (
        <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px] flex flex-col lg:flex-row gap-8 lg:gap-6 items-center">

          {/* LEFT: Headline + stamp card */}
          <div className="order-2 lg:order-1 w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1 className="font-montserrat font-bold text-[56px] md:text-[88px] xl:text-[110px] leading-[0.95] tracking-[-2px] md:tracking-[-4px] text-white">
              <span className="block">Postani</span>
              <span className="block text-hero-yellow italic">Hero</span>
            </h1>
            <p className="mt-5 max-w-[460px] font-montserrat font-medium text-white/90 text-[16px] md:text-[20px] leading-[1.4]">
              Sakupljaj pečate uz svaku porciju i osvoji
              <span className="text-hero-yellow font-bold"> 10. gyros besplatno</span>.
              Bez plastične kartice — pravo u tvoj Google Wallet.
            </p>

            <StampCardPreview />
          </div>

          {/* RIGHT: Form / Success card */}
          <div className="order-1 lg:order-2 w-full lg:w-auto lg:flex-shrink-0 lg:max-w-[520px]">
            <div className="relative bg-hero-green rounded-[40px] lg:rounded-lg p-6 md:p-8 lg:p-[36px] shadow-hero-xs">
              {initialError && state.kind === 'idle' && (
                <p className="mb-6 px-5 py-4 rounded-3xl bg-white/15 border border-white/30 text-white text-sm font-montserrat font-medium">
                  {errorCopyByCode[initialError] ?? 'Došlo je do greške. Pokušaj ponovo.'}
                </p>
              )}

              {state.kind === 'success' ? (
                <SuccessCard email={email} mode={mode} />
              ) : mode === 'register' ? (
                <RegisterForm
                  name={name}
                  email={email}
                  consent={consent}
                  state={state}
                  onName={setName}
                  onEmail={setEmail}
                  onConsent={setConsent}
                  onSubmit={onRegister}
                  onSwitchMode={() => switchMode('login')}
                />
              ) : (
                <LoginForm
                  email={email}
                  state={state}
                  onEmail={setEmail}
                  onSubmit={onLogin}
                  onSwitchMode={() => switchMode('register')}
                />
              )}
            </div>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

interface RegisterFormProps {
  name: string;
  email: string;
  consent: boolean;
  state: SubmitState;
  onName: (v: string) => void;
  onEmail: (v: string) => void;
  onConsent: (v: boolean) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSwitchMode: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  email,
  consent,
  state,
  onName,
  onEmail,
  onConsent,
  onSubmit,
  onSwitchMode,
}) => (
  <>
    <h2 className="font-montserrat font-black text-[24px] md:text-[28px] text-white leading-[1.05] mb-5">
      Aktiviraj svoju <span className="text-hero-yellow italic">Hero</span> karticu
    </h2>

    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field
        label="Ime i prezime"
        type="text"
        value={name}
        onChange={onName}
        required
        minLength={2}
        maxLength={80}
        autoComplete="name"
      />

      <Field
        label="Email"
        type="email"
        value={email}
        onChange={onEmail}
        required
        autoComplete="email"
      />

      <label className="flex items-start gap-3 cursor-pointer mt-1">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => onConsent(e.target.checked)}
          className="mt-1 w-5 h-5 accent-hero-yellow flex-shrink-0"
        />
        <span className="font-montserrat text-sm text-white/90 leading-[1.5]">
          Slažem se sa obradom mojih podataka u svrhu programa lojalnosti
          i prijema email obaveštenja od Gyros Heroes.
        </span>
      </label>

      {state.kind === 'error' && <ErrorBanner message={state.message} />}

      <button
        type="submit"
        disabled={state.kind === 'submitting' || !consent}
        className="mt-2 bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
      >
        {state.kind === 'submitting' ? 'Šaljem…' : 'Pošalji aktivacioni link'}
      </button>
    </form>

    <p className="mt-5 text-center font-montserrat text-sm text-white/85">
      Već si Hero?{' '}
      <button
        type="button"
        onClick={onSwitchMode}
        className="font-bold text-hero-yellow hover:text-white transition-colors underline-offset-2 hover:underline"
      >
        Prijavi se →
      </button>
    </p>
  </>
);

interface LoginFormProps {
  email: string;
  state: SubmitState;
  onEmail: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onSwitchMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ email, state, onEmail, onSubmit, onSwitchMode }) => (
  <>
    <h2 className="font-montserrat font-black text-[24px] md:text-[28px] text-white leading-[1.05] mb-2">
      Prijavi se na svoju <span className="text-hero-yellow italic">Hero</span> karticu
    </h2>
    <p className="font-montserrat text-white/85 text-[14px] mb-5">
      Pošaljemo ti link za prijavu na email — bez lozinke.
    </p>

    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <Field
        label="Email"
        type="email"
        value={email}
        onChange={onEmail}
        required
        autoComplete="email"
      />

      {state.kind === 'error' && <ErrorBanner message={state.message} />}

      <button
        type="submit"
        disabled={state.kind === 'submitting'}
        className="mt-2 bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
      >
        {state.kind === 'submitting' ? 'Šaljem…' : 'Pošalji link za prijavu'}
      </button>
    </form>

    <p className="mt-5 text-center font-montserrat text-sm text-white/85">
      Nemaš nalog?{' '}
      <button
        type="button"
        onClick={onSwitchMode}
        className="font-bold text-hero-yellow hover:text-white transition-colors underline-offset-2 hover:underline"
      >
        Registruj se →
      </button>
    </p>
  </>
);

const ErrorBanner: React.FC<{ message: string }> = ({ message }) => (
  <p className="px-4 py-3 rounded-2xl bg-red-500/20 border border-red-300/40 text-white text-sm font-montserrat font-medium">
    Nešto nije u redu. Pokušaj ponovo.
    <span className="block mt-1 text-xs opacity-70 font-normal">({message})</span>
  </p>
);

const StampCardPreview: React.FC = () => (
  <div className="mt-8 w-full max-w-[460px] bg-white/95 rounded-[28px] px-5 py-5 shadow-hero-xs">
    <div className="flex items-center justify-between mb-3">
      <span className="font-montserrat font-bold text-[12px] tracking-[1.5px] uppercase text-grey-black">
        Hero kartica
      </span>
      <span className="font-montserrat font-bold text-[11px] tracking-wide text-hero-blue-dark">
        0 / 10
      </span>
    </div>
    <div className="grid grid-cols-5 gap-2">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="aspect-square rounded-full border-2 border-dashed border-grey-black/25 flex items-center justify-center font-montserrat font-bold text-[13px] text-grey-black/35"
        >
          {i + 1}
        </div>
      ))}
      <div className="aspect-square rounded-full bg-hero-yellow flex items-center justify-center shadow-hero-xs">
        <span className="font-montserrat font-black text-[15px] text-grey-black leading-none">10</span>
      </div>
    </div>
    <p className="mt-3 font-montserrat text-[13px] text-grey-black/75 text-center">
      10. gyros — <span className="font-bold text-hero-blue-dark">besplatno</span>
    </p>
  </div>
);

interface SuccessCardProps {
  email: string;
  mode: Mode;
}

const SuccessCard: React.FC<SuccessCardProps> = ({ email, mode }) => (
  <div className="relative">
    {/* Floating mascot */}
    <img
      src={superheroTortilla}
      alt=""
      aria-hidden="true"
      className="hidden md:block absolute -top-16 -right-6 w-[120px] h-auto drop-shadow-2xl pointer-events-none select-none"
      style={{ transform: 'rotate(15deg)' }}
    />

    <div className="text-center pt-2 pb-2">
      {/* Icon with yellow halo */}
      <div className="relative mx-auto mb-5 w-[88px] h-[88px] flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-hero-yellow shadow-hero-xs" />
        <Mail className="relative w-12 h-12 text-grey-black" strokeWidth={2.25} />
      </div>

      <h2 className="font-montserrat font-black text-[36px] md:text-[44px] text-white leading-[1.05]">
        Proveri <span className="text-hero-yellow italic">inbox</span>!
      </h2>

      <p className="mt-3 font-montserrat text-grey-black text-[16px] leading-[1.45]">
        {mode === 'register' ? 'Poslali smo aktivacioni link na' : 'Poslali smo link za prijavu na'}
        <br />
        <span className="font-bold text-grey-black">{email}</span>
      </p>

      {mode === 'register' ? (
        <ol className="mt-6 flex flex-col gap-3 text-left max-w-[360px] mx-auto">
          <Step n={1}>Klikni link u inboxu</Step>
          <Step n={2}>Dodaj karticu u Google Wallet</Step>
          <Step n={3}>Pokaži pri svakoj narudžbini</Step>
        </ol>
      ) : (
        <p className="mt-5 font-montserrat text-grey-black text-[15px]">
          Klikni link iz emaila i kartica je tvoja.
        </p>
      )}

      <p className="mt-6 font-montserrat text-grey-black/70 text-[13px]">
        Link važi 24 sata.
      </p>
    </div>
  </div>
);

interface StepProps {
  n: number;
  children: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ n, children }) => (
  <li className="flex items-center gap-3">
    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-hero-yellow flex items-center justify-center font-montserrat font-black text-[15px] text-grey-black shadow-hero-xs">
      {n}
    </span>
    <span className="font-montserrat font-medium text-grey-black text-[15px] leading-[1.3]">
      {children}
    </span>
  </li>
);

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
