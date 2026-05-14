import { Box, Flex } from "@chakra-ui/react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function GlobalLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Flex h="100vh" w="100vw" overflow="hidden" bg="gray.100">
      <Sidebar />
      <Flex flex="1" direction="column" overflow="hidden" ml="64px">
        <Header />
        <Box flex="1" overflowY="auto" p={{ base: 4, md: 8 }}>
          <Outlet />
        </Box>
      </Flex>
    </Flex>
  );
}
