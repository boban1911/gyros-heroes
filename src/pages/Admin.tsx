import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, ScanLine, ShieldOff } from 'lucide-react';
import Footer from '../components/Footer';
import Logo from '../components/Logo';
import cityBg from '../assets/footer/footer-bg-new.svg';
import superheroTortilla from '../assets/superhero-tortilla.svg';

const TOAST_DURATION_MS = 2400;

type StaffRole = 'admin' | 'staff';

interface StaffPrincipal {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

interface LoyaltyConfigRow {
  id: number;
  stampsRequired: number;
  rewardDescription: string;
  scanCooldownSeconds: number;
  qrTokenTtlSeconds: number;
  updatedAt: string;
}

interface StaffRow {
  id: string;
  email: string;
  name: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
}

type ToastTone = 'success' | 'warning' | 'error';

interface ToastState {
  message: string;
  tone: ToastTone;
}

type SessionStatus = 'loading' | 'admin' | 'forbidden' | 'anonymous';

function classNamesForToast(tone: ToastTone): string {
  switch (tone) {
    case 'success':
      return 'bg-hero-green text-white border-white/40';
    case 'warning':
      return 'bg-hero-yellow text-grey-black border-white/50';
    case 'error':
      return 'bg-hero-blue-dark text-white border-hero-yellow/60';
    default:
      return 'bg-hero-blue-dark text-white border-white/30';
  }
}

function AdminTopBar() {
  return (
    <nav className="sticky top-0 z-50 flex justify-center w-full px-[20px] pt-[10px]">
      <div className="bg-hero-blue-dark w-full max-w-[1400px] rounded-[30px] py-[10px] px-[20px] nav:px-[40px] flex items-center justify-between shadow-hero-xs border border-white/10">
        <Link
          to="/admin"
          className="h-[40px] md:h-[60px] aspect-[355/60] relative shrink-0 cursor-pointer"
          aria-label="Admin početna"
        >
          <Logo className="w-full h-full" />
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden md:inline-flex items-center gap-1.5 bg-hero-yellow/15 text-hero-yellow border border-hero-yellow/40 rounded-full px-3 py-1 text-[11px] font-montserrat font-bold uppercase tracking-widest">
            <Crown className="w-3 h-3" strokeWidth={2.5} />
            Admin
          </span>
          <a
            href="/scan/"
            className="bg-hero-yellow text-grey-black font-montserrat font-bold text-[12px] md:text-[14px] h-[40px] md:h-[44px] px-4 md:px-5 inline-flex items-center justify-center gap-2 rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4" strokeWidth={2.5} />
            Skener
          </a>
        </div>
      </div>
    </nav>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-hero-blue overflow-x-clip">
      <AdminTopBar />
      {/* City silhouette backdrop — matches Loyalty / LoyaltyCard */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] sm:w-[150%] md:w-full max-w-[1820px] aspect-[1820/1228] z-0 pointer-events-none">
        <img
          src={cityBg}
          alt=""
          className="w-full h-full object-contain object-top opacity-20 md:opacity-30"
        />
      </div>
      <main className="relative z-10 px-5 pt-[40px] md:pt-[60px] pb-12 lg:pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
}

function FullScreenLoader() {
  return (
    <PageShell>
      <div className="min-h-[60vh]" aria-hidden="true" />
    </PageShell>
  );
}

function NoAccess({ onLogout, loggingOut }: { onLogout: () => void; loggingOut: boolean }) {
  return (
    <PageShell>
      <div className="max-w-[640px] mx-auto">
        <div className="relative bg-hero-green rounded-[40px] p-8 md:p-12 shadow-hero-xs text-center">
          <img
            src={superheroTortilla}
            alt=""
            aria-hidden="true"
            className="hidden md:block absolute -top-20 -right-8 w-[140px] h-auto drop-shadow-2xl pointer-events-none select-none"
            style={{ transform: 'rotate(15deg)' }}
          />
          <div className="relative mx-auto mb-6 w-[88px] h-[88px] flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-hero-yellow shadow-hero-xs" />
            <ShieldOff className="relative w-12 h-12 text-grey-black" strokeWidth={2.25} />
          </div>
          <h1 className="font-montserrat font-black text-[40px] md:text-[56px] text-white leading-[1.0] mb-3 tracking-[-1px]">
            Nemaš <span className="text-hero-yellow italic">pristup</span>
          </h1>
          <p className="font-montserrat text-white/90 text-[15px] md:text-[17px] leading-[1.5] mb-8 max-w-[420px] mx-auto">
            Komandni centar je dostupan samo administratorima Gyros Heroes tima.
          </p>
          <button
            type="button"
            onClick={onLogout}
            disabled={loggingOut}
            className="bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 inline-flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loggingOut ? 'Izlazim…' : 'Odjavi se'}
          </button>
        </div>
      </div>
    </PageShell>
  );
}

interface ConfigSectionProps {
  config: LoyaltyConfigRow;
  onSaved: (next: LoyaltyConfigRow) => void;
  showToast: (toast: ToastState) => void;
}

function ConfigSection({ config, onSaved, showToast }: ConfigSectionProps) {
  const [stampsRequired, setStampsRequired] = useState(String(config.stampsRequired));
  const [rewardDescription, setRewardDescription] = useState(config.rewardDescription);
  const [scanCooldownSeconds, setScanCooldownSeconds] = useState(String(config.scanCooldownSeconds));
  const [qrTokenTtlSeconds, setQrTokenTtlSeconds] = useState(String(config.qrTokenTtlSeconds));
  const [saving, setSaving] = useState(false);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (saving) return;

      const sr = Number.parseInt(stampsRequired, 10);
      const cd = Number.parseInt(scanCooldownSeconds, 10);
      const ttl = Number.parseInt(qrTokenTtlSeconds, 10);
      const desc = rewardDescription.trim();
      if (!Number.isFinite(sr) || sr < 1 || sr > 100) {
        showToast({ tone: 'error', message: 'Broj pečata mora biti između 1 i 100.' });
        return;
      }
      if (!Number.isFinite(cd) || cd < 0 || cd > 86_400) {
        showToast({ tone: 'error', message: 'Cooldown mora biti između 0 i 86400.' });
        return;
      }
      if (!Number.isFinite(ttl) || ttl < 10 || ttl > 3600) {
        showToast({ tone: 'error', message: 'QR TTL mora biti između 10 i 3600.' });
        return;
      }
      if (!desc) {
        showToast({ tone: 'error', message: 'Opis nagrade ne sme biti prazan.' });
        return;
      }

      setSaving(true);
      try {
        const res = await fetch('/api/admin/config', {
          method: 'PUT',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            stampsRequired: sr,
            rewardDescription: desc,
            scanCooldownSeconds: cd,
            qrTokenTtlSeconds: ttl,
          }),
        });
        if (res.ok) {
          const next = (await res.json()) as LoyaltyConfigRow;
          onSaved(next);
          showToast({ tone: 'success', message: 'Konfiguracija sačuvana.' });
        } else {
          showToast({ tone: 'error', message: 'Greška pri čuvanju konfiguracije.' });
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        setSaving(false);
      }
    },
    [
      saving,
      stampsRequired,
      scanCooldownSeconds,
      qrTokenTtlSeconds,
      rewardDescription,
      onSaved,
      showToast,
    ],
  );

  return (
    <section className="relative bg-hero-green rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[40px] shadow-hero-xs">
      <h2 className="font-montserrat font-black text-[26px] md:text-[34px] text-white leading-[1.05] mb-2">
        Pravila <span className="text-hero-yellow italic">Hero</span> programa
      </h2>
      <p className="font-montserrat text-white/85 text-[14px] md:text-[15px] mb-6">
        Sve promene odmah utiču na sve aktivne kartice — pažljivo.
      </p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
        <NumberField
          label="Pečata za nagradu"
          hint="1 – 100"
          value={stampsRequired}
          onChange={setStampsRequired}
          min={1}
          max={100}
          disabled={saving}
        />
        <TextField
          label="Opis nagrade"
          value={rewardDescription}
          onChange={setRewardDescription}
          maxLength={200}
          disabled={saving}
        />
        <NumberField
          label="Cooldown"
          hint="sekunde · 0 – 86400"
          value={scanCooldownSeconds}
          onChange={setScanCooldownSeconds}
          min={0}
          max={86400}
          disabled={saving}
        />
        <NumberField
          label="QR TTL"
          hint="sekunde · 10 – 3600"
          value={qrTokenTtlSeconds}
          onChange={setQrTokenTtlSeconds}
          min={10}
          max={3600}
          disabled={saving}
        />

        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 inline-flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
          >
            {saving ? 'Čuvam…' : 'Sačuvaj pravila'}
          </button>
        </div>
      </form>
    </section>
  );
}

