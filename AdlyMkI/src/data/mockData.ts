export type FacilityType = 'residential' | 'daily';

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  address: string;
}

export type UserRole = 'admin' | 'coordinator' | 'educator' | 'guest' | 'parent';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  img?: string;
  phone?: string;
  roles: UserRole[];
  facilityIds?: string[];
  referenceEducatorId?: string; // For guests
  parentId?: string; // For guests to parents
  childrenIds?: string[]; // For parents
  avatarUrl?: string;
  xp?: number; // Gamification points for guests
  level?: number;
}

export type TaskType = 'chore' | 'therapy' | 'medical' | 'learning' | 'recreation';
export type TaskStatus = 'pending' | 'completed' | 'swapped' | 'failed' | 'pending_verification';

export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  assignedTo: string; // User ID
  facilityId: string;
  difficultyWeight: number; // 1-5
  status: TaskStatus;
  scheduledFor: string; // ISO string
  completedAt?: string; // ISO string
  proofImageUrl?: string;
  requiresVerification: boolean;
  createdByRole?: 'guest' | 'educator' | 'system';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Icon name
  requiredXp: number;
}

export interface Feedback {
  id: string;
  guestId: string;
  educatorId: string;
  note: string;
  date: string; // ISO string
}

// --- MOCK DATA ---

export const mockFacilities: Facility[] = [
  { id: 'f1', name: 'Casa del Sole', type: 'residential', address: 'Via Roma 1, Firenze' },
  { id: 'f2', name: 'Centro Arcobaleno', type: 'daily', address: 'Via Milano 10, Firenze' },
  { id: 'f3', name: 'Villa Serena', type: 'residential', address: 'Via Verdi 12, Firenze' },
  { id: 'f4', name: 'Casa delle Rose', type: 'daily', address: 'Via Leopardi 8, Firenze' },
  { id: 'f5', name: 'Centro Stella', type: 'residential', address: 'Via Petrarca 4, Firenze' },
  { id: 'f6', name: 'Spazio Aurora', type: 'daily', address: 'Via Dante 20, Firenze' }
];

export const mockUsers: User[] = [
  { id: 'u1', firstName: 'Super', lastName: 'Admin', roles: ['admin'], email: 'admin@valdesi.it', phone: '333 1234567' },
  { id: 'u2', firstName: 'Laura', lastName: 'Bianchi', roles: ['coordinator', 'educator'], facilityIds: ['f1', 'f2'], email: 'lbianchi@valdesi.it', phone: '333 9876543', avatarUrl: '/profile_pics/laura.bianchi.jpg' },
  { id: 'u3', firstName: 'Marco', lastName: 'Rossi', roles: ['educator'], facilityIds: ['f1'], email: 'mrossi@valdesi.it', phone: '334 1122334', avatarUrl: '/profile_pics/marco.rossi.jpg' },
  { id: 'u4', firstName: 'Giulia', lastName: 'Verdi', roles: ['guest'], facilityIds: ['f1'], referenceEducatorId: 'u3', xp: 450, level: 3, phone: '338 5566778', avatarUrl: '/profile_pics/giulia.verdi.jpg' },
  { id: 'u5', firstName: 'Andrea', lastName: 'Neri', roles: ['guest'], facilityIds: ['f1'], referenceEducatorId: 'u2', xp: 120, level: 1, avatarUrl: '/profile_pics/andrea.neri.jpg' },
  { id: 'u6', firstName: 'Elena', lastName: 'Verdi', roles: ['parent'], childrenIds: ['u4'], email: 'everdi@example.com', phone: '339 9988776', avatarUrl: '/profile_pics/elena.verdi.jpg' },
  { id: 'u7', firstName: 'Sara', lastName: 'Conti', roles: ['educator'], facilityIds: ['f2'], email: 'sconti@valdesi.it', avatarUrl: '/profile_pics/sara.conti.jpg' },
  { id: 'u8', firstName: 'Paolo', lastName: 'Galli', roles: ['guest'], facilityIds: ['f2'], referenceEducatorId: 'u7', xp: 260, level: 2, avatarUrl: '/profile_pics/paolo.galli.jpg' },
  { id: 'u9', firstName: 'Marta', lastName: 'Fontana', roles: ['educator'], facilityIds: ['f3'], avatarUrl: '/profile_pics/marta.fontana.jpg' },
  { id: 'u10', firstName: 'Luca', lastName: 'Moretti', roles: ['guest'], facilityIds: ['f3'], referenceEducatorId: 'u9', xp: 380, level: 3, avatarUrl: '/profile_pics/luca.moretti.jpg' },
  { id: 'u11', firstName: 'Anna', lastName: 'Sala', roles: ['educator'], facilityIds: ['f4'], avatarUrl: '/profile_pics/anna.sara.jpg' },
  { id: 'u12', firstName: 'Francesco', lastName: 'Riva', roles: ['guest'], facilityIds: ['f4'], referenceEducatorId: 'u11', xp: 180, level: 1 },
  { id: 'u13', firstName: 'Chiara', lastName: 'Ferri', roles: ['educator'], facilityIds: ['f5'], avatarUrl: '/profile_pics/chiara.ferri.jpg' },
  { id: 'u14', firstName: 'Tommaso', lastName: 'Leone', roles: ['guest'], facilityIds: ['f5'], referenceEducatorId: 'u13', xp: 520, level: 4 },
  { id: 'u15', firstName: 'Irene', lastName: 'Costa', roles: ['educator'], facilityIds: ['f6'] },
  { id: 'u16', firstName: 'Nicolò', lastName: 'Marini', roles: ['guest'], facilityIds: ['f6'], referenceEducatorId: 'u15', xp: 95, level: 1 }
];

