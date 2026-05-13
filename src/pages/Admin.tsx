import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Crown,
  Download,
  type LucideIcon,
  Plus,
  ScanLine,
  ShieldOff,
  SlidersHorizontal,
  Trash2,
  UserCog,
  Users,
} from 'lucide-react';
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

interface CustomerCard {
  id: string;
  stampsCount: number;
  totalRedemptions: number;
  status: 'active' | 'ready_to_redeem';
  hasWalletPass: boolean;
  createdAt: string;
  lastStampAt: string | null;
}

interface CustomerRow {
  id: string;
  email: string;
  name: string;
  emailVerifiedAt: string | null;
  createdAt: string;
  card: CustomerCard | null;
}

type ToastTone = 'success' | 'warning' | 'error';

interface ToastState {
  message: string;
  tone: ToastTone;
}

type SessionStatus = 'loading' | 'admin' | 'forbidden' | 'anonymous';

type AdminTab = 'config' | 'staff' | 'customers';

const TAB_HASHES: Record<AdminTab, string> = {
  config: '#pravila',
  staff: '#tim',
  customers: '#korisnici',
};

function tabFromHash(hash: string): AdminTab {
  switch (hash) {
    case '#tim':
      return 'staff';
    case '#korisnici':
      return 'customers';
    case '#pravila':
    default:
      return 'config';
  }
}

interface TabDef {
  key: AdminTab;
  label: string;
  icon: LucideIcon;
}

const TABS: ReadonlyArray<TabDef> = [
  { key: 'config', label: 'Pravila', icon: SlidersHorizontal },
  { key: 'staff', label: 'Tim', icon: UserCog },
  { key: 'customers', label: 'Korisnici', icon: Users },
];

interface AdminTabsProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  customersCount: number;
  staffCount: number;
}

