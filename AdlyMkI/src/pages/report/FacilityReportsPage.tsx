import type { ReactNode } from "react";
import { Box, Button, Card, Heading, HStack, SimpleGrid, Stack, Text, VStack } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowLeft, BarChart3, CheckCircle2, CircleAlert, PieChart as PieChartIcon, Trophy, Users } from "lucide-react";
import { mockFacilities, mockTasks, mockUsers, type Task, type TaskType } from "../../data/mockData";

const taskTypeLabels: Record<TaskType, string> = {
  chore: "Faccende",
  therapy: "Terapia",
  medical: "Sanitarie",
  learning: "Apprendimento",
  recreation: "Ricreative",
};

const pieColors = ["#2B6CB0", "#E53E3E"];

function countTasksByType(tasks: Task[]) {
  return tasks.reduce((counts, task) => {
    counts[task.type] = (counts[task.type] ?? 0) + 1;
    return counts;
  }, {} as Partial<Record<TaskType, number>>);
}

function buildTypeChartData(tasks: Task[]) {
  const counts = countTasksByType(tasks);
  const typesInFacility = Array.from(new Set(tasks.map((task) => task.type)));

  return typesInFacility.map((type) => ({
    type,
    name: taskTypeLabels[type],
    value: counts[type] ?? 0,
  }));
}

