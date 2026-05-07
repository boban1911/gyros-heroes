import { useEffect, useState, useCallback } from 'react';

export type StaffRole = 'admin' | 'staff';

export interface StaffPrincipal {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
}

export type StaffSessionStatus = 'loading' | 'authenticated' | 'anonymous';

interface StaffSessionState {
  status: StaffSessionStatus;
  staff: StaffPrincipal | null;
  refresh: () => Promise<void>;
  setStaff: (next: StaffPrincipal | null) => void;
}

export function useStaffSession(): StaffSessionState {
  const [status, setStatus] = useState<StaffSessionStatus>('loading');
  const [staff, setStaffState] = useState<StaffPrincipal | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/staff/me', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const data = (await res.json()) as StaffPrincipal;
        setStaffState(data);
        setStatus('authenticated');
        return;
      }
      setStaffState(null);
      setStatus('anonymous');
    } catch {
      setStaffState(null);
      setStatus('anonymous');
    }
  }, []);

  const setStaff = useCallback((next: StaffPrincipal | null) => {
    setStaffState(next);
    setStatus(next ? 'authenticated' : 'anonymous');
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { status, staff, refresh, setStaff };
}
