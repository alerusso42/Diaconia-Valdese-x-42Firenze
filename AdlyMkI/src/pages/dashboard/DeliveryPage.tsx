import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Heading, Badge, SimpleGrid } from '@chakra-ui/react';
import { Package, Check, Printer, Clock, Plus, X, ArrowUpDown, User } from 'lucide-react';
import { mockUsers, mockFacilities } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useDelivery, type Delivery } from '../../context/DeliveryContext';

const structureToFacilityId: Record<string, string> = {
  "struttura-1": "f1", "struttura-2": "f2", "struttura-3": "f3",
  "struttura-4": "f4", "struttura-5": "f5", "struttura-6": "f6",
};

const OBJECT_TYPES = [
  { value: 'clothing',   label: 'Vestiti' },
  { value: 'document',   label: 'Documento' },
  { value: 'package',    label: 'Pacco' },
  { value: 'medication', label: 'Farmaci' },
  { value: 'personal',   label: 'Effetti Personali' },
  { value: 'other',      label: 'Altro' },
];

function printReceipt(d: Delivery) {
  const date = new Date(d.createdAt).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const time = new Date(d.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  const html = `<!DOCTYPE html>
<html lang="it"><head><meta charset="UTF-8"/><title>Ricevuta Consegna</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Helvetica Neue',Arial,sans-serif;padding:60px 80px;color:#1a202c}
.header{text-align:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #2d3748}
.header h1{font-size:26px;font-weight:700;margin-bottom:6px}
.header p{font-size:13px;color:#718096}
.st{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#718096;margin-bottom:12px;margin-top:28px}
.row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0}
.row .l{color:#718096;font-size:14px}.row .v{font-weight:600;font-size:14px}
.badge{display:inline-block;background:#e6fffa;color:#2c7a7b;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600}
.sigs{display:flex;justify-content:space-around;margin-top:80px}
.sig{text-align:center;width:200px}.sig-line{border-top:1px solid #2d3748;padding-top:10px;font-size:12px;color:#718096}
</style></head><body>
<div class="header"><h1>Ricevuta di Consegna</h1><p>${d.facilityName}</p></div>
<div class="st">Dettagli</div>
<div class="row"><span class="l">Data</span><span class="v">${date}</span></div>
<div class="row"><span class="l">Ora</span><span class="v">${time}</span></div>
<div class="row"><span class="l">Destinatario</span><span class="v">${d.guestName}</span></div>
<div class="row"><span class="l">Tipo oggetto</span><span class="v"><span class="badge">${d.objectLabel}</span></span></div>
${d.description ? `<div class="row"><span class="l">Note</span><span class="v">${d.description}</span></div>` : ''}
<div class="row"><span class="l">Stato</span><span class="v">✓ Accettato</span></div>
<div class="sigs">
  <div class="sig"><div class="sig-line">Firma Educatore</div></div>
  <div class="sig"><div class="sig-line">Firma Ospite</div></div>
</div></body></html>`;
  const w = window.open('', '_blank', 'width=820,height=650');
  if (w) { w.document.write(html); w.document.close(); w.onload = () => w.print(); }
}

export function DeliveryPage() {
  const { selectedStructure, guestAccounts } = useAuth();
  const selectedFacilityId = selectedStructure ? structureToFacilityId[selectedStructure] : undefined;
  const facilityName = mockFacilities.find(f => f.id === selectedFacilityId)?.name ?? 'Struttura';

  const [search, setSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState('');
  const [objectType, setObjectType] = useState('');
  const [otherLabel, setOtherLabel] = useState('');
  const [description, setDescription] = useState('');
  const { deliveries, addDelivery, removeDelivery } = useDelivery();
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'type'>('date');
  const [filterGuest, setFilterGuest] = useState('');

  const guestsInFacility = mockUsers.filter(
    u => u.roles.includes('guest') && u.facilityIds?.includes(selectedFacilityId ?? '')
  );
  const createdGuests = guestAccounts
    .filter(a => a.facilityId === selectedFacilityId)
    .map(a => a.user);
  const allGuests = [...guestsInFacility, ...createdGuests];

  const filteredGuests = allGuests.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase())
  );
  const selectedGuest = allGuests.find(g => g.id === selectedGuestId);
  const canSubmit = !!selectedGuestId && !!objectType && (objectType !== 'other' || !!otherLabel.trim());

  const handleSubmit = () => {
    if (!canSubmit || !selectedGuest) return;
    const objectLabel = objectType === 'other'
      ? otherLabel.trim()
      : OBJECT_TYPES.find(o => o.value === objectType)?.label ?? objectType;
    addDelivery({
      id: `d-${Date.now()}`,
      guestId: selectedGuest.id,
      guestName: `${selectedGuest.firstName} ${selectedGuest.lastName}`,
      objectType,
      objectLabel,
      description,
      facilityName,
    });
    setSelectedGuestId(''); setObjectType(''); setOtherLabel(''); setDescription(''); setSearch('');
  };

  return (
    <Box p={4}>
      <HStack mb={6} gap={3}>
        <Package size={28} color="var(--chakra-colors-teal-600)" />
        <Heading size="lg" color="gray.800">Gestione Consegne</Heading>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} alignItems="start">

        {/* ── FORM ── */}
        <Box bg="white" borderRadius="xl" shadow="sm" border="1px solid" borderColor="gray.100" overflow="hidden">
          <Box px={6} py={4} bg="teal.500">
            <HStack gap={2}>
              <Plus size={18} color="white" />
              <Text fontWeight="bold" color="white">Nuova Richiesta di Consegna</Text>
            </HStack>
          </Box>
          <Box p={6}>

            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
              Destinatario
            </Text>
            <input
              placeholder="Cerca ospite per nome..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1a202c', backgroundColor: '#f7fafc', outline: 'none', marginBottom: '8px', fontFamily: 'inherit' }}
            />
            <Box maxH="160px" overflowY="auto" border="1px solid" borderColor="gray.200" borderRadius="lg" mb={5}>
              {filteredGuests.length === 0
                ? <Text fontSize="sm" color="gray.400" p={3} textAlign="center">Nessun ospite trovato</Text>
                : filteredGuests.map(g => (
                  <Box
                    key={g.id} px={3} py={2} cursor="pointer"
                    bg={selectedGuestId === g.id ? 'teal.50' : 'white'}
                    borderLeft="3px solid"
                    borderColor={selectedGuestId === g.id ? 'teal.400' : 'transparent'}
                    _hover={{ bg: selectedGuestId === g.id ? 'teal.50' : 'gray.50' }}
                    onClick={() => setSelectedGuestId(g.id)}
                  >
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight={selectedGuestId === g.id ? 'semibold' : 'normal'} color="gray.800">
                        {g.firstName} {g.lastName}
                      </Text>
                      {selectedGuestId === g.id && <Check size={14} color="#319795" />}
                    </HStack>
                  </Box>
                ))
              }
            </Box>

            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
              Tipo Oggetto
            </Text>
            <HStack mb={5} gap={2} flexWrap="wrap">
              {OBJECT_TYPES.map(o => (
                <Box
                  key={o.value} px={3} py={1} borderRadius="full" cursor="pointer"
                  bg={objectType === o.value ? 'teal.400' : 'gray.100'}
                  border="2px solid"
                  borderColor={objectType === o.value ? 'teal.500' : 'gray.200'}
                  onClick={() => setObjectType(o.value)}
                  transition="all 0.15s"
                  _hover={{ bg: objectType === o.value ? 'teal.400' : 'gray.200' }}
                >
                  <Text fontSize="sm" fontWeight={objectType === o.value ? 'bold' : 'normal'}
                    color={objectType === o.value ? 'white' : 'gray.700'}>
                    {o.label}
                  </Text>
                </Box>
              ))}
            </HStack>

            {objectType === 'other' && (
              <>
                <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
                  Specifica l'oggetto
                </Text>
                <input
                  placeholder="Es. scarpe, borsa, giocattolo..."
                  value={otherLabel}
                  onChange={e => setOtherLabel(e.target.value)}
                  autoFocus
                  style={{ width: '100%', fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #63B3ED', color: '#1a202c', backgroundColor: '#EBF8FF', outline: 'none', marginBottom: '20px', fontFamily: 'inherit' }}
                />
              </>
            )}

            <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
              Note (opzionale)
            </Text>
            <textarea
              placeholder="Descrivi l'oggetto o aggiungi indicazioni..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              style={{ width: '100%', fontSize: '14px', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#1a202c', backgroundColor: '#f7fafc', resize: 'none', outline: 'none', marginBottom: '24px', fontFamily: 'inherit' }}
            />

            <Button colorPalette="teal" w="full" disabled={!canSubmit} onClick={handleSubmit} size="md">
              <Package size={16} /> Crea Richiesta di Consegna
            </Button>
          </Box>
        </Box>

        {/* ── QUEUE ── */}
        <Box>
          <HStack mb={3} justify="space-between" flexWrap="wrap" gap={2}>
            <HStack gap={2}>
              <Clock size={18} color="var(--chakra-colors-gray-600)" />
              <Text fontWeight="bold" color="gray.700" fontSize="lg">Coda Consegne</Text>
              {deliveries.length > 0 && (
                <Box px={2} py="1px" bg="gray.200" borderRadius="full">
                  <Text fontSize="xs" fontWeight="bold" color="gray.600">{deliveries.length}</Text>
                </Box>
              )}
            </HStack>

            {deliveries.length > 1 && (
              <HStack gap={1}>
                <ArrowUpDown size={13} color="#718096" />
                {(['date', 'name', 'type'] as const).map(opt => (
                  <Box
                    key={opt}
                    px={3} py={1} borderRadius="full" cursor="pointer"
                    bg={sortBy === opt ? 'teal.400' : 'gray.100'}
                    border="1px solid"
                    borderColor={sortBy === opt ? 'teal.500' : 'gray.200'}
                    onClick={() => setSortBy(opt)}
                    transition="all 0.15s"
                    _hover={{ bg: sortBy === opt ? 'teal.400' : 'gray.200' }}
                  >
                    <Text fontSize="xs" fontWeight={sortBy === opt ? 'bold' : 'normal'}
                      color={sortBy === opt ? 'white' : 'gray.600'}>
                      {opt === 'date' ? 'Data' : opt === 'name' ? 'Nome' : 'Tipo'}
                    </Text>
                  </Box>
                ))}
              </HStack>
            )}
          </HStack>

          {/* Filtro per ospite */}
          {(() => {
            const uniqueGuests = [...new Set(deliveries.map(d => d.guestName))];
            if (uniqueGuests.length < 2) return null;
            return (
              <Box mb={3} p={3} bg="gray.50" borderRadius="lg" border="1px solid" borderColor="gray.200">
                <HStack gap={2} flexWrap="wrap">
                  <User size={13} color="#718096" />
                  <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide">
                    Ospite
                  </Text>
                  <Box
                    px={3} py={1} borderRadius="full" cursor="pointer"
                    bg={filterGuest === '' ? 'blue.400' : 'white'}
                    border="1px solid" borderColor={filterGuest === '' ? 'blue.500' : 'gray.300'}
                    onClick={() => setFilterGuest('')}
                    transition="all 0.15s"
                    _hover={{ bg: filterGuest === '' ? 'blue.400' : 'gray.100' }}
                  >
                    <Text fontSize="xs" fontWeight={filterGuest === '' ? 'bold' : 'normal'}
                      color={filterGuest === '' ? 'white' : 'gray.600'}>
                      Tutti
                    </Text>
                  </Box>
                  {uniqueGuests.map(name => (
                    <Box
                      key={name}
                      px={3} py={1} borderRadius="full" cursor="pointer"
                      bg={filterGuest === name ? 'blue.400' : 'white'}
                      border="1px solid" borderColor={filterGuest === name ? 'blue.500' : 'gray.300'}
                      onClick={() => setFilterGuest(filterGuest === name ? '' : name)}
                      transition="all 0.15s"
                      _hover={{ bg: filterGuest === name ? 'blue.400' : 'gray.100' }}
                    >
                      <Text fontSize="xs" fontWeight={filterGuest === name ? 'bold' : 'normal'}
                        color={filterGuest === name ? 'white' : 'gray.600'}>
                        {name}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              </Box>
            );
          })()}

          {deliveries.length === 0 ? (
            <Box p={10} bg="gray.50" borderRadius="xl" border="2px dashed" borderColor="gray.200" textAlign="center">
              <Box display="flex" justifyContent="center" mb={3}>
                <Package size={36} color="#CBD5E0" />
              </Box>
              <Text color="gray.400" fontSize="sm">Nessuna consegna in corso</Text>
              <Text color="gray.400" fontSize="xs" mt={1}>Le richieste create appariranno qui</Text>
            </Box>
          ) : (
            <VStack align="stretch" gap={3}>
              {[...deliveries]
                .filter(d => filterGuest === '' || d.guestName === filterGuest)
                .sort((a, b) => {
                if (sortBy === 'name') return a.guestName.localeCompare(b.guestName, 'it');
                if (sortBy === 'type') return a.objectLabel.localeCompare(b.objectLabel, 'it');
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
              }).map(d => (
                <Box
                  key={d.id} bg="white" borderRadius="xl" shadow="sm"
                  border="1px solid" borderColor={d.status === 'accepted' ? 'green.200' : 'orange.200'}
                  overflow="hidden"
                >
                  {/* Card header strip */}
                  <Box
                    px={4} py={2}
                    bg={d.status === 'accepted' ? 'green.50' : 'orange.50'}
                    borderBottom="1px solid"
                    borderColor={d.status === 'accepted' ? 'green.200' : 'orange.200'}
                  >
                    <HStack justify="space-between">
                      <HStack gap={2}>
                        <Box w="8px" h="8px" borderRadius="full" bg={d.status === 'accepted' ? 'green.400' : 'orange.400'} />
                        <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" letterSpacing="wide"
                          color={d.status === 'accepted' ? 'green.700' : 'orange.700'}>
                          {d.status === 'accepted' ? 'Accettato' : 'In attesa di accettazione'}
                        </Text>
                      </HStack>
                      <Box cursor="pointer" onClick={() => removeDelivery(d.id)} _hover={{ opacity: 0.6 }}>
                        <X size={14} color="#A0AEC0" />
                      </Box>
                    </HStack>
                  </Box>

                  {/* Card body */}
                  <Box px={4} py={3}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontWeight="semibold" color="gray.800">{d.guestName}</Text>
                      <Badge colorPalette="teal" variant="subtle">{d.objectLabel}</Badge>
                    </HStack>
                    {d.description && (
                      <Text fontSize="xs" color="gray.500" fontStyle="italic" mb={1}>"{d.description}"</Text>
                    )}
                    <Text fontSize="xs" color="gray.400">
                      {new Date(d.createdAt).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </Text>

                    {d.status === 'pending' && (
                      <HStack mt={3} px={3} py={2} bg="orange.50" borderRadius="md" border="1px solid" borderColor="orange.200" gap={2}>
                        <Clock size={13} color="#C05621" />
                        <Text fontSize="xs" color="orange.700">In attesa di conferma dall'ospite</Text>
                      </HStack>
                    )}
                    {d.status === 'accepted' && (
                      <Button mt={3} size="sm" colorPalette="blue" w="full" onClick={() => printReceipt(d)}>
                        <Printer size={14} /> Stampa Ricevuta PDF
                      </Button>
                    )}
                  </Box>
                </Box>
              ))}
            </VStack>
          )}
        </Box>

      </SimpleGrid>
    </Box>
  );
}
