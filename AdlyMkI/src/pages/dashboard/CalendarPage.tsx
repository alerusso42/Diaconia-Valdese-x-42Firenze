import { useState } from 'react';
import { Box, VStack, HStack, Text, SimpleGrid, Card, Badge, Button, Heading, Portal } from '@chakra-ui/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Plus, Trash2, Check } from 'lucide-react';
import { 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  addDays, 
  addWeeks, 
  addMonths, 
  isSameDay, 
  isSameMonth, 
  parseISO,
  format,
  eachDayOfInterval,
  isToday
} from 'date-fns';
import { it } from 'date-fns/locale';
import { type Task } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

type ViewMode = 'month' | 'week' | 'day';

const TASK_TYPES = [
  { value: 'chore',      label: 'Turni',    color: 'blue' },
  { value: 'therapy',    label: 'Terapia',  color: 'purple' },
  { value: 'learning',   label: 'Studio',   color: 'cyan' },
  { value: 'recreation', label: 'Svago',    color: 'green' },
] as const;

interface NewEventDialogProps {
  date: Date;
  facilityId: string;
  assignedTo: string;
  onSave: (task: Task) => void;
  onClose: () => void;
}

function NewEventDialog({ date, facilityId, assignedTo, onSave, onClose }: NewEventDialogProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [type, setType] = useState<'chore' | 'therapy' | 'learning' | 'recreation'>('chore');
  const [description, setDescription] = useState('');

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
      {/* Backdrop */}
      <Box
        position="fixed"
        top="0" left="0" right="0" bottom="0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        zIndex={1000}
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        position="fixed"
        top="50%"
        left="50%"
        style={{ transform: 'translate(-50%, -50%)', width: 'min(480px, calc(100vw - 32px))' }}
        zIndex={1001}
        bg="white"
        borderRadius="2xl"
        shadow="2xl"
        overflow="hidden"
      >
        {/* Striscia colore */}
        <Box h="6px" bg={`${TASK_TYPES.find(t => t.value === type)?.color}.400`} transition="background 0.2s" />

        {/* Bottone chiudi */}
        <Box
          position="absolute" top="12px" right="12px"
          cursor="pointer" p={1} borderRadius="full"
          _hover={{ bg: 'gray.100' }}
          onClick={onClose}
          zIndex={1}
        >
          <X size={16} color="#718096" />
        </Box>

        <Box p={6}>
          {/* Titolo */}
          <input
            placeholder="Aggiungi titolo"
            value={title}
            onChange={e => setTitle(e.target.value)}
            autoFocus
            style={{
              width: '100%',
              fontSize: '20px',
              fontWeight: '600',
              border: 'none',
              borderBottom: '2px solid #63B3ED',
              borderRadius: 0,
              padding: '0 0 8px 0',
              marginBottom: '20px',
              outline: 'none',
              color: '#1a202c',
              backgroundColor: 'transparent',
            }}
          />

          {/* Data + ora */}
          <HStack mb={5} gap={4} align="center">
            <Box bg="gray.100" px={3} py={1} borderRadius="full">
              <Text fontSize="sm" color="gray.700" fontWeight="medium">
                {format(date, 'EEEE d MMMM', { locale: it })}
              </Text>
            </Box>
            <input
              type="time"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={{ fontSize: '14px', padding: '4px 8px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#2d3748', backgroundColor: '#f7fafc', colorScheme: 'light' }}
            />
          </HStack>

          {/* Tipo attività */}
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
            Tipo attività
          </Text>
          <HStack mb={5} gap={2} flexWrap="wrap">
            {TASK_TYPES.map(t => (
              <Box
                key={t.value}
                px={3} py={1} borderRadius="full" cursor="pointer"
                bg={type === t.value ? `${t.color}.400` : `${t.color}.100`}
                border="2px solid"
                borderColor={type === t.value ? `${t.color}.500` : `${t.color}.200`}
                onClick={() => setType(t.value)}
                transition="all 0.15s"
                _hover={{ bg: `${t.color}.200` }}
              >
                <Text fontSize="sm" fontWeight={type === t.value ? 'bold' : 'normal'} color={`${t.color}.800`}>
                  {t.label}
                </Text>
              </Box>
            ))}
          </HStack>

          {/* Descrizione */}
          <textarea
            placeholder="Aggiungi descrizione (opzionale)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              fontSize: '14px',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              color: '#1a202c',
              backgroundColor: '#f7fafc',
              resize: 'none',
              outline: 'none',
              marginBottom: '24px',
              fontFamily: 'inherit',
            }}
          />

          {/* Azioni */}
          <HStack justify="flex-end" gap={3}>
            <Button variant="ghost" colorPalette="gray" onClick={onClose}>Annulla</Button>
            <Button
              colorPalette="blue"
              onClick={handleSave}
              disabled={!title.trim()}
              px={6}
            >
              Salva
            </Button>
          </HStack>
        </Box>
      </Box>
    </Portal>
  );
}

