import { useState } from 'react';
import {
  Box, VStack, HStack, Text, SimpleGrid, Card, Badge, Button, Heading, Portal,
} from '@chakra-ui/react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus, Trash2, Check,
  RefreshCw, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import {
  startOfWeek, startOfMonth, endOfMonth, endOfWeek, addDays, addWeeks, addMonths,
  isSameDay, isSameMonth, parseISO, format, eachDayOfInterval, isToday,
} from 'date-fns';
import { it } from 'date-fns/locale';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useGuestCalendar } from '../../context/GuestCalendarContext';
import { useNotifications } from '../../context/NotificationContext';
import { mockUsers, type Task } from '../../data/mockData';
import { toaster } from '../../components/ui/toaster';

type ViewMode = 'month' | 'week' | 'day';

const TASK_TYPES = [
  { value: 'chore',      label: 'Turni',   color: 'blue'   },
  { value: 'therapy',    label: 'Terapia', color: 'purple' },
  { value: 'learning',   label: 'Studio',  color: 'cyan'   },
  { value: 'recreation', label: 'Svago',   color: 'green'  },
] as const;

function getColor(type: string) {
  switch (type) {
    case 'chore':      return 'blue';
    case 'therapy':    return 'purple';
    case 'learning':   return 'cyan';
    case 'recreation': return 'green';
    default:           return 'gray';
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'completed':           return 'Completato';
    case 'pending':             return 'Da Fare';
    case 'pending_verification':return 'In Verifica';
    case 'swapped':             return 'Scambio Richiesto';
    case 'failed':              return 'Non Completato';
    default:                    return status;
  }
}

// ─── Dialog nuovo evento ───────────────────────────────────────────────────────
interface NewEventDialogProps {
  date: Date;
  facilityId: string;
  assignedTo: string;
  onSave: (task: Task) => void;
  onClose: () => void;
}

function NewEventDialog({ date, facilityId, assignedTo, onSave, onClose }: NewEventDialogProps) {
  const [title, setTitle]       = useState('');
  const [time, setTime]         = useState('09:00');
  const [type, setType]         = useState<Task['type']>('chore');
  const [description, setDesc]  = useState('');

  const handleSave = () => {
    if (!title.trim()) return;
    const [h, m] = time.split(':').map(Number);
    const scheduled = new Date(date);
    scheduled.setHours(h, m, 0, 0);
    onSave({
      id: `t-${Date.now()}`,
      title: title.trim(),
      description,
      type,
      assignedTo,
      facilityId,
      difficultyWeight: 1,
      status: 'pending',
      scheduledFor: scheduled.toISOString(),
      requiresVerification: false,
    });
  };

  return (
    <Portal>
      <Box position="fixed" inset="0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} zIndex={1000} onClick={onClose} />
      <Box
        position="fixed" top="50%" left="50%"
        style={{ transform: 'translate(-50%,-50%)', width: 'min(480px, calc(100vw - 32px))' }}
        zIndex={1001} bg="white" borderRadius="2xl" shadow="2xl" overflow="hidden"
      >
        <Box h="6px" bg={`${TASK_TYPES.find(t => t.value === type)?.color ?? 'blue'}.400`} transition="background 0.2s" />
        <Box position="absolute" top="12px" right="12px" cursor="pointer" p={1} borderRadius="full" _hover={{ bg: 'gray.100' }} onClick={onClose}>
          <X size={16} color="#718096" />
        </Box>
        <Box p={6}>
          <input
            placeholder="Aggiungi titolo"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            style={{
              width: '100%', fontSize: '20px', fontWeight: '600',
              border: 'none', borderBottom: '2px solid #63B3ED', borderRadius: 0,
              padding: '0 0 8px 0', marginBottom: '20px', outline: 'none',
              color: '#1a202c', backgroundColor: 'transparent',
            }}
          />
          <HStack mb={5} gap={4}>
            <Box bg="gray.100" px={3} py={1} borderRadius="full">
              <Text fontSize="sm" color="gray.700" fontWeight="medium">
                {format(date, 'EEEE d MMMM', { locale: it })}
              </Text>
            </Box>
            <input
              type="time" value={time}
              onChange={e => setTime(e.target.value)}
              style={{ fontSize: '14px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#2d3748', backgroundColor: '#f7fafc' }}
            />
          </HStack>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" mb={2}>Tipo attività</Text>
          <HStack mb={5} gap={2} flexWrap="wrap">
            {TASK_TYPES.map(t => (
              <Box
                key={t.value} px={3} py={1} borderRadius="full" cursor="pointer"
                bg={type === t.value ? `${t.color}.400` : `${t.color}.100`}
                border="2px solid" borderColor={type === t.value ? `${t.color}.500` : `${t.color}.200`}
                onClick={() => setType(t.value)} transition="all 0.15s"
                _hover={{ bg: `${t.color}.200` }}
              >
                <Text fontSize="sm" fontWeight={type === t.value ? 'bold' : 'normal'} color={`${t.color}.800`}>
                  {t.label}
                </Text>
              </Box>
            ))}
          </HStack>
          <textarea
            placeholder="Descrizione (opzionale)" value={description}
            onChange={e => setDesc(e.target.value)} rows={3}
            style={{
              width: '100%', fontSize: '14px', padding: '8px 12px', borderRadius: '8px',
              border: '1px solid #e2e8f0', color: '#1a202c', backgroundColor: '#f7fafc',
              resize: 'none', outline: 'none', marginBottom: '24px', fontFamily: 'inherit',
            }}
          />
          <HStack justify="flex-end" gap={3}>
            <Button variant="ghost" colorPalette="gray" onClick={onClose}>Annulla</Button>
            <Button colorPalette="blue" onClick={handleSave} disabled={!title.trim()} px={6}>Salva</Button>
          </HStack>
        </Box>
      </Box>
    </Portal>
  );
}