export const mockTasks: Task[] = [
  { id: 't1', title: 'Pulire la cucina', description: 'Lavare i piatti e pulire i banconi dopo cena', type: 'chore', assignedTo: 'u4', facilityId: 'f1', difficultyWeight: 3, status: 'pending', scheduledFor: new Date().toISOString(), requiresVerification: true },
  { id: 't2', title: 'Seduta dallo psicologo', description: 'Incontro settimanale con il Dott. Moretti', type: 'therapy', assignedTo: 'u4', facilityId: 'f1', difficultyWeight: 1, status: 'completed', scheduledFor: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 86000000).toISOString(), requiresVerification: false },
  { id: 't3', title: 'Portare fuori la spazzatura', description: 'Raccolta differenziata: organico e plastica', type: 'chore', assignedTo: 'u5', facilityId: 'f1', difficultyWeight: 2, status: 'pending_verification', scheduledFor: new Date().toISOString(), requiresVerification: true, proofImageUrl: 'mock-trash-proof.jpg' },
  { id: 't4', title: 'Passeggiata mattutina', description: 'Breve passeggiata assistita in giardino', type: 'recreation', assignedTo: 'u8', facilityId: 'f2', difficultyWeight: 1, status: 'pending', scheduledFor: new Date().toISOString(), requiresVerification: false },
  { id: 't5', title: 'Piegare il bucato', description: 'Piegare e sistemare il bucato pulito', type: 'chore', assignedTo: 'u10', facilityId: 'f3', difficultyWeight: 2, status: 'completed', scheduledFor: new Date(Date.now() - 43200000).toISOString(), completedAt: new Date(Date.now() - 42800000).toISOString(), requiresVerification: false },
  { id: 't6', title: 'Apparecchiare la tavola', description: 'Preparare la sala da pranzo prima del pranzo', type: 'learning', assignedTo: 'u12', facilityId: 'f4', difficultyWeight: 2, status: 'pending_verification', scheduledFor: new Date().toISOString(), requiresVerification: true },
  { id: 't7', title: 'Annaffiare le piante', description: 'Prendersi cura delle piante in serra', type: 'recreation', assignedTo: 'u14', facilityId: 'f5', difficultyWeight: 1, status: 'completed', scheduledFor: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 7100000).toISOString(), requiresVerification: false },
  { id: 't8', title: 'Riordinare i libri', description: "Sistemare i materiali dell'angolo lettura", type: 'learning', assignedTo: 'u16', facilityId: 'f6', difficultyWeight: 2, status: 'pending', scheduledFor: new Date().toISOString(), requiresVerification: false },
  { id: 't9', title: 'Invitare un amico a casa', description: 'Vorrei invitare una amica sabato 18 maggio, dalle 15:00 alle 18:00.', type: 'recreation', assignedTo: 'u4', facilityId: 'f1', difficultyWeight: 1, status: 'swapped', scheduledFor: new Date().toISOString(), requiresVerification: true },
  { id: 't10', title: 'Pulizia bagno', description: 'Pulire il bagno condiviso del piano', type: 'chore', assignedTo: 'u17', facilityId: 'f1', difficultyWeight: 2, status: 'completed', scheduledFor: new Date(Date.now() - 43200000).toISOString(), completedAt: new Date(Date.now() - 40000000).toISOString(), requiresVerification: false },
  { id: 't11', title: 'Corso di italiano', description: 'Lezione settimanale di italiano', type: 'learning', assignedTo: 'u17', facilityId: 'f1', difficultyWeight: 2, status: 'pending', scheduledFor: new Date().toISOString(), requiresVerification: false },
  { id: 't12', title: 'Seduta fisioterapia', description: 'Appuntamento con la fisioterapista', type: 'therapy', assignedTo: 'u18', facilityId: 'f1', difficultyWeight: 1, status: 'completed', scheduledFor: new Date(Date.now() - 86400000).toISOString(), completedAt: new Date(Date.now() - 84000000).toISOString(), requiresVerification: false },
  { id: 't13', title: 'Preparazione tavola pranzo', description: 'Apparecchiare il tavolo per il pranzo comune', type: 'chore', assignedTo: 'u19', facilityId: 'f1', difficultyWeight: 1, status: 'pending_verification', scheduledFor: new Date().toISOString(), requiresVerification: true },
  { id: 't14', title: 'Passeggiata pomeridiana', description: 'Uscita nel parco con accompagnatore', type: 'recreation', assignedTo: 'u20', facilityId: 'f1', difficultyWeight: 1, status: 'completed', scheduledFor: new Date(Date.now() - 7200000).toISOString(), completedAt: new Date(Date.now() - 6800000).toISOString(), requiresVerification: false },
  { id: 't15', title: 'Riordino camera', description: 'Sistemare e riordinare la propria stanza', type: 'chore', assignedTo: 'u20', facilityId: 'f1', difficultyWeight: 2, status: 'pending', scheduledFor: new Date().toISOString(), requiresVerification: false },
  { id: 't16', title: 'Esercizi di fisioterapia', description: 'Completare la serie di esercizi mattutini assegnati dalla fisioterapista', type: 'therapy', assignedTo: 'u4', facilityId: 'f1', difficultyWeight: 2, status: 'pending_verification', scheduledFor: new Date().toISOString(), requiresVerification: true, proofImageUrl: 'mock-physio-proof.jpg' },
  { id: 't17', title: 'Fare la spesa', description: 'Acquistare i prodotti dalla lista della settimana al supermercato', type: 'chore', assignedTo: 'u5', facilityId: 'f1', difficultyWeight: 3, status: 'pending', scheduledFor: new Date(Date.now() - 3600000).toISOString(), requiresVerification: false },

  { id: 't19', title: 'Corso di cucina', description: 'Partecipare al laboratorio di cucina del pomeriggio', type: 'learning', assignedTo: 'u4', facilityId: 'f1', difficultyWeight: 1, status: 'pending', scheduledFor: new Date(Date.now() - 7200000).toISOString(), requiresVerification: false },
];

