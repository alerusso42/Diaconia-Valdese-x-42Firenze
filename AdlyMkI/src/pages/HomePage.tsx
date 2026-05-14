import { Box, Center, Text } from "@chakra-ui/react"
import { RoleCircle } from "../components/RoleCircle"
import { roles } from "../data/roles"

// Posizione nella griglia per ogni ruolo (layout a triangolo su desktop).
// Indice 0 = ospite (top center), 1 = educatore (bottom left), 2 = genitore (bottom right)
const gridPositions = [
  { gridColumn: { base: "1", md: "2" }, gridRow: { base: "1", md: "1" } },
  { gridColumn: { base: "1", md: "1" }, gridRow: { base: "2", md: "2" } },
  { gridColumn: { base: "1", md: "3" }, gridRow: { base: "3", md: "2" } },
]

export function HomePage() {
  return (
    <Box
      minH="100vh"
      w="100%"
      style={{ backgroundColor: "#EEF4FB" }}
      display="flex"
      flexDirection="column"
      alignItems="center"
      position="relative"
      overflow="hidden"
    >
      {/* Forme decorative di sfondo */}
      <Box
        position="absolute"
        top="-110px"
        right="-110px"
        w={{ base: "240px", md: "340px" }}
        h={{ base: "240px", md: "340px" }}
        borderRadius="full"
        bg="#B8D4EE"
        opacity={0.35}
        style={{ pointerEvents: "none" }}
      />
      <Box
        position="absolute"
        bottom="-90px"
        left="-90px"
        w={{ base: "210px", md: "300px" }}
        h={{ base: "210px", md: "300px" }}
        borderRadius="full"
        bg="rgb(200, 234, 200)"
        opacity={0.38}
        style={{ pointerEvents: "none" }}
      />
      <Box
        position="absolute"
        top="48%"
        right="-55px"
        w={{ base: "130px", md: "170px" }}
        h={{ base: "130px", md: "170px" }}
        borderRadius="full"
        bg="rgb(255, 224, 230)"
        opacity={0.42}
        style={{ pointerEvents: "none" }}
      />

      {/* Banner hero con titolo */}
      <Box
        w="100%"
        bg="rgb(200, 223, 245)"
        borderBottomRadius={{ base: "3xl", md: "4xl" }}
        py={{ base: 10, md: 16 }}
        px={{ base: 4, md: 8 }}
        display="flex"
        flexDirection="column"
        alignItems="center"
        mb={{ base: 10, md: 14 }}
        boxShadow="0 4px 24px rgba(58, 95, 138, 0.12)"
        position="relative"
        zIndex={1}
      >
        <Text
          as="h1"
          fontSize={{ base: "4xl", md: "6xl", lg: "7xl" }}
          fontWeight="extrabold"
          textAlign="center"
          color="rgb(58, 95, 138)"
          lineHeight="1.1"
          fontFamily="'Nunito', sans-serif"
          letterSpacing="-0.5px"
        >
          Accedi alla tua area personale
        </Text>
        <Text
          fontSize={{ base: "sm", md: "md" }}
          color="rgb(90, 128, 168)"
          mt={3}
          textAlign="center"
          letterSpacing="wide"
        >
        </Text>
      </Box>

      {/*
        Griglia a triangolo su desktop:
        ┌─────────────────────────────┐
        │          [Ospite]           │  ← colonna 2, riga 1
        │  [Educatore]  [Genitore]    │  ← colonne 1 e 3, riga 2
        └─────────────────────────────┘
        Su mobile (1 colonna) i cerchi si impilano verticalmente.
      */}
      <Box
        w="100%"
        maxW="860px"
        px={{ base: 4, md: 8 }}
        pb={{ base: 8, md: 12 }}
        display="grid"
        gridTemplateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }}
        gridTemplateRows={{ base: "auto auto auto", md: "auto auto" }}
        gap={{ base: 10, md: 6, lg: 10 }}
        position="relative"
        zIndex={1}
      >
        {roles.map((role, i) => (
          <Center key={role.id} {...gridPositions[i]}>
            <RoleCircle
              id={role.id}
              images={role.images}
              label={role.label}
              bg={role.bg}
            />
          </Center>
        ))}
      </Box>
    </Box>
  )
}
