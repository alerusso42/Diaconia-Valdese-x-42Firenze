import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Box, Button, Heading, HStack, Image, Input, SimpleGrid, Stack, Text, Textarea, VStack } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Cake, CalendarDays, CheckCircle2, Circle, Eye, FileDown, PenLine, Save, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { mockFacilities, mockUsers } from "../../data/mockData";
import {
  countCompletedReportAreas,
  createEmptyGuestReport,
  reportAreaDefinitions,
  type GuestReport,
  type ReportAreaKey,
} from "../../data/guestReport";
import fallbackGuestImage from "../../assets/student/ospite.png";
import studentGirlImage from "../../assets/student/bambina con autismo.png";
import studentBoyImage from "../../assets/student/bambino con autismo.png";

const reportStorageKey = "adlymki.monthlyReports";

const studentImageByPath: Record<string, string> = {
  "assets/student/ospite.png": fallbackGuestImage,
  "src/assets/student/ospite.png": fallbackGuestImage,
  "assets/student/bambina con autismo.png": studentGirlImage,
  "src/assets/student/bambina con autismo.png": studentGirlImage,
  "assets/student/bambino con autismo.png": studentBoyImage,
  "src/assets/student/bambino con autismo.png": studentBoyImage,
};

const demoGuestDetails: Record<string, { birthDate: string; facilityEntryDate: string }> = {
  u4: { birthDate: "2008-03-12", facilityEntryDate: "2024-09-03" },
  u5: { birthDate: "2009-07-22", facilityEntryDate: "2025-01-18" },
  u8: { birthDate: "2010-11-04", facilityEntryDate: "2024-10-07" },
  u10: { birthDate: "2007-05-28", facilityEntryDate: "2023-12-12" },
  u12: { birthDate: "2011-02-15", facilityEntryDate: "2025-02-01" },
  u14: { birthDate: "2006-08-30", facilityEntryDate: "2024-06-14" },
  u16: { birthDate: "2012-01-09", facilityEntryDate: "2025-03-20" },
};

type ReportMode = "edit" | "view";
type ActiveReportSection = ReportAreaKey | "freeAnnotations";

const freeAnnotationsSection = {
  key: "freeAnnotations",
  label: "Libere annotazioni",
  focusLabel: "Note trasversali",
} as const;

interface GuestProfile {
  id: string;
  firstName: string;
  lastName: string;
  facilityId?: string;
  birthDate?: string;
  facilityEntryDate?: string;
  img?: string;
  avatarUrl?: string;
  sex?: string;
}

function getCurrentMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

function getReportKey(guestId: string, month: string) {
  return `${guestId}:${month}`;
}

function loadStoredReports(): Record<string, GuestReport> {
  if (typeof window === "undefined") return {};

  const storedReports = window.localStorage.getItem(reportStorageKey);
  if (!storedReports) return {};

  try {
    return JSON.parse(storedReports) as Record<string, GuestReport>;
  } catch {
    return {};
  }
}

function saveStoredReport(report: GuestReport) {
  if (typeof window === "undefined") return;

  const reports = loadStoredReports();
  reports[getReportKey(report.guestId, report.month)] = report;
  window.localStorage.setItem(reportStorageKey, JSON.stringify(reports));
}

function formatDate(date?: string) {
  if (!date) return "Non disponibile";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Non disponibile";

  return new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" }).format(parsedDate);
}

function formatMonth(month: string) {
  const parsedDate = new Date(`${month}-01T12:00:00`);
  if (Number.isNaN(parsedDate.getTime())) return month;

  return new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(parsedDate);
}

function calculateAge(birthDate?: string) {
  if (!birthDate) return "Non disponibile";

  const date = new Date(birthDate);
  if (Number.isNaN(date.getTime())) return "Non disponibile";

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();
  const hasBirthdayPassed = monthDelta > 0 || (monthDelta === 0 && today.getDate() >= date.getDate());
  if (!hasBirthdayPassed) age -= 1;

  return `${age} anni`;
}