interface NumberFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, hint, value, onChange, min, max, disabled }) => (
  <label className="flex flex-col gap-2">
    <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide flex items-center gap-2">
      {label}
      {hint && <span className="font-normal text-white/55 text-[11px] md:text-[12px]">· {hint}</span>}
    </span>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
    />
  </label>
);

interface TextFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  disabled?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ label, value, onChange, maxLength, disabled }) => (
  <label className="flex flex-col gap-2">
    <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
      {label}
    </span>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      disabled={disabled}
      className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
    />
  </label>
);

interface StaffSectionProps {
  staff: StaffRow[];
  meId: string;
  onChanged: (next: StaffRow[]) => void;
  showToast: (toast: ToastState) => void;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function StaffSection({ staff, meId, onChanged, showToast }: StaffSectionProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('staff');
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const toggleActive = useCallback(
    async (row: StaffRow) => {
      if (togglingId) return;
      setTogglingId(row.id);
      try {
        const res = await fetch('/api/admin/staff', {
          method: 'PATCH',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ id: row.id, isActive: !row.isActive }),
        });
        if (res.ok) {
          const updated = (await res.json()) as StaffRow;
          onChanged(staff.map((s) => (s.id === updated.id ? updated : s)));
          showToast({
            tone: 'success',
            message: updated.isActive ? 'Korisnik aktiviran.' : 'Korisnik deaktiviran.',
          });
        } else {
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (data.error === 'cannot_deactivate_self') {
            showToast({ tone: 'warning', message: 'Ne možeš deaktivirati sopstveni nalog.' });
          } else {
            showToast({ tone: 'error', message: 'Greška pri promeni statusa.' });
          }
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        setTogglingId(null);
      }
    },
    [togglingId, staff, onChanged, showToast],
  );

