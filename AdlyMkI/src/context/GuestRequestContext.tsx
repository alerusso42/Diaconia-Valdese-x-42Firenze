import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { GuestRequest } from '../data/mockData';

const KEY = 'adlymki_guest_requests';

function load(): GuestRequest[] {
  try {
    const s = localStorage.getItem(KEY);
    return s ? (JSON.parse(s) as GuestRequest[]) : [];
  } catch { return []; }
}

function save(reqs: GuestRequest[]) {
  localStorage.setItem(KEY, JSON.stringify(reqs));
}

interface GuestRequestCtx {
  requests:     GuestRequest[];
  addRequest:   (data: Omit<GuestRequest, 'id' | 'createdAt' | 'status'>) => void;
  updateStatus: (id: string, status: GuestRequest['status']) => void;
  forGuest:     (guestId: string) => GuestRequest[];
  forFacility:  (facilityId: string) => GuestRequest[];
}

const Ctx = createContext<GuestRequestCtx | undefined>(undefined);

export function GuestRequestProvider({ children }: { children: ReactNode }) {
  const [requests, setRequests] = useState<GuestRequest[]>(load);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setRequests(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addRequest = (data: Omit<GuestRequest, 'id' | 'createdAt' | 'status'>) => {
    const r: GuestRequest = {
      ...data,
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setRequests(prev => {
      const next = [r, ...prev];
      save(next);
      return next;
    });
  };

  const updateStatus = (id: string, status: GuestRequest['status']) =>
    setRequests(prev => {
      const next = prev.map(r => r.id === id ? { ...r, status } : r);
      save(next);
      return next;
    });

  const forGuest    = (id: string) => requests.filter(r => r.guestId === id);
  const forFacility = (id: string) => requests.filter(r => r.facilityId === id);

  return (
    <Ctx.Provider value={{ requests, addRequest, updateStatus, forGuest, forFacility }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGuestRequests() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGuestRequests must be used within GuestRequestProvider');
  return ctx;
}