export function CalendarPage() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [localTasks, setLocalTasks] = useState<Task[]>([]);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null);

  // Filter tasks based on role
  const relevantTasks = localTasks.filter(task => {
    if (!user) return false;
    if (user.roles.includes('educator') || user.roles.includes('coordinator')) {
      return user.facilityIds?.includes(task.facilityId);
    }
    return task.assignedTo === user.id;
  });

  const handleAddTask = (task: Task) => {
    setLocalTasks(prev => [...prev, task]);
    setNewEventDate(null);
  };

  const getTasksForDate = (date: Date) => {
    return relevantTasks.filter(t => t.scheduledFor && isSameDay(parseISO(t.scheduledFor), date));
  };

  const getColor = (type: string) => {
    switch(type) {
      case 'chore': return 'blue';
      case 'therapy': return 'purple';
      case 'learning': return 'cyan';
      case 'recreation': return 'green';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'Completato';
      case 'pending': return 'Da Fare';
      case 'pending_verification': return 'In Verifica';
      case 'swapped': return 'Scambio Richiesto';
      default: return status;
    }
  };

  const next = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
    setSelectedTask(null);
  };

  const prev = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, -1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, -1));
    else setCurrentDate(addDays(currentDate, -1));
    setSelectedTask(null);
  };

  const today = () => {
    setCurrentDate(new Date());
    setSelectedTask(null);
  };

  const renderHeader = () => {
    let dateFormat = '';
    if (view === 'month') dateFormat = 'MMMM yyyy';
    else if (view === 'week') dateFormat = "'Settimana del' d MMMM yyyy";
    else dateFormat = 'EEEE d MMMM yyyy';

    return (
      <HStack justify="space-between" mb={6} flexWrap="wrap" gap={4}>
        <HStack>
          <CalendarIcon size={28} color="var(--chakra-colors-blue-600)" />
          <Heading size="lg" color="gray.800">Calendario</Heading>
        </HStack>
        <HStack gap={4}>
          <HStack bg="gray.100" p={1} borderRadius="md">
            <Button size="sm" variant={view === 'day' ? 'solid' : 'ghost'} colorPalette={view === 'day' ? 'blue' : 'gray'} color={view === 'day' ? undefined : 'gray.800'} _hover={view === 'day' ? undefined : { bg: 'gray.200', color: 'gray.900' }} onClick={() => setView('day')}>Giorno</Button>
            <Button size="sm" variant={view === 'week' ? 'solid' : 'ghost'} colorPalette={view === 'week' ? 'blue' : 'gray'} color={view === 'week' ? undefined : 'gray.800'} _hover={view === 'week' ? undefined : { bg: 'gray.200', color: 'gray.900' }} onClick={() => setView('week')}>Settimana</Button>
            <Button size="sm" variant={view === 'month' ? 'solid' : 'ghost'} colorPalette={view === 'month' ? 'blue' : 'gray'} color={view === 'month' ? undefined : 'gray.800'} _hover={view === 'month' ? undefined : { bg: 'gray.200', color: 'gray.900' }} onClick={() => setView('month')}>Mese</Button>
          </HStack>
        </HStack>
      </HStack>
    );
  };

  const renderControls = () => {
    let dateFormat = view === 'month' ? 'MMMM yyyy' : (view === 'day' ? 'dd MMMM yyyy' : "'Settimana del' dd-MM-yyyy");
    
    let displayDate = currentDate;
    if (view === 'week') {
      displayDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    }

    return (
      <HStack justify="center" mb={6} gap={4}>
        <Button variant="outline" size="sm" onClick={today} color="gray.800" borderColor="gray.300" _hover={{ bg: 'gray.100', color: 'gray.900' }}>Oggi</Button>
        <Box cursor="pointer" onClick={prev}>
          <ChevronLeft size={24} color="gray" />
        </Box>
        <Text fontWeight="bold" fontSize="lg" minW="200px" textAlign="center" textTransform={view === 'week' ? 'none' : 'capitalize'} color="gray.800">
          {format(displayDate, dateFormat, { locale: it })}
        </Text>
        <Box cursor="pointer" onClick={next}>
          <ChevronRight size={24} color="gray" />
        </Box>
      </HStack>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = "d";
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    return (
      <Box>
        <SimpleGrid columns={7} gap={2} mb={2}>
          {weekDays.map(d => (
            <Box key={d} textAlign="center">
              <Text fontSize="sm" fontWeight="bold" color="gray.500">{d}</Text>
            </Box>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} gap={2}>
          {days.map((day, idx) => {
            const isTodayDate = isToday(day);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const dayTasks = getTasksForDate(day);

            return (
              <Card.Root 
                key={idx} 
                p={1} 
                minH="100px" 
                bg={isTodayDate ? "blue.50" : (isCurrentMonth ? "white" : "gray.50")} 
                color={isCurrentMonth ? "gray.800" : "gray.400"}
                borderRadius="lg" 
                border={isTodayDate ? '1px solid var(--chakra-colors-blue-300)' : '1px solid var(--chakra-colors-gray-100)'}
                shadow="sm"
              >
                <Text fontWeight="bold" mb={1} ml={1} color={isTodayDate ? 'blue.600' : (isCurrentMonth ? 'gray.700' : 'gray.400')}>
                  {format(day, dateFormat)}
                </Text>
                
                <VStack align="stretch" gap={1}>
                  {dayTasks.slice(0, 3).map(task => (
                    <Badge 
                      key={task.id} 
                      colorPalette={getColor(task.type)} 
                      fontSize="2xs" 
                      w="100%" 
                      textAlign="center" 
                      py={0.5} 
                      px={0} 
                      borderRadius="sm" 
                      cursor="pointer"
                      onClick={(e) => { e.stopPropagation(); setSelectedTask(task); }}
                      opacity={task.status === 'completed' ? 0.6 : 1}
                      lineClamp={1}
                    >
                      {task.title}
                    </Badge>
                  ))}
                  {dayTasks.length > 3 && (
                    <Text fontSize="xs" color="gray.500" textAlign="center">+{dayTasks.length - 3}</Text>
                  )}
                </VStack>
              </Card.Root>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  };

  const renderWeekView = () => {
    const COLUMN_HEIGHT = 500;
    const HEADER_HEIGHT = 36;
    const GAP_PX = 4;
    const TASK_HEIGHT_RATIO = 0.20; // ogni task occupa il 20% della colonna

    const taskHeight = Math.floor((COLUMN_HEIGHT - HEADER_HEIGHT) * TASK_HEIGHT_RATIO);
    const lines = Math.max(1, Math.floor(taskHeight / 15));

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: addDays(startDate, 6) });
    const weekDays = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

    return (
      <Box>
        <SimpleGrid columns={7} gap={2} mb={2}>
          {weekDays.map(d => (
            <Box key={d} textAlign="center">
              <Text fontSize="sm" fontWeight="bold" color="gray.500">{d}</Text>
            </Box>
          ))}
        </SimpleGrid>
        <SimpleGrid columns={7} gap={2}>
          {days.map((day, idx) => {
            const isTodayDate = isToday(day);
            const dayTasks = getTasksForDate(day);

            return (
              <Card.Root
                key={idx}
                p={2}
                h={`${COLUMN_HEIGHT}px`}
                bg={isTodayDate ? "blue.50" : "white"}
                color="gray.800"
                borderRadius="lg"
                border={isTodayDate ? '1px solid var(--chakra-colors-blue-300)' : '1px solid var(--chakra-colors-gray-100)'}
                shadow="sm"
                display="flex"
                flexDirection="column"
              >
                <Text fontWeight="bold" mb={2} textAlign="center" fontSize="sm" color={isTodayDate ? 'blue.600' : 'gray.700'} flexShrink={0}>
                  {format(day, 'd')}
                </Text>

                <VStack align="stretch" gap={`${GAP_PX}px`} overflowY="auto" flex="1">
                  {dayTasks.map(task => (
                    <Box
                      key={task.id}
                      h={`${taskHeight}px`}
                      flexShrink={0}
                      position="relative"
                      bg={`var(--chakra-colors-${getColor(task.type)}-300)`}
                      borderLeft="3px solid"
                      borderColor={`var(--chakra-colors-${getColor(task.type)}-600)`}
                      borderRadius="md"
                      px={1}
                      display="flex"
                      alignItems="center"
                      overflow="hidden"
                      cursor="pointer"
                      onClick={() => setSelectedTask(task)}
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      opacity={task.status === 'completed' ? 0.6 : 1}
                    >
                      <Text
                        fontSize="xs"
                        fontWeight="500"
                        color={`${getColor(task.type)}.800`}
                        lineHeight="1.2"
                        overflow="hidden"
                        lineClamp={lines}
                        pr={hoveredTaskId === task.id ? '16px' : '0'}
                      >
                        {task.title}
                      </Text>
                      {hoveredTaskId === task.id && (
                        <Box
                          position="absolute"
                          top="3px"
                          right="3px"
                          borderRadius="sm"
                          p="2px"
                          cursor="pointer"
                          style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocalTasks(prev => prev.filter(t => t.id !== task.id));
                            if (selectedTask?.id === task.id) { setSelectedTask(null); setDeleteConfirm(false); }
                          }}
                          _hover={{ bg: 'red.100' }}
                        >
                          <Trash2 size={17} color="#C53030" />
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>

                {/* Bottone + */}
                <Box
                  h="24px"
                  flexShrink={0}
                  mt={`${GAP_PX}px`}
                  bg="green.400"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  cursor="pointer"
                  onClick={() => setNewEventDate(day)}
                  _hover={{ bg: "green.500" }}
                  transition="background 0.15s"
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

  const renderDayView = () => {
    const dayTasks = getTasksForDate(currentDate);

    return (
      <Card.Root p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm" minH="400px">
        <Heading size="md" mb={6} textAlign="center" color="blue.600">
          {format(currentDate, "EEEE d MMMM", { locale: it })}
        </Heading>
        {dayTasks.length === 0 ? (
          <Text textAlign="center" color="gray.500" mt={10}>Nessun evento per questa giornata</Text>
        ) : (
          <VStack align="stretch" gap={4}>
            {dayTasks.map(task => (
              <Card.Root 
                key={task.id} 
                p={4} 
                borderLeft="4px solid" 
                borderColor={`var(--chakra-colors-${getColor(task.type)}-500)`}
                bg={`${getColor(task.type)}.50`}
                color="gray.800"
                cursor="pointer"
                onClick={() => setSelectedTask(task)}
                opacity={task.status === 'completed' ? 0.7 : 1}
              >
                <HStack justify="space-between">
                  <VStack align="start" gap={1}>
                    <Text fontWeight="bold" fontSize="lg">{task.title}</Text>
                    <Text fontSize="sm" color="gray.600">{task.description}</Text>
                  </VStack>
                  <VStack align="end">
                    <Badge colorPalette={getColor(task.type)}>{task.type}</Badge>
                    <Badge variant="outline" colorPalette="gray">{getStatusLabel(task.status)}</Badge>
                  </VStack>
                </HStack>
              </Card.Root>
            ))}
          </VStack>
        )}
      </Card.Root>
    );
  };

  return (
    <Box p={4}>
      {renderHeader()}
      {renderControls()}

      {view === 'month' && renderMonthView()}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}

      {newEventDate && (
        <NewEventDialog
          date={newEventDate}
          facilityId={user?.facilityIds?.[0] ?? 'f1'}
          assignedTo={user?.id ?? 'u3'}
          onSave={handleAddTask}
          onClose={() => setNewEventDate(null)}
        />
      )}

      {selectedTask && (
        <Card.Root mt={6} p={4} bg="blue.50" color="gray.800" border="1px solid" borderColor="blue.100" borderRadius="xl">
          <HStack justify="space-between" mb={2}>
            <Text fontWeight="bold" fontSize="lg" color="gray.800">{selectedTask.title}</Text>
            <Box cursor="pointer" onClick={() => { setSelectedTask(null); setDeleteConfirm(false); }}>
              <X size={20} color="gray" />
            </Box>
          </HStack>
          <Text mb={3} color="gray.600" fontSize="sm">{selectedTask.description}</Text>
          <HStack justify="space-between" flexWrap="wrap" gap={2}>
            <HStack gap={3}>
              <Badge colorPalette={getColor(selectedTask.type)}>{selectedTask.type}</Badge>
              <Badge variant="outline" colorPalette="gray">{getStatusLabel(selectedTask.status)}</Badge>
            </HStack>
            {deleteConfirm ? (
              <HStack gap={2} bg="red.50" px={3} py={1} borderRadius="md" border="1px solid" borderColor="red.200">
                <Text fontSize="xs" color="gray.700">Eliminare?</Text>
                <Button size="xs" colorPalette="red" onClick={() => {
                  setLocalTasks(prev => prev.filter(t => t.id !== selectedTask.id));
                  setSelectedTask(null);
                  setDeleteConfirm(false);
                }}>
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
        </Card.Root>
      )}

      <HStack mt={8} gap={4} fontSize="sm" flexWrap="wrap" justify="center">
         <Box><Badge colorPalette="blue" mr={2}>Turni</Badge></Box>
         <Box><Badge colorPalette="purple" mr={2}>Terapia</Badge></Box>
         <Box><Badge colorPalette="cyan" mr={2}>Studio</Badge></Box>
         <Box><Badge colorPalette="green" mr={2}>Svago</Badge></Box>
      </HStack>
    </Box>
  );
}