export function FacilityReportsPage() {
  const { facilityId } = useParams();
  const navigate = useNavigate();
  const facility = mockFacilities.find((item) => item.id === facilityId);

  if (!facility) {
    return (
      <VStack align="stretch" gap={6}>
        <Button alignSelf="start" variant="ghost" colorPalette="blue" onClick={() => navigate("/dashboard")}>
          <HStack gap={2}>
            <ArrowLeft size={18} />
            <Text>Torna alla dashboard</Text>
          </HStack>
        </Button>
        <Box p={6} bg="white" borderRadius="xl" shadow="sm">
          <Heading size="md" color="gray.800" mb={2}>Struttura non trovata</Heading>
          <Text color="gray.600">Non esiste una struttura associata a questo report generale.</Text>
        </Box>
      </VStack>
    );
  }

  const facilityGuests = mockUsers.filter((user) => user.roles.includes("guest") && user.facilityIds?.includes(facility.id));
  const facilityTasks = mockTasks.filter((task) => task.facilityId === facility.id);
  const completedTasks = facilityTasks.filter((task) => task.status === "completed");
  const pendingTasks = facilityTasks.filter((task) => task.status === "pending");
  const openTasks = facilityTasks.length - completedTasks.length;
  const completionRate = facilityTasks.length === 0 ? 0 : Math.round((completedTasks.length / facilityTasks.length) * 100);

  const pendingByGuest = facilityGuests.map((guest) => ({
    name: `${guest.firstName} ${guest.lastName}`,
    pending: pendingTasks.filter((task) => task.assignedTo === guest.id).length,
  }));

  const completionPieData = [
    { name: "Completati", value: completedTasks.length },
    { name: "Non completati", value: openTasks },
  ];

  const completedByType = buildTypeChartData(completedTasks).sort((first, second) => second.value - first.value);
  const criticalLowEngage = buildTypeChartData(facilityTasks)
    .map((item) => ({
      ...item,
      value: completedTasks.filter((task) => task.type === item.type).length,
    }))
    .sort((first, second) => first.value - second.value)
    .slice(0, 3);

  const contributorRanking = facilityGuests
    .map((guest) => ({
      name: `${guest.firstName} ${guest.lastName}`,
      completed: completedTasks.filter((task) => task.assignedTo === guest.id).length,
      total: facilityTasks.filter((task) => task.assignedTo === guest.id).length,
    }))
    .sort((first, second) => second.completed - first.completed);

  return (
    <VStack align="stretch" gap={6}>
      <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
        <Box>
          <Button variant="ghost" colorPalette="blue" mb={3} onClick={() => navigate("/dashboard")}>
            <HStack gap={2}>
              <ArrowLeft size={18} />
              <Text>Torna alla dashboard</Text>
            </HStack>
          </Button>
          <Heading size="lg" color="gray.800" mb={2}>Report generale struttura</Heading>
          <Text color="gray.600">{facility.name} · {facility.address}</Text>
        </Box>
      </Stack>

      <SimpleGrid columns={{ base: 1, md: 4 }} gap={4}>
        <SummaryCard icon={<Users size={22} />} label="Ospiti" value={facilityGuests.length.toString()} color="blue" />
        <SummaryCard icon={<BarChart3 size={22} />} label="Compiti totali" value={facilityTasks.length.toString()} color="purple" />
        <SummaryCard icon={<CheckCircle2 size={22} />} label="Completati" value={completedTasks.length.toString()} color="teal" />
        <SummaryCard icon={<Trophy size={22} />} label="Completamento" value={`${completionRate}%`} color="green" />
      </SimpleGrid>

      <SimpleGrid columns={{ base: 1, xl: 2 }} gap={6}>
        <ReportChartCard title="Compiti in sospeso" subtitle="Numero di compiti in sospeso per ospite" icon={<CircleAlert size={20} />}>
          <ChartFrame empty={pendingByGuest.length === 0}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={pendingByGuest} margin={{ top: 10, right: 18, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2D3748" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#2D3748" }} />
                <Tooltip />
                <Bar dataKey="pending" name="In sospeso" fill="#DD6B20" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ReportChartCard>

        <ReportChartCard title="Migliori contributori" subtitle="Rapporto tra compiti completati e compiti totali nella struttura" icon={<PieChartIcon size={20} />}>
          <SimpleGrid columns={{ base: 1, md: 2 }} gap={4} alignItems="center">
            <ChartFrame empty={facilityTasks.length === 0}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={completionPieData} cx="50%" cy="50%" innerRadius={58} outerRadius={88} paddingAngle={4} dataKey="value">
                    {completionPieData.map((entry, index) => (
                      <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartFrame>
            <VStack align="stretch" gap={2}>
              {contributorRanking.map((guest) => (
                <HStack key={guest.name} justify="space-between" p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.100">
                  <Box>
                    <Text color="gray.800" fontWeight="bold">{guest.name}</Text>
                    <Text color="gray.500" fontSize="sm">{guest.completed}/{guest.total} compiti completati</Text>
                  </Box>
                  <Text color="blue.700" fontWeight="bold">{guest.total === 0 ? 0 : Math.round((guest.completed / guest.total) * 100)}%</Text>
                </HStack>
              ))}
            </VStack>
          </SimpleGrid>
        </ReportChartCard>

        <ReportChartCard title="Tipologie più completate" subtitle="Tipologie di compiti più completate" icon={<BarChart3 size={20} />}>
          <ChartFrame empty={completedByType.length === 0}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={completedByType} margin={{ top: 10, right: 18, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2D3748" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#2D3748" }} />
                <Tooltip />
                <Bar dataKey="value" name="Compiti completati" fill="#2B6CB0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ReportChartCard>

        <ReportChartCard title="Basso coinvolgimento critico" subtitle="Le tre tipologie meno completate nella struttura" icon={<CircleAlert size={20} />}>
          <ChartFrame empty={criticalLowEngage.length === 0}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={criticalLowEngage} margin={{ top: 10, right: 18, left: -16, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#2D3748" }} interval={0} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#2D3748" }} />
                <Tooltip />
                <Bar dataKey="value" name="Compiti completati" fill="#C53030" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        </ReportChartCard>
      </SimpleGrid>
    </VStack>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: ReactNode; label: string; value: string; color: "blue" | "green" | "purple" | "teal" }) {
  const colors = {
    blue: { bg: "blue.50", border: "blue.100", text: "blue.700" },
    green: { bg: "green.50", border: "green.100", text: "green.700" },
    purple: { bg: "purple.50", border: "purple.100", text: "purple.700" },
    teal: { bg: "teal.50", border: "teal.100", text: "teal.700" },
  }[color];

  return (
    <Card.Root p={5} bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor={colors.border}>
      <HStack color={colors.text} mb={3}>
        <Box bg={colors.bg} borderRadius="md" p={2}>{icon}</Box>
        <Text color="gray.700" fontWeight="bold">{label}</Text>
      </HStack>
      <Heading size="2xl" color="gray.900">{value}</Heading>
    </Card.Root>
  );
}

function ReportChartCard({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode }) {
  return (
    <Box p={6} bg="white" borderRadius="xl" shadow="sm">
      <HStack align="start" gap={3} mb={5}>
        <Box color="white" bg="blue.700" borderRadius="md" boxSize="34px" display="flex" alignItems="center" justifyContent="center" flexShrink={0}>
          {icon}
        </Box>
        <Box>
          <Heading size="md" color="gray.800">{title}</Heading>
          <Text color="gray.600" fontSize="sm">{subtitle}</Text>
        </Box>
      </HStack>
      {children}
    </Box>
  );
}

function ChartFrame({ empty, children }: { empty: boolean; children: ReactNode }) {
  if (empty) {
    return (
      <Box h="260px" bg="gray.50" border="1px solid" borderColor="gray.100" borderRadius="lg" display="flex" alignItems="center" justifyContent="center">
        <Text color="gray.500">Nessun dato disponibile per questa struttura.</Text>
      </Box>
    );
  }

  return (
    <Box h="260px" w="100%">
      {children}
    </Box>
  );
}