function AdminTabs({ active, onChange, customersCount, staffCount }: AdminTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Admin sekcije"
      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-full p-1.5 inline-flex items-center gap-1 max-w-full overflow-x-auto"
    >
      {TABS.map((tab) => {
        const isActive = active === tab.key;
        const Icon = tab.icon;
        const badge =
          tab.key === 'customers' ? customersCount : tab.key === 'staff' ? staffCount : null;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.key)}
            className={`relative inline-flex items-center gap-2 rounded-full px-4 md:px-5 h-10 md:h-11 font-montserrat font-bold text-[12px] md:text-[13px] tracking-wide uppercase whitespace-nowrap transition-colors duration-base ${
              isActive
                ? 'bg-hero-yellow text-grey-black shadow-hero-xs'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" strokeWidth={2.25} />
            {tab.label}
            {badge !== null && (
              <span
                className={`ml-0.5 inline-flex items-center justify-center min-w-[22px] h-[20px] px-1.5 rounded-full text-[10px] font-black ${
                  isActive ? 'bg-grey-black text-hero-yellow' : 'bg-white/15 text-white'
                }`}
              >
                {badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

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

interface CustomersSectionProps {
  customers: CustomerRow[];
  stampsRequired: number;
  onChanged: (next: CustomerRow[]) => void;
  showToast: (toast: ToastState) => void;
}

const CONFIRM_PHRASE = 'OBRIŠI';

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildCustomersCsv(rows: CustomerRow[]): string {
  const header = [
    'email',
    'name',
    'stamps',
    'status',
    'redemptions',
    'has_wallet_pass',
    'last_stamp_at',
    'registered_at',
    'email_verified_at',
  ];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.email,
        r.name,
        r.card?.stampsCount ?? 0,
        r.card?.status ?? 'no_card',
        r.card?.totalRedemptions ?? 0,
        r.card?.hasWalletPass ? 'yes' : 'no',
        r.card?.lastStampAt ?? '',
        r.createdAt,
        r.emailVerifiedAt ?? '',
      ]
        .map(csvEscape)
        .join(','),
    );
  }
  return lines.join('\n');
}

function CustomersSection({ customers, stampsRequired, onChanged, showToast }: CustomersSectionProps) {
  const [query, setQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [stampingId, setStampingId] = useState<string | null>(null);
  const [stampDelta, setStampDelta] = useState<Record<string, string>>({});

  const filtered = (() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.email.toLowerCase().includes(q) || c.name.toLowerCase().includes(q),
    );
  })();

  const toggleExpand = useCallback((id: string) => {
    setExpandedId((curr) => (curr === id ? null : id));
    setConfirmText('');
  }, []);

  const handleExport = useCallback(() => {
    const csv = buildCustomersCsv(filtered);
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
    link.href = url;
    link.download = `gyros-heroes-korisnici-${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast({ tone: 'success', message: `Izvezeno ${filtered.length} redova.` });
  }, [filtered, showToast]);

  const handleDelete = useCallback(
    async (row: CustomerRow) => {
      if (deletingId) return;
      if (confirmText.trim().toUpperCase() !== CONFIRM_PHRASE) {
        showToast({ tone: 'warning', message: `Upiši "${CONFIRM_PHRASE}" da potvrdiš brisanje.` });
        return;
      }
      setDeletingId(row.id);
      try {
        const res = await fetch(`/api/admin/customers?id=${encodeURIComponent(row.id)}`, {
          method: 'DELETE',
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          onChanged(customers.filter((c) => c.id !== row.id));
          setExpandedId(null);
          setConfirmText('');
          showToast({ tone: 'success', message: 'Korisnik obrisan.' });
        } else if (res.status === 404) {
          onChanged(customers.filter((c) => c.id !== row.id));
          showToast({ tone: 'warning', message: 'Korisnik već ne postoji.' });
        } else {
          showToast({ tone: 'error', message: 'Greška pri brisanju.' });
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        setDeletingId(null);
      }
    },
    [deletingId, confirmText, customers, onChanged, showToast],
  );

  const handleAddStamp = useCallback(
    async (row: CustomerRow) => {
      if (stampingId || !row.card) return;
      const raw = stampDelta[row.id] ?? '1';
      const delta = Number.parseInt(raw, 10);
      if (!Number.isFinite(delta) || delta < 1 || delta > 50) {
        showToast({ tone: 'warning', message: 'Unesi broj između 1 i 50.' });
        return;
      }
      setStampingId(row.id);
      try {
        const res = await fetch('/api/admin/customers/stamp', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ cardId: row.card.id, delta }),
        });
        const data = (await res.json().catch(() => null)) as
          | { stampsCount: number; status: 'active' | 'ready_to_redeem'; justBecameRedeemable: boolean }
          | { error: string }
          | null;
        if (res.ok && data && 'stampsCount' in data) {
          onChanged(
            customers.map((c) =>
              c.id === row.id && c.card
                ? {
                    ...c,
                    card: {
                      ...c.card,
                      stampsCount: data.stampsCount,
                      status: data.status,
                      lastStampAt: new Date().toISOString(),
                    },
                  }
                : c,
            ),
          );
          setStampDelta((m) => ({ ...m, [row.id]: '1' }));
          showToast({
            tone: 'success',
            message: data.justBecameRedeemable
              ? 'Pečati dodati. Kartica spremna za otkup!'
              : 'Pečati dodati.',
          });
        } else if (res.status === 409 && data && 'error' in data && data.error === 'card_ready_to_redeem') {
          showToast({ tone: 'warning', message: 'Kartica je već spremna za otkup.' });
        } else if (res.status === 404) {
          showToast({ tone: 'warning', message: 'Kartica nije pronađena.' });
        } else {
          showToast({ tone: 'error', message: 'Greška pri dodavanju pečata.' });
        }
      } catch {
        showToast({ tone: 'error', message: 'Mreža nije dostupna.' });
      } finally {
        setStampingId(null);
      }
    },
    [stampingId, stampDelta, customers, onChanged, showToast],
  );

  return (
    <section className="bg-white/95 rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[40px] shadow-hero-xs">
      <div className="flex items-baseline justify-between mb-1 flex-wrap gap-3">
        <h2 className="font-montserrat font-black text-[26px] md:text-[34px] text-grey-black leading-[1.05] flex items-center gap-3">
          <Users className="w-7 h-7 text-hero-blue-dark" strokeWidth={2.25} />
          <span>
            Hero <span className="text-hero-blue-dark italic">korisnici</span>
          </span>
        </h2>
        <span className="font-montserrat font-bold text-[12px] tracking-[1.5px] uppercase text-grey-black/60">
          {customers.length} {customers.length === 1 ? 'korisnik' : 'korisnika'}
        </span>
      </div>
      <p className="font-montserrat text-grey-black/70 text-[14px] md:text-[15px] mb-6">
        Pregled svih registrovanih korisnika programa, broj pečata i istorija.
      </p>

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Pretraga po email-u ili imenu…"
          className="flex-1 h-[50px] md:h-[56px] rounded-full bg-grey-light/30 px-5 font-montserrat font-medium text-grey-black placeholder:text-grey-black/45 border-2 border-transparent focus:outline-none focus:border-hero-blue-dark focus:bg-white transition-colors duration-fast"
        />
        <button
          type="button"
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="bg-hero-blue-dark text-white font-montserrat font-bold text-[13px] md:text-[14px] h-[50px] md:h-[56px] px-6 inline-flex items-center justify-center gap-2 rounded-full hover:bg-hero-blue transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" strokeWidth={2.5} />
          Izvezi CSV
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="font-montserrat text-grey-black/55 text-[14px] py-8 text-center">
          {customers.length === 0 ? 'Još nema registrovanih korisnika.' : 'Nema rezultata za zadatu pretragu.'}
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-grey-black/5 -mx-2">
          {filtered.map((row) => {
            const isExpanded = expandedId === row.id;
            const stamps = row.card?.stampsCount ?? 0;
            const status = row.card?.status ?? null;
            const ratio = stampsRequired > 0 ? Math.min(1, stamps / stampsRequired) : 0;
            return (
              <li key={row.id} className="px-2">
                <button
                  type="button"
                  onClick={() => toggleExpand(row.id)}
                  className="w-full grid grid-cols-[1fr_auto] md:grid-cols-[2fr_1fr_1fr_auto] items-center gap-3 md:gap-4 py-4 text-left hover:bg-grey-light/20 rounded-2xl transition-colors duration-fast"
                  aria-expanded={isExpanded}
                >
                  <div className="min-w-0">
                    <p className="font-montserrat font-bold text-grey-black truncate">{row.name}</p>
                    <p className="font-montserrat text-grey-black/65 text-[13px] truncate">{row.email}</p>
                  </div>
                  <div className="hidden md:flex flex-col gap-1.5 min-w-0">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-montserrat font-black text-[18px] text-grey-black">
                        {stamps}
                      </span>
                      <span className="font-montserrat text-grey-black/50 text-[12px]">/ {stampsRequired}</span>
                    </div>
                    <div className="h-1.5 bg-grey-light/40 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${status === 'ready_to_redeem' ? 'bg-hero-yellow' : 'bg-hero-green'}`}
                        style={{ width: `${ratio * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="hidden md:block">
                    {status === 'ready_to_redeem' ? (
                      <span className="inline-flex items-center bg-hero-yellow/20 text-grey-black border border-hero-yellow/50 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                        Spremno
                      </span>
                    ) : status === 'active' ? (
                      <span className="inline-flex items-center bg-hero-green/15 text-hero-green border border-hero-green/40 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                        Aktivno
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-grey-light/40 text-grey-black/60 border border-grey-black/10 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest">
                        Bez kartice
                      </span>
                    )}
                  </div>
                  <div className="md:hidden text-right">
                    <p className="font-montserrat font-black text-[16px] text-grey-black leading-none">
                      {stamps}
                      <span className="text-grey-black/45 font-medium text-[12px]"> /{stampsRequired}</span>
                    </p>
                    {status === 'ready_to_redeem' && (
                      <p className="font-montserrat font-bold text-[10px] tracking-widest uppercase text-hero-yellow-dark mt-1">
                        Spremno
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    className={`hidden md:block w-5 h-5 text-grey-black/40 transition-transform duration-base ${isExpanded ? 'rotate-180' : ''}`}
                    strokeWidth={2.25}
                  />
                </button>

                {isExpanded && (
                  <div className="bg-grey-light/25 rounded-[20px] p-4 md:p-5 mb-3 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 font-montserrat text-[13px]">
                    <DetailItem label="Otkupi" value={String(row.card?.totalRedemptions ?? 0)} />
                    <DetailItem
                      label="Wallet pass"
                      value={row.card?.hasWalletPass ? 'Da' : 'Ne'}
                    />
                    <DetailItem
                      label="Poslednji pečat"
                      value={row.card?.lastStampAt ? formatRelative(row.card.lastStampAt) : '—'}
                    />
                    <DetailItem
                      label="Email potvrđen"
                      value={row.emailVerifiedAt ? 'Da' : 'Ne'}
                    />
                    <DetailItem label="Registrovan" value={formatDate(row.createdAt)} />
                    {row.card && (
                      <DetailItem label="Kartica od" value={formatDate(row.card.createdAt)} />
                    )}
                    {row.card && (
                      <div className="col-span-2 md:col-span-4 mt-2 pt-3 border-t border-grey-black/10">
                        <p className="font-montserrat font-bold text-[12px] tracking-widest uppercase text-hero-green mb-2">
                          Dodaj pečate ručno
                        </p>
                        <p className="font-montserrat text-grey-black/70 text-[12.5px] mb-3 leading-snug">
                          Dodaje pečate kao da je staff skenirao QR. Google Wallet pass se odmah ažurira.
                          {row.card.status === 'ready_to_redeem' && (
                            <span className="block mt-1 font-bold text-hero-yellow-dark">
                              Kartica je spremna za otkup — pečati se ne mogu dodati dok se nagrada ne iskoristi.
                            </span>
                          )}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="number"
                            min={1}
                            max={50}
                            value={stampDelta[row.id] ?? '1'}
                            onChange={(e) =>
                              setStampDelta((m) => ({ ...m, [row.id]: e.target.value }))
                            }
                            disabled={row.card.status === 'ready_to_redeem'}
                            className="sm:w-[120px] h-[44px] rounded-full bg-white px-5 font-montserrat font-medium text-grey-black border-2 border-grey-black/15 focus:outline-none focus:border-hero-green transition-colors duration-fast disabled:opacity-50"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddStamp(row)}
                            disabled={
                              stampingId === row.id || row.card.status === 'ready_to_redeem'
                            }
                            className="bg-hero-green text-white font-montserrat font-bold text-[13px] h-[44px] px-5 inline-flex items-center justify-center gap-2 rounded-full hover:bg-hero-green/85 transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="w-4 h-4" strokeWidth={2.5} />
                            {stampingId === row.id ? 'Dodajem…' : 'Dodaj pečate'}
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="col-span-2 md:col-span-4 mt-2 pt-3 border-t border-grey-black/10">
                      <p className="font-montserrat font-bold text-[12px] tracking-widest uppercase text-hero-blue-dark mb-2">
                        Force delete
                      </p>
                      <p className="font-montserrat text-grey-black/70 text-[12.5px] mb-3 leading-snug">
                        Trajno briše korisnika, karticu i istoriju. Pass u Google Walletu se postavlja na EXPIRED.
                        Upiši <span className="font-bold text-grey-black">{CONFIRM_PHRASE}</span> da bi potvrdio.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder={CONFIRM_PHRASE}
                          className="flex-1 h-[44px] rounded-full bg-white px-5 font-montserrat font-medium text-grey-black border-2 border-grey-black/15 focus:outline-none focus:border-hero-blue-dark transition-colors duration-fast"
                        />
                        <button
                          type="button"
                          onClick={() => handleDelete(row)}
                          disabled={
                            deletingId === row.id ||
                            confirmText.trim().toUpperCase() !== CONFIRM_PHRASE
                          }
                          className="bg-hero-blue-dark text-white font-montserrat font-bold text-[13px] h-[44px] px-5 inline-flex items-center justify-center gap-2 rounded-full hover:bg-hero-blue transition-colors duration-base disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2.5} />
                          {deletingId === row.id ? 'Brišem…' : 'Obriši trajno'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="min-w-0">
    <p className="font-montserrat font-bold text-[10px] tracking-[1.5px] uppercase text-grey-black/55 mb-0.5">
      {label}
    </p>
    <p className="font-montserrat font-medium text-grey-black truncate">{value}</p>
  </div>
);

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

interface AdminLoginProps {
  onLoggedIn: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoggedIn }) => {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: trimmedEmail, password }),
      });
      if (res.ok) {
        onLoggedIn();
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
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
    <PageShell>
      <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px]">
        <div className="max-w-[460px] mx-auto pt-[40px] md:pt-[60px]">
          <p className="font-montserrat font-bold text-hero-yellow text-[12px] md:text-[14px] tracking-[2px] uppercase mb-2 text-center">
            Komandni centar
          </p>
          <h1 className="font-montserrat font-bold text-[40px] md:text-[56px] leading-[0.95] tracking-[-1.5px] text-white text-center mb-6">
            Prijavi se kao <span className="text-hero-yellow italic">admin</span>
          </h1>

          <div className="bg-hero-green rounded-[40px] lg:rounded-[48px] p-6 md:p-8 lg:p-[36px] shadow-hero-xs">
            <p className="font-montserrat text-white/85 text-[14px] mb-6">
              Email i lozinka. Staff nalozi vide samo skener — ne admin panel.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
              <label className="flex flex-col gap-2">
                <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
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
                  className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="font-montserrat font-semibold text-white text-[13px] md:text-[14px] tracking-wide">
                  Lozinka
                </span>
                <input
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={submitting}
                  className="h-[50px] md:h-[56px] rounded-full bg-white/95 px-5 font-montserrat font-medium text-grey-black border-2 border-transparent focus:outline-none focus:border-hero-yellow focus:bg-white transition-colors duration-fast disabled:opacity-70"
                />
              </label>

              {errorMessage ? (
                <p
                  role="alert"
                  className="px-4 py-3 rounded-2xl bg-hero-blue-dark/60 border border-hero-yellow/40 text-hero-yellow text-[14px] font-montserrat font-medium text-center"
                >
                  {errorMessage}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-hero-yellow text-grey-black font-montserrat font-bold text-[15px] md:text-[16px] h-[50px] md:h-[60px] px-8 flex items-center justify-center rounded-full shadow-hero-xs hover:bg-white hover:text-hero-yellow transition-colors duration-base whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-hero-yellow disabled:hover:text-grey-black"
              >
                {submitting ? 'Prijavljujem…' : 'Prijavi se'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

function Admin() {
  const [status, setStatus] = useState<SessionStatus>('loading');
  const [me, setMe] = useState<StaffPrincipal | null>(null);
  const [config, setConfig] = useState<LoyaltyConfigRow | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [customerRows, setCustomerRows] = useState<CustomerRow[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>(() =>
    typeof window === 'undefined' ? 'config' : tabFromHash(window.location.hash),
  );
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const onHashChange = () => setActiveTab(tabFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const selectTab = useCallback((tab: AdminTab) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined' && window.location.hash !== TAB_HASHES[tab]) {
      window.history.replaceState(null, '', TAB_HASHES[tab]);
    }
  }, []);

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

  const bootstrap = useCallback(async (): Promise<void> => {
    setStatus('loading');
    try {
      const meRes = await fetch('/api/staff/me', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!meRes.ok) {
        setMe(null);
        setStatus('anonymous');
        return;
      }
      const principal = (await meRes.json()) as StaffPrincipal;
      setMe(principal);
      if (principal.role !== 'admin') {
        setStatus('forbidden');
        return;
      }
      const [cfgRes, staffRes, customersRes] = await Promise.all([
        fetch('/api/admin/config', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        }),
        fetch('/api/admin/staff', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        }),
        fetch('/api/admin/customers', {
          credentials: 'same-origin',
          headers: { Accept: 'application/json' },
        }),
      ]);
      if (cfgRes.ok) {
        const cfg = (await cfgRes.json()) as LoyaltyConfigRow;
        setConfig(cfg);
      }
      if (staffRes.ok) {
        const data = (await staffRes.json()) as { staff: StaffRow[] };
        setStaff(data.staff);
      }
      if (customersRes.ok) {
        const data = (await customersRes.json()) as { customers: CustomerRow[] };
        setCustomerRows(data.customers);
      }
      setStatus('admin');
    } catch {
      setMe(null);
      setStatus('anonymous');
    }
  }, []);

  useEffect(() => {
    void bootstrap();
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, [bootstrap]);

  const handleLogout = useCallback(async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await fetch('/api/staff/logout', { method: 'POST', credentials: 'same-origin' });
    } catch {
      // ignore
    }
    setLoggingOut(false);
    setMe(null);
    setConfig(null);
    setStaff([]);
    setCustomerRows([]);
    setStatus('anonymous');
  }, [loggingOut]);

  if (status === 'loading') {
    return <FullScreenLoader />;
  }
  if (status === 'anonymous') {
    return <AdminLogin onLoggedIn={() => void bootstrap()} />;
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

      <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px] mt-8 md:mt-10 flex justify-center md:justify-start">
        <AdminTabs
          active={activeTab}
          onChange={selectTab}
          customersCount={customerRows.length}
          staffCount={staff.length}
        />
      </div>

      <div className="max-w-[1400px] mx-auto px-[20px] nav:px-[100px] mt-6 md:mt-8 flex flex-col gap-6 md:gap-8">
        {activeTab === 'config' ? (
          config ? (
            <ConfigSection
              config={config}
              onSaved={(next) => setConfig(next)}
              showToast={showToast}
            />
          ) : (
            <section className="bg-hero-green/40 border border-white/15 rounded-[40px] p-8 text-white/85 text-sm font-montserrat">
              Učitavam konfiguraciju…
            </section>
          )
        ) : null}

        {activeTab === 'staff' && me ? (
          <StaffSection
            staff={staff}
            meId={me.id}
            onChanged={(next) => setStaff(next)}
            showToast={showToast}
          />
        ) : null}

        {activeTab === 'customers' ? (
          <CustomersSection
            customers={customerRows}
            stampsRequired={config?.stampsRequired ?? 10}
            onChanged={(next) => setCustomerRows(next)}
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
