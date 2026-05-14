import { useEffect, useState, type ElementType } from "react";
import { Box, VStack, Text, Flex, HStack } from "@chakra-ui/react";
import { ChevronDown, ChevronRight, Home, Calendar, Trophy, Users, FileText, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import type { UserRole } from "../../data/mockData";

interface NavItem {
  label: string;
  path: string;
  icon: ElementType;
  roles: UserRole[];
  children?: Array<{ label: string; path: string }>;
}

const structureToFacilityId: Record<string, string> = {
  "struttura-1": "f1",
  "struttura-2": "f2",
  "struttura-3": "f3",
  "struttura-4": "f4",
  "struttura-5": "f5",
  "struttura-6": "f6",
};

const navItems: NavItem[] = [
  { label: "Oggi", path: "/dashboard", icon: Home, roles: ["guest", "educator", "parent", "coordinator", "admin"] },
  { label: "Mio Calendario", path: "/dashboard/calendar", icon: Calendar, roles: ["guest", "educator", "coordinator"] },
  { label: "Autonomia", path: "/dashboard/autonomy", icon: Trophy, roles: ["guest"] },
  {
    label: "Gestione ospiti",
    path: "/dashboard/guests",
    icon: Users,
    roles: ["educator", "coordinator"],
    children: [
      { label: "Aggiungi ospite", path: "/dashboard/guests/add" },
      { label: "Elenco ospiti", path: "/dashboard/guests/list" },
      { label: "Consegne", path: "/dashboard/guests/delivery" },
    ],
  },
  { label: "Bacheca", path: "/dashboard/board", icon: FileText, roles: ["educator"] },
  { label: "Impostazioni", path: "/dashboard/settings", icon: Settings, roles: ["admin", "coordinator"] },
];

const COLLAPSED_W = "64px";
const EXPANDED_W = "260px";

export function Sidebar() {
  const { user, selectedStructure } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const selectedFacilityId = selectedStructure ? structureToFacilityId[selectedStructure] : undefined;

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/guests")) {
      setGuestMenuOpen(true);
    }
  }, [location.pathname]);

  if (!user) return null;

  const userPrimaryRole = user.roles[0];
  const filteredItems = navItems
    .filter(item => item.roles.includes(userPrimaryRole))
    .map((item) => {
      if (item.path !== "/dashboard/guests") {
        return item;
      }

      return {
        ...item,
        children: [
          ...(item.children ?? []),
          { label: "Report struttura", path: selectedFacilityId ? `/reports/${selectedFacilityId}` : "/dashboard" },
        ],
      };
    });

  return (
    <Box
      position="fixed"
      top={0}
      left={0}
      h="100vh"
      w={isHovered ? EXPANDED_W : COLLAPSED_W}
      bg="blue.900"
      color="white"
      zIndex={1000}
      display="flex"
      flexDirection="column"
      py={6}
      shadow="xl"
      overflow="hidden"
      style={{ transition: "width 0.25s ease" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <Box px={4} mb={10} h="36px" display="flex" alignItems="center" overflow="hidden" whiteSpace="nowrap">
        <Text fontSize="3xl" fontWeight="900" color="white" lineHeight={1}>
          {isHovered ? "Adly!" : "A"}
        </Text>
      </Box>

      {/* Nav items */}
      <VStack align="stretch" gap={1} flex="1">
        {filteredItems.map(item => {
          const isGuestMenu = item.path === "/dashboard/guests" && item.children?.length;
          const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
          const childIsActive = item.children?.some(child => location.pathname === child.path);
          const parentIsActive = isActive || Boolean(childIsActive);

          return (
            <Box key={item.path}>
              <Flex
                align="center"
                px={4}
                py={4}
                bg={parentIsActive ? "blue.800" : "transparent"}
                color={parentIsActive ? "white" : "blue.200"}
                cursor="pointer"
                borderRight="4px solid"
                borderColor={parentIsActive ? "blue.300" : "transparent"}
                _hover={{ bg: "blue.800", color: "white" }}
                transition="all 0.2s"
                overflow="hidden"
                whiteSpace="nowrap"
                onClick={() => {
                  if (isGuestMenu) {
                    setGuestMenuOpen(v => !v);
                    return;
                  }
                  navigate(item.path);
                }}
              >
                <Box flexShrink={0}>
                  <item.icon size={20} />
                </Box>
                <HStack flex="1" justify="space-between" gap={2} ml={isHovered ? 3 : 0} style={{ opacity: isHovered ? 1 : 0, transition: "opacity 0.2s ease" }}>
                  <Text fontWeight={parentIsActive ? "600" : "500"}>{item.label}</Text>
                  {isGuestMenu && (guestMenuOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
                </HStack>
              </Flex>

              {isGuestMenu && guestMenuOpen && isHovered && item.children && (
                <VStack align="stretch" gap={1} mt={1} mb={2} pl={4}>
                  {item.children.map(child => {
                    const childIsCurrent = location.pathname === child.path;
                    return (
                      <Flex
                        key={child.path}
                        align="center"
                        px={6}
                        py={3}
                        ml={4}
                        bg={childIsCurrent ? "blue.700" : "transparent"}
                        color={childIsCurrent ? "white" : "blue.200"}
                        borderRadius="lg"
                        cursor="pointer"
                        _hover={{ bg: "blue.800", color: "white" }}
                        transition="all 0.2s"
                        whiteSpace="nowrap"
                        onClick={() => navigate(child.path)}
                      >
                        <Text fontSize="sm" fontWeight={childIsCurrent ? "600" : "500"}>{child.label}</Text>
                      </Flex>
                    );
                  })}
                </VStack>
              )}
            </Box>
          );
        })}
      </VStack>

      {/* Ruolo attivo */}
      <Box px={4} py={4} borderTop="1px solid" borderColor="blue.800" overflow="hidden" whiteSpace="nowrap">
        <Text fontSize="xs" color="blue.300" textTransform="uppercase" fontWeight="bold">
          {isHovered ? "Ruolo Attivo" : ""}
        </Text>
        <Text fontSize="sm" fontWeight="medium" textTransform="capitalize">
          {isHovered ? userPrimaryRole : userPrimaryRole[0].toUpperCase()}
        </Text>
      </Box>
    </Box>
  );
}
