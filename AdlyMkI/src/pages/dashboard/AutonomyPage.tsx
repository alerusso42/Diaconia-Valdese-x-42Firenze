import { Box, Heading, Text, VStack, SimpleGrid, HStack } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { mockAchievements, mockTasks } from "../../data/mockData";
import { Sparkles, ChefHat, Medal, Trophy } from "lucide-react";

// Use framer-motion with Chakra's generic Box for cards to avoid conflicts
const MotionBox = motion(Box as any);

const iconMap: Record<string, any> = {
  Sparkles, ChefHat, Medal
};

export function AutonomyPage() {
  const { user } = useAuth();
  
  const xp = user?.xp || 0;
  const level = user?.level || 1;
  const nextLevelXp = level * 200;
  const progressPercent = Math.min((xp / nextLevelXp) * 100, 100);

  const completedTasks = mockTasks.filter(t => t.assignedTo === user?.id && (t.status === 'completed' || t.status === 'pending_verification'));

  return (
    <VStack align="stretch" gap={8} w="100%">
      <Box>
        <Heading size="lg" mb={2} color="gray.800">Il Tuo Percorso di Autonomia</Heading>
        <Text color="gray.600">Completa i compiti per guadagnare XP, salire di livello e sbloccare trofei!</Text>
      </Box>

      {/* Progress Section */}
      <Box bg="white" p={6} borderRadius="xl" shadow="sm">
        <HStack justify="space-between" mb={3}>
          <Heading size="md" color="gray.800">Livello {level}</Heading>
          <Text fontWeight="bold" color="blue.600">{xp} / {nextLevelXp} XP</Text>
        </HStack>
        <Box w="100%" bg="gray.100" h={4} borderRadius="full" overflow="hidden">
          <Box bg="blue.500" h="100%" w={`${progressPercent}%`} transition="width 1s ease-in-out" />
        </Box>
        <Text fontSize="sm" color="gray.500" mt={2} textAlign="right">Ancora {nextLevelXp - xp} XP per il prossimo livello!</Text>
      </Box>

      {/* Achievements Grid */}
      <Box>
        <Heading size="md" mb={4} color="gray.800">I Tuoi Trofei</Heading>
        <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
          {mockAchievements.map((ach, i) => {
            const isUnlocked = xp >= ach.requiredXp;
            const Icon = iconMap[ach.icon] || Trophy;

            return (
              <MotionBox 
                key={ach.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                p={5} 
                bg={isUnlocked ? "yellow.50" : "gray.50"} 
                borderColor={isUnlocked ? "yellow.400" : "gray.200"}
                borderWidth="2px"
                shadow="sm" 
                borderRadius="xl"
                opacity={isUnlocked ? 1 : 0.6}
              >
                <VStack>
                  <Box p={3} bg={isUnlocked ? "yellow.400" : "gray.300"} borderRadius="full" color="white" mb={2} shadow={isUnlocked ? "md" : "none"}>
                    <Icon size={32} />
                  </Box>
                  <Heading size="sm" textAlign="center" color="gray.800">{ach.title}</Heading>
                  <Text fontSize="sm" color="gray.600" textAlign="center" minH="40px">{ach.description}</Text>
                  
                  {isUnlocked ? (
                    <Box mt={2} px={3} py={1} bg="yellow.100" color="yellow.800" borderRadius="md" fontSize="xs" fontWeight="bold">
                      Sbloccato!
                    </Box>
                  ) : (
                    <Box mt={2} px={3} py={1} bg="gray.200" color="gray.600" borderRadius="md" fontSize="xs" fontWeight="bold">
                      Richiede {ach.requiredXp} XP
                    </Box>
                  )}
                </VStack>
              </MotionBox>
            )
          })}
        </SimpleGrid>
      </Box>

      {/* History */}
      <Box bg="white" p={6} borderRadius="xl" shadow="sm">
        <Heading size="md" mb={4} color="gray.800">Storico Compiti Completati</Heading>
        <VStack align="stretch" gap={3}>
          {completedTasks.length > 0 ? completedTasks.map(t => (
            <HStack key={t.id} justify="space-between" p={4} bg="gray.50" borderRadius="md" borderLeft="4px solid" borderColor="green.400">
              <Box>
                <Text fontWeight="bold" color="gray.700">{t.title}</Text>
                <Text fontSize="sm" color="gray.500">
                  {t.completedAt ? new Date(t.completedAt).toLocaleDateString('it-IT') : 'Completato di recente'}
                </Text>
              </Box>
              <Text fontWeight="black" color="green.500" fontSize="lg">+{t.difficultyWeight * 10} XP</Text>
            </HStack> 
          )) : (
            <Text color="gray.500" fontStyle="italic">Nessun compito completato per ora. Inizia subito per guadagnare punti!</Text>
          )}
        </VStack>
      </Box>
    </VStack>
  );
}