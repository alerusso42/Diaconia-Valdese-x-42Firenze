import { useAuth } from "../../context/AuthContext";
import { GuestDashboard } from "./GuestDashboard";
import { EducatorDashboard } from "./EducatorDashboard";
import { ParentDashboard } from "./ParentDashboard";
import { Box, Text } from "@chakra-ui/react";

export function DashboardIndex() {
  const { user } = useAuth();

  if (!user) return null;

  if (user.roles.includes("guest")) return <GuestDashboard />;
  if (user.roles.includes("educator") || user.roles.includes("coordinator")) return <EducatorDashboard />;
  if (user.roles.includes("parent")) return <ParentDashboard />;

  return (
    <Box p={6}>
      <Text>Dashboard non ancora disponibile per questo ruolo ({user.roles.join(', ')}).</Text>
    </Box>
  );
}
