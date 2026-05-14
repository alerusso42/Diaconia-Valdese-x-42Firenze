import { z } from "zod";

export const reportAreaDefinitions = [
  {
    key: "areaSocioRelational",
    label: "Socio-relazionale",
    focusLabel: "Si trova a suo agio con i pari? Come comunica i propri bisogni e il proprio stato d'animo?",
  },
  {
    key: "areaFamily",
    label: "Familiare",
    focusLabel: "Rapporto con famiglia/tutor?",
  },
  {
    key: "areaRoutine",
    label: "Quotidianità",
    focusLabel: "Come si svolge la routine dell'ospite?",
  },
  {
    key: "areaHealth",
    label: "Sanitaria",
    focusLabel: "Necessita di cure particolari? Evoluzioni sul suo stato psicofisico?",
  },
  {
    key: "areaCognitive",
    label: "Cognitiva",
    focusLabel: "Che cosa ha imparato? Cosa gli interessa?",
  },
  {
    key: "areaLove",
    label: "Affettiva",
    focusLabel: "Come esprime affetto verso pari ed educatori?",
  },
  {
    key: "meeting",
    label: "Colloquio con l'ospite",
    focusLabel: "Di quali problemi avete discusso? Che soluzioni avete trovato? Come si e concluso l'incontro?",
  },
] as const;

export type ReportAreaKey = (typeof reportAreaDefinitions)[number]["key"];

const ReportAreaSchema = z.object({
  name: z.string().min(1, "Il nome dell'area è richiesto"),
  field: z.string().optional(),
  annotation: z.string().min(10, "L'annotazione deve essere più dettagliata (min 10 caratteri)"),
});

export const GuestReportSchema = z.object({
  guestId: z.string().min(1, "ID ospite mancante"),
  month: z.string(),
  areaSocioRelational: ReportAreaSchema,
  areaFamily: ReportAreaSchema,
  areaRoutine: ReportAreaSchema,
  areaHealth: ReportAreaSchema,
  areaCognitive: ReportAreaSchema,
  areaLove: ReportAreaSchema,
  meeting: ReportAreaSchema,
  freeAnnotations: z.string().optional(),
});

export type GuestReport = z.infer<typeof GuestReportSchema>;

export function createEmptyGuestReport(guestId: string, month: string): GuestReport {
  const areas = reportAreaDefinitions.reduce((draft, area) => {
    draft[area.key] = {
      name: area.label,
      field: "",
      annotation: "",
    };

    return draft;
  }, {} as Record<ReportAreaKey, GuestReport[ReportAreaKey]>);

  return {
    guestId,
    month,
    freeAnnotations: "",
    ...areas,
  };
}

export function countCompletedReportAreas(report: GuestReport) {
  return reportAreaDefinitions.filter((area) => report[area.key].annotation.trim().length >= 10).length;
}
