import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Badge, Input, Card, Textarea } from '@chakra-ui/react';
import { CheckCircle2, Image as ImageIcon, Camera, RefreshCw } from 'lucide-react';
import { mockTasks, mockUsers, type Task } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { toaster } from '../ui/toaster';

export function GuestTaskList() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter(t => t.assignedTo === user?.id));
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [actionType, setActionType] = useState<'complete' | 'swap' | null>(null);

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const otherTasks = tasks.filter(t => t.status !== 'pending');

  const handleAction = (task: Task, type: 'complete' | 'swap') => {
    setSelectedTask(task);
    setActionType(type);
  };

  const submitComplete = () => {
    if (selectedTask) {
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id 
          ? { ...t, status: t.requiresVerification ? 'pending_verification' : 'completed' } 
          : t
      ));
      toaster.create({ title: 'Ottimo lavoro!', description: 'Hai completato il compito.', type: 'success' });
      setSelectedTask(null);
      setActionType(null);
    }
  };

  const submitSwap = () => {
    if (selectedTask) {
      setTasks(prev => prev.map(t => 
        t.id === selectedTask.id ? { ...t, status: 'swapped' } : t
      ));
      toaster.create({ title: 'Richiesta inviata', description: 'Hai richiesto uno scambio per questo turno.', type: 'info' });
      setSelectedTask(null);
      setActionType(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'green';
      case 'pending': return 'blue';
      case 'pending_verification': return 'orange';
      case 'swapped': return 'purple';
      default: return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'completed': return 'Completato';
      case 'pending': return 'Da Fare';
      case 'pending_verification': return 'In Attesa di Verifica';
      case 'swapped': return 'Scambio Richiesto';
      default: return status;
    }
  };

  return (
    <VStack align="stretch" gap={4}>
      {tasks.length === 0 && (
        <Text color="gray.500">Nessun compito assegnato.</Text>
      )}

      {selectedTask && (
        <Card.Root p={5} bg="gray.50" color="gray.800" mb={4} borderRadius="xl" border="2px solid" borderColor="blue.200">
          <Text fontWeight="bold" fontSize="lg" mb={2}>
            {actionType === 'complete' ? 'Completa Compito' : 'Richiedi Scambio'}
          </Text>
          <Text mb={4}>{selectedTask.title}</Text>
          
          {actionType === 'complete' && selectedTask.requiresVerification && (
            <Box mb={4} p={6} border="2px dashed" borderColor="gray.300" borderRadius="md" textAlign="center" bg="white" color="gray.800">
              <Camera size={32} color="gray" style={{ margin: '0 auto', marginBottom: '8px' }} />
              <Text fontSize="sm" color="gray.500">Carica una foto prova del compito</Text>
              <Button size="sm" mt={2} variant="surface">
                <ImageIcon size={16} style={{ marginRight: '8px' }} /> Scegli File
              </Button>
            </Box>
          )}

          {actionType === 'swap' && (
            <Box mb={4}>
              <Text fontSize="sm" mb={2}>Seleziona il coinquilino con cui scambiare:</Text>
              <Box color="gray.800" as="select" p={2} width="100%" borderRadius="md" bg="white" border="1px solid" borderColor="gray.200">
                <option value="">Seleziona...</option>
                {mockUsers.filter(u => u.roles.includes('guest') && u.id !== user?.id).map(u => (
                  <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                ))}
              </Box>
            </Box>
          )}

          <HStack gap={3}>
            <Button colorPalette="blue" onClick={actionType === 'complete' ? submitComplete : submitSwap}>
              {actionType === 'complete' ? 'Conferma Completamento' : 'Invia Richiesta'}
            </Button>
            <Button variant="ghost" color="gray.800" _hover={{ bg: 'gray.200', color: 'gray.900' }} onClick={() => setSelectedTask(null)}>Annulla</Button>
          </HStack>
        </Card.Root>
      )}

      {!selectedTask && pendingTasks.map(task => (
        <Card.Root key={task.id} p={4} bg="white" color="gray.800" borderRadius="xl" shadow="sm">
          <VStack align="stretch" gap={3}>
            <HStack justify="space-between">
              <HStack>
                {task.type === 'chore' && <CheckCircle2 color="var(--chakra-colors-blue-500)" />}
                <Text fontWeight="semibold">{task.title}</Text>
              </HStack>
              <Badge colorPalette="blue" color="gray.900">Da Fare</Badge>
            </HStack>
            <Text fontSize="sm" color="gray.600">{task.description}</Text>
            
            <HStack justify="flex-end" mt={2}>
              <Button size="sm" variant="surface" onClick={() => handleAction(task, 'swap')}>
                <RefreshCw size={14} style={{ marginRight: '4px' }}/> Scambia
              </Button>
              <Button size="sm" colorPalette="blue" onClick={() => handleAction(task, 'complete')}>
                <CheckCircle2 size={14} style={{ marginRight: '4px' }}/> Fatto
              </Button>
            </HStack>
          </VStack>
        </Card.Root>
      ))}

      {otherTasks.length > 0 && (
        <Box mt={6}>
          <Text fontWeight="bold" mb={3} color="gray.600">Completati o in sospeso</Text>
          {otherTasks.map(task => (
            <Card.Root key={task.id} p={4} bg="white" color="gray.800" borderRadius="xl" shadow="sm" mb={3} opacity={0.8}>
               <VStack align="stretch" gap={2}>
                <HStack justify="space-between">
                  <Text fontWeight="medium" textDecoration={task.status === 'completed' ? 'line-through' : 'none'}>
                    {task.title}
                  </Text>
                  <Badge colorPalette={getStatusColor(task.status)} color="gray.900">
                    {getStatusLabel(task.status)}
                  </Badge>
                </HStack>
              </VStack>
            </Card.Root>
          ))}
        </Box>
      )}
    </VStack>
  );
}
