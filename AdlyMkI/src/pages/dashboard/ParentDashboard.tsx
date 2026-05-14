import { useMemo } from "react";
import { Box, Heading, HStack, Image, SimpleGrid, Text, VStack, Badge } from "@chakra-ui/react";
import { CalendarDays, MapPin, Heart, BookOpen, ChefHat, Flower2, Home, Monitor } from "lucide-react";
import { CalendarView } from "../../components/calendar/CalendarView";
import { useAuth } from "../../context/AuthContext";
import { mockFacilities, mockUsers } from "../../data/mockData";
import myFirstHtmlUrl from "../../assets/family_tutor/myFirstHtml.png";
import pizzaUrl from "../../assets/family_tutor/pizza.png";
import casaUrl from "../../assets/family_tutor/casa.png";
import papaveroOneUrl from "../../assets/family_tutor/papavero (1).png";
import papaveroUrl from "../../assets/family_tutor/papavero.png";

export function ParentDashboard() {
  const { user } = useAuth();

  const child = useMemo(() => {
    const childId = user?.childrenIds?.[0];
    if (!childId) return undefined;
    return mockUsers.find((c) => c.id === childId && c.roles.includes("guest"));
  }, [user]);

  const facility = useMemo(() => {
    const facilityId = child?.facilityIds?.[0];
    if (!facilityId) return undefined;
    return mockFacilities.find((f) => f.id === facilityId);
  }, [child]);

  const childName = child ? `${child.firstName} ${child.lastName}` : "il ragazzo";
  const facilityTypeLabel = facility?.type === "daily" ? "Centro diurno" : "Struttura residenziale";

  const monthlyBoard = [
    { month: "Gennaio", title: "Nuovo inizio",        image: casaUrl,         badge: "Casa",        icon: Home,     color: "blue",   note: "Un mese di ambientamento, routine chiare e passi sicuri." },
    { month: "Febbraio", title: "Primi laboratori",   image: myFirstHtmlUrl,  badge: "Informatica",  icon: Monitor,  color: "purple", note: "Screenshot e prove creative dal laboratorio digitale." },
    { month: "Marzo",   title: "Stagione di crescita",image: papaveroUrl,     badge: "Benessere",    icon: Flower2,  color: "green",  note: "Un mese più aperto, colorato e leggero." },
    { month: "Aprile",  title: "Fiori e autonomia",   image: papaveroOneUrl,  badge: "Autonomia",    icon: Heart,    color: "pink",   note: "Piccole conquiste quotidiane raccontate con immagini." },
    { month: "Maggio",  title: "Giornate condivise",  image: pizzaUrl,        badge: "Cucina",       icon: ChefHat,  color: "orange", note: "Attività di gruppo, tavole apparecchiate e serate insieme." },
  ];

  return (
    <VStack align="stretch" gap={8}>

      {/* ── HERO ── */}
      <Box
        borderRadius="2xl" overflow="hidden" position="relative"
        bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        shadow="xl"
      >
        {/* Decorative circles */}
        <Box position="absolute" top="-40px" right="-40px" w="200px" h="200px" borderRadius="full"
          style={{ background: 'rgba(255,255,255,0.07)' }} />
        <Box position="absolute" bottom="-30px" left="-30px" w="150px" h="150px" borderRadius="full"
          style={{ background: 'rgba(255,255,255,0.05)' }} />

        <Box p={{ base: 6, md: 10 }} position="relative" zIndex={1}>
          <HStack gap={6} align="center" flexWrap="wrap">
            {/* Avatar */}
            <Box
              w="88px" h="88px" borderRadius="full" overflow="hidden" flexShrink={0}
              border="3px solid" borderColor="whiteAlpha.500"
              shadow="lg"
              bg="purple.300"
            >
              {child?.avatarUrl ? (
                <Image src={child.avatarUrl} alt={childName} w="full" h="full" objectFit="cover" />
              ) : (
                <Box w="full" h="full" display="flex" alignItems="center" justifyContent="center">
                  <Text fontSize="3xl" fontWeight="bold" color="white">
                    {child?.firstName?.[0] ?? "?"}
                  </Text>
                </Box>
              )}
            </Box>

            {/* Text */}
            <Box flex={1} minW="180px">
              <Text fontSize="xs" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="widest" mb={1}>
                Benvenuto/a
              </Text>
              <Heading size="2xl" color="white" mb={1}>{childName}</Heading>
              <HStack gap={2} flexWrap="wrap">
                <Box px={3} py={1} borderRadius="full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Text fontSize="sm" color="white" fontWeight="medium">{facility?.name ?? "—"}</Text>
                </Box>
                <Box px={3} py={1} borderRadius="full" style={{ background: 'rgba(255,255,255,0.10)' }}>
                  <Text fontSize="sm" color="whiteAlpha.800">{facilityTypeLabel}</Text>
                </Box>
              </HStack>
            </Box>
          </HStack>

          {/* Stat bar */}
          <SimpleGrid columns={{ base: 2, sm: 3 }} gap={4} mt={8}>
            {[
              { label: "Struttura", value: facility?.name ?? "—",                    icon: Home },
              { label: "Indirizzo", value: facility?.address ?? "—",                  icon: MapPin },
              { label: "Tipo",      value: facilityTypeLabel,                         icon: BookOpen },
            ].map(({ label, value, icon: Icon }) => (
              <Box key={label} px={4} py={3} borderRadius="xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
                <HStack gap={2} mb={1}>
                  <Icon size={14} color="rgba(255,255,255,0.7)" />
                  <Text fontSize="2xs" fontWeight="bold" color="whiteAlpha.700" textTransform="uppercase" letterSpacing="wide">
                    {label}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="semibold" color="white" lineClamp={1}>{value}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── PHOTO BOARD ── */}
      <Box>
        <HStack mb={1} gap={2}>
          <Flower2 size={18} color="var(--chakra-colors-purple-500)" />
          <Heading size="md" color="gray.800">Bacheca fotografica</Heading>
        </HStack>
        <Text color="gray.500" fontSize="sm" mb={5}>
          Un racconto visuale mese per mese delle attività di {child?.firstName ?? "tuo figlio"}.
        </Text>

        <SimpleGrid columns={{ base: 1, md: 2, xl: 3 }} gap={5}>
          {monthlyBoard.map((entry) => {
            const Icon = entry.icon;
            return (
              <Box
                key={entry.month}
                borderRadius="2xl" overflow="hidden" bg="white"
                shadow="md" border="1px solid" borderColor="gray.100"
                transition="transform 0.2s ease, box-shadow 0.2s ease"
                _hover={{ transform: "translateY(-4px)", shadow: "xl" }}
                cursor="default"
              >
                {/* Image */}
                <Box position="relative" overflow="hidden" h="200px">
                  <Image src={entry.image} alt={entry.title} w="100%" h="100%" objectFit="cover"
                    transition="transform 0.3s ease"
                    _hover={{ transform: "scale(1.04)" }}
                  />
                  {/* Gradient overlay */}
                  <Box
                    position="absolute" bottom={0} left={0} right={0} h="60px"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }}
                  />
                  {/* Month badge */}
                  <Box
                    position="absolute" top={3} left={3}
                    px={3} py={1} borderRadius="full"
                    style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(8px)' }}
                    shadow="sm"
                  >
                    <Text fontSize="xs" fontWeight="bold" color="gray.700">{entry.month}</Text>
                  </Box>
                  {/* Category pill */}
                  <Box position="absolute" bottom={3} left={3}>
                    <HStack gap={1} px={2} py={1} borderRadius="full"
                      style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(6px)' }}
                    >
                      <Icon size={11} />
                      <Text fontSize="2xs" fontWeight="bold" color="gray.700">{entry.badge}</Text>
                    </HStack>
                  </Box>
                </Box>

                {/* Body */}
                <Box p={5}>
                  <Heading size="sm" color="gray.800" mb={1}>{entry.title}</Heading>
                  <Text fontSize="sm" color="gray.500" lineClamp={2}>{entry.note}</Text>
                </Box>
              </Box>
            );
          })}
        </SimpleGrid>
      </Box>

      {/* ── CALENDAR ── */}
      <Box bg="white" borderRadius="2xl" shadow="md" border="1px solid" borderColor="gray.100" overflow="hidden">
        <Box px={6} py={4} borderBottom="1px solid" borderColor="gray.100"
          bg="linear-gradient(90deg, #f0f4ff 0%, #faf5ff 100%)"
        >
          <HStack gap={3}>
            <Box p={2} borderRadius="lg" bg="purple.100">
              <CalendarDays size={18} color="var(--chakra-colors-purple-600)" />
            </Box>
            <Box>
              <Text fontSize="xs" fontWeight="bold" color="purple.500" textTransform="uppercase" letterSpacing="wide">Calendario</Text>
              <Heading size="sm" color="gray.800">Settimana di {child?.firstName ?? "tuo figlio"}</Heading>
            </Box>
            <Badge colorPalette="purple" borderRadius="full" ml="auto">Sola lettura</Badge>
          </HStack>
        </Box>
        <Box p={4}>
          <CalendarView targetUserId={child?.id} />
        </Box>
      </Box>

    </VStack>
  );
}
