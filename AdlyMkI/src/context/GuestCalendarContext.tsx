import { createContext, useContext, useState, type ReactNode } from 'react';
import { startOfWeek, addDays } from 'date-fns';
import {
  mockUsers,
  mockChoreTemplates,
  type Task,
  type SwapRequest,
} from '../data/mockData';

const CALENDAR_KEY = 'adlymki_guest_calendars';
const SWAPS_KEY    = 'adlymki_swap_requests';

type TasksMap = Record<string, Task[]>;

function loadTasksMap(): TasksMap {
  try {
    const s = localStorage.getItem(CALENDAR_KEY);
    return s ? (JSON.parse(s) as TasksMap) : {};
  } catch { return {}; }
}

function saveTasksMap(m: TasksMap) {
  localStorage.setItem(CALENDAR_KEY, JSON.stringify(m));
}

function loadSwaps(): SwapRequest[] {
  try {
    const s = localStorage.getItem(SWAPS_KEY);
    return s ? (JSON.parse(s) as SwapRequest[]) : [];
  } catch { return []; }
}

function saveSwaps(swaps: SwapRequest[]) {
  localStorage.setItem(SWAPS_KEY, JSON.stringify(swaps));
}

function buildWeeklyTasks(userId: string, facilityId: string): Task[] {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  return mockChoreTemplates.map((tmpl, i) => {
    let taskDate: Date;
    if (tmpl.dayOfWeek !== undefined) {
      // dayOfWeek 1=Lun..6=Sab,0=Dom → offset from Monday
      const offset = tmpl.dayOfWeek === 0 ? 6 : tmpl.dayOfWeek - 1;
      taskDate = addDays(weekStart, offset);
    } else {
      taskDate = new Date();
    }
    taskDate = new Date(taskDate);
    taskDate.setHours(8 + i, 0, 0, 0);
    return {
      id: `chore-${userId}-${i}`,
      title: tmpl.title,
      description: tmpl.description,
      type: tmpl.type,
      assignedTo: userId,
      facilityId,
      difficultyWeight: tmpl.difficultyWeight,
      status: 'pending' as const,
      scheduledFor: taskDate.toISOString(),
      requiresVerification: tmpl.requiresVerification,
    };
  });
}

function initMap(map: TasksMap): TasksMap {
  const result = { ...map };
  for (const u of mockUsers.filter(u => u.roles.includes('guest'))) {
    if (!result[u.id]?.length) {
      result[u.id] = buildWeeklyTasks(u.id, u.facilityIds?.[0] ?? 'f1');
    }
  }
  return result;
}

interface GuestCalendarCtx {
  getTasksForUser: (userId: string) => Task[];
  addTask:         (userId: string, task: Task) => void;
  removeTask:      (userId: string, taskId: string) => void;
  updateTask:      (userId: string, taskId: string, patch: Partial<Task>) => void;
  directSwapTask:  (fromUserId: string, taskId: string, toUserId: string) => void;
  swapRequests:         SwapRequest[];
  createSwapRequest:    (data: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => void;
  respondToSwap:        (id: string, accepted: boolean) => void;
  pendingSwapsForUser:  (userId: string) => SwapRequest[];
  sentSwapsForUser:     (userId: string) => SwapRequest[];
}

const Ctx = createContext<GuestCalendarCtx | undefined>(undefined);

export function GuestCalendarProvider({ children }: { children: ReactNode }) {
  const [tasksMap, setTasksMap] = useState<TasksMap>(() => {
    const loaded = loadTasksMap();
    const init   = initMap(loaded);
    saveTasksMap(init);
    return init;
  });

  const [swaps, setSwaps] = useState<SwapRequest[]>(loadSwaps);

  const getTasksForUser = (uid: string) => tasksMap[uid] ?? [];

  const addTask = (uid: string, task: Task) =>
    setTasksMap(prev => {
      const next = { ...prev, [uid]: [...(prev[uid] ?? []), task] };
      saveTasksMap(next);
      return next;
    });

  const removeTask = (uid: string, taskId: string) =>
    setTasksMap(prev => {
      const next = { ...prev, [uid]: (prev[uid] ?? []).filter(t => t.id !== taskId) };
      saveTasksMap(next);
      return next;
    });

  const updateTask = (uid: string, taskId: string, patch: Partial<Task>) =>
    setTasksMap(prev => {
      const next = {
        ...prev,
        [uid]: (prev[uid] ?? []).map(t => t.id === taskId ? { ...t, ...patch } : t),
      };
      saveTasksMap(next);
      return next;
    });

  const directSwapTask = (fromUserId: string, taskId: string, toUserId: string) => {
    setTasksMap(prev => {
      const fromTasks = prev[fromUserId] ?? [];
      const task = fromTasks.find(t => t.id === taskId);
      if (!task) return prev;
      const movedTask = { ...task, assignedTo: toUserId, status: 'pending' as const };
      const next = {
        ...prev,
        [fromUserId]: fromTasks.filter(t => t.id !== taskId),
        [toUserId]: [...(prev[toUserId] ?? []), movedTask],
      };
      saveTasksMap(next);
      return next;
    });
  };

  const createSwapRequest = (data: Omit<SwapRequest, 'id' | 'createdAt' | 'status'>) => {
    const req: SwapRequest = {
      ...data,
      id: `swap-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setSwaps(prev => {
      const next = [req, ...prev];
      saveSwaps(next);
      return next;
    });
  };

  const respondToSwap = (id: string, accepted: boolean) => {
    setSwaps(prev => {
      const next = prev.map(r =>
        r.id === id ? { ...r, status: accepted ? 'accepted' as const : 'rejected' as const } : r
      );
      saveSwaps(next);
      return next;
    });
    if (accepted) {
      const req = swaps.find(r => r.id === id);
      if (req) updateTask(req.requesterId, req.requesterTaskId, { status: 'swapped' });
    }
  };

  const pendingSwapsForUser = (uid: string) =>
    swaps.filter(r => r.targetId === uid && r.status === 'pending');

  const sentSwapsForUser = (uid: string) =>
    swaps.filter(r => r.requesterId === uid);

  return (
    <Ctx.Provider value={{
      getTasksForUser, addTask, removeTask, updateTask, directSwapTask,
      swapRequests: swaps, createSwapRequest, respondToSwap,
      pendingSwapsForUser, sentSwapsForUser,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useGuestCalendar() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useGuestCalendar must be used within GuestCalendarProvider');
  return ctx;
}
