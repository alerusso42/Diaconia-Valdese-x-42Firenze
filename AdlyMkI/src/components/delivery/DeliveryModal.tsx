import { useState } from 'react';
import { Box, VStack, HStack, Text, Button, Portal } from '@chakra-ui/react';
import { X, Package, Check, Printer, Clock } from 'lucide-react';
import { type User } from '../../data/mockData';
import { useDelivery } from '../../context/DeliveryContext';

const OBJECT_TYPES = [
  { value: 'clothing',   label: 'Vestiti' },
  { value: 'document',   label: 'Documento' },
  { value: 'package',    label: 'Pacco' },
  { value: 'medication', label: 'Farmaci' },
  { value: 'personal',   label: 'Effetti Personali' },
  { value: 'other',      label: 'Altro' },
];

interface DeliveryModalProps {
  guests: User[];
  preselectedGuestId: string;
  facilityName: string;
  onClose: () => void;
}

export function DeliveryModal({ guests, preselectedGuestId, facilityName, onClose }: DeliveryModalProps) {
  const { addDelivery, deliveries, markAccepted: ctxMarkAccepted } = useDelivery();
  const [search, setSearch] = useState('');
  const [selectedGuestId, setSelectedGuestId] = useState(preselectedGuestId);
  const [objectType, setObjectType] = useState('');
  const [otherLabel, setOtherLabel] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState<'form' | 'sent' | 'accepted'>('form');
  const [sentDeliveryId, setSentDeliveryId] = useState<string | null>(null);

  // aggiorna step quando Giulia accetta (cross-session via localStorage)
  const sentDelivery = sentDeliveryId ? deliveries.find(d => d.id === sentDeliveryId) : null;
  if (step === 'sent' && sentDelivery?.status === 'accepted') {
    setTimeout(() => setStep('accepted'), 0);
  }

  const filteredGuests = guests.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  const selectedGuest = guests.find(g => g.id === selectedGuestId);
  const objLabel = objectType === 'other'
    ? (otherLabel.trim() || 'Altro')
    : (OBJECT_TYPES.find(o => o.value === objectType)?.label ?? objectType);
  const canSend = !!selectedGuestId && !!objectType && (objectType !== 'other' || !!otherLabel.trim());

  const handlePrint = () => {
    if (!selectedGuest) return;
    const date = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });

    const html = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8"/>
  <title>Ricevuta Consegna</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Helvetica Neue',Arial,sans-serif;padding:60px 80px;color:#1a202c}
    .header{text-align:center;margin-bottom:40px;padding-bottom:24px;border-bottom:2px solid #2d3748}
    .header h1{font-size:26px;font-weight:700;margin-bottom:6px}
    .header p{font-size:13px;color:#718096}
    .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#718096;margin-bottom:12px;margin-top:28px}
    .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #e2e8f0}
    .row .label{color:#718096;font-size:14px}
    .row .value{font-weight:600;font-size:14px}
    .badge{display:inline-block;background:#e6fffa;color:#2c7a7b;padding:3px 12px;border-radius:20px;font-size:12px;font-weight:600}
    .signatures{display:flex;justify-content:space-around;margin-top:80px}
    .sig{text-align:center;width:200px}
    .sig-line{border-top:1px solid #2d3748;padding-top:10px;font-size:12px;color:#718096}
  </style>
</head>
<body>
  <div class="header">
    <h1>Ricevuta di Consegna</h1>
    <p>${facilityName}</p>
  </div>
  <div class="section-title">Dettagli</div>
  <div class="row"><span class="label">Data</span><span class="value">${date}</span></div>
  <div class="row"><span class="label">Ora</span><span class="value">${time}</span></div>
  <div class="row"><span class="label">Destinatario</span><span class="value">${selectedGuest.firstName} ${selectedGuest.lastName}</span></div>
  <div class="row"><span class="label">Tipo oggetto</span><span class="value"><span class="badge">${objLabel}</span></span></div>
  ${description ? `<div class="row"><span class="label">Note</span><span class="value">${description}</span></div>` : ''}
  <div class="row"><span class="label">Stato</span><span class="value">✓ Accettato</span></div>
  <div class="signatures">
    <div class="sig"><div class="sig-line">Firma Educatore</div></div>
    <div class="sig"><div class="sig-line">Firma Ospite</div></div>
  </div>
</body>
</html>`;

    const w = window.open('', '_blank', 'width=820,height=650');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.onload = () => w.print();
    }
  };

  return (
    <Portal>
      <Box
        position="fixed" top="0" left="0" right="0" bottom="0"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
        zIndex={1200}
        onClick={onClose}
      />

      <Box
        position="fixed" top="50%" left="50%"
        style={{ transform: 'translate(-50%, -50%)', width: 'min(520px, calc(100vw - 32px))' }}
        zIndex={1201}
        bg="white" borderRadius="2xl" shadow="2xl" overflow="hidden"
        maxH="90vh"
      >
        {/* Header */}
        <Box px={6} py={4} bg="teal.500" position="relative">
          <HStack gap={3}>
            <Package size={20} color="white" />
            <Text fontWeight="bold" fontSize="lg" color="white">Consegna Oggetto</Text>
          </HStack>
          <Box
            position="absolute" top="12px" right="12px"
            cursor="pointer" p={1} borderRadius="full"
            _hover={{ bg: 'teal.400' }}
            onClick={onClose}
          >
            <X size={16} color="white" />
          </Box>
        </Box>

        <Box p={6} overflowY="auto" maxH="calc(90vh - 68px)">

          {/* ── STEP: FORM ── */}
          {step === 'form' && (
            <>
              <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase" letterSpacing="wide" mb={2}>
                Destinatario
              </Text>
              <input
                placeholder="Cerca ospite per nome..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', fontSize: '14px', padding: '8px 12px',
                  borderRadius: '8px', border: '1px solid #e2e8f0',
                  color: '#1a202c', backgroundColor: '#f7fafc',
                  outline: 'none', marginBottom: '8px', fontFamily: 'inherit',
                }}
              />
              <Box
                maxH="150px" overflowY="auto"
                border="1px solid" borderColor="gray.200"
                borderRadius="lg" mb={5}
              >
                {filteredGuests.length === 0 ? (
                  <Text fontSize="sm" color="gray.400" p={3} textAlign="center">Nessun ospite trovato</Text>
                ) : filteredGuests.map(g => (
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
                ))}
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
                placeholder="Descrivi l'oggetto..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                style={{
                  width: '100%', fontSize: '14px', padding: '8px 12px',
                  borderRadius: '8px', border: '1px solid #e2e8f0',
                  color: '#1a202c', backgroundColor: '#f7fafc',
                  resize: 'none', outline: 'none',
                  marginBottom: '24px', fontFamily: 'inherit',
                }}
              />

              <HStack justify="flex-end" gap={3}>
                <Button variant="ghost" colorPalette="gray" onClick={onClose}>Annulla</Button>
                <Button colorPalette="teal" disabled={!canSend} onClick={() => {
                  const id = `d-${Date.now()}`;
                  addDelivery({
                    id,
                    guestId: selectedGuest!.id,
                    guestName: `${selectedGuest!.firstName} ${selectedGuest!.lastName}`,
                    objectType,
                    objectLabel: objLabel,
                    description,
                    facilityName,
                  });
                  setSentDeliveryId(id);
                  setStep('sent');
                }} px={6}>
                  Invia Notifica
                </Button>
              </HStack>
            </>
          )}

          {/* ── STEP: SENT ── */}
          {step === 'sent' && (
            <VStack gap={4} align="stretch">
              <Box p={4} bg="teal.50" borderRadius="xl" border="1px solid" borderColor="teal.200">
                <HStack mb={2} gap={2}>
                  <Clock size={16} color="#2C7A7B" />
                  <Text fontWeight="semibold" color="teal.700">Notifica inviata al calendario</Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  <Text as="span" fontWeight="semibold">{selectedGuest?.firstName} {selectedGuest?.lastName}</Text>
                  {' '}riceverà la notifica per:{' '}
                  <Text as="span" fontWeight="semibold">{objLabel}</Text>
                </Text>
                {description && (
                  <Text fontSize="sm" color="gray.500" mt={1} fontStyle="italic">"{description}"</Text>
                )}
              </Box>

              <HStack p={4} bg="orange.50" borderRadius="xl" border="1px solid" borderColor="orange.200" gap={2}>
                <Clock size={15} color="#C05621" />
                <Text fontSize="sm" color="orange.700">In attesa di conferma dall'ospite</Text>
              </HStack>
            </VStack>
          )}

          {/* ── STEP: ACCEPTED ── */}
          {step === 'accepted' && (
            <VStack gap={4} align="stretch">
              <Box p={4} bg="green.50" borderRadius="xl" border="1px solid" borderColor="green.200">
                <HStack mb={2} gap={2}>
                  <Check size={16} color="#276749" />
                  <Text fontWeight="semibold" color="green.700">Oggetto accettato</Text>
                </HStack>
                <Text fontSize="sm" color="gray.700">
                  <Text as="span" fontWeight="semibold">{selectedGuest?.firstName} {selectedGuest?.lastName}</Text>
                  {' '}ha accettato la consegna di:{' '}
                  <Text as="span" fontWeight="semibold">{objLabel}</Text>
                </Text>
              </Box>

              <HStack justify="flex-end" gap={3}>
                <Button variant="ghost" colorPalette="gray" onClick={onClose}>Chiudi</Button>
                <Button colorPalette="blue" onClick={handlePrint} px={6}>
                  <Printer size={14} /> Stampa Ricevuta PDF
                </Button>
              </HStack>
            </VStack>
          )}

        </Box>
      </Box>
    </Portal>
  );
}
