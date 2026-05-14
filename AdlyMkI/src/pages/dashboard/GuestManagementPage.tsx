import { useState, useRef, type FormEvent } from "react";
import { Box, Button, Heading, HStack, Input, Stack, Text, VStack, SimpleGrid, Image } from "@chakra-ui/react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth, type GuestAccount } from "../../context/AuthContext";
import { mockFacilities, mockUsers } from "../../data/mockData";
import { FileText, Camera } from "lucide-react";

const structureToFacilityId: Record<string, string> = {
  "struttura-1": "f1",
  "struttura-2": "f2",
  "struttura-3": "f3",
  "struttura-4": "f4",
  "struttura-5": "f5",
  "struttura-6": "f6",
};

const sexLabels: Record<string, string> = {
  maschio: "Maschio",
  femmina: "Femmina",
  "non-specificato": "Non specificato",
  altro: "Altro",
};

export function GuestManagementPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedStructure, registerGuest, deleteGuest, guestAccounts } = useAuth();
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestCitizenship, setGuestCitizenship] = useState("");
  const [guestBirthDate, setGuestBirthDate] = useState("");
  const [guestItalyEntryDate, setGuestItalyEntryDate] = useState("");
  const [guestFacilityEntryDate, setGuestFacilityEntryDate] = useState("");
  const [guestSex, setGuestSex] = useState("");
  const [guestFacilityType, setGuestFacilityType] = useState<'daily' | 'residential' | ''>('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [createdGuest, setCreatedGuest] = useState<GuestAccount | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFacilityId = selectedStructure ? structureToFacilityId[selectedStructure] : undefined;
  const selectedFacility = selectedFacilityId ? mockFacilities.find((facility) => facility.id === selectedFacilityId) : undefined;
  const mockGuestsInFacility = mockUsers.filter((user) => user.roles.includes("guest") && user.facilityIds?.includes(selectedFacilityId ?? ""));
  const createdGuestsInFacility = guestAccounts.filter((account) => account.facilityId === selectedFacilityId);
  const guestsInFacility = [
    ...mockGuestsInFacility.map((guest) => ({
      id: guest.id,
      firstName: guest.firstName,
      lastName: guest.lastName,
      username: guest.firstName,
      citizenship: "",
      birthDate: "",
      facilityEntryDate: "",
      sex: "",
    })),
    ...createdGuestsInFacility.slice().reverse().map((account) => ({
      id: account.user.id,
      accountId: account.id,
      firstName: account.user.firstName,
      lastName: account.user.lastName,
      username: account.username,
      citizenship: account.citizenship,
      birthDate: account.birthDate,
      facilityEntryDate: account.facilityEntryDate,
      sex: account.sex,
    })),
  ];
  const isListView = location.pathname.endsWith("/list");

  const handleCreateGuest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFacilityId) {
      return;
    }

    const newGuest = registerGuest({
      firstName: guestFirstName,
      lastName: guestLastName,
      facilityId: selectedFacilityId,
      citizenship: guestCitizenship,
      birthDate: guestBirthDate,
      italyEntryDate: guestItalyEntryDate,
      facilityEntryDate: guestFacilityEntryDate,
      sex: guestSex,
      facilityType: guestFacilityType || undefined,
      avatarUrl: avatarPreview ?? undefined,
    });

    if (newGuest) {
      setCreatedGuest(newGuest);
      setGuestFirstName("");
      setGuestLastName("");
      setGuestCitizenship("");
      setGuestBirthDate("");
      setGuestItalyEntryDate("");
      setGuestFacilityEntryDate("");
      setGuestSex("");
      setGuestFacilityType('');
      setAvatarPreview(null);
    }
  };

  return (
    <VStack align="stretch" gap={6}>

      {!isListView && <Box p={6} bg="white" borderRadius="xl" shadow="sm">
        <Heading size="md" mb={2} color="gray.800">Aggiungi ospite</Heading>
        <Text color="gray.500" mb={4}>
          Inserisci i dati del nuovo ospite per generare username e password della struttura.
        </Text>

        {selectedFacility ? (
          <form onSubmit={handleCreateGuest}>
            <Stack gap={4}>
              {/* Foto profilo */}
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={3} color="gray.700">Foto profilo (opzionale)</Text>
                <HStack gap={4} align="center">
                  <Box
                    w="90px" h="90px" borderRadius="full" overflow="hidden"
                    border="2px dashed" borderColor="blue.300"
                    bg="blue.50" cursor="pointer" flexShrink={0}
                    display="flex" alignItems="center" justifyContent="center"
                    onClick={() => fileInputRef.current?.click()}
                    _hover={{ borderColor: "blue.500", bg: "blue.100" }}
                    transition="all 0.15s"
                    position="relative"
                  >
                    {avatarPreview ? (
                      <Image src={avatarPreview} alt="Anteprima" w="full" h="full" objectFit="cover" />
                    ) : (
                      <VStack gap={1} color="blue.400">
                        <Camera size={24} />
                        <Text fontSize="2xs" fontWeight="medium" textAlign="center" lineHeight="1.2">Aggiungi foto</Text>
                      </VStack>
                    )}
                  </Box>
                  <VStack align="start" gap={1}>
                    <Button size="sm" variant="outline" colorPalette="blue" onClick={() => fileInputRef.current?.click()}>
                      {avatarPreview ? "Cambia foto" : "Carica foto"}
                    </Button>
                    {avatarPreview && (
                      <Button size="sm" variant="ghost" colorPalette="red" onClick={() => setAvatarPreview(null)}>
                        Rimuovi
                      </Button>
                    )}
                    <Text fontSize="xs" color="gray.400">JPG, PNG · max 5 MB</Text>
                  </VStack>
                </HStack>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => setAvatarPreview(ev.target?.result as string);
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </Box>

              <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Nome</Text>
                  <Input value={guestFirstName} onChange={(e) => setGuestFirstName(e.currentTarget.value)} placeholder="Nome ospite" bg="gray.50" color="gray.900" _placeholder={{ color: "gray.500" }} required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Cognome</Text>
                  <Input value={guestLastName} onChange={(e) => setGuestLastName(e.currentTarget.value)} placeholder="Cognome ospite" bg="gray.50" color="gray.900" _placeholder={{ color: "gray.500" }} required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Cittadinanza</Text>
                  <Input value={guestCitizenship} onChange={(e) => setGuestCitizenship(e.currentTarget.value)} placeholder="Es: italiana, marocchina, romena" bg="gray.50" color="gray.900" _placeholder={{ color: "gray.500" }} required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Data di nascita</Text>
                  <Input type="date" value={guestBirthDate} onChange={(e) => setGuestBirthDate(e.currentTarget.value)} bg="gray.50" color="gray.900" required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Data ingresso in Italia</Text>
                  <Input type="date" value={guestItalyEntryDate} onChange={(e) => setGuestItalyEntryDate(e.currentTarget.value)} bg="gray.50" color="gray.900" required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Data ingresso struttura</Text>
                  <Input type="date" value={guestFacilityEntryDate} onChange={(e) => setGuestFacilityEntryDate(e.currentTarget.value)} bg="gray.50" color="gray.900" required />
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Sesso</Text>
                  <Box position="relative">
                    <select
                      value={guestSex}
                      onChange={(e) => setGuestSex(e.currentTarget.value)}
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingLeft: "12px",
                        paddingRight: "40px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        background: "#f7fafc",
                        color: guestSex ? "#1a202c" : "#718096",
                        outline: "none",
                        appearance: "none",
                      }}
                    >
                      <option value="" disabled>Seleziona sesso</option>
                      <option value="maschio">Maschio</option>
                      <option value="femmina">Femmina</option>
                      <option value="non-specificato">Non specificato</option>
                      <option value="altro">Altro</option>
                    </select>
                    <Text position="absolute" right={3} top="50%" transform="translateY(-50%)" color="gray.500" pointerEvents="none" fontSize="sm">▼</Text>
                  </Box>
                </Box>
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.700">Struttura</Text>
                  <Box position="relative">
                    <select
                      value={guestFacilityType}
                      onChange={(e) => setGuestFacilityType(e.currentTarget.value as 'daily' | 'residential' | '')}
                      required
                      style={{
                        width: "100%",
                        height: "40px",
                        paddingLeft: "12px",
                        paddingRight: "40px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        background: "#f7fafc",
                        color: guestFacilityType ? "#1a202c" : "#718096",
                        outline: "none",
                        appearance: "none",
                      }}
                    >
                      <option value="" disabled>Seleziona tipo</option>
                      <option value="daily">Centro diurno</option>
                      <option value="residential">Residenza</option>
                    </select>
                    <Text position="absolute" right={3} top="50%" transform="translateY(-50%)" color="gray.500" pointerEvents="none" fontSize="sm">▼</Text>
                  </Box>
                </Box>
              </SimpleGrid>

              <Button type="submit" colorPalette="blue" alignSelf="start">
                Salva ospite e genera credenziali per {selectedFacility.name}
              </Button>

              {createdGuest && (
                <Box p={4} borderRadius="lg" bg="blue.50" border="1px solid" borderColor="blue.100">
                  <Text fontWeight="bold" color="blue.800" mb={2}>Credenziali generate</Text>
                  <Text color="blue.900" id="name" >Username: {createdGuest.username}</Text>
                  <Text color="blue.900" id="password" >Password: {createdGuest.password}</Text>
                  <Text color="blue.900" id="citizen" >Cittadinanza: {createdGuest.citizenship}</Text>
                  <Text color="blue.900" id="date" >Data di nascita: {createdGuest.birthDate}</Text>
                  <Text color="blue.900" id="italyArrive" >Ingresso in Italia: {createdGuest.italyEntryDate}</Text>
                  <Text color="blue.900" id="structureArrive" >Data ingresso struttura: {createdGuest.facilityEntryDate}</Text>
                  <Text color="blue.900" id="sex" >Sesso: {sexLabels[createdGuest.sex] ?? createdGuest.sex}</Text>
                  <Button
                    mt={4}
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => navigate("/dashboard/guests/list")}
                  >
                    Vai all’elenco ospiti
                  </Button>
                </Box>
              )}
            </Stack>
          </form>
        ) : (
          <Text color="gray.500">Seleziona una struttura dall'accesso educatore per creare nuovi ospiti.</Text>
        )}
      </Box>}

      {isListView && (
        <Box p={6} bg="white" borderRadius="xl" shadow="sm">
          <Heading size="md" mb={4} color="gray.800">Elenco ospiti</Heading>
          {guestsInFacility.length > 0 ? (
            <Stack gap={3}>
              {guestsInFacility.map((guest) => (
                <Box
                  key={guest.id}
                  p={3}
                  bg="gray.50"
                  borderRadius="md"
                  cursor="pointer"
                  _hover={{ bg: "gray.100" }}
                  onClick={() => navigate(`/dashboard/profile/${guest.id}`)}
                >
                  <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={3}>
                    <Box>
                      <Text fontWeight="medium" color="blue.600">{guest.firstName} {guest.lastName}</Text>
                      <Text fontSize="sm" color="gray.500">{guest.username}</Text>
                      {(guest.citizenship || guest.birthDate) && (
                        <Text fontSize="sm" color="gray.500">{guest.citizenship} {guest.birthDate ? `• ${guest.birthDate}` : ""}</Text>
                      )}
                      <Text fontSize="sm" color="gray.500">
                        Struttura: {guest.facilityEntryDate || selectedFacility?.name || "Non disponibile"}
                        {guest.sex ? ` • Sesso: ${sexLabels[guest.sex] ?? guest.sex}` : ""}
                      </Text>
                    </Box>
                    <HStack gap={2}>
                      <Button colorPalette="blue" variant="outline" onClick={(e) => { e.stopPropagation(); navigate(`/dashboard/guests/report/${guest.id}`); }}>
                        <HStack gap={2}>
                          <FileText size={18} />
                          <Text>Report mensile</Text>
                        </HStack>
                      </Button>
                      {'accountId' in guest && (
                        <Button
                          colorPalette="red" variant="outline" size="sm"
                          onClick={(e) => { e.stopPropagation(); deleteGuest(guest.accountId as string); }}
                        >
                          Elimina
                        </Button>
                      )}
                    </HStack>
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <Text color="gray.500">Nessun ospite disponibile per questa struttura.</Text>
          )}
        </Box>
      )}
    </VStack>
  );
}