export const mockAchievements: Achievement[] = [
  { id: 'a1', title: 'Pulizia Impeccabile', description: 'Completa 10 compiti di pulizia', icon: 'Sparkles', requiredXp: 100 },
  { id: 'a2', title: 'Maestro in Cucina', description: 'Cucina la cena per la struttura 5 volte', icon: 'ChefHat', requiredXp: 200 },
  { id: 'a3', title: 'Coinquilino Affidabile', description: 'Completa 20 compiti senza saltare una scadenza', icon: 'Medal', requiredXp: 500 }
];

export const mockFeedbacks: Feedback[] = [
  { id: 'fb1', guestId: 'u4', educatorId: 'u3', note: 'Giulia sta mostrando grandi miglioramenti nel rispettare le regole questa settimana.', date: new Date().toISOString() }
];

// === Nuovi tipi per le funzionalità ospite ===

export interface GuestCredentials {
  userId: string;
  username: string;
  password: string;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  targetId: string;
  targetName: string;
  requesterTaskId: string;
  requesterTaskTitle: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface ChoreTemplate {
  title: string;
  description: string;
  type: TaskType;
  difficultyWeight: number;
  requiresVerification: boolean;
  dayOfWeek?: number; // 1=Lun..6=Sab, 0=Dom; undefined=giornaliero
}

export type GuestRequestType = 'documento' | 'farmaci' | 'uscita' | 'visita' | 'acquisto' | 'altro';

export interface GuestRequest {
  id: string;
  guestId: string;
  guestName: string;
  facilityId: string;
  type: GuestRequestType;
  label: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// Credenziali per gli ospiti mock esistenti (username / password)
export const mockGuestCredentials: GuestCredentials[] = [
  { userId: 'u4',  username: 'giulia.verdi',    password: 'pass123' },
  { userId: 'u5',  username: 'andrea.neri',      password: 'pass123' },
  { userId: 'u8',  username: 'paolo.galli',      password: 'pass123' },
  { userId: 'u10', username: 'luca.moretti',     password: 'pass123' },
  { userId: 'u12', username: 'francesco.riva',   password: 'pass123' },
  { userId: 'u14', username: 'tommaso.leone',    password: 'pass123' },
  { userId: 'u16', username: 'nicolo.marini',    password: 'pass123' },
];

// Turni casalinghi predefiniti per il calendario settimanale degli ospiti
export const mockChoreTemplates: ChoreTemplate[] = [
  { title: 'Lavare i piatti',           description: 'Lavare e asciugare tutti i piatti dopo i pasti',               type: 'chore',    difficultyWeight: 2, requiresVerification: false },
  { title: 'Riempire la lavastoviglie', description: 'Caricare la lavastoviglie e avviarla dopo pranzo',              type: 'chore',    difficultyWeight: 1, requiresVerification: false },
  { title: 'Buttare la spazzatura',     description: 'Raccogliere i sacchi e portarli al bidone esterno',             type: 'chore',    difficultyWeight: 2, requiresVerification: true,  dayOfWeek: 2 },
  { title: 'Pulire la propria stanza',  description: 'Riordinare e passare il panno nella propria stanza',            type: 'chore',    difficultyWeight: 3, requiresVerification: true,  dayOfWeek: 1 },
  { title: 'Pulire il bagno condiviso', description: 'Pulire il bagno con detergenti e stracci',                      type: 'chore',    difficultyWeight: 3, requiresVerification: true,  dayOfWeek: 4 },
  { title: 'Apparecchiare la tavola',   description: 'Preparare piatti, posate e bicchieri per il pranzo',            type: 'chore',    difficultyWeight: 1, requiresVerification: false },
  { title: 'Fare il bucato',            description: 'Lavare, stendere e piegare i propri vestiti',                   type: 'chore',    difficultyWeight: 2, requiresVerification: false, dayOfWeek: 5 },
  { title: 'Fare la spesa',             description: 'Compilare la lista e andare al supermercato con l\'educatore',  type: 'learning', difficultyWeight: 3, requiresVerification: false, dayOfWeek: 3 },
  { title: 'Cucinare il pranzo',        description: 'Partecipare alla preparazione del pranzo per la casa',          type: 'learning', difficultyWeight: 4, requiresVerification: false, dayOfWeek: 6 },
];