// ─── Modal richiesta scambio ───────────────────────────────────────────────────
interface SwapModalProps {
  task: Task;
  facilityId: string;
  currentUser: { id: string; firstName: string; lastName: string } | null;
  onSubmit: (targetId: string, targetName: string) => void;
  onClose: () => void;
}

function SwapModal({ task, facilityId, currentUser, onSubmit, onClose }: SwapModalProps) {
  const [targetId, setTargetId] = useState('');
  const candidates = mockUsers.filter(
    u => u.roles.includes('guest') && u.facilityIds?.includes(facilityId) && u.id !== currentUser?.id
  );

  const handleSubmit = () => {
    if (!targetId) return;
    const target = candidates.find(u => u.id === targetId);
    if (target) onSubmit(targetId, `${target.firstName} ${target.lastName}`);
  };

  return (
    <Portal>
      <Box position="fixed" inset="0" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} zIndex={1000} onClick={onClose} />
      <Box
        position="fixed" top="50%" left="50%"
        style={{ transform: 'translate(-50%,-50%)', width: 'min(440px, calc(100vw - 32px))' }}
        zIndex={1001} bg="white" borderRadius="2xl" shadow="2xl" p={6}
      >
        <HStack justify="space-between" mb={4}>
          <Heading size="sm" color="gray.800">Richiedi Scambio Turno</Heading>
          <Box cursor="pointer" onClick={onClose}><X size={18} color="#718096" /></Box>
        </HStack>

        <Box p={3} bg="blue.50" borderRadius="lg" mb={4}>
          <Text fontSize="sm" color="blue.700" fontWeight="medium">{task.title}</Text>
          <Text fontSize="xs" color="blue.500">{format(parseISO(task.scheduledFor), 'EEEE d MMMM', { locale: it })}</Text>
        </Box>

        <Text fontSize="sm" color="gray.600" mb={2}>Seleziona con chi vuoi scambiare:</Text>
        <select
          value={targetId}
          onChange={e => setTargetId(e.target.value)}
          style={{
            width: '100%', padding: '8px 12px', borderRadius: '8px',
            border: '1px solid #e2e8f0', color: '#1a202c', backgroundColor: '#f7fafc',
            fontSize: '14px', marginBottom: '20px', outline: 'none', fontFamily: 'inherit',
          }}
        >
          <option value="">Seleziona un coinquilino…</option>
          {candidates.map(u => (
            <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
          ))}
        </select>

        <HStack justify="flex-end" gap={3}>
          <Button variant="ghost" colorPalette="gray" onClick={onClose}>Annulla</Button>
          <Button colorPalette="purple" disabled={!targetId} onClick={handleSubmit}>
            <RefreshCw size={14} /> Invia Richiesta
          </Button>
        </HStack>
      </Box>
    </Portal>
  );
}

