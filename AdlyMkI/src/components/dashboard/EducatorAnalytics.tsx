import { Box, Heading, Text, VStack, SimpleGrid, Card, HStack } from "@chakra-ui/react";
import { Users, AlertTriangle, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { EducatorInbox } from "../../components/tasks/EducatorInbox";

// Example mock data for Phase 5 Analytics charts
const activityData = [
  { name: 'Sett 1', task: 45 },
  { name: 'Sett 2', task: 52 },
  { name: 'Sett 3', task: 38 },
  { name: 'Sett 4', task: 65 }
];

const completionData = [
  { name: 'Completati', value: 310 },
  { name: 'Scambiati', value: 85 },
  { name: 'Falliti', value: 45 },
];
const COLORS = ['#00C49F', '#0088FE', '#FF8042'];

export function EducatorAnalytics() {
  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} mt={8}>
      <Card.Root p={6} bg="white" shadow="sm" borderRadius="xl">
        <Heading size="md" mb={4} color="gray.800">Trend Compiti (Ultimo Mese)</Heading>
        <Box h="250px" w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activityData}>
              <XAxis dataKey="name" stroke="#A0AEC0" fontSize={12} />
              <YAxis stroke="#A0AEC0" fontSize={12} />
              <Tooltip cursor={{ fill: 'transparent' }} />
              <Bar dataKey="task" fill="#3182CE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Card.Root>
      
      <Card.Root p={6} bg="white" shadow="sm" borderRadius="xl">
        <Heading size="md" mb={4} color="gray.800">Verifiche & Esiti Globali</Heading>
        <Box h="250px" w="100%">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={completionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {completionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} compiti`, 'Totale']} />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Card.Root>
    </SimpleGrid>
  );
}
