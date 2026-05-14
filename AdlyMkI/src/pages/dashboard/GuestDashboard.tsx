import { useState, useRef } from "react";
import {
  Box, Heading, Text, VStack, SimpleGrid, Card, HStack, Button, Textarea, Badge, Input, Image,
} from "@chakra-ui/react";
import {
  Send, TrendingUp, FileText, Pill, Navigation, Users,
  ShoppingCart, MoreHorizontal, CheckCircle2, Clock, AlertCircle, Package,
} from "lucide-react";
import { isToday, isPast, parseISO } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useGuestRequests } from "../../context/GuestRequestContext";
import { useGuestCalendar } from "../../context/GuestCalendarContext";
import { useDelivery } from "../../context/DeliveryContext";
import { mockFacilities, type GuestRequestType } from "../../data/mockData";
import { toaster } from "../../components/ui/toaster";
import shoppingImageUrl from "../../assets/student/reminders/shopping_16560637.png";
import cleaningImageUrl from "../../assets/student/reminders/cleaning-after-party_16872611.png";
import silenceImageUrl from "../../assets/student/reminders/silence_18099772.png";
import waitImageUrl from "../../assets/student/reminders/wait_2042400.png";

const REQUEST_TYPES: { value: GuestRequestType; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'documento', label: 'Documento', icon: FileText,      color: 'blue'   },
  { value: 'farmaci',   label: 'Farmaci',   icon: Pill,          color: 'green'  },
  { value: 'uscita',    label: 'Uscita',    icon: Navigation,    color: 'orange' },
  { value: 'visita',    label: 'Visita',    icon: Users,         color: 'purple' },
  { value: 'acquisto',  label: 'Acquisto',  icon: ShoppingCart,  color: 'teal'   },
  { value: 'altro',     label: 'Altro',     icon: MoreHorizontal,color: 'gray'   },
];

