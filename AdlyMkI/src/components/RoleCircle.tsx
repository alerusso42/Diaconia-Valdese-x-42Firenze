import { Center, Flex, Image, Text, VStack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export interface RoleCircleProps {
  images: string[]
  label: string
  bg: string
}

export function RoleCircle({ images, label, bg, id }: RoleCircleProps & { id?: string }) {
  const navigate = useNavigate();

  return (
    <VStack 
      gap={{ base: 3, md: 4 }} 
      cursor="pointer"
      onClick={() => id && navigate(`/login/${id}`)}
    >
      <Center
        borderRadius="full"
        bg={bg}
        border="4px solid"
        borderColor="#7AAFD4"
        w={{ base: "38vw", md: "22vw", lg: "200px" }}
        h={{ base: "38vw", md: "22vw", lg: "200px" }}
        maxW="220px"
        maxH="220px"
        minW="120px"
        minH="120px"
        boxShadow="lg"
        overflow="hidden"
        p={3}
        transition="transform 0.2s ease, box-shadow 0.2s ease"
        _hover={{ transform: "scale(1.07)", boxShadow: "xl" }}
      >
        {images.length === 1 ? (
          <Image
            src={images[0]}
            alt={label}
            objectFit="contain"
            maxW="65%"
            maxH="65%"
          />
        ) : (
          <Flex align="center" justify="center" gap={2} w="85%" h="85%">
            {images.map((src, i) => (
              <Image
                key={i}
                src={src}
                alt={label}
                objectFit="contain"
                maxW="48%"
                maxH="100%"
              />
            ))}
          </Flex>
        )}
      </Center>

      <Text
        fontSize={{ base: "sm", md: "md", lg: "lg" }}
        fontWeight="bold"
        color="#3A5F8A"
        textAlign="center"
      >
        {label}
      </Text>
    </VStack>
  )
}
