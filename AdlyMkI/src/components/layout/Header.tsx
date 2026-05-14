import { useState } from "react";
import { Flex, HStack, Text, Button, Box, VStack, Badge } from "@chakra-ui/react";
import { Bell, UserCircle, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useNavigate, useLocation } from "react-router-dom";

const routeLabels: Record<string, string> = {
  '/dashboard': 'Oggi',
  '/dashboard/calendar': 'Mio Calendario',
  '/dashboard/autonomy': 'Autonomia',
  '/dashboard/guests': 'Gestione Ospiti',
  '/dashboard/guests/add': 'Aggiungi Ospite',
  '/dashboard/guests/list': 'Elenco Ospiti',
  '/dashboard/guests/delivery': 'Consegne',
  '/dashboard/board': 'Bacheca',
  '/dashboard/settings': 'Impostazioni',
};

export function Header() {
  const { user, logout } = useAuth();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const pageTitle = routeLabels[location.pathname] ?? 'Pannello di controllo';
  const [showNotifs, setShowNotifs] = useState(false);

  const userNotifications = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Flex 
      px={{ base: 4, md: 6 }} 
      py={4} 
      bg="white" 
      borderBottom="1px solid" 
      borderColor="gray.200" 
      align="center" 
      justify="space-between"
      shadow="sm"
    >
      <HStack>

        <Text fontSize={{ base: "md", md: "lg"}} fontWeight="semibold" color="gray.700">
          {pageTitle}
        </Text>
      </HStack>
      
      <HStack gap={{ base: 2, md: 6 }}>
        <Box position="relative">
          <Box position="relative" cursor="pointer" p={2} _hover={{ bg: 'gray.100', borderRadius: 'full' }} onClick={() => setShowNotifs(!showNotifs)}>
            <Bell size={22} color="#4A5568" />
            {unreadCount > 0 && (
              <Box 
                position="absolute" 
                top="1" 
                right="2" 
                w="10px" 
                h="10px" 
                bg="red.500" 
                borderRadius="full" 
                border="2px solid white"
              />
            )}
          </Box>
          
          {/* Notifications Dropdown */}
          {showNotifs && (
            <Box 
              position="absolute" 
              top="100%" 
              right={0} 
              mt={2} 
              w="320px" 
              bg="white" 
              borderRadius="xl" 
              shadow="xl" 
              border="1px solid" 
              borderColor="gray.200" 
              zIndex={1000}
              maxH="400px"
              overflowY="auto"
            >
              <HStack justify="space-between" p={3} borderBottom="1px solid" borderColor="gray.100" position="sticky" top={0} bg="white" zIndex={2}>
                <Text fontWeight="bold" color="gray.800">Notifiche</Text>
                {unreadCount > 0 && (
                  <Button size="xs" variant="ghost" colorPalette="blue" onClick={() => { if(user) markAllAsRead(user.id); }}>
                    Segna tutto come già letto
                  </Button>
                )}
              </HStack>
              <VStack align="stretch" gap={0}>
                {userNotifications.length === 0 ? (
                  <Text p={4} textAlign="center" color="gray.500" fontSize="sm">Nessuna notifica.</Text>
                ) : (
                  userNotifications.map(notif => (
                    <Box 
                      key={notif.id} 
                      p={3} 
                      bg={notif.isRead ? 'white' : 'blue.50'} 
                      borderBottom="1px solid" 
                      borderColor="gray.100" 
                      cursor={notif.isRead ? 'default' : 'pointer'}
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      _hover={{ bg: notif.isRead ? 'gray.50' : 'blue.100' }}
                    >
                      <HStack justify="space-between" align="start">
                        <Box>
                          <Text fontSize="sm" fontWeight="bold" color="gray.800">{notif.title}</Text>
                          <Text fontSize="sm" color="gray.600" mt={1}>{notif.message}</Text>
                        </Box>
                        {!notif.isRead && <Badge colorPalette="blue" size="sm">Nuova</Badge>}
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
            </Box>
          )}
        </Box>
        
        <HStack bg="gray.50" px={4} py={2} borderRadius="full" cursor="pointer" border="1px solid" borderColor="gray.100" _hover={{ bg: 'gray.100' }} onClick={() => navigate("/dashboard/profile")}>
          <UserCircle size={20} color="#4A5568" />
          <Text fontSize="sm" fontWeight="medium" color="gray.700" display={{ base: 'none', md: 'block' }}>
            {user?.firstName} {user?.lastName}
          </Text>
        </HStack>

        <Button 
          size="sm" 
          variant="ghost" 
          colorScheme="red" 
          onClick={handleLogout} 
          title="Esci"
          px={2}
        >
          <LogOut size={20} />
        </Button>
      </HStack>
    </Flex>
  );
}