export function GuestDashboard() {
  const { user } = useAuth();
  const { addRequest, forGuest } = useGuestRequests();
  const { getTasksForUser } = useGuestCalendar();
  const { forGuest: deliveriesForGuest, markAccepted } = useDelivery();

  const [openPanel, setOpenPanel]     = useState<'request' | 'progress' | null>(null);
  const [visiblePanel, setVisiblePanel] = useState<'request' | 'progress' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedType, setSelectedType] = useState<GuestRequestType | null>(null);
  const [altroLabel, setAltroLabel]     = useState('');
  const [description, setDescription]   = useState('');

  const facilityId = user?.facilityIds?.[0] ?? 'f1';
  const facility   = mockFacilities.find(f => f.id === facilityId);

  const reminderCards = [
    {
      title: "Divieto di fumare",
      text: "Nessun fumo negli ambienti interni e negli spazi condivisi.",
      image: shoppingImageUrl,
      accent: "red.500",
      bg: "red.50",
    },
    {
      title: "Spazi comuni puliti",
      text: "Dopo l'uso lascia cucina, tavoli e bagno in ordine.",
      image: cleaningImageUrl,
      accent: "green.500",
      bg: "green.50",
    },
    {
      title: "Turni di lavatrice",
      text: "Rispetta il tuo turno e non sovrapporre i lavaggi.",
      image: waitImageUrl,
      accent: "orange.500",
      bg: "orange.50",
    },
    {
      title: "Musica bassa dopo le 22:00",
      text: "Dalle 22:00 il volume va tenuto basso per il riposo di tutti.",
      image: silenceImageUrl,
      accent: "blue.500",
      bg: "blue.50",
    },
  ];

  const myTasks    = user ? getTasksForUser(user.id) : [];
  const todayTasks = myTasks.filter(t => {
    try { return isToday(parseISO(t.scheduledFor)); } catch { return false; }
  });
  const doneTasks    = todayTasks.filter(t => t.status === 'completed' || t.status === 'pending_verification');
  const pendingTasks = todayTasks.filter(t => t.status === 'pending');
  const lateTasks    = pendingTasks.filter(t => {
    try { return isPast(parseISO(t.scheduledFor)); } catch { return false; }
  });
  const completionPct = todayTasks.length === 0
    ? 100
    : Math.round((doneTasks.length / todayTasks.length) * 100);

  const myRequests        = user ? forGuest(user.id) : [];
  const pendingReqs       = myRequests.filter(r => r.status === 'pending');
  const pendingDeliveries = user ? deliveriesForGuest(user.id).filter(d => d.status === 'pending') : [];

  const toggle = (panel: 'request' | 'progress') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (openPanel === panel) {
      setOpenPanel(null);
      timerRef.current = setTimeout(() => setVisiblePanel(null), 400);
    } else if (openPanel === null) {
      setVisiblePanel(panel);
      setOpenPanel(panel);
    } else {
      setOpenPanel(null);
      timerRef.current = setTimeout(() => { setVisiblePanel(panel); setOpenPanel(panel); }, 400);
    }
  };

  const submitRequest = () => {
    if (!selectedType || !user) return;
    if (selectedType === 'altro' && !altroLabel.trim()) return;
    const typeInfo = REQUEST_TYPES.find(t => t.value === selectedType)!;
    addRequest({
      guestId: user.id,
      guestName: `${user.firstName} ${user.lastName}`,
      facilityId,
      type: selectedType,
      label: selectedType === 'altro' ? altroLabel.trim() : typeInfo.label,
      description,
    });
    toaster.create({ title: 'Richiesta inviata!', description: "L'educatore la vedrà a breve.", type: 'success' });
    setSelectedType(null);
    setAltroLabel('');
    setDescription('');
  };

  return (
    <VStack align="stretch" gap={6}>
      <Box mb={2}>
        <Heading size="lg" color="gray.800">Ciao, {user?.firstName}!</Heading>
        <Text color="gray.500" fontSize="sm" mt={1}>{facility?.name}</Text>
      </Box>

      <HStack align="flex-start" gap={8} w="full">
        {/* Reminders a sinistra - verticale */}
        <VStack gap={4} align="center">
          {reminderCards.map((item) => (
            <Box key={item.title} w="72px" display="flex" flexDirection="column" alignItems="center">
              <Card.Root
                p={0}
                bg={item.bg}
                shadow="sm"
                borderRadius="full"
                border="1px solid"
                borderColor={item.accent}
                cursor="pointer"
                aspectRatio={1}
                w="70px"
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                _hover={{ transform: "scale(1.05)" }}
                transition="all 0.2s ease"
                overflow="hidden"
              >
                <Box w="100%" h="100%" borderRadius="full" overflow="hidden">
                  <Image src={item.image} alt={item.title} w="100%" h="100%" objectFit="cover" />
                </Box>
              </Card.Root>
              <Text fontSize="2xs" color="gray.800" textAlign="center" fontWeight="bold" lineHeight="1" px={1} mt={0.5}>
                {item.title}
              </Text>
            </Box>
          ))}
        </VStack>

        {/* Cerchi a destra - come prima */}
        <Box flex="1" display="flex" justifyContent="center" mt={20}>
          <HStack gap={56} align="center" justify="center" flexWrap="nowrap">
            {/* Cerchio 1 – Richiesta */}
            <Card.Root
            p={6} bg="blue.200" shadow="lg" borderRadius="full"
            border="4px solid" borderColor="blue.300"
            cursor="pointer" aspectRatio={1} w="180px"
            display="flex" flexDirection="column" alignItems="center" justifyContent="center"
            onClick={() => toggle('request')}
            _hover={{ bg: "blue.300", transform: "scale(1.04)" }}
            outline={openPanel === 'request' ? "3px solid" : "none"}
            outlineColor="blue.500"
            transition="background 0.2s ease, transform 0.2s ease"
          >
            <Send size={28} color="var(--chakra-colors-blue-700)" />
            <Text fontWeight="bold" color="black" fontSize="md" mt={2} mb={1} textAlign="center">Richiesta</Text>
            <Heading size="2xl" color="black">{pendingReqs.length + pendingDeliveries.length}</Heading>
            <Text fontSize="xs" color="blue.800" textAlign="center">in attesa</Text>
            </Card.Root>

            {/* Cerchio 2 – Progresso */}
            <Card.Root
            p={6} bg="teal.200" shadow="lg" borderRadius="full"
            border="4px solid" borderColor="teal.300"
            cursor="pointer" aspectRatio={1} w="180px"
            display="flex" flexDirection="column" alignItems="center" justifyContent="center"
            onClick={() => toggle('progress')}
            _hover={{ bg: "teal.300", transform: "scale(1.04)" }}
            outline={openPanel === 'progress' ? "3px solid" : "none"}
            outlineColor="teal.500"
            transition="background 0.2s ease, transform 0.2s ease"
          >
            <TrendingUp size={28} color="var(--chakra-colors-teal-700)" />
            <Text fontWeight="bold" color="black" fontSize="md" mt={2} mb={1} textAlign="center">Progresso</Text>
            <Heading size="2xl" color="black">{completionPct}%</Heading>
            <Text fontSize="xs" color="teal.800" textAlign="center">completato oggi</Text>
            </Card.Root>
          </HStack>
        </Box>
      </HStack>

      {/* Pannello a tendina */}
      <Box
        overflow="hidden"
        style={{
          maxHeight: openPanel ? '900px' : '0px',
          opacity: openPanel ? 1 : 0,
          transform: openPanel ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'max-height 0.4s ease, opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* — Pannello Richiesta — */}
        {visiblePanel === 'request' && (
          <Box p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm">

            {pendingDeliveries.length > 0 && (
              <Box mb={6}>
                <HStack mb={3} gap={2}>
                  <Package size={16} color="var(--chakra-colors-teal-600)" />
                  <Text fontWeight="bold" color="teal.700" fontSize="md">Oggetti in arrivo per te</Text>
                </HStack>
                <VStack align="stretch" gap={2}>
                  {pendingDeliveries.map(delivery => (
                    <HStack
                      key={delivery.id}
                      p={3} bg="teal.50" borderRadius="lg"
                      border="1px solid" borderColor="teal.200"
                      justify="space-between" flexWrap="wrap" gap={2}
                    >
                      <VStack align="start" gap={0}>
                        <HStack gap={1}>
                          <Package size={13} color="var(--chakra-colors-teal-600)" />
                          <Text fontSize="sm" fontWeight="semibold" color="gray.800">{delivery.objectLabel}</Text>
                        </HStack>
                        {delivery.description && (
                          <Text fontSize="xs" color="gray.500" fontStyle="italic">"{delivery.description}"</Text>
                        )}
                        <Text fontSize="xs" color="teal.600">{delivery.facilityName}</Text>
                      </VStack>
                      <Button
                        size="xs" colorPalette="teal"
                        onClick={() => {
                          markAccepted(delivery.id);
                          toaster.create({ title: 'Oggetto accettato!', type: 'success' });
                        }}
                      >
                        Accetta
                      </Button>
                    </HStack>
                  ))}
                </VStack>
                <Box mt={4} mb={4} h="1px" bg="gray.100" />
              </Box>
            )}

            <Heading size="md" mb={4} color="gray.800">Nuova Richiesta all'Educatore</Heading>

            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={3}>Tipo di richiesta</Text>
            <HStack gap={2} mb={5} flexWrap="wrap">
              {REQUEST_TYPES.map(rt => {
                const Icon = rt.icon;
                const active = selectedType === rt.value;
                return (
                  <Box
                    key={rt.value}
                    px={2} py={2} borderRadius="lg" cursor="pointer"
                    bg={active ? `${rt.color}.100` : 'gray.50'}
                    border="2px solid"
                    borderColor={active ? `${rt.color}.400` : 'gray.200'}
                    display="flex" flexDirection="column" alignItems="center" gap={1}
                    w="72px"
                    onClick={() => setSelectedType(rt.value)}
                    transition="all 0.15s"
                    _hover={{ borderColor: `${rt.color}.300`, bg: `${rt.color}.50` }}
                  >
                    <Icon size={16} />
                    <Text fontSize="2xs" fontWeight={active ? 'semibold' : 'normal'} color="gray.700" textAlign="center">
                      {rt.label}
                    </Text>
                  </Box>
                );
              })}
            </HStack>

            {selectedType === 'altro' && (
              <Box mb={4}>
                <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Di cosa hai bisogno?</Text>
                <Input
                  value={altroLabel}
                  onChange={e => setAltroLabel(e.target.value)}
                  placeholder="Es. supporto psicologico, attività ricreativa…"
                  color="gray.800"
                  bg="gray.50"
                  autoFocus
                />
              </Box>
            )}

            <Text fontSize="sm" fontWeight="semibold" color="gray.600" mb={2}>Descrizione (opzionale)</Text>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descrivi la tua richiesta..."
              mb={4}
              color="gray.800"
              bg="gray.50"
              rows={3}
            />

            <Button colorPalette="blue" disabled={!selectedType || (selectedType === 'altro' && !altroLabel.trim())} onClick={submitRequest} w="full">
              <Send size={16} />
              Invia Richiesta
            </Button>

            {myRequests.length > 0 && (
              <Box mt={6}>
                <Text fontWeight="semibold" color="gray.700" mb={3}>Le mie richieste recenti</Text>
                <VStack align="stretch" gap={2}>
                  {myRequests.slice(0, 5).map(req => (
                    <HStack key={req.id} p={3} bg="gray.50" borderRadius="lg" justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium" color="gray.800">{req.label}</Text>
                        {req.description && (
                          <Text fontSize="xs" color="gray.500">{req.description}</Text>
                        )}
                      </VStack>
                      <Badge
                        colorPalette={
                          req.status === 'pending' ? 'orange'
                          : req.status === 'approved' ? 'green'
                          : 'red'
                        }
                      >
                        {req.status === 'pending' ? 'In attesa' : req.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                      </Badge>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            )}
          </Box>
        )}

        {/* — Pannello Progresso — */}
        {visiblePanel === 'progress' && (
          <Box p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Il Mio Progresso Oggi</Heading>

            <SimpleGrid columns={{ base: 1, sm: 3 }} gap={4} mb={6}>
              <Box p={4} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200" textAlign="center">
                <CheckCircle2 size={24} color="var(--chakra-colors-green-500)" style={{ margin: '0 auto 8px' }} />
                <Heading size="xl" color="green.600">{doneTasks.length}</Heading>
                <Text fontSize="sm" color="green.700">Completati</Text>
              </Box>
              <Box p={4} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200" textAlign="center">
                <Clock size={24} color="var(--chakra-colors-orange-500)" style={{ margin: '0 auto 8px' }} />
                <Heading size="xl" color="orange.600">{pendingTasks.length - lateTasks.length}</Heading>
                <Text fontSize="sm" color="orange.700">Da Fare</Text>
              </Box>
              <Box p={4} bg="red.50" borderRadius="xl" border="1px solid" borderColor="red.200" textAlign="center">
                <AlertCircle size={24} color="var(--chakra-colors-red-500)" style={{ margin: '0 auto 8px' }} />
                <Heading size="xl" color="red.600">{lateTasks.length}</Heading>
                <Text fontSize="sm" color="red.700">In Ritardo</Text>
              </Box>
            </SimpleGrid>

            {/* Barra progresso */}
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" color="gray.600">Avanzamento giornaliero</Text>
              <Text fontSize="sm" fontWeight="bold" color="teal.600">{completionPct}%</Text>
            </HStack>
            <Box h="12px" bg="gray.100" borderRadius="full" overflow="hidden">
              <Box
                h="full"
                bg={completionPct === 100 ? "green.400" : "teal.400"}
                borderRadius="full"
                style={{ width: `${completionPct}%`, transition: 'width 0.5s ease' }}
              />
            </Box>

            {todayTasks.length === 0 && (
              <Text color="gray.500" fontSize="sm" mt={4} textAlign="center">
                Nessun compito per oggi. Goditi la giornata!
              </Text>
            )}
          </Box>
        )}
      </Box>

    </VStack>
  );
}
