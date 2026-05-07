import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setErrorMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMessage('Unesite email i lozinku.');
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
        setErrorMessage('Proverite unete podatke.');
      } else {
        setErrorMessage('Greška pri prijavi. Pokušajte ponovo.');
      }
    } catch {
      setErrorMessage('Mreža nije dostupna. Pokušajte ponovo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-hero-blue-dark flex items-center justify-center px-6 py-10 font-montserrat">
      <div className="w-full max-w-md bg-hero-blue/40 border border-white/15 rounded-[40px] p-8 md:p-10 shadow-2xl backdrop-blur-md">
        <h1 className="text-white font-extrabold text-3xl md:text-4xl text-center mb-2">
          <span className="text-hero-yellow italic">Hero</span> Scanner
        </h1>
        <p className="text-white/80 text-center text-sm mb-8">
          Prijavi se da bi skenirao loyalty kartice.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
          <label className="flex flex-col gap-2">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">Email</span>
            <input
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={submitting}
              className="bg-white/95 text-grey-black rounded-full px-5 h-12 md:h-14 text-base outline-none focus:shadow-hero-focus transition-shadow duration-base"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-white text-sm font-semibold uppercase tracking-wider">Lozinka</span>
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={submitting}
              className="bg-white/95 text-grey-black rounded-full px-5 h-12 md:h-14 text-base outline-none focus:shadow-hero-focus transition-shadow duration-base"
            />
          </label>

          {errorMessage ? (
            <p
              role="alert"
              className="text-hero-yellow bg-hero-blue-dark/60 border border-hero-yellow/40 rounded-2xl px-4 py-3 text-sm text-center"
            >
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="bg-hero-yellow text-grey-black font-montserrat font-bold text-sm md:text-base h-12 md:h-14 px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white transition-colors duration-base uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Prijavljujem…' : 'Prijavi se'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default Login;
