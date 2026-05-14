import { useState, useRef } from "react";
import { Box, Heading, Text, VStack, SimpleGrid, Card, HStack, Button, Image } from "@chakra-ui/react";
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import { EducatorInbox } from "../../components/tasks/EducatorInbox";
import { AlertTriangle, TrendingUp, Calendar, Package, FileText, UserCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { mockFacilities, mockTasks, mockUsers } from "../../data/mockData";
import { DeliveryModal } from "../../components/delivery/DeliveryModal";
import { useNavigate } from "react-router-dom";

const structureToFacilityId: Record<string, string> = {
  "struttura-1": "f1",
  "struttura-2": "f2",
  "struttura-3": "f3",
  "struttura-4": "f4",
  "struttura-5": "f5",
  "struttura-6": "f6",
};


export function EducatorDashboard() {
  const [openPanel, setOpenPanel] = useState<'guests' | 'inbox' | 'completion' | null>(null);
  const [visiblePanel, setVisiblePanel] = useState<'guests' | 'inbox' | 'completion' | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [deliveryGuestId, setDeliveryGuestId] = useState<string | null>(null);
  const navigate = useNavigate();

  const toggle = (panel: 'guests' | 'inbox' | 'completion') => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (openPanel === panel) {
      setOpenPanel(null);
      timerRef.current = setTimeout(() => setVisiblePanel(null), 400);
    } else if (openPanel === null) {
      setVisiblePanel(panel);
      setOpenPanel(panel);
    } else {
      setOpenPanel(null);
      timerRef.current = setTimeout(() => {
        setVisiblePanel(panel);
        setOpenPanel(panel);
      }, 400);
    }
  };
  const { selectedStructure, guestAccounts } = useAuth();
  const selectedFacilityId = selectedStructure ? structureToFacilityId[selectedStructure] : undefined;
  const selectedFacility = selectedFacilityId ? mockFacilities.find((facility) => facility.id === selectedFacilityId) : undefined;

  const guestsInFacility = mockUsers.filter(
    (user) => user.roles.includes("guest") && user.facilityIds?.includes(selectedFacilityId ?? "")
  );

  const createdGuestsInFacility = guestAccounts
    .filter((account) => account.facilityId === selectedFacilityId)
    .map((account) => account.user);

  const allGuestsInFacility = [...guestsInFacility, ...createdGuestsInFacility];
  const facilityTasks = mockTasks.filter((task) => task.facilityId === selectedFacilityId);
  const pendingVerifications = facilityTasks.filter(
    (task) => task.status === "pending_verification" || task.status === "swapped" || task.status === "failed"
  ).length;
  const completionRate = facilityTasks.length === 0
    ? 0
    : Math.round((facilityTasks.filter((task) => task.status === "completed").length / facilityTasks.length) * 100);

  return (
    <VStack align="stretch" gap={6}>
      <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
        <Card.Root
          p={6} bg="blue.200" shadow="lg" borderRadius="full"
          border="4px solid" borderColor="#7AAFD4" position="relative"
          cursor="pointer" aspectRatio={1} w="45%" mx="auto"
          display="flex" flexDirection="column" alignItems="center" justifyContent="center"
          onClick={() => toggle('guests')}
          _hover={{ bg: "blue.300", transform: "scale(1.04)" }}
          outline={openPanel === 'guests' ? "3px solid" : "none"}
          outlineColor="blue.500"
          transition="background 0.2s ease, transform 0.2s ease"
        >
          <HStack gap={0} mb={3} justify="center">
            {allGuestsInFacility.slice(0, 4).map((guest, i) => (
              <Box
                key={guest.id}
                w="38px" h="38px"
                borderRadius="full"
                overflow="hidden"
                border="2px solid white"
                flexShrink={0}
                ml={i === 0 ? 0 : "-10px"}
                zIndex={4 - i}
                position="relative"
                shadow="sm"
              >
                {guest.avatarUrl ? (
                  <Image src={guest.avatarUrl} alt={guest.firstName} w="full" h="full" objectFit="cover" />
                ) : (
                  <Box w="full" h="full" bg="blue.500" display="flex" alignItems="center" justifyContent="center">
                    <Text fontSize="xs" color="white" fontWeight="bold">{guest.firstName[0]}</Text>
                  </Box>
                )}
              </Box>
            ))}
            {allGuestsInFacility.length > 4 && (
              <Box
                w="38px" h="38px" borderRadius="full" bg="blue.700"
                border="2px solid white" flexShrink={0} ml="-10px"
                display="flex" alignItems="center" justifyContent="center"
                position="relative" shadow="sm"
              >
                <Text fontSize="xs" color="white" fontWeight="bold">+{allGuestsInFacility.length - 4}</Text>
              </Box>
            )}
          </HStack>
          <Text fontWeight="bold" color="black" fontSize="md" mb={1}>Ospiti della Struttura</Text>
          <Heading size="3xl" color="black" mb={1}>{allGuestsInFacility.length}</Heading>
          <Text fontSize="sm" color="blue.700" textAlign="center">
            {selectedFacility?.name ?? "Nessuna struttura selezionata"}
          </Text>
        </Card.Root>

        <Card.Root
          p={6} bg="orange.200" shadow="lg" borderRadius="full"
          border="4px solid" borderColor="#7AAFD4"
          cursor="pointer" aspectRatio={1} w="45%" mx="auto"
          display="flex" flexDirection="column" alignItems="center" justifyContent="center"
          onClick={() => toggle('inbox')}
          _hover={{ bg: "orange.300", transform: "scale(1.04)" }}
          outline={openPanel === 'inbox' ? "3px solid" : "none"}
          outlineColor="orange.500"
          transition="background 0.2s ease, transform 0.2s ease"
        >
          <HStack mb={2} color="orange.600">
            <AlertTriangle size={28} />
          </HStack>
          <Text fontWeight="bold" color="black" fontSize="md" mb={1}>Richieste e Attività</Text>
          <Heading size="3xl" color="black" mb={1}>{pendingVerifications}</Heading>
          <Text fontSize="sm" color="orange.700" textAlign="center">Compiti o scambi in sospeso</Text>
        </Card.Root>

        <Card.Root
          p={6} bg="teal.200" shadow="lg" borderRadius="full"
          border="4px solid" borderColor="#7AAFD4"
          cursor="pointer" aspectRatio={1} w="45%" mx="auto"
          display="flex" flexDirection="column" alignItems="center" justifyContent="center"
          onClick={() => toggle('completion')}
          _hover={{ bg: "teal.300", transform: "scale(1.04)" }}
          outline={openPanel === 'completion' ? "3px solid" : "none"}
          outlineColor="teal.500"
          transition="background 0.2s ease, transform 0.2s ease"
        >
          <HStack mb={2} color="teal.600">
            <TrendingUp size={28} />
          </HStack>
          <Text fontWeight="bold" color="black" fontSize="md" mb={1}>Completamento</Text>
          <Heading size="3xl" color="black" mb={1}>{completionRate}%</Heading>
          <Text fontSize="sm" color="teal.700" textAlign="center">Tasso dei compiti nella struttura</Text>
        </Card.Root>
      </SimpleGrid>

      {/* Pannello unico a tendina */}
      <Box
        overflow="hidden"
        style={{
          maxHeight: openPanel ? '1000px' : '0px',
          opacity: openPanel ? 1 : 0,
          transform: openPanel ? 'translateY(0)' : 'translateY(-12px)',
          transition: 'max-height 0.4s ease, opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {visiblePanel === 'guests' && (
          <Box p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Ospiti della struttura</Heading>
            <VStack align="stretch" gap={3}>
              {allGuestsInFacility.map(guest => (
                <HStack key={guest.id} p={3} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.100" gap={3} flexWrap="wrap" w="fit-content">
                  <Box
                    w="44px" h="44px" borderRadius="full"
                    overflow="hidden"
                    border="2px solid" borderColor="blue.300"
                    flexShrink={0}
                    bg="blue.200"
                  >
                    {guest.avatarUrl ? (
                      <Image src={guest.avatarUrl} alt={guest.firstName} w="full" h="full" objectFit="cover" />
                    ) : (
                      <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                        <Text fontSize="sm" color="blue.700" fontWeight="bold">{guest.firstName[0]}</Text>
                      </Box>
                    )}
                  </Box>
                  <Box minW="120px">
                    <Text fontWeight="semibold" color="gray.800">{guest.firstName} {guest.lastName}</Text>
                  </Box>
                  <HStack gap={2} ml={2}>
                    <Button size="xs" colorPalette="blue" onClick={() => navigate(`/dashboard/guests/calendar/${guest.id}`)}>
                      <Calendar size={12} /> Calendario
                    </Button>
                    <Button size="xs" colorPalette="teal" onClick={() => setDeliveryGuestId(guest.id)}>
                      <Package size={12} /> Consegna
                    </Button>
                    <Button size="xs" colorPalette="purple" onClick={() => navigate(`/dashboard/profile/${guest.id}`)}>
                      <UserCircle size={12} /> Profilo
                    </Button>
                    <Button size="xs" colorPalette="gray" onClick={() => navigate(`/dashboard/guests/report/${guest.id}`)}>
                      <FileText size={12} /> Report
                    </Button>
                  </HStack>
                </HStack>
              ))}
            </VStack>
          </Box>
        )}
        {visiblePanel === 'inbox' && (
          <Box p={6} bg="orange.200" color="gray.800" borderRadius="xl" shadow="sm">
            <Heading size="md" mb={4} color="gray.800">Inbox: Richieste e Verifiche</Heading>
            <EducatorInbox facilityId={selectedFacilityId} />
          </Box>
        )}
        {visiblePanel === 'completion' && (() => {
          const completed = facilityTasks.filter(t => t.status === 'completed').length;
          const pending = facilityTasks.length - completed;
          const pieData = [
            { name: 'Completate', value: completed, fill: '#38A169' },
            { name: 'Da completare', value: pending, fill: '#FC8181' },
          ];
          const guestRanking = allGuestsInFacility
            .map(g => ({
              name: `${g.firstName} ${g.lastName}`,
              pending: facilityTasks.filter(t => t.assignedTo === g.id && t.status !== 'completed').length,
            }))
            .filter(g => g.pending > 0)
            .sort((a, b) => b.pending - a.pending);

          return (
            <Box p={6} bg="white" color="gray.800" borderRadius="xl" shadow="sm">
              <Heading size="md" mb={4} color="gray.800">Riepilogo Completamento</Heading>
              <HStack align="start" gap={8} flexWrap="wrap">
                <Box flex="1" minW="200px">
                  <Text fontWeight="semibold" mb={3} color="gray.700">Attività totali</Text>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <HStack justify="center" gap={4} mt={2}>
                    <HStack gap={1}><Box w="12px" h="12px" borderRadius="sm" bg="green.500" /><Text fontSize="sm">Completate ({completed})</Text></HStack>
                    <HStack gap={1}><Box w="12px" h="12px" borderRadius="sm" bg="red.300" /><Text fontSize="sm">Da fare ({pending})</Text></HStack>
                  </HStack>
                </Box>
                <Box flex="1" minW="200px">
                  <Text fontWeight="semibold" mb={3} color="gray.700">Ospiti con più attività in sospeso</Text>
                  {guestRanking.length === 0 ? (
                    <Text color="gray.500" fontSize="sm">Tutti i compiti sono completati!</Text>
                  ) : (
                    <VStack align="stretch" gap={2}>
                      {guestRanking.map((g, i) => (
                        <HStack key={g.name} p={2} bg={i === 0 ? "red.50" : "gray.50"} borderRadius="md" border="1px solid" borderColor={i === 0 ? "red.200" : "gray.100"} justify="space-between">
                          <HStack gap={2}>
                            <Box w="8px" h="8px" borderRadius="full" bg={i === 0 ? "red.400" : "gray.400"} />
                            <Text fontSize="sm" fontWeight={i === 0 ? "semibold" : "normal"} color="gray.800">{g.name}</Text>
                          </HStack>
                          <Text fontSize="sm" fontWeight="bold" color={i === 0 ? "red.600" : "gray.600"}>{g.pending} in sospeso</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>
              </HStack>
            </Box>
          );
        })()}
      </Box>

      {deliveryGuestId && (
        <DeliveryModal
          guests={allGuestsInFacility}
          preselectedGuestId={deliveryGuestId}
          facilityName={selectedFacility?.name ?? 'Struttura'}
          onClose={() => setDeliveryGuestId(null)}
        />
      )}
    </VStack>
  );
}