function resolveGuestProfile(routeId: string | undefined, guestAccounts: ReturnType<typeof useAuth>["guestAccounts"]): GuestProfile | null {
  if (!routeId) return null;

  const createdGuest = guestAccounts.find((account) => account.user.id === routeId || account.id === routeId);
  if (createdGuest) {
    return {
      id: createdGuest.user.id,
      firstName: createdGuest.user.firstName,
      lastName: createdGuest.user.lastName,
      facilityId: createdGuest.facilityId,
      birthDate: createdGuest.birthDate,
      facilityEntryDate: createdGuest.facilityEntryDate,
      img: createdGuest.user.img,
      avatarUrl: createdGuest.user.avatarUrl,
      sex: createdGuest.sex,
    };
  }

  const mockGuest = mockUsers.find((user) => user.id === routeId && user.roles.includes("guest"));
  if (!mockGuest) return null;

  return {
    id: mockGuest.id,
    firstName: mockGuest.firstName,
    lastName: mockGuest.lastName,
    facilityId: mockGuest.facilityIds?.[0],
    birthDate: demoGuestDetails[mockGuest.id]?.birthDate,
    facilityEntryDate: demoGuestDetails[mockGuest.id]?.facilityEntryDate,
    img: mockGuest.img,
    avatarUrl: mockGuest.avatarUrl,
  };
}

function resolveImagePath(imagePath?: string) {
  const cleanPath = imagePath?.trim();
  if (!cleanPath) return undefined;
  if (studentImageByPath[cleanPath]) return studentImageByPath[cleanPath];
  if (cleanPath.startsWith("http") || cleanPath.startsWith("/")) return cleanPath;

  return undefined;
}

function getGuestImage(guest: GuestProfile) {
  return resolveImagePath(guest.img) ?? resolveImagePath(guest.avatarUrl) ?? fallbackGuestImage;
}

function normalizeStoredReport(storedReport: GuestReport | undefined, guestId: string, month: string) {
  const emptyReport = createEmptyGuestReport(guestId, month);
  if (!storedReport) return emptyReport;

  return {
    ...emptyReport,
    ...storedReport,
    freeAnnotations: storedReport.freeAnnotations ?? "",
  };
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

function buildGuestReportHtml(report: GuestReport, guest: GuestProfile, facilityName: string, guestImage: string) {
  const guestName = `${guest.firstName} ${guest.lastName}`;
  const areasHtml = reportAreaDefinitions.map((area) => {
    const reportArea = report[area.key];

    return `
      <section class="report-card">
        <h3>${escapeHtml(area.label)}</h3>
        <p class="focus">${escapeHtml(reportArea.field?.trim() || area.focusLabel)}</p>
        <p>${escapeHtml(reportArea.annotation.trim() || "Nessuna annotazione ancora.")}</p>
      </section>
    `;
  }).join("");

  return `
    <!doctype html>
    <html lang="it">
      <head>
        <meta charset="utf-8" />
        <title>Report mensile - ${escapeHtml(guestName)}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1a202c; margin: 32px; }
          header { display: flex; gap: 18px; align-items: center; border-bottom: 1px solid #cbd5e0; padding-bottom: 18px; margin-bottom: 24px; }
          img { width: 96px; height: 96px; object-fit: cover; border-radius: 12px; }
          h1 { margin: 0 0 6px; font-size: 26px; }
          h2 { margin: 26px 0 12px; font-size: 20px; }
          h3 { margin: 0 0 8px; font-size: 16px; }
          p { margin: 0; line-height: 1.55; white-space: pre-wrap; }
          .meta { color: #4a5568; margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
          .report-card { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; break-inside: avoid; }
          .focus { color: #2b6cb0; font-weight: 700; margin-bottom: 8px; }
          @media print { body { margin: 18mm; } }
        </style>
      </head>
      <body>
        <header>
          <img src="${escapeHtml(guestImage)}" alt="${escapeHtml(guestName)}" />
          <div>
            <h1>Report mensile</h1>
            <p class="meta">Ospite: ${escapeHtml(guestName)}</p>
            <p class="meta">Struttura: ${escapeHtml(facilityName)}</p>
            <p class="meta">Mese: ${escapeHtml(formatMonth(report.month))}</p>
            <p class="meta">Età: ${escapeHtml(calculateAge(guest.birthDate))} · Ingresso struttura: ${escapeHtml(formatDate(guest.facilityEntryDate))}</p>
          </div>
        </header>
        <h2>Aree del report</h2>
        <main class="grid">${areasHtml}</main>
        <h2>Libere annotazioni</h2>
        <section class="report-card">
          <p>${escapeHtml(report.freeAnnotations?.trim() || "Nessuna annotazione libera ancora.")}</p>
        </section>
      </body>
    </html>
  `;
}

export function MonthlyReportPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { guestAccounts } = useAuth();
  const guest = useMemo(() => resolveGuestProfile(id, guestAccounts), [guestAccounts, id]);
  const [month, setMonth] = useState(getCurrentMonth);
  const [mode, setMode] = useState<ReportMode>("edit");
  const [activeSection, setActiveSection] = useState<ActiveReportSection>("areaSocioRelational");
  const [draft, setDraft] = useState<GuestReport>(() => createEmptyGuestReport(id ?? "", getCurrentMonth()));
  const [saveMessage, setSaveMessage] = useState("");

  const facility = guest?.facilityId ? mockFacilities.find((item) => item.id === guest.facilityId) : undefined;
  const guestImage = guest ? getGuestImage(guest) : fallbackGuestImage;
  const reportSections = [...reportAreaDefinitions, freeAnnotationsSection];
  const completedAreas = countCompletedReportAreas(draft) + (draft.freeAnnotations?.trim() ? 1 : 0);
  const activeAreaDefinition = activeSection === "freeAnnotations"
    ? undefined
    : reportAreaDefinitions.find((area) => area.key === activeSection) ?? reportAreaDefinitions[0];
  const activeAreaValue = activeAreaDefinition ? draft[activeAreaDefinition.key] : undefined;

  useEffect(() => {
    if (!guest) return;

    const storedReport = loadStoredReports()[getReportKey(guest.id, month)];
    setDraft(normalizeStoredReport(storedReport, guest.id, month));
    setSaveMessage("");
  }, [guest, month]);

  const updateAreaValue = (areaKey: ReportAreaKey, field: "field" | "annotation", value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [areaKey]: {
        ...currentDraft[areaKey],
        [field]: value,
      },
    }));
    setSaveMessage("");
  };

  const updateFreeAnnotations = (value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      freeAnnotations: value,
    }));
    setSaveMessage("");
  };

  const handleSave = () => {
    saveStoredReport(draft);
    setSaveMessage(`Report salvato per ${formatMonth(draft.month)}.`);
  };

  const handleExportPdf = () => {
    if (!guest) return;

    const pdfWindow = window.open("", "_blank", "width=960,height=1200");

    if (!pdfWindow) {
      window.print();
      return;
    }

    const imageUrl = new URL(guestImage, window.location.origin).href;
    pdfWindow.document.write(buildGuestReportHtml(draft, guest, facility?.name ?? "Struttura non disponibile", imageUrl));
    pdfWindow.document.close();
    pdfWindow.focus();
    pdfWindow.setTimeout(() => {
      pdfWindow.print();
    }, 250);
  };

  const moveActiveArea = (direction: "next" | "previous") => {
    const currentIndex = reportSections.findIndex((section) => section.key === activeSection);
    const nextIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    const boundedIndex = Math.min(Math.max(nextIndex, 0), reportSections.length - 1);
    setActiveSection(reportSections[boundedIndex].key);
  };

  if (!guest) {
    return (
      <VStack align="stretch" gap={6}>
        <Button alignSelf="start" variant="ghost" colorPalette="blue" onClick={() => navigate("/dashboard/guests/list")}>
          <HStack gap={2}>
            <ArrowLeft size={18} />
            <Text>Elenco ospiti</Text>
          </HStack>
        </Button>
        <Box p={6} bg="white" borderRadius="xl" shadow="sm">
          <Heading size="md" color="gray.800" mb={2}>Ospite non trovato</Heading>
          <Text color="gray.600">Non esiste un ospite associato a questo report.</Text>
        </Box>
      </VStack>
    );
  }

  return (
    <VStack align="stretch" gap={6}>
      <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
        <Box>
          <Button variant="ghost" colorPalette="blue" mb={3} onClick={() => navigate("/dashboard/guests/list")}>
            <HStack gap={2}>
              <ArrowLeft size={18} />
              <Text>Elenco ospiti</Text>
            </HStack>
          </Button>
          <Heading size="lg" color="gray.800" mb={2}>Report mensile</Heading>
          <Text color="gray.600">{guest.firstName} {guest.lastName} · {formatMonth(month)}</Text>
        </Box>

        <HStack gap={2} justify={{ base: "stretch", md: "flex-end" }}>
          <Button flex={{ base: 1, md: "initial" }} variant={mode === "edit" ? "solid" : "outline"} colorPalette="blue" color={mode === "edit" ? "white" : "gray.900"} onClick={() => setMode("edit")}>
            <HStack gap={2}>
              <PenLine size={18} />
              <Text fontWeight="bold">Modifica</Text>
            </HStack>
          </Button>
          <Button flex={{ base: 1, md: "initial" }} variant={mode === "view" ? "solid" : "outline"} colorPalette="blue" color={mode === "view" ? "white" : "gray.900"} onClick={() => setMode("view")}>
            <HStack gap={2}>
              <Eye size={18} />
              <Text fontWeight="bold">Visualizza</Text>
            </HStack>
          </Button>
          <Button flex={{ base: 1, md: "initial" }} variant="outline" colorPalette="green" color="gray.900" onClick={handleExportPdf}>
            <HStack gap={2}>
              <FileDown size={18} />
              <Text fontWeight="bold">Esporta PDF</Text>
            </HStack>
          </Button>
        </HStack>
      </Stack>

      <Box p={6} bg="white" borderRadius="xl" shadow="sm">
        <Stack direction={{ base: "column", md: "row" }} gap={6} align={{ base: "stretch", md: "center" }}>
          <Image
            src={guestImage}
            alt={`${guest.firstName} ${guest.lastName}`}
            boxSize={{ base: "112px", md: "128px" }}
            objectFit="cover"
            borderRadius="xl"
            bg="gray.100"
          />

          <Box flex="1">
            <Heading size="md" color="gray.800" mb={4}>{guest.firstName} {guest.lastName}</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
              <ProfileDatum icon={<Building2 size={18} />} label="Struttura" value={facility?.name ?? "Non disponibile"} />
              <ProfileDatum icon={<Cake size={18} />} label="Età" value={calculateAge(guest.birthDate)} />
              <ProfileDatum icon={<ImageIcon src={guestImage} alt="" />} label="Ingresso struttura" value={formatDate(guest.facilityEntryDate)} />
              <ProfileDatum icon={<CalendarDays size={18} />} label="Mese report" value={formatMonth(month)} />
            </SimpleGrid>
          </Box>
        </Stack>
      </Box>

      <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={4}>
        <Box>
          <Text fontWeight="bold" color="gray.800">{completedAreas} di {reportSections.length} sezioni complete</Text>
          <Text color="gray.600" fontSize="sm">Completamento annotazioni mensili</Text>
        </Box>
        <HStack gap={3}>
          <Input type="month" value={month} onChange={(event) => setMonth(event.currentTarget.value)} bg="white" color="gray.900" maxW={{ base: "100%", md: "180px" }} />
          <Button colorPalette="blue" onClick={handleSave}>
            <HStack gap={2}>
              <Save size={18} />
              <Text>Salva</Text>
            </HStack>
          </Button>
        </HStack>
      </Stack>

      {saveMessage && (
        <Box px={4} py={3} bg="blue.50" border="1px solid" borderColor="blue.100" borderRadius="lg">
          <Text color="blue.800" fontWeight="medium">{saveMessage}</Text>
        </Box>
      )}

      {mode === "edit" ? (
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6} templateColumns={{ base: "1fr", lg: "280px 1fr" }}>
          <Box p={4} bg="white" borderRadius="xl" shadow="sm">
            <VStack align="stretch" gap={2}>
              {reportSections.map((section) => {
                const isActive = section.key === activeSection;
                const isComplete = section.key === "freeAnnotations"
                  ? Boolean(draft.freeAnnotations?.trim())
                  : draft[section.key].annotation.trim().length >= 10;

                return (
                  <Button
                    key={section.key}
                    variant={isActive ? "solid" : "ghost"}
                    colorPalette={isActive ? "blue" : "gray"}
                    color={isActive ? "white" : "gray.900"}
                    fontWeight="bold"
                    justifyContent="flex-start"
                    onClick={() => setActiveSection(section.key)}
                    _hover={{ bg: isActive ? "blue.600" : "gray.100", color: isActive ? "white" : "gray.950" }}
                  >
                    <HStack gap={3}>
                      {isComplete ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      <Text>{section.label}</Text>
                    </HStack>
                  </Button>
                );
              })}
            </VStack>
          </Box>

          <Box p={6} bg="white" borderRadius="xl" shadow="sm">
            <VStack align="stretch" gap={5}>
              {activeSection === "freeAnnotations" ? (
                <>
                  <Box>
                    <Heading size="md" color="gray.800" mb={1}>{freeAnnotationsSection.label}</Heading>
                    <Text color="gray.600">{freeAnnotationsSection.focusLabel}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>Annotazioni libere</Text>
                    <Textarea
                      value={draft.freeAnnotations ?? ""}
                      onChange={(event) => updateFreeAnnotations(event.currentTarget.value)}
                      placeholder="Aggiungi note trasversali, promemoria o osservazioni non legate a una singola area"
                      bg="gray.50"
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      minH="300px"
                      resize="vertical"
                    />
                  </Box>
                </>
              ) : activeAreaDefinition && activeAreaValue ? (
                <>
                  <Box>
                    <Heading size="md" color="gray.800" mb={1}>{activeAreaDefinition.label}</Heading>
                    <Text color="gray.600">{activeAreaDefinition.focusLabel}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>Sintesi</Text>
                    <Input
                      value={activeAreaValue.field ?? ""}
                      onChange={(event) => updateAreaValue(activeAreaDefinition.key, "field", event.currentTarget.value)}
                      placeholder="Es: punti di forza, criticità, obiettivi del mese"
                      bg="gray.50"
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                    />
                  </Box>

                  <Box>
                    <Text fontSize="sm" fontWeight="medium" color="gray.700" mb={1}>Annotazione mensile</Text>
                    <Textarea
                      value={activeAreaValue.annotation}
                      onChange={(event) => updateAreaValue(activeAreaDefinition.key, "annotation", event.currentTarget.value)}
                      placeholder={`Scrivi l'annotazione per l'area ${activeAreaDefinition.label.toLowerCase()}`}
                      bg="gray.50"
                      color="gray.900"
                      _placeholder={{ color: "gray.500" }}
                      minH="220px"
                      resize="vertical"
                    />
                  </Box>
                </>
              ) : null}

              <Stack direction={{ base: "column", md: "row" }} justify="space-between" gap={3}>
                <HStack gap={3}>
                  <Button variant="outline" disabled={activeSection === reportSections[0].key} onClick={() => moveActiveArea("previous")}>
                    Precedente
                  </Button>
                  <Button variant="outline" disabled={activeSection === reportSections[reportSections.length - 1].key} onClick={() => moveActiveArea("next")}>
                    Successiva
                  </Button>
                </HStack>
                <Button colorPalette="blue" onClick={handleSave}>
                  <HStack gap={2}>
                    <Save size={18} />
                    <Text>Salva report</Text>
                  </HStack>
                </Button>
              </Stack>
            </VStack>
          </Box>
        </SimpleGrid>
      ) : (
        <Box p={6} bg="white" borderRadius="xl" shadow="sm">
          <Stack direction={{ base: "column", md: "row" }} justify="space-between" align={{ base: "stretch", md: "center" }} gap={3} mb={5}>
            <Box>
              <Heading size="md" color="gray.800" mb={1}>Report di {formatMonth(draft.month)}</Heading>
              <Text color="gray.600">{guest.firstName} {guest.lastName} · {facility?.name ?? "Struttura non disponibile"}</Text>
            </Box>
            <HStack color="blue.600" fontWeight="bold">
              <UserRound size={18} />
              <Text>{completedAreas}/{reportSections.length}</Text>
            </HStack>
          </Stack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={4}>
            {reportAreaDefinitions.map((area) => {
              const reportArea = draft[area.key];

              return (
                <Box key={area.key} p={4} bg="gray.50" border="1px solid" borderColor="gray.100" borderRadius="lg">
                  <Heading size="sm" color="gray.800" mb={2}>{area.label}</Heading>
                  <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={3}>
                    {reportArea.field?.trim() || area.focusLabel}
                  </Text>
                  <Text color="gray.700" whiteSpace="pre-wrap">
                    {reportArea.annotation.trim() || "Nessuna annotazione ancora."}
                  </Text>
                </Box>
              );
            })}

            <Box p={4} bg="gray.50" border="1px solid" borderColor="gray.100" borderRadius="lg">
              <Heading size="sm" color="gray.800" mb={2}>Libere annotazioni</Heading>
              <Text fontSize="sm" color="blue.700" fontWeight="medium" mb={3}>
                Note trasversali
              </Text>
              <Text color="gray.700" whiteSpace="pre-wrap">
                {draft.freeAnnotations?.trim() || "Nessuna annotazione libera ancora."}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>
      )}
    </VStack>
  );
}

function ProfileDatum({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <HStack align="start" gap={3}>
      <Box
        color="white"
        bg="blue.700"
        border="1px solid"
        borderColor="blue.800"
        borderRadius="md"
        boxSize="34px"
        display="flex"
        alignItems="center"
        justifyContent="center"
        flexShrink={0}
      >
        {icon}
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.500" textTransform="uppercase" fontWeight="bold">{label}</Text>
        <Text color="gray.800" fontWeight="medium">{value}</Text>
      </Box>
    </HStack>
  );
}

function ImageIcon({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      boxSize="28px"
      borderRadius="md"
      objectFit="cover"
    />
  );
}