  const handleCreate = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (creating) return;
      const trimmedEmail = email.trim();
      const trimmedName = name.trim();
      if (!trimmedEmail || !trimmedName || password.length < 8) {
        showToast({
          tone: 'error',
          message: 'Email, ime i lozinka (min. 8 karaktera) su obavezni.',
        });
        return;
      }
      setCreating(true);
      try {
        const res = await fetch('/api/admin/staff', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, name: trimmedName, password, role }),
        });
        if (res.ok) {
          const created = (await res.json()) as StaffRow;
          onChanged([created, ...staff]);
          setEmail('');
          setName('');
          setPassword('');
          setRole('staff');
          showToast({ tone: 'success', message: 'Korisnik dodat.' });
        } else if (res.status === 409) {
          showToast({ tone: 'warning', message: 'Email je već u upotrebi.' });
        } else {
          showToast({ tone: 'error', message: 'Greška pri dodavanju korisnika.' });
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        setCreating(false);
      }
    },
    [creating, email, name, password, role, staff, onChanged, showToast],
  );

  return (
    <section className="bg-white/95 rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[40px] shadow-hero-xs">
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-3">
        <h2 className="font-montserrat font-black text-[26px] md:text-[34px] text-grey-black leading-[1.05]">
          <span className="text-hero-blue-dark italic">Hero</span> tim
        </h2>
        <span className="font-montserrat font-bold text-[12px] tracking-[1.5px] uppercase text-grey-black/60">
          {staff.length} {staff.length === 1 ? 'član' : 'člana'}
        </span>
      </div>
      <p className="font-montserrat text-grey-black/70 text-[14px] md:text-[15px] mb-6">
        Dodaj kolege, podeli admin prava, isključi privremene radnike.
      </p>

      {/* Mobile cards / Desktop table */}
      <ul className="flex flex-col gap-3 md:hidden">
        {staff.map((row) => {
          const isSelf = row.id === meId;
          return (
            <li
              key={row.id}
              className="bg-grey-light/30 rounded-[24px] p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={row.name} role={row.role} />
                <div className="flex-1 min-w-0">
                  <p className="font-montserrat font-bold text-grey-black truncate">
                    {row.name}
                    {isSelf && (
                      <span className="ml-2 text-[10px] text-hero-blue-dark uppercase tracking-widest">
                        Ti
                      </span>
                    )}
                  </p>
                  <p className="font-montserrat text-grey-black/65 text-[13px] truncate">
                    {row.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 pt-1 border-t border-grey-black/5">
                <div className="flex items-center gap-2 min-w-0">
                  <RolePill role={row.role} />
                  <span className="font-montserrat text-grey-black/45 text-[11px] truncate">
                    od {formatDate(row.createdAt)}
                  </span>
                </div>
                <StatusPill
                  row={row}
                  isSelf={isSelf}
                  pending={togglingId === row.id}
                  onToggle={() => toggleActive(row)}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden md:block overflow-x-auto -mx-2">
        <table className="w-full text-left">
          <thead>
            <tr className="font-montserrat font-bold text-[11px] tracking-[1.5px] uppercase text-grey-black/55 border-b border-grey-black/10">
              <th className="py-3 px-2">Član</th>
              <th className="py-3 px-2">Uloga</th>
              <th className="py-3 px-2">Pridružen</th>
              <th className="py-3 px-2 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-montserrat text-grey-black">
            {staff.map((row) => {
              const isSelf = row.id === meId;
              return (
                <tr key={row.id} className="border-b border-grey-black/5 hover:bg-grey-light/20 transition-colors duration-fast">
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-3">
                      <Avatar name={row.name} role={row.role} />
                      <div className="min-w-0">
                        <p className="font-bold truncate">
                          {row.name}
                          {isSelf && (
                            <span className="ml-2 text-[10px] text-hero-blue-dark uppercase tracking-widest">Ti</span>
                          )}
                        </p>
                        <p className="text-grey-black/60 text-[13px] truncate">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <RolePill role={row.role} />
                  </td>
                  <td className="py-3 px-2 text-grey-black/60 text-[13px]">
                    {formatDate(row.createdAt)}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <StatusPill
                      row={row}
                      isSelf={isSelf}
                      pending={togglingId === row.id}
                      onToggle={() => toggleActive(row)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add user — distinct visual block within the white card */}
      <form
        onSubmit={handleCreate}
        className="mt-8 bg-hero-blue-dark rounded-[28px] p-5 md:p-6 lg:p-7 grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="md:col-span-2 flex items-baseline justify-between">
          <h3 className="font-montserrat font-black text-white text-[18px] md:text-[20px] tracking-wide">
            Dodaj novog <span className="text-hero-yellow italic">Heroja</span>
          </h3>
        </div>
        <DarkField
          label="Ime i prezime"
          type="text"
          value={name}
          onChange={setName}
          maxLength={120}
          disabled={creating}
          autoComplete="off"
        />
        <DarkField
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          disabled={creating}
          autoComplete="off"
        />
        <DarkField
          label="Lozinka"
          type="password"
          value={password}
          onChange={setPassword}
          minLength={8}
          disabled={creating}
          autoComplete="new-password"
        />
        <label className="flex flex-col gap-2">
          <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
            Uloga
          </span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value === 'admin' ? 'admin' : 'staff')}
            disabled={creating}
            className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast appearance-none disabled:opacity-70"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%23212121'%3E%3Cpath fill-rule='evenodd' d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z' clip-rule='evenodd' /%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1.25rem center',
              backgroundSize: '1.25rem',
            }}
          >
            <option value="staff">Osoblje</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <div className="md:col-span-2 flex justify-end pt-1">
          <button
            type="submit"
            disabled={creating}
            className="bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 inline-flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
          >
            {creating ? 'Dodajem…' : 'Dodaj Heroja'}
          </button>
        </div>
      </form>
    </section>
  );
}

interface DarkFieldProps {
  label: string;
  type: 'text' | 'email' | 'password';
  value: string;
  onChange: (v: string) => void;
  maxLength?: number;
  minLength?: number;
  disabled?: boolean;
  autoComplete?: string;
}

const DarkField: React.FC<DarkFieldProps> = ({
  label,
  type,
  value,
  onChange,
  maxLength,
  minLength,
  disabled,
  autoComplete,
}) => (
  <label className="flex flex-col gap-2">
    <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      minLength={minLength}
      disabled={disabled}
      autoComplete={autoComplete}
      className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
    />
  </label>
);

const Avatar: React.FC<{ name: string; role: StaffRole }> = ({ name, role }) => (
  <div
    className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-montserrat font-black text-[14px] shadow-hero-xs ${
      role === 'admin' ? 'bg-hero-yellow text-grey-black' : 'bg-hero-blue-dark text-white'
    }`}
    aria-hidden="true"
  >
    {initialsOf(name)}
  </div>
);

const RolePill: React.FC<{ role: StaffRole }> = ({ role }) => {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1.5 bg-hero-yellow/15 text-hero-yellow-dark border border-hero-yellow/40 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
        <Crown className="w-3 h-3" strokeWidth={2.5} />
        Admin
      </span>
    );
  }
  return (
    <span className="inline-flex items-center bg-grey-light/40 text-grey-black/70 border border-grey-black/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
      Osoblje
    </span>
  );
};

interface StatusPillProps {
  row: StaffRow;
  isSelf: boolean;
  pending: boolean;
  onToggle: () => void;
}

const StatusPill: React.FC<StatusPillProps> = ({ row, isSelf, pending, onToggle }) => {
  const disabled = isSelf || pending;
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      title={isSelf ? 'Ne možeš menjati sopstveni status' : undefined}
      className={`inline-flex items-center gap-2 rounded-full px-4 h-9 text-[12px] font-bold uppercase tracking-widest transition-all duration-base disabled:cursor-not-allowed ${
        row.isActive
          ? 'bg-hero-green text-white hover:bg-hero-green/85 disabled:opacity-60'
          : 'bg-grey-light/50 text-grey-black/70 border border-grey-black/15 hover:bg-grey-light disabled:opacity-60'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${row.isActive ? 'bg-white' : 'bg-grey-black/40'}`}
        aria-hidden="true"
      />
      {row.isActive ? 'Aktivan' : 'Pauziran'}
    </button>
  );
};

function formatRelative(iso: string): string {
  try {
    const ms = Date.now() - new Date(iso).getTime();
    const minutes = Math.round(ms / 60_000);
    if (minutes < 1) return 'upravo sada';
    if (minutes < 60) return `pre ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `pre ${hours} ${hours === 1 ? 'sat' : 'sati'}`;
    const days = Math.round(hours / 24);
    if (days < 30) return `pre ${days} ${days === 1 ? 'dan' : 'dana'}`;
    return new Date(iso).toLocaleDateString('sr-RS', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

interface HeroProps {
  me: StaffPrincipal;
  config: LoyaltyConfigRow | null;
  staff: StaffRow[];
  loggingOut: boolean;
  onLogout: () => void;
}

const AdminHero: React.FC<HeroProps> = ({ me, config, staff, loggingOut, onLogout }) => {
  const firstName = me.name.split(' ')[0];
  const activeCount = staff.filter((s) => s.isActive).length;
  return (
    <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px]">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex-1">
          <p className="font-montserrat font-bold text-hero-yellow text-[12px] md:text-[14px] tracking-[2px] uppercase mb-2">
            Komandni centar
          </p>
          <h1 className="font-montserrat font-bold text-[48px] md:text-[80px] xl:text-[100px] leading-[0.95] tracking-[-2px] md:tracking-[-4px] text-white">
            Zdravo, <span className="text-hero-yellow italic">{firstName}!</span>
          </h1>
          <p className="mt-3 font-montserrat font-medium text-white/90 text-[15px] md:text-[18px] leading-[1.4] max-w-[560px]">
            Podesi pravila programa i upravljaj <span className="text-hero-yellow font-bold">Hero</span> timom.
            Sve promene su <span className="font-bold">odmah uživo</span> na svim karticama.
          </p>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="self-start md:self-end bg-white/10 hover:bg-white/20 transition-colors duration-base text-white text-[12px] font-bold uppercase tracking-widest rounded-full px-5 h-11 border border-white/25 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loggingOut ? 'Izlazim…' : 'Odjavi se'}
        </button>
      </div>

      <div className="mt-7 md:mt-9 grid grid-cols-3 gap-3 md:gap-4 max-w-[640px]">
        <StatChip
          label="Za nagradu"
          value={config ? `${config.stampsRequired}` : '—'}
          unit="pečata"
        />
        <StatChip
          label="Aktivni tim"
          value={`${activeCount}`}
          unit={activeCount === 1 ? 'član' : 'člana'}
        />
        <StatChip
          label="Konfiguracija"
          value={config ? formatRelative(config.updatedAt) : '—'}
        />
      </div>
    </div>
  );
};

const StatChip: React.FC<{ label: string; value: string; unit?: string }> = ({ label, value, unit }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-[20px] md:rounded-[24px] px-4 py-3 md:px-5 md:py-4">
    <p className="font-montserrat font-bold text-white/65 text-[10px] md:text-[11px] tracking-[1.5px] uppercase">
      {label}
    </p>
    <p className="font-montserrat font-black text-white text-[20px] md:text-[26px] leading-[1.05] mt-1">
      {value}
      {unit && <span className="ml-1.5 font-medium text-white/55 text-[12px] md:text-[14px] tracking-wide">{unit}</span>}
    </p>
  </div>
);

function Admin() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [me, setMe] = useState<StaffPrincipal | null>(null);
  const [config, setConfig] = useState<LoyaltyConfigRow | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const toastTimerRef = useRef<number | null>(null);

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

  useEffect(() => {
    let cancelled = false;
    async function bootstrap(): Promise<void> {
      try {
        const meRes = await fetch('/api/staff/me', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (!meRes.ok) {
          if (!cancelled) {
            setStatus('anonymous');
            navigate('/scan/login', { replace: true });
          }
          return;
        }
        const principal = (await meRes.json()) as StaffPrincipal;
        if (cancelled) return;
        setMe(principal);
        if (principal.role !== 'admin') {
          setStatus('forbidden');
          return;
        }
        const [cfgRes, staffRes] = await Promise.all([
          fetch('/api/admin/config', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
          }),
          fetch('/api/admin/staff', {
            credentials: 'same-origin',
            headers: { Accept: 'application/json' },
          }),
        ]);
        if (cancelled) return;
        if (cfgRes.ok) {
          const cfg = (await cfgRes.json()) as LoyaltyConfigRow;
          setConfig(cfg);
        }
        if (staffRes.ok) {
          const data = (await staffRes.json()) as { staff: StaffRow[] };
          setStaff(data.staff);
        }
        setStatus('admin');
      } catch {
        if (!cancelled) {
          setStatus('anonymous');
          navigate('/scan/login', { replace: true });
        }
      }
    }
    void bootstrap();
    return () => {
      cancelled = true;
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [navigate]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/staff/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore
    }
    navigate('/scan/login', { replace: true });
  }, [loggingOut, navigate]);

  if (status === 'loading' || status === 'anonymous') {
    return <FullScreenLoader />;
  }
  if (status === 'forbidden') {
    return <NoAccess onLogout={handleLogout} loggingOut={loggingOut} />;
  }

  return (
    <PageShell>
      {me && (
        <AdminHero
          me={me}
          config={config}
          staff={staff}
          loggingOut={loggingOut}
          onLogout={handleLogout}
        />
      )}

      <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px] mt-10 md:mt-14 flex flex-col gap-6 md:gap-8">
        {config ? (
          <ConfigSection
            config={config}
            onSaved={(next) => setConfig(next)}
            showToast={showToast}
          />
        ) : (
          <section className="bg-hero-green/40 border border-white/15 rounded-[40px] p-8 text-white/85 text-sm font-montserrat">
            Učitavam konfiguraciju…
          </section>
        )}

        {me ? (
          <StaffSection
            staff={staff}
            meId={me.id}
            onChanged={(next) => setStaff(next)}
            showToast={showToast}
          />
        ) : null}
      </div>

      {toast ? (
        <div
          className={`fixed top-[max(env(safe-area-inset-top),12px)] left-0 right-0 z-30 px-4 flex justify-center transform transition-all duration-500 ease-in-out pointer-events-none ${
            toastVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
          }`}
          role="status"
          aria-live="polite"
        >
          <div
            className={`max-w-md w-full rounded-2xl border px-5 py-4 shadow-2xl text-center font-montserrat font-bold text-base ${classNamesForToast(toast.tone)}`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
    </PageShell>
  );
}

export default Admin;
