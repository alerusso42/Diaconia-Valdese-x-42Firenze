import { useState } from 'react';
import { Box, SimpleGrid, VStack, HStack, Text, Button } from '@chakra-ui/react';
import { Check, X, AlertOctagon, Bell, ChevronDown, ChevronUp, FileText, Pill, Navigation, Users, ShoppingCart, MoreHorizontal } from 'lucide-react';
import { mockTasks, mockUsers, type Task, type GuestRequestType } from '../../data/mockData';
import { useNotifications } from '../../context/NotificationContext';
import { useGuestRequests } from '../../context/GuestRequestContext';
import { toaster } from '../ui/toaster';

const REQUEST_ICONS: Record<GuestRequestType, React.ElementType> = {
  documento: FileText,
  farmaci:   Pill,
  uscita:    Navigation,
  visita:    Users,
  acquisto:  ShoppingCart,
  altro:     MoreHorizontal,
};

function CountBadge({ count, bg, borderColor }: { count: number; bg: string; borderColor: string }) {
  return (
    <Box
      w="20px" h="20px" borderRadius="full"
      bg={bg} border="1.5px solid" borderColor={borderColor}
      display="flex" alignItems="center" justifyContent="center"
      flexShrink={0}
    >
      <Text fontSize="2xs" fontWeight="bold" color="gray.700" lineHeight="1">{count}</Text>
    </Box>
  );
}

function TaskRow({ task, guestName, actions, showDescription }: { task: Task; guestName: string; actions: React.ReactNode; showDescription?: boolean }) {
  return (
    <Box px={3} py={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.100" shadow="xs">
      <Text fontWeight="semibold" fontSize="sm" color="gray.800" lineClamp={1}>{guestName}</Text>
      <Text fontSize="xs" color="gray.500" lineClamp={1}>{task.title}</Text>
      {showDescription && task.description && (
        <Text fontSize="xs" color="gray.600" mt={1} mb={1} fontStyle="italic" lineClamp={2}>{task.description}</Text>
      )}
      <HStack gap={1} justify="flex-end" mt={2}>{actions}</HStack>
    </Box>
  );
}

interface ColumnProps {
  title: string;
  count: number;
  accentColor: string;
  badgeBg: string;
  badgeBorder: string;
  bg: string;
  borderColor: string;
  children: React.ReactNode;
  emptyLabel: string;
}

function Column({ title, count, accentColor, badgeBg, badgeBorder, bg, borderColor, children, emptyLabel }: ColumnProps) {
  const [open, setOpen] = useState(true);

  return (
    <Box bg={bg} borderRadius="xl" border="1px solid" borderColor={borderColor} overflow="hidden">
      <HStack
        px={4} py={3} cursor="pointer" justify="space-between"
        _hover={{ opacity: 0.85 }} onClick={() => setOpen(v => !v)} userSelect="none"
      >
        <HStack gap={2}>
          <Box w="8px" h="8px" borderRadius="full" bg={accentColor} flexShrink={0} />
          <Text fontSize="xs" fontWeight="bold" color={accentColor} textTransform="uppercase" letterSpacing="wide">
            {title}
          </Text>
          <CountBadge count={count} bg={badgeBg} borderColor={badgeBorder} />
        </HStack>
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </HStack>

      <Box overflow="hidden" style={{
        maxHeight: open ? '800px' : '0px',
        opacity: open ? 1 : 0,
        transition: 'max-height 0.35s ease, opacity 0.25s ease',
      }}>
        <VStack align="stretch" gap={2} px={3} pb={3}>
          {count === 0
            ? <Text fontSize="sm" color="gray.400" textAlign="center" py={3}>{emptyLabel}</Text>
            : children
          }
        </VStack>
      </Box>
    </Box>
  );
}

function ConfirmButton({ label, colorPalette, icon, onConfirm }: {
  label: string;
  colorPalette: string;
  icon: React.ReactNode;
  onConfirm: () => void;
}) {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <HStack gap={1} bg={`${colorPalette}.50`} px={2} py={1} borderRadius="md" border="1px solid" borderColor={`${colorPalette}.200`}>
        <Text fontSize="xs" color="gray.700">Confermi?</Text>
        <Button size="xs" colorPalette={colorPalette} onClick={() => { setConfirming(false); onConfirm(); }}>
          <Check size={11} /> Sì
        </Button>
        <Button size="xs" variant="outline" colorPalette="gray" onClick={() => setConfirming(false)}>
          <X size={11} />
        </Button>
      </HStack>
    );
  }

  return (
    <Button size="xs" colorPalette={colorPalette} onClick={() => setConfirming(true)}>
      {icon} {label}
    </Button>
  );
}

