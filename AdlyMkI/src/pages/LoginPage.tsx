import { useState, type SyntheticEvent } from "react";
import { Box, Button, Center, Input, Stack, Text, VStack } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { roles } from "../data/roles";
import { mockFacilities } from "../data/mockData";

const facilityKeyById: Record<string, string> = {
  f1: "struttura-1", f2: "struttura-2", f3: "struttura-3",
  f4: "struttura-4", f5: "struttura-5", f6: "struttura-6",
};

export function LoginPage() {
  const { roleId } = useParams<{ roleId: string }>();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [selectedStructure, setSelectedStructure] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  // Find the selected role data to customize the UI
  const roleData = roles.find((r) => r.id === roleId) || roles[0];

  // Dynamic colors based on role for the presentation
  const bgColors: Record<string, string> = {
    'ospite': 'teal.50',
    'educatore': 'blue.50',
    'genitore': 'orange.50'
  };

  const handleLogin = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    // In our mock prototype, we just log them in as a mock user of that role
    if (roleId) {
      const success = login(
        roleId,
        selectedStructure || undefined,
        roleId === 'ospite' ? { username: identifier, password } : undefined
      );

      if (success) {
        setLoginError(null);
        // Navigate to their specific dashboard
        navigate('/dashboard');
        return;
      }

      setLoginError('Credenziali non valide. Controlla username e password.');
    }
  };

  return (
    <Box minH="100vh" w="100%" bg={bgColors[roleId || 'ospite'] || 'gray.50'} display="flex" alignItems="center" justifyContent="center" px={4}>
      <Box bg="white" p={{ base: 6, md: 10 }} rounded="2xl" shadow="xl" maxW="md" w="100%">
        <VStack gap={6} align="stretch">
          <Center>
            {/* If the role has an image, show the first one as a logo */}
            {roleData.images.length > 0 && (
              <Box w="80px" h="80px" overflow="hidden" borderRadius="full" bg={roleData.bg} border="2px solid" borderColor="gray.200" display="flex" alignItems="center" justifyContent="center">
                <img src={roleData.images[0]} alt={roleData.label} style={{ maxWidth: '60%', maxHeight: '60%' }} />
              </Box>
            )}
          </Center>

          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Bentornato, {roleData.label}
            </Text>
            <Text color="gray.500" fontSize="sm" mt={1}>
              Inserisci le tue credenziali per accedere
            </Text>
          </Box>
{/* ma è mai possibile? */}
          <form onSubmit={handleLogin}>
            <Stack gap={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">
                  {roleId === 'ospite' ? 'Username ospite' : 'Email o Username'}
                </Text>
                <Input
                  placeholder={roleId === 'ospite' ? 'Es: mario.rossi.f1.ab12' : 'Es: mario.rossi'}
                  bg="gray.50"
                  color="gray.900"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.currentTarget.value)}
                  required
                />
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Password</Text>
                <Input
                  type="password"
                  placeholder="••••••••"
                  bg="gray.50"
                  color="gray.900"
                  value={password}
                  onChange={(e) => setPassword(e.currentTarget.value)}
                  required
                />
              </Box>

              {roleId === 'educatore' && (
                <Box>

                {loginError && (
                  <Text color="red.500" fontSize="sm">
                    {loginError}
                  </Text>
                )}
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Struttura di riferimento</Text>
                  <Box position="relative">
                    <select
                      value={selectedStructure}
                      onChange={(e) => setSelectedStructure(e.currentTarget.value)}
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingLeft: "12px",
                        paddingRight: "40px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        background: "#f7fafc",
                        color: selectedStructure ? "#1a202c" : "#718096",
                        outline: "none",
                        appearance: "none",
                      }}
                    >
                      <option value="" disabled>Seleziona una struttura</option>
                      {mockFacilities.map(f => (
                        <option key={f.id} value={facilityKeyById[f.id]}>{f.name}</option>
                      ))}
                    </select>
                    <Text
                      position="absolute"
                      right={3}
                      top="50%"
                      transform="translateY(-50%)"
                      color="gray.500"
                      pointerEvents="none"
                      fontSize="sm"
                    >
                      ▼
                    </Text>
                  </Box>
                </Box>
              )}
              
              <Button type="submit" colorScheme="blue" size="lg" w="100%" mt={2}>
                Accedi come {roleData.label}
              </Button>
            </Stack>
          </form>

          {roleId === 'genitore' && (
            <Text fontSize="xs" textAlign="center" color="blue.500" cursor="pointer" mt={4}>
              Hai ricevuto un invito? Registrati qui.
            </Text>
          )}

          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            ← Torna alla selezione ruolo
          </Button>
        </VStack>
      </Box>
    </Box>
  );
}