// ─── Sezione richieste di scambio ricevute ─────────────────────────────────────
interface SwapRequestsSectionProps {
  swaps: ReturnType<ReturnType<typeof useGuestCalendar>['pendingSwapsForUser']>;
  onRespond: (id: string, accepted: boolean) => void;
}

function SwapRequestsSection({ swaps, onRespond }: SwapRequestsSectionProps) {
  if (swaps.length === 0) return null;
  return (
    <Box mb={6} p={4} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
      <HStack mb={3}>
        <AlertTriangle size={18} color="var(--chakra-colors-purple-600)" />
        <Text fontWeight="bold" color="purple.700">
          {swaps.length} richiesta{swaps.length > 1 ? 'e' : ''} di scambio ricevuta{swaps.length > 1 ? 'e' : ''}
        </Text>
      </HStack>
      <VStack align="stretch" gap={2}>
        {swaps.map(req => (
          <HStack key={req.id} p={3} bg="white" borderRadius="lg" shadow="sm" justify="space-between" flexWrap="wrap" gap={2}>
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="semibold" color="gray.800">
                {req.requesterName} vuole scambiare:
              </Text>
              <Text fontSize="sm" color="purple.600">"{req.requesterTaskTitle}"</Text>
            </VStack>
            <HStack gap={2}>
              <Button size="xs" colorPalette="green" onClick={() => {
                onRespond(req.id, true);
                toaster.create({ title: 'Scambio accettato', type: 'success' });
              }}>
                <Check size={12} /> Accetta
              </Button>
              <Button size="xs" colorPalette="red" variant="outline" onClick={() => {
                onRespond(req.id, false);
                toaster.create({ title: 'Scambio rifiutato', type: 'info' });
              }}>
                <X size={12} /> Rifiuta
              </Button>
            </HStack>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
}

// ─── Componente principale ─────────────────────────────────────────────────────
export function GuestCalendarPage() {
  const { guestId } = useParams<{ guestId?: string }>();
  const { user, guestAccounts } = useAuth();
  const {
    getTasksForUser, addTask, removeTask, updateTask, directSwapTask,
    pendingSwapsForUser, sentSwapsForUser, createSwapRequest, respondToSwap,
  } = useGuestCalendar();
  const { addNotification } = useNotifications();

  const [view, setView]               = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);
  const [swapModal, setSwapModal]     = useState<Task | null>(null);

  // Utente target (educatore che vede il calendario di un ospite, oppure l'ospite stesso)
  const targetUserId = guestId ?? user?.id ?? '';
  const isEducatorView = !!guestId;

  const allUsers = [
    ...mockUsers,
    ...guestAccounts.map(a => a.user),
  ];
  const targetUser = allUsers.find(u => u.id === targetUserId);
  const facilityId = targetUser?.facilityIds?.[0] ?? 'f1';

  const tasks = getTasksForUser(targetUserId);
  const pendingSwaps = !isEducatorView && user ? pendingSwapsForUser(user.id) : [];
  const incomingSwapsForTarget = isEducatorView ? pendingSwapsForUser(targetUserId) : [];
  const sentSwaps = sentSwapsForUser(targetUserId);
  const swapByTaskId = new Map(sentSwaps.filter(s => s.status === 'pending').map(s => [s.requesterTaskId, s]));

  const getTasksForDate = (date: Date) =>
    tasks.filter(t => {
      try { return t.scheduledFor && isSameDay(parseISO(t.scheduledFor), date); }
      catch { return false; }
    });

  const handleAddTask = (task: Task) => {
    addTask(targetUserId, { ...task, createdByRole: isEducatorView ? 'educator' : 'guest' });
    setNewEventDate(null);
  };

  const handleDeleteTask = (taskId: string) => {
    removeTask(targetUserId, taskId);
    setSelectedTask(null);
    setDeleteConfirm(false);
  };

  const handleCompleteTask = (task: Task) => {
    updateTask(targetUserId, task.id, {
      status: task.requiresVerification ? 'pending_verification' : 'completed',
      completedAt: new Date().toISOString(),
    });
    setSelectedTask(null);
    toaster.create({ title: 'Ottimo lavoro!', type: 'success' });
  };

  const handleSwapSubmit = (targetId: string, targetName: string) => {
    if (!swapModal) return;
    if (isEducatorView) {
      directSwapTask(targetUserId, swapModal.id, targetId);
      toaster.create({ title: `Turno spostato a ${targetName}`, type: 'success' });
    } else {
      if (!user) return;
      createSwapRequest({
        requesterId: user.id,
        requesterName: `${user.firstName} ${user.lastName}`,
        targetId,
        targetName,
        requesterTaskId: swapModal.id,
        requesterTaskTitle: swapModal.title,
      });
      addNotification({
        userId: targetId,
        title: 'Richiesta di scambio turno',
        message: `${user.firstName} ${user.lastName} vuole scambiare il turno "${swapModal.title}" con te.`,
      });
      toaster.create({ title: 'Richiesta di scambio inviata!', type: 'success' });
    }
    setSwapModal(null);
    setSelectedTask(null);
  };

  // ── Navigazione ──
  const next = () => {
    if (view === 'month')     setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else                      setCurrentDate(addDays(currentDate, 1));
    setSelectedTask(null);
  };
  const prev = () => {
    if (view === 'month')     setCurrentDate(addMonths(currentDate, -1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else                      setCurrentDate(addDays(currentDate, -1));
    setSelectedTask(null);
  };
  const today = () => { setCurrentDate(new Date()); setSelectedTask(null); };

  // ── Header ──
  const renderHeader = () => (
    <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
      <HStack>
        <CalendarIcon size={26} color="var(--chakra-colors-blue-600)" />
        <Heading size="lg" color="gray.800">
          {isEducatorView && targetUser
            ? `Calendario di ${targetUser.firstName} ${targetUser.lastName}`
            : 'Il Mio Calendario'}
        </Heading>
      </HStack>
      <HStack bg="gray.100" p={1} borderRadius="md">
        {(['day', 'week', 'month'] as ViewMode[]).map(v => (
          <Button
            key={v} size="sm"
            variant={view === v ? 'solid' : 'ghost'}
            colorPalette={view === v ? 'blue' : 'gray'}
            color={view === v ? undefined : 'gray.800'}
            _hover={view === v ? undefined : { bg: 'gray.200' }}
            onClick={() => setView(v)}
          >
            {v === 'day' ? 'Giorno' : v === 'week' ? 'Settimana' : 'Mese'}
          </Button>
        ))}
      </HStack>
    </HStack>
  );

  const renderControls = () => {
    const fmt = view === 'month' ? 'MMMM yyyy' : (view === 'day' ? 'dd MMMM yyyy' : "'Settimana del' dd-MM-yyyy");
    const display = view === 'week' ? startOfWeek(currentDate, { weekStartsOn: 1 }) : currentDate;
    return (
      <HStack justify="center" mb={6} gap={4}>
        <Button variant="outline" size="sm" onClick={today} color="gray.800" borderColor="gray.300" _hover={{ bg: 'gray.100' }}>Oggi</Button>
        <Box cursor="pointer" onClick={prev}><ChevronLeft size={24} color="gray" /></Box>
        <Text fontWeight="bold" fontSize="lg" minW="200px" textAlign="center" color="gray.800" textTransform={view === 'week' ? 'none' : 'capitalize'}>
          {format(display, fmt, { locale: it })}
        </Text>
        <Box cursor="pointer" onClick={next}><ChevronRight size={24} color="gray" /></Box>
      </HStack>
    );
  };

  // ── Vista mese ──
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const days = eachDayOfInterval({
      start: startOfWeek(monthStart, { weekStartsOn: 1 }),
      end: endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 }),
    });
    return (
      <Box>
        <SimpleGrid columns={7} gap={2} mb={2}>
          {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d => (
            <Text key={d} fontSize="sm" fontWeight="bold" color="gray.500" textAlign="center">{d}</Text>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} gap={2}>
          {days.map((day, i) => {
            const today_    = isToday(day);
            const curMonth  = isSameMonth(day, monthStart);
            const dayTasks  = getTasksForDate(day);
            return (
              <Card.Root
                key={i} p={1} minH="90px"
                bg={today_ ? 'blue.50' : curMonth ? 'white' : 'gray.50'}
                color={curMonth ? 'gray.800' : 'gray.400'}
                borderRadius="lg"
                border={today_ ? '1px solid var(--chakra-colors-blue-300)' : '1px solid var(--chakra-colors-gray-100)'}
                shadow="sm"
                cursor={isEducatorView ? 'pointer' : 'default'}
                onClick={() => isEducatorView && setNewEventDate(day)}
              >
                <Text fontWeight="bold" mb={1} ml={1} color={today_ ? 'blue.600' : curMonth ? 'gray.700' : 'gray.400'}>
                  {format(day, 'd')}
                </Text>
                <VStack align="stretch" gap={1}>
                  {dayTasks.slice(0, 3).map(task => {
                    const isSwapped = swapByTaskId.has(task.id);
                    return (
                      <Badge
                        key={task.id}
                        colorPalette={isSwapped ? 'purple' : getColor(task.type)}
                        fontSize="2xs" w="100%" textAlign="left" py={0.5} px={1} borderRadius="sm"
                        cursor="pointer" opacity={task.status === 'completed' ? 0.6 : 1}
                        onClick={e => { e.stopPropagation(); setSelectedTask(task); setDeleteConfirm(false); }}
                        lineClamp={1}
                      >
                        {isSwapped ? '⇄ ' : ''}{format(parseISO(task.scheduledFor), 'H:mm')} {task.title}
                      </Badge>
                    );
                  })}
                  {dayTasks.length > 3 && <Text fontSize="xs" color="gray.500" textAlign="center">+{dayTasks.length - 3}</Text>}
                </VStack>
              </Card.Root>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  };

  // ── Vista settimana ──
  const renderWeekView = () => {
    const COLUMN_HEIGHT = 480;
    const taskH = Math.floor((COLUMN_HEIGHT - 36) * 0.20);
    const lines = Math.max(1, Math.floor(taskH / 15));
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 6) });

    return (
      <Box>
        <SimpleGrid columns={7} gap={2} mb={2}>
          {['Lun','Mar','Mer','Gio','Ven','Sab','Dom'].map(d => (
            <Text key={d} fontSize="sm" fontWeight="bold" color="gray.500" textAlign="center">{d}</Text>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} gap={2}>
          {days.map((day, i) => {
            const today_ = isToday(day);
            const dayTasks = getTasksForDate(day);
            return (
              <Card.Root
                key={i} p={2} h={`${COLUMN_HEIGHT}px`}
                bg={today_ ? 'blue.50' : 'white'} color="gray.800"
                borderRadius="lg"
                border={today_ ? '1px solid var(--chakra-colors-blue-300)' : '1px solid var(--chakra-colors-gray-100)'}
                shadow="sm" display="flex" flexDirection="column"
              >
                <Text fontWeight="bold" mb={2} textAlign="center" fontSize="sm"
                  color={today_ ? 'blue.600' : 'gray.700'} flexShrink={0}
                >
                  {format(day, 'd')}
                </Text>
                <VStack align="stretch" gap="4px" overflowY="auto" flex="1">
                  {dayTasks.map(task => {
                    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
                    const isPending = task.status === 'pending';
                    const isHovered = hoveredTaskId === task.id;
                    const guestCanDelete = task.createdByRole === 'guest';
                    const showDeleteBtn = isHovered && (isEducatorView || guestCanDelete);
                    const showCompleteBtn = isHovered && isPending;
                    const showSwapBtn = isHovered && isPending
                      && (isEducatorView || parseISO(task.scheduledFor) > twoHoursFromNow);
                    return (
                    <Box
                      key={task.id} h={`${taskH}px`} flexShrink={0} position="relative"
                      bg={`var(--chakra-colors-${getColor(task.type)}-300)`}
                      borderLeft="3px solid" borderColor={`var(--chakra-colors-${getColor(task.type)}-600)`}
                      borderRadius="md" px={1} pt={1} display="flex" flexDirection="column"
                      alignItems="flex-start" overflow="hidden"
                      cursor="pointer" opacity={task.status === 'completed' ? 0.6 : 1}
                      onClick={() => { setSelectedTask(task); setDeleteConfirm(false); }}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                    >
                      <HStack w="full" justify="space-between" flexShrink={0} gap={0}>
                        <HStack gap={1}>
                          <Text fontSize="2xs" fontWeight="bold" color={`${getColor(task.type)}.700`} lineHeight="1.3">
                            {format(parseISO(task.scheduledFor), 'H:mm')}
                          </Text>
                          {swapByTaskId.has(task.id) && (
                            <Box title={`Scambio richiesto con ${swapByTaskId.get(task.id)!.targetName}`}>
                              <RefreshCw size={9} color="var(--chakra-colors-purple-600)" />
                            </Box>
                          )}
                        </HStack>
                        {showDeleteBtn && (
                          <Box
                            borderRadius="md" p="4px"
                            cursor="pointer" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                            onClick={e => { e.stopPropagation(); handleDeleteTask(task.id); }}
                            _hover={{ bg: 'red.100' }}
                            title="Elimina"
                          >
                            <Trash2 size={24} color="#C53030" />
                          </Box>
                        )}
                      </HStack>
                      <Text fontSize="xs" fontWeight="500" color={`${getColor(task.type)}.800`}
                        lineHeight="1.2" overflow="hidden" lineClamp={Math.max(1, lines - 1)}
                      >
                        {task.title}
                      </Text>
                      {(showCompleteBtn || showSwapBtn) && (
                        <HStack position="absolute" bottom="3px" right="3px" gap="2px">
                          {showCompleteBtn && (
                            <Box
                              borderRadius="md" p="4px"
                              cursor="pointer" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                              onClick={e => { e.stopPropagation(); handleCompleteTask(task); }}
                              _hover={{ bg: 'green.100' }}
                              title="Segna come fatto"
                            >
                              <CheckCircle2 size={24} color="var(--chakra-colors-green-600)" />
                            </Box>
                          )}
                          {showSwapBtn && (
                            <Box
                              borderRadius="md" p="4px"
                              cursor="pointer" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}
                              onClick={e => { e.stopPropagation(); setSwapModal(task); }}
                              _hover={{ bg: 'purple.100' }}
                              title="Richiedi scambio"
                            >
                              <RefreshCw size={24} color="var(--chakra-colors-purple-600)" />
                            </Box>
                          )}
                        </HStack>
                      )}
                    </Box>
                    );
                  })}
                </VStack>
                {/* Pulsante aggiungi */}
                <Box
                  h="24px" flexShrink={0} mt="4px"
                  bg="green.400" borderRadius="md"
                  display="flex" alignItems="center" justifyContent="center"
                  cursor="pointer" onClick={() => setNewEventDate(day)}
                  _hover={{ bg: 'green.500' }} transition="background 0.15s"
                >
                  <Plus size={16} color="white" />
                </Box>
              </Card.Root>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  };

  // ── Vista giorno ──
  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);
    return (
      <Card.Root p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm" minH="400px">
        <Heading size="md" mb={6} textAlign="center" color="blue.600">
          {format(currentDate, 'EEEE d MMMM', { locale: it })}
        </Heading>
        {dayTasks.length === 0 ? (
          <VStack gap={3} mt={10}>
            <Text textAlign="center" color="gray.500">Nessun evento per questa giornata</Text>
            <Button size="sm" colorPalette="green" onClick={() => setNewEventDate(currentDate)}>
              <Plus size={14} /> Aggiungi evento
            </Button>
          </VStack>
        ) : (
          <VStack align="stretch" gap={4}>
            {dayTasks.map(task => (
              <Card.Root
                key={task.id} p={4}
                borderLeft="4px solid" borderColor={`var(--chakra-colors-${getColor(task.type)}-500)`}
                bg={`${getColor(task.type)}.50`} color="gray.800"
                cursor="pointer" opacity={task.status === 'completed' ? 0.7 : 1}
                onClick={() => { setSelectedTask(task); setDeleteConfirm(false); }}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontSize="xs" fontWeight="bold" color={`${getColor(task.type)}.600`}>
                      {format(parseISO(task.scheduledFor), 'H:mm')}
                    </Text>
                    <Text fontWeight="bold" fontSize="lg">{task.title}</Text>
                    <Text fontSize="sm" color="gray.600">{task.description}</Text>
                  </VStack>
                  <VStack align="end">
                    <Badge colorPalette={getColor(task.type)}>{task.type}</Badge>
                    <Badge variant="outline" colorPalette="gray">{getStatusLabel(task.status)}</Badge>
                    {swapByTaskId.has(task.id) && (
                      <Badge colorPalette="purple">
                        <RefreshCw size={10} /> Scambio con {swapByTaskId.get(task.id)!.targetName.split(' ')[0]}
                      </Badge>
                    )}
                  </VStack>
                </HStack>
              </Card.Root>
            ))}
            <Button size="sm" colorPalette="green" alignSelf="flex-start" onClick={() => setNewEventDate(currentDate)}>
              <Plus size={14} /> Aggiungi evento
            </Button>
          </VStack>
        )}
      </Card.Root>
    );
  };

  // ── Pannello dettaglio task ──
  const renderTaskDetail = () => {
    if (!selectedTask) return null;
    const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const taskDate = parseISO(selectedTask.scheduledFor);
    const canSwap = !isEducatorView && selectedTask.status === 'pending' && taskDate > twoHoursFromNow;
    const canComplete = !isEducatorView && selectedTask.status === 'pending';

    return (
      <Card.Root mt={6} p={4} bg="blue.50" color="gray.800" border="1px solid" borderColor="blue.100" borderRadius="xl">
        <HStack justify="space-between" mb={2}>
          <Text fontWeight="bold" fontSize="lg" color="gray.800">{selectedTask.title}</Text>
          <Box cursor="pointer" onClick={() => { setSelectedTask(null); setDeleteConfirm(false); }}>
            <X size={20} color="gray" />
          </Box>
        </HStack>
        <Text mb={3} color="gray.600" fontSize="sm">{selectedTask.description}</Text>
        {swapByTaskId.has(selectedTask.id) && (
          <Box mb={3} px={3} py={2} bg="purple.50" borderRadius="lg" border="1px solid" borderColor="purple.200">
            <HStack gap={2}>
              <RefreshCw size={14} color="var(--chakra-colors-purple-600)" />
              <Text fontSize="sm" color="purple.700" fontWeight="medium">
                Scambio richiesto con {swapByTaskId.get(selectedTask.id)!.targetName}
              </Text>
            </HStack>
          </Box>
        )}
        <HStack justify="space-between" flexWrap="wrap" gap={3}>
          <HStack gap={3}>
            <Badge colorPalette={getColor(selectedTask.type)}>{selectedTask.type}</Badge>
            <Badge variant="outline" colorPalette="gray">{getStatusLabel(selectedTask.status)}</Badge>
          </HStack>
          <HStack gap={2} flexWrap="wrap">
            {canComplete && (
              <Button size="xs" colorPalette="green" onClick={() => handleCompleteTask(selectedTask)}>
                <CheckCircle2 size={12} /> Segna come fatto
              </Button>
            )}
            {canSwap && (
              <Button size="xs" colorPalette="purple" onClick={() => setSwapModal(selectedTask)}>
                <RefreshCw size={12} /> Richiedi Scambio
              </Button>
            )}
            {deleteConfirm ? (
              <HStack gap={2} bg="red.50" px={3} py={1} borderRadius="md" border="1px solid" borderColor="red.200">
                <Text fontSize="xs" color="gray.700">Eliminare?</Text>
                <Button size="xs" colorPalette="red" onClick={() => handleDeleteTask(selectedTask.id)}>
                  <Check size={11} /> Sì
                </Button>
                <Button size="xs" variant="outline" colorPalette="gray" onClick={() => setDeleteConfirm(false)}>
                  <X size={11} />
                </Button>
              </HStack>
            ) : (
              <Button size="xs" variant="outline" colorPalette="red" onClick={() => setDeleteConfirm(true)}>
                <Trash2 size={12} /> Elimina
              </Button>
            )}
          </HStack>
        </HStack>
      </Card.Root>
    );
  };

  // ── Render principale ──
  return (
    <Box p={4}>
      {/* Banner educatore */}
      {isEducatorView && targetUser && (
        <Box mb={4} p={3} bg="orange.50" borderRadius="lg" border="1px solid" borderColor="orange.200">
          <Text fontSize="sm" color="orange.700" fontWeight="semibold">
            Stai modificando il calendario di {targetUser.firstName} {targetUser.lastName}
          </Text>
        </Box>
      )}

      {/* Richieste di scambio ricevute dall'ospite — sola lettura per educatore */}
      {isEducatorView && incomingSwapsForTarget.length > 0 && (
        <Box mb={4} p={4} bg="purple.50" borderRadius="xl" border="1px solid" borderColor="purple.200">
          <HStack mb={3}>
            <RefreshCw size={16} color="var(--chakra-colors-purple-600)" />
            <Text fontWeight="bold" color="purple.700" fontSize="sm">
              {incomingSwapsForTarget.length} richiesta{incomingSwapsForTarget.length > 1 ? 'e' : ''} di scambio in arrivo
            </Text>
          </HStack>
          <VStack align="stretch" gap={2}>
            {incomingSwapsForTarget.map(req => (
              <HStack key={req.id} p={3} bg="white" borderRadius="lg" shadow="sm" justify="space-between">
                <VStack align="start" gap={0}>
                  <Text fontSize="sm" fontWeight="semibold" color="gray.800">{req.requesterName}</Text>
                  <Text fontSize="xs" color="purple.600">"{req.requesterTaskTitle}"</Text>
                </VStack>
                <Badge colorPalette="purple" variant="outline">In attesa risposta</Badge>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}

      {/* Richieste di scambio ricevute (solo vista ospite) */}
      <SwapRequestsSection
        swaps={pendingSwaps}
        onRespond={(id, accepted) => {
          respondToSwap(id, accepted);
          if (accepted) {
            const req = pendingSwaps.find(r => r.id === id);
            if (req && user) {
              addNotification({
                userId: req.requesterId,
                title: 'Scambio accettato!',
                message: `${user.firstName} ${user.lastName} ha accettato lo scambio del turno "${req.requesterTaskTitle}".`,
              });
            }
          }
        }}
      />

      {renderHeader()}
      {renderControls()}

      {view === 'month' && renderMonthView()}
      {view === 'week'  && renderWeekView()}
      {view === 'day'   && renderDayView()}

      {newEventDate && (
        <NewEventDialog
          date={newEventDate}
          facilityId={facilityId}
          assignedTo={targetUserId}
          onSave={handleAddTask}
          onClose={() => setNewEventDate(null)}
        />
      )}

      {renderTaskDetail()}

      {swapModal && user && (
        <SwapModal
          task={swapModal}
          facilityId={facilityId}
          currentUser={user}
          onSubmit={handleSwapSubmit}
          onClose={() => setSwapModal(null)}
        />
      )}

      <HStack mt={8} gap={4} fontSize="sm" flexWrap="wrap" justify="center">
        <Badge colorPalette="blue">Turni</Badge>
        <Badge colorPalette="purple">Terapia</Badge>
        <Badge colorPalette="cyan">Studio</Badge>
        <Badge colorPalette="green">Svago</Badge>
      </HStack>
    </Box>
  );
}
