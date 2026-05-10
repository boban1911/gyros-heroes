import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanLine } from 'lucide-react';
import Logo from '../../components/Logo';
import cityBg from '../../assets/footer/footer-bg-new.svg';
import superheroTortilla from '../../assets/superhero-tortilla.svg';

interface LoginSuccess {
  ok: true;
  staff: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'staff';
  };
}

interface LoginFailure {
  error: string;
  details?: unknown;
}

function Login() {
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-focus the email field on mount so the staff can start typing immediately.
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Unesi email i lozinku.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });

      if (res.ok) {
        const _data = (await res.json()) as LoginSuccess;
        navigate('/scan/', { replace: true });
        return;
      }

      const data = (await res.json().catch(() => ({}) as LoginFailure)) as LoginFailure;
      if (res.status === 401 || data.error === 'invalid_credentials') {
        setErrorMessage('Pogrešan email ili lozinka.');
      } else if (data.error === 'invalid_input') {
        setErrorMessage('Proveri unete podatke.');
      } else {
        setErrorMessage('Greška pri prijavi. Pokušaj ponovo.');
      }
    } catch {
      setErrorMessage('Mreža nije dostupna. Pokušaj ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-hero-blue overflow-x-clip font-montserrat">
      {/* Minimal staff-flavored top bar — logo only, no marketing nav */}
      <nav className="sticky top-0 z-50 flex justify-center w-full px-[20px] pt-[10px]">
        <div className="bg-hero-blue-dark w-full max-w-[1400px] rounded-[30px] py-[10px] px-[20px] nav:px-[40px] flex items-center justify-between shadow-hero-xs border border-white/10">
          <a
            href="/"
            className="h-[40px] md:h-[60px] aspect-[355/60] relative shrink-0 cursor-pointer"
            aria-label="Gyros Heroes — početna"
          >
            <Logo className="w-full h-full" />
          </a>
          <span className="inline-flex items-center gap-1.5 bg-hero-yellow/15 text-hero-yellow border border-hero-yellow/40 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
            <ScanLine className="w-3 h-3" strokeWidth={2.5} />
            Skener
          </span>
        </div>
      </nav>

      {/* City silhouette backdrop — matches Loyalty / Admin */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img
          src={cityBg}
          alt=""
          className="w-full h-full object-contain object-top opacity-20 md:opacity-30"
        />
      </div>

      <main className="relative z-10 px-5 pt-[40px] md:pt-[60px] pb-12 lg:pb-16">
        <div className="max-w-[1100px] mx-auto px-[20px] nav:px-[60px] flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">

          {/* LEFT: Hero copy */}
          <div className="order-2 lg:order-1 w-full lg:flex-1 flex flex-col items-center lg:items-start text-center lg:text-left">
            <p className="font-bold text-hero-yellow text-[12px] md:text-[14px] tracking-[2px] uppercase mb-2">
              Za osoblje
            </p>
            <h1 className="font-bold text-[56px] md:text-[80px] xl:text-[96px] leading-[0.95] tracking-[-2px] md:tracking-[-3px] text-white">
              <span className="block">Hero</span>
              <span className="block text-hero-yellow italic">Skener</span>
            </h1>
            <p className="mt-5 max-w-[420px] font-medium text-white/90 text-[15px] md:text-[17px] leading-[1.45]">
              Prijavi se i počni da
              <span className="text-hero-yellow font-bold"> skeniraš </span>
              Hero kartice na kasi. Brzo, bezbedno, bez petljanja.
            </p>
          </div>

          {/* RIGHT: Login form on green panel — matches Loyalty register pattern */}
          <div className="order-1 lg:order-2 w-full lg:w-auto lg:flex-shrink-0 lg:max-w-[460px]">
            <div className="relative bg-hero-green rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[36px] shadow-hero-xs">
              <img
                src={superheroTortilla}
                alt=""
                aria-hidden="true"
                className="hidden md:block absolute -top-14 -right-6 w-[100px] h-auto drop-shadow-2xl pointer-events-none select-none"
                style={{ transform: 'rotate(15deg)' }}
              />

              <h2 className="font-black text-[24px] md:text-[28px] text-white leading-[1.05] mb-2">
                Prijavi se kao <span className="text-hero-yellow italic">Hero</span>
              </h2>
              <p className="text-white/85 text-[14px] mb-6">
                Email i lozinka koje ti je dao admin.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <label className="flex flex-col gap-2">
                  <span className="font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
                    Email
                  </span>
                  <input
                    ref={emailRef}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    disabled={submitting}
                    className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
                  />
                </label>

                <label className="flex flex-col gap-2">
                  <span className="font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
                    Lozinka
                  </span>
                  <input
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    disabled={submitting}
                    className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
                  />
                </label>

                {errorMessage ? (
                  <p
                    role="alert"
                    className="px-4 py-3 rounded-2xl bg-hero-blue-dark/60 border border-hero-yellow/40 text-hero-yellow text-[14px] font-medium text-center"
                  >
                    {errorMessage}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-2 bg-hero-yellow text-grey-black font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
                >
                  {submitting ? 'Prijavljujem…' : 'Prijavi se'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
