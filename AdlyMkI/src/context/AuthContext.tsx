import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockUsers, mockGuestCredentials, type User } from '../data/mockData';

const guestAccountsStorageKey = 'adlymki.guestAccounts';

export interface GuestAccount {
  id: string;
  user: User;
  username: string;
  password: string;
  facilityId: string;
  citizenship: string;
  birthDate: string;
  italyEntryDate: string;
  facilityEntryDate: string;
  sex: string;
  facilityType?: 'daily' | 'residential';
  createdAt: string;
}

interface GuestRegistrationInput {
  firstName: string;
  lastName: string;
  facilityId: string;
  citizenship: string;
  birthDate: string;
  italyEntryDate: string;
  facilityEntryDate: string;
  sex: string;
  facilityType?: 'daily' | 'residential';
  avatarUrl?: string;
}

interface GuestLoginCredentials {
  username: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  selectedStructure: string | null;
  guestAccounts: GuestAccount[];
  login: (roleId: string, structure?: string, credentials?: GuestLoginCredentials) => boolean;
  registerGuest: (input: GuestRegistrationInput) => GuestAccount | null;
  deleteGuest: (guestAccountId: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadGuestAccounts(): GuestAccount[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawAccounts = window.localStorage.getItem(guestAccountsStorageKey);
  if (!rawAccounts) {
    return [];
  }

  try {
    return JSON.parse(rawAccounts) as GuestAccount[];
  } catch {
    return [];
  }
}

function saveGuestAccounts(guestAccounts: GuestAccount[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(guestAccountsStorageKey, JSON.stringify(guestAccounts));
}

function generateGuestCredentials(firstName: string, lastName: string, facilityId: string) {
  const slug = `${firstName}.${lastName}`
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '')
    .replace(/\.+/g, '.');
  const suffix = Math.random().toString(36).slice(2, 6);
  const username = `${slug}.${facilityId}.${suffix}`;
  const password = Math.random().toString(36).slice(2, 8);

  return { username, password };
}

function facilityIdToStructureKey(facilityId?: string) {
  const mapping: Record<string, string> = {
    f1: 'struttura-1',
    f2: 'struttura-2',
    f3: 'struttura-3',
    f4: 'struttura-4',
    f5: 'struttura-5',
    f6: 'struttura-6',
  };

  return facilityId ? mapping[facilityId] ?? null : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
  const [guestAccounts, setGuestAccounts] = useState<GuestAccount[]>(loadGuestAccounts);

  // For the presentation, we'll mock login by picking a user who matches the role
  const login = (roleId: string, structure?: string, credentials?: GuestLoginCredentials) => {
    // We map the homepage role 'id' to the mockData 'roles' array
    const roleMapping: Record<string, string> = {
      'ospite': 'guest',
      'educatore': 'educator',
      'genitore': 'parent'
    };
    
    const targetRole = roleMapping[roleId] || 'guest';
    if (targetRole === 'guest') {
      // Controlla prima le credenziali degli ospiti mock predefiniti
      const matchingMockCred = credentials
        ? mockGuestCredentials.find(c => c.username === credentials.username && c.password === credentials.password)
        : undefined;
      const matchingMockUser = matchingMockCred
        ? mockUsers.find(u => u.id === matchingMockCred.userId)
        : undefined;

      // Poi controlla gli account creati dinamicamente
      const matchingGuest = credentials
        ? guestAccounts.find((account) => account.username === credentials.username && account.password === credentials.password)
        : undefined;

      const fallbackGuest = mockUsers.find((u) => u.roles.includes('guest'));

      const guestUser = matchingMockUser ?? matchingGuest?.user ?? fallbackGuest;

      if (guestUser) {
        setUser(guestUser);
        setSelectedStructure(facilityIdToStructureKey(guestUser.facilityIds?.[0]));
        return true;
      }

      return false;
    }

    const mockUser = mockUsers.find(u => u.roles.includes(targetRole as any));
    
    if (mockUser) {
      setUser(mockUser);
      setSelectedStructure(roleId === 'educatore' && structure ? structure : null);
      return true;
    }

    return false;
  };

  const registerGuest = ({ firstName, lastName, facilityId, citizenship, birthDate, italyEntryDate, facilityEntryDate, sex, facilityType, avatarUrl }: GuestRegistrationInput) => {
    if (!firstName.trim() || !lastName.trim() || !facilityId || !citizenship.trim() || !birthDate || !italyEntryDate || !facilityEntryDate || !sex.trim()) {
      return null;
    }

    const credentials = generateGuestCredentials(firstName.trim(), lastName.trim(), facilityId);
    const newGuestAccount: GuestAccount = {
      id: `guest-${Date.now()}`,
      user: {
        id: `guest-user-${Date.now()}`,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        roles: ['guest'],
        facilityIds: [facilityId],
        xp: 0,
        level: 1,
        avatarUrl,
      },
      username: credentials.username,
      password: credentials.password,
      facilityId,
      citizenship: citizenship.trim(),
      birthDate,
      italyEntryDate,
      facilityEntryDate,
      sex: sex.trim(),
      facilityType,
      createdAt: new Date().toISOString(),
    };

    const nextGuestAccounts = [...guestAccounts, newGuestAccount];
    setGuestAccounts(nextGuestAccounts);
    saveGuestAccounts(nextGuestAccounts);

    return newGuestAccount;
  };

  const deleteGuest = (guestAccountId: string) => {
    const next = guestAccounts.filter(a => a.id !== guestAccountId);
    setGuestAccounts(next);
    saveGuestAccounts(next);
  };

  const logout = () => {
    setUser(null);
    setSelectedStructure(null);
  };

  return (
    <AuthContext.Provider value={{ user, selectedStructure, guestAccounts, login, registerGuest, deleteGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
