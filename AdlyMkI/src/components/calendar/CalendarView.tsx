import { useState } from 'react';
import { Box, VStack, HStack, Text, SimpleGrid, Card, Badge } from '@chakra-ui/react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { startOfWeek, addDays, addWeeks, isSameDay, parseISO, format } from 'date-fns';
import { type Task } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useGuestCalendar } from '../../context/GuestCalendarContext';

interface CalendarViewProps {
  targetUserId?: string;
}

export function CalendarView({ targetUserId }: CalendarViewProps = {}) {
  const { user } = useAuth();
  const { getTasksForUser } = useGuestCalendar();
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const baseDate = new Date();
  const targetDate = addWeeks(baseDate, weekOffset);
  const startDate = startOfWeek(targetDate, { weekStartsOn: 0 }); // Dom-first

  const resolvedUserId = targetUserId ?? user?.id ?? '';
  const relevantTasks = getTasksForUser(resolvedUserId);

  const daysLabel = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
  const currentWeek = Array.from({ length: 7 }).map((_, idx) => {
    const date = addDays(startDate, idx);
    const dayTasks = relevantTasks.filter(t => t.scheduledFor && isSameDay(parseISO(t.scheduledFor), date));
    return { date, dayTasks };
  });

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

  const monthYearLabel = targetDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <CalendarIcon size={24} color="gray" />
          <Text fontWeight="bold" fontSize="xl" color="gray.800">
            {weekOffset === 0 ? 'Settimana Attuale' : 'Calendario'}
          </Text>
        </HStack>
        <HStack gap={4}>
          <Box cursor="pointer" onClick={() => { setWeekOffset(prev => prev - 1); setSelectedTask(null); }}>
            <ChevronLeft size={24} color="gray" />
          </Box>
          <Text fontWeight="medium" minW="100px" textAlign="center" textTransform="capitalize" color="gray.800">
            {monthYearLabel}
          </Text>
          <Box cursor="pointer" onClick={() => { setWeekOffset(prev => prev + 1); setSelectedTask(null); }}>
            <ChevronRight size={24} color="gray" />
          </Box>
        </HStack>
      </HStack>

      <SimpleGrid columns={7} gap={2} mb={4}>
        {daysLabel.map(d => (
          <Box key={d} textAlign="center">
            <Text fontSize="sm" fontWeight="bold" color="gray.500">{d}</Text>
          </Box>
        ))}
      </SimpleGrid>

      <SimpleGrid columns={7} gap={2}>
        {currentWeek.map((day, idx) => {
          const isToday = isSameDay(day.date, baseDate);
          return (
            <Card.Root 
              key={idx} 
              p={1} 
              minH="120px" 
              bg={isToday ? "blue.50" : "white"} 
              color="gray.800" 
              borderRadius="lg" 
              border={isToday ? '1px solid var(--chakra-colors-blue-300)' : 'none'}
              shadow="sm"
            >
              <Text fontWeight="bold" mb={1} ml={1} color={isToday ? 'blue.600' : 'gray.700'}>
                {day.date.getDate()}
              </Text>
              
              <VStack align="stretch" gap={1}>
                {day.dayTasks.map(task => (
                  <Badge
                    key={task.id}
                    colorPalette={getColor(task.type)}
                    fontSize="xs"
                    w="100%"
                    textAlign="left"
                    py={1}
                    px={1}
                    borderRadius="md"
                    whiteSpace="normal"
                    cursor="pointer"
                    onClick={() => setSelectedTask(task)}
                    opacity={task.status === 'completed' ? 0.6 : 1}
                    _hover={{ opacity: 0.8 }}
                  >
                    {format(parseISO(task.scheduledFor), 'H:mm')} {task.title}
                  </Badge>
                ))}
              </VStack>
            </Card.Root>
          );
        })}
      </SimpleGrid>
      
      {selectedTask && (
        <Card.Root mt={4} p={4} bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="xl">
          <HStack justify="space-between" mb={2}>
            <VStack align="start" gap={0}>
              <Text fontSize="xs" fontWeight="bold" color="blue.500">
                {format(parseISO(selectedTask.scheduledFor), 'H:mm')}
              </Text>
              <Text fontWeight="bold" fontSize="lg" color="gray.800">{selectedTask.title}</Text>
            </VStack>
            <Box cursor="pointer" onClick={() => setSelectedTask(null)}>
              <X size={20} color="gray" />
            </Box>
          </HStack>
          <Text mb={3} color="gray.600" fontSize="sm">{selectedTask.description}</Text>
          <HStack gap={3}>
            <Badge colorPalette={getColor(selectedTask.type)}>{selectedTask.type}</Badge>
            <Badge variant="outline" colorPalette="gray">{getStatusLabel(selectedTask.status)}</Badge>
          </HStack>
        </Card.Root>
      )}

      <HStack mt={6} gap={4} fontSize="sm" flexWrap="wrap">
         <Box><Badge colorPalette="blue" mr={2}>Turni</Badge></Box>
         <Box><Badge colorPalette="purple" mr={2}>Terapia</Badge></Box>
         <Box><Badge colorPalette="cyan" mr={2}>Studio</Badge></Box>
         <Box><Badge colorPalette="green" mr={2}>Svago</Badge></Box>
      </HStack>
    </Box>
  );
}