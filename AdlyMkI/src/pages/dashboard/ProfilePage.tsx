import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Avatar,
  Button,
  HStack,
  Card,
  Badge,
  SimpleGrid,
  Input,
  Separator,
  Center,
  Textarea
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { Upload, MapPin, Users, ShieldCheck, NotebookPen } from 'lucide-react';
import { mockFacilities, mockUsers, type User } from '../../data/mockData';
import { useParams, Navigate, useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const { user: currentUser, guestAccounts } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();
  
  const [targetUser, setTargetUser] = useState<User | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(true);
  const [educatorNote, setEducatorNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);
  
  useEffect(() => {
    if (!currentUser) return;

    let userToView = currentUser;
    if (userId && userId !== currentUser.id) {
      // Find from mockUsers or guestAccounts
      userToView = mockUsers.find(u => u.id === userId) 
        || guestAccounts.find(g => g.user.id === userId)?.user 
        || currentUser; // fallback?
        
      if (userToView === currentUser) {
         setTargetUser(null);
         return; // Target user not found
      }
      
      // Determine authorization
      const isParent = currentUser.roles.includes('parent');
      const isAdmin = currentUser.roles.includes('admin');
      
      if (isAdmin) {
        setIsAuthorized(true);
      } else if (isParent) {
        // Parent can only view their kids
        setIsAuthorized(!!currentUser.childrenIds?.includes(userToView.id));
      } else {
        // Educators / Guests can view if they share a facility
        const sharedFacility = userToView.facilityIds?.some(fId => currentUser.facilityIds?.includes(fId));
        setIsAuthorized(!!sharedFacility);
      }
    } else {
      setIsAuthorized(true);
    }
    
    setTargetUser(userToView);
    setAvatarUrl(userToView.avatarUrl);
    const saved = localStorage.getItem(`educator_note_${userToView.id}`);
    setEducatorNote(saved ?? '');
    setNoteSaved(false);
  }, [currentUser, userId, guestAccounts]);
  
  if (!currentUser) return null;
  if (!targetUser && userId !== currentUser.id) return <Center h="50vh"><Text>Utente non trovato.</Text></Center>;
  if (!isAuthorized) {
    return (
      <Center h="50vh">
        <VStack>
          <ShieldCheck size={48} color="var(--chakra-colors-red-500)" />
          <Heading size="md">Accesso Negato</Heading>
          <Text>Non hai i permessi per visualizzare questo profilo.</Text>
        </VStack>
      </Center>
    );
  }

  const isOwnProfile = targetUser!.id === currentUser.id;
  const isGuest = targetUser!.roles.includes('guest');
  const isEducator = targetUser!.roles.includes('educator');
  const isParent = targetUser!.roles.includes('parent');
  const isAdmin = targetUser!.roles.includes('admin');
  const viewerIsEducator = currentUser.roles.includes('educator') || currentUser.roles.includes('coordinator');

  const saveNote = () => {
    localStorage.setItem(`educator_note_${targetUser!.id}`, educatorNote);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // Handle fake upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0 && isOwnProfile) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAvatarUrl(imageUrl);
    }
  };

  // Helper context functions
  const getAssignedFacilities = () => {
    return mockFacilities.filter(f => targetUser!.facilityIds?.includes(f.id));
  };
  
  const getReferenceEducator = () => {
    if (!targetUser!.referenceEducatorId) return null;
    return mockUsers.find(u => u.id === targetUser!.referenceEducatorId);
  };

  const getReferenceTutor = () => {
    if (!targetUser!.parentId) return null;
    return mockUsers.find(u => u.id === targetUser!.parentId);
  };
  
  const getGuestsForEducator = () => {
    return mockUsers.filter(u => u.roles.includes('guest') && u.referenceEducatorId === targetUser!.id);
  };
  
  const getChildren = () => {
    if (!targetUser!.childrenIds) return [];
    return mockUsers.filter(u => targetUser!.childrenIds?.includes(u.id));
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxW="1200px" mx="auto">
      <VStack align="stretch" gap={8}>
        
        {/* Header Section */}
        <Box>
          <Heading size="lg" color="gray.800">{isOwnProfile ? "Il Tuo Profilo" : `Profilo di ${targetUser!.firstName}`}</Heading>
          <Text color="gray.600">{isOwnProfile ? "Gestisci le tue informazioni personali e preferenze." : "Dettagli anagrafici e operativi."}</Text>
        </Box>

        <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
          
          {/* Main Info Card */}
          <Card.Root p={6} bg="white" shadow="sm" borderRadius="xl" gridColumn={{ md: 'span 1' }}>
            <VStack gap={4} align="center" textAlign="center">
              <Box position="relative">
                <Avatar.Root size="2xl" width="120px" height="120px" bg="blue.500">
                  <Avatar.Image src={avatarUrl} />
                  <Avatar.Fallback name={`${targetUser!.firstName} ${targetUser!.lastName}`} />
                </Avatar.Root>
                {isOwnProfile && (
                  <Box 
                    position="absolute" 
                    bottom={0} 
                    right={0} 
                    bg="white" 
                    p={1} 
                    borderRadius="full" 
                    shadow="md"
                    border="1px solid"
                    borderColor="gray.200"
                  >
                    <label htmlFor="avatar-upload" style={{ cursor: 'pointer' }}>
                      <Upload size={16} color="var(--chakra-colors-blue-500)" />
                    </label>
                    <Input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*" 
                      display="none" 
                      onChange={handlePhotoUpload}
                    />
                  </Box>
                )}
              </Box>
              
              <Box>
                <Heading size="md" color="gray.800">{targetUser!.firstName} {targetUser!.lastName}</Heading>
                <Text color="gray.500">@{targetUser!.firstName.toLowerCase()}.{targetUser!.lastName.toLowerCase()}</Text>
              </Box>

              <HStack gap={2} flexWrap="wrap" justify="center">
                {targetUser!.roles.map((role: string) => (
                  <Badge key={role} colorPalette="blue" textTransform="uppercase">
                    {role}
                  </Badge>
                ))}
              </HStack>

              <Separator />

              <VStack w="100%" align="stretch" gap={3}>
                <HStack justify="space-between">
                  <Text color="gray.500" fontSize="sm">Nome</Text>
                  <Text fontWeight="medium" color="gray.800">{targetUser!.firstName}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500" fontSize="sm">Cognome</Text>
                  <Text fontWeight="medium" color="gray.800">{targetUser!.lastName}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500" fontSize="sm">Email</Text>
                  <Text fontWeight="medium" color="gray.800">{targetUser!.email ?? 'Non specificata'}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.500" fontSize="sm">Telefono</Text>
                  <Text fontWeight="medium" color="gray.800">{targetUser!.phone ?? 'Non inserito'}</Text>
                </HStack>
              </VStack>

              {isOwnProfile && (
                <Button w="100%" mt={2} colorPalette="blue" variant="outline">
                  Modifica Password
                </Button>
              )}
            </VStack>
          </Card.Root>

          {/* Context-Specific Info Columns */}
          <Card.Root p={6} bg="white" shadow="sm" borderRadius="xl" gridColumn={{ md: 'span 2' }}>
            <VStack align="stretch" gap={6} h="100%">
              
              {/* === GUEST SECTION === */}
              {isGuest && (
                <>
                  <Heading size="sm" color="blue.600" display="flex" alignItems="center" gap={2}>
                    <MapPin size={20} /> La Mia Struttura
                  </Heading>
                  {getAssignedFacilities().length > 0 ? (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      {getAssignedFacilities().map(f => (
                        <Box key={f.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                          <Text fontWeight="bold" color="gray.800">{f.name}</Text>
                          <Text fontSize="sm" color="gray.500">{f.address}</Text>
                          <Badge mt={2} colorPalette="green">{f.type === 'residential' ? 'Residenziale' : 'Diurno'}</Badge>
                        </Box>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text color="gray.500">Nessuna struttura assegnata.</Text>
                  )}

                  <Separator />

                  <Box>
                    <Text fontWeight="bold" color="gray.700" mb={3}>Educatore di Riferimento</Text>
                    {getReferenceEducator() ? (
                        <HStack 
                          p={3} 
                          bg="gray.50" 
                          borderRadius="lg"
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => navigate(`/dashboard/profile/${getReferenceEducator()?.id}`)}
                        >
                        <Avatar.Root size="sm">
                          <Avatar.Image src={getReferenceEducator()?.avatarUrl} />
                          <Avatar.Fallback name={`${getReferenceEducator()?.firstName} ${getReferenceEducator()?.lastName}`} />
                        </Avatar.Root>
                        <Text fontWeight="medium" color="gray.800">{getReferenceEducator()?.firstName} {getReferenceEducator()?.lastName}</Text>
                      </HStack>
                    ) : (
                      <Text color="gray.500">Nessun educatore assegnato.</Text>
                    )}
                  </Box>

                  <Box>
                    <Text fontWeight="bold" color="gray.700" mb={3}>Familiare / Tutore Legale</Text>
                    {getReferenceTutor() ? (
                        <HStack 
                          p={3} 
                          bg="gray.50" 
                          borderRadius="lg"
                          cursor="pointer"
                          _hover={{ bg: "gray.100" }}
                          onClick={() => navigate(`/dashboard/profile/${getReferenceTutor()?.id}`)}
                        >
                        <Avatar.Root size="sm">
                          <Avatar.Image src={getReferenceTutor()?.avatarUrl} />
                          <Avatar.Fallback name={`${getReferenceTutor()?.firstName} ${getReferenceTutor()?.lastName}`} />
                        </Avatar.Root>
                        <Text fontWeight="medium" color="gray.800">{getReferenceTutor()?.firstName} {getReferenceTutor()?.lastName}</Text>
                      </HStack>
                    ) : (
                      <Text color="gray.500">Nessun familiare o tutore legale assegnato.</Text>
                    )}
                  </Box>
                </>
              )}

              {/* === EDUCATOR SECTION === */}
              {isEducator && (
                <>
                  <Heading size="sm" color="blue.600" display="flex" alignItems="center" gap={2}>
                    <MapPin size={20} /> Strutture Assegnate
                  </Heading>
                  {getAssignedFacilities().length > 0 ? (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      {getAssignedFacilities().map(f => (
                        <Box key={f.id} p={4} border="1px solid" borderColor="gray.200" borderRadius="lg">
                          <Text fontWeight="bold" color="gray.800">{f.name}</Text>
                          <Text fontSize="sm" color="gray.500">{f.address}</Text>
                          <Badge mt={2} colorPalette="green">{f.type === 'residential' ? 'Residenziale' : 'Diurno'}</Badge>
                        </Box>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text color="gray.500">Nessuna struttura assegnata.</Text>
                  )}

                  <Separator />

                  <Heading size="sm" color="blue.600" display="flex" alignItems="center" gap={2}>
                    <Users size={20} /> Ospiti Seguiti (Tutor)
                  </Heading>
                  {getGuestsForEducator().length > 0 ? (
                    <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                      {getGuestsForEducator().map(guest => (
                        <HStack 
                          key={guest.id} 
                          p={3} 
                          border="1px solid" 
                          borderColor="gray.200" 
                          borderRadius="lg"
                          cursor="pointer"
                          _hover={{ bg: "gray.50" }}
                            onClick={() => navigate(`/dashboard/profile/${guest.id}`)}
                        >
                          <Avatar.Root size="sm">
                            <Avatar.Image src={guest.avatarUrl} />
                            <Avatar.Fallback name={`${guest.firstName} ${guest.lastName}`} />
                          </Avatar.Root>
                          <Text fontWeight="medium" color="blue.600">{guest.firstName} {guest.lastName}</Text>
                        </HStack>
                      ))}
                    </SimpleGrid>
                  ) : (
                    <Text color="gray.500" fontSize="sm">Attualmente non sei assegnato come educatore di riferimento per nessun ospite.</Text>
                  )}
                </>
              )}

              {/* === PARENT SECTION === */}
              {isParent && (
                <>
                  <Heading size="sm" color="blue.600" display="flex" alignItems="center" gap={2}>
                    <Users size={20} /> I Tuoi Ragazzi
                  </Heading>
                  <Text color="gray.600" fontSize="sm" mb={2}>
                    Questi sono gli ospiti associati al tuo account che stai seguendo:
                  </Text>
                  {getChildren().length > 0 ? (
                    <VStack align="stretch" gap={3}>
                      {getChildren().map(child => (
                          <HStack 
                            key={child.id} 
                            p={4} 
                            border="1px solid" 
                            borderColor="gray.200" 
                            borderRadius="lg" 
                            justify="space-between"
                            cursor="pointer"
                            _hover={{ bg: "gray.50" }}
                            onClick={() => navigate(`/dashboard/profile/${child.id}`)}
                          >
                          <HStack>
                            <Avatar.Root size="md">
                              <Avatar.Image src={child.avatarUrl} />
                              <Avatar.Fallback name={`${child.firstName} ${child.lastName}`} />
                            </Avatar.Root>
                            <Box>
                              <Text fontWeight="bold" color="gray.800">{child.firstName} {child.lastName}</Text>
                              <HStack gap={2}>
                                <Badge colorPalette="blue" size="sm">LG. {child.level ?? 1}</Badge>
                                <Text fontSize="xs" color="gray.500">{child.xp ?? 0} XP Totali</Text>
                              </HStack>
                            </Box>
                          </HStack>
                          <Button size="sm" colorPalette="blue" variant="ghost">Vedi Bacheca</Button>
                        </HStack>
                      ))}
                    </VStack>
                  ) : (
                    <Text color="gray.500">Nessun ragazzo associato al momento.</Text>
                  )}
                </>
              )}

              {/* === ADMIN PLACEHOLDER === */}
              {isAdmin && (
                <>
                  <Heading size="sm" color="red.600" display="flex" alignItems="center" gap={2}>
                    <ShieldCheck size={20} /> Accesso Amministrativo Globale
                  </Heading>
                  <Text color="gray.600">Hai pieno accesso a tutte le configurazioni della piattaforma, alle statistiche globali e alla gestione utenti dell'intera rete valdese.</Text>
                </>
              )}

              {/* === NOTE EDUCATORE (visibili solo all'educatore) === */}
              {isGuest && viewerIsEducator && !isOwnProfile && (
                <>
                  <Separator />
                  <Heading size="sm" color="purple.600" display="flex" alignItems="center" gap={2}>
                    <NotebookPen size={20} /> Note riservate educatore
                  </Heading>
                  <Text fontSize="sm" color="gray.500">Queste note sono visibili solo agli educatori e coordinatori.</Text>
                  <Textarea
                    value={educatorNote}
                    onChange={(e) => { setEducatorNote(e.currentTarget.value); setNoteSaved(false); }}
                    placeholder="Inserisci considerazioni, osservazioni o note su questo ospite..."
                    rows={5}
                    bg="purple.50"
                    border="1px solid"
                    borderColor="purple.200"
                    color="gray.800"
                    _placeholder={{ color: 'gray.400' }}
                    resize="vertical"
                  />
                  <HStack justify="flex-end">
                    <Button size="sm" colorPalette="purple" onClick={saveNote}>
                      {noteSaved ? 'Salvato!' : 'Salva nota'}
                    </Button>
                  </HStack>
                </>
              )}

            </VStack>
          </Card.Root>

        </SimpleGrid>
      </VStack>
    </Box>
  );
}