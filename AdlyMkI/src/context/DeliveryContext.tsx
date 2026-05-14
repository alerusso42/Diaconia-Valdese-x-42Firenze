import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Delivery {
  id: string;
  guestId: string;
  guestName: string;
  objectType: string;
  objectLabel: string;
  description: string;
  createdAt: string;
  status: 'pending' | 'accepted';
  facilityName: string;
}

interface DeliveryContextType {
  deliveries: Delivery[];
  addDelivery: (d: Omit<Delivery, 'createdAt' | 'status'>) => void;
  removeDelivery: (id: string) => void;
  markAccepted: (id: string) => void;
  forGuest: (guestId: string) => Delivery[];
}

const STORAGE_KEY = 'adlymki_deliveries';

function load(): Delivery[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'); }
  catch { return []; }
}
function save(d: Delivery[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

const DeliveryContext = createContext<DeliveryContextType | null>(null);

export function DeliveryProvider({ children }: { children: ReactNode }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(load);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setDeliveries(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addDelivery = (d: Omit<Delivery, 'createdAt' | 'status'>) =>
    setDeliveries(prev => {
      const next = [...prev, { ...d, createdAt: new Date().toISOString(), status: 'pending' as const }];
      save(next);
      return next;
    });

  const removeDelivery = (id: string) =>
    setDeliveries(prev => { const next = prev.filter(d => d.id !== id); save(next); return next; });

  const markAccepted = (id: string) =>
    setDeliveries(prev => {
      const next = prev.map(d => d.id === id ? { ...d, status: 'accepted' as const } : d);
      save(next);
      return next;
    });

  const forGuest = (guestId: string) => deliveries.filter(d => d.guestId === guestId);

  return (
    <DeliveryContext.Provider value={{ deliveries, addDelivery, removeDelivery, markAccepted, forGuest }}>
      {children}
    </DeliveryContext.Provider>
  );
}

export function useDelivery() {
  const ctx = useContext(DeliveryContext);
  if (!ctx) throw new Error('useDelivery must be used within DeliveryProvider');
  return ctx;
}