export function EducatorInbox({ facilityId }: { facilityId?: string }) {
  const { addNotification } = useNotifications();
  const { forFacility, updateStatus } = useGuestRequests();

  const [tasks, setTasks] = useState<Task[]>(
    mockTasks.filter(t =>
      ['pending_verification', 'swapped', 'pending', 'failed'].includes(t.status) &&
      mockUsers.some(u => u.id === t.assignedTo) &&
      (!facilityId || t.facilityId === facilityId)
    )
  );

  const toVerify = tasks.filter(t => t.status === 'pending_verification');
  const overdue  = tasks.filter(t => t.status === 'pending' || t.status === 'failed');
  const swapReqs = tasks.filter(t => t.status === 'swapped');

  const guestReqs = (facilityId ? forFacility(facilityId) : [])
    .filter(r => r.status === 'pending');

  const getGuestName = (id: string) => {
    const g = mockUsers.find(u => u.id === id);
    return g ? `${g.firstName} ${g.lastName}` : 'Ospite Sconosciuto';
  };

  const approve = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toaster.create({ title: 'Approvato', type: 'success' });
  };
  const reject = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toaster.create({ title: 'Rifiutato', description: 'Ospite avvisato di ripetere il compito.', type: 'warning' });
  };
  const remind = (task: Task) => {
    addNotification({
      userId: task.assignedTo,
      title: 'Promemoria Compito',
      message: `Hai un ritardo su: "${task.title}". L'educatore ti ha mandato un sollecito, per favore completalo al più presto.`
    });
    toaster.create({ title: "Promemoria inviato all'ospite!", type: 'info' });
  };
  const sanction = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    toaster.create({ title: 'Sanzione applicata', description: "Punti decurtati dal profilo dell'ospite.", type: 'error' });
  };
  const approveReq = (id: string, guestId: string) => {
    updateStatus(id, 'approved');
    addNotification({
      userId: guestId,
      title: 'Richiesta approvata',
      message: "L'educatore ha approvato la tua richiesta.",
    });
    toaster.create({ title: 'Richiesta approvata', type: 'success' });
  };
  const rejectReq = (id: string, guestId: string) => {
    updateStatus(id, 'rejected');
    addNotification({
      userId: guestId,
      title: 'Richiesta rifiutata',
      message: "L'educatore ha rifiutato la tua richiesta.",
    });
    toaster.create({ title: 'Richiesta rifiutata', type: 'warning' });
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>

      <Column title="Da verificare" count={toVerify.length}
        accentColor="orange.600" badgeBg="orange.400" badgeBorder="orange.400"
        bg="orange.100" borderColor="orange.300" emptyLabel="Nessuna attività da verificare">
        {toVerify.map(t => (
          <TaskRow key={t.id} task={t} guestName={getGuestName(t.assignedTo)} actions={
            <>
              <ConfirmButton label="Rifiuta" colorPalette="red" icon={<X size={11} />} onConfirm={() => reject(t.id)} />
              <ConfirmButton label="Approva" colorPalette="green" icon={<Check size={11} />} onConfirm={() => approve(t.id)} />
            </>
          } />
        ))}
      </Column>

      <Column title="In ritardo" count={overdue.length}
        accentColor="red.600" badgeBg="red.400" badgeBorder="red.400"
        bg="red.100" borderColor="red.300" emptyLabel="Nessun compito in ritardo">
        {overdue.map(t => (
          <TaskRow key={t.id} task={t} guestName={getGuestName(t.assignedTo)} actions={
            <>
              <ConfirmButton label="Ricorda" colorPalette="blue" icon={<Bell size={11} />} onConfirm={() => remind(t)} />
              <ConfirmButton label="Sanziona" colorPalette="red" icon={<AlertOctagon size={11} />} onConfirm={() => sanction(t.id)} />
            </>
          } />
        ))}
      </Column>

      <Column title="Richieste" count={swapReqs.length + guestReqs.length}
        accentColor="purple.600" badgeBg="purple.400" badgeBorder="purple.400"
        bg="purple.100" borderColor="purple.300" emptyLabel="Nessuna richiesta in sospeso">
        {swapReqs.map(t => (
          <TaskRow key={t.id} task={t} guestName={getGuestName(t.assignedTo)} showDescription actions={
            <>
              <ConfirmButton label="Rifiuta" colorPalette="red" icon={<X size={11} />} onConfirm={() => reject(t.id)} />
              <ConfirmButton label="Approva" colorPalette="purple" icon={<Check size={11} />} onConfirm={() => approve(t.id)} />
            </>
          } />
        ))}
        {guestReqs.map(req => {
          const Icon = REQUEST_ICONS[req.type] ?? MoreHorizontal;
          return (
            <Box key={req.id} px={3} py={2} bg="white" borderRadius="md" border="1px solid" borderColor="gray.100" shadow="xs">
              <HStack gap={1} mb={1}>
                <Icon size={12} />
                <Text fontWeight="semibold" fontSize="sm" color="gray.800" lineClamp={1}>{req.guestName}</Text>
              </HStack>
              <Text fontSize="xs" color="purple.600" fontWeight="medium">{req.label}</Text>
              {req.description && (
                <Text fontSize="xs" color="gray.500" mt={1} lineClamp={2} fontStyle="italic">"{req.description}"</Text>
              )}
              <HStack gap={1} justify="flex-end" mt={2}>
                <ConfirmButton label="Rifiuta" colorPalette="red" icon={<X size={11} />} onConfirm={() => rejectReq(req.id, req.guestId)} />
                <ConfirmButton label="Approva" colorPalette="purple" icon={<Check size={11} />} onConfirm={() => approveReq(req.id, req.guestId)} />
              </HStack>
            </Box>
          );
        })}
      </Column>

    </SimpleGrid>
  );
}
