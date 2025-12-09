import type { WordstatClient } from "../api/wordstatClient.js";

export interface DynamicsInput {
  phrase: string;
  period: "monthly" | "weekly" | "daily";
  fromDate: string;
  toDate?: string;
  regions?: number[];
  devices?: "all" | "desktop" | "phone" | "tablet";
}

export const dynamicsDefinition = {
  name: "wordstat_dynamics",
  description:
    "Получить динамику частотности запроса по времени. " +
    "Возвращает историю изменения популярности запроса (даты, количество, доля от всех запросов). " +
    "ВАЖНО: для period='monthly' fromDate должен быть первым днём месяца (YYYY-MM-01). " +
    "Для period='weekly' fromDate должен быть понедельником.",
  inputSchema: {
    type: "object" as const,
    properties: {
      phrase: {
        type: "string",
        description: "Ключевое слово или фраза для анализа",
      },
      period: {
        type: "string",
        enum: ["monthly", "weekly", "daily"],
        description: "Период агрегации: monthly (помесячно), weekly (понедельно), daily (подневно)",
      },
      fromDate: {
        type: "string",
        description:
          "Дата начала в формате YYYY-MM-DD. " +
          "Для monthly — первый день месяца (например 2022-01-01). " +
          "Для weekly — понедельник.",
      },
      toDate: {
        type: "string",
        description: "Дата окончания в формате YYYY-MM-DD (опционально)",
      },
      regions: {
        type: "array",
        items: { type: "number" },
        description:
          "Список ID регионов (опционально). Используйте wordstat_regions_tree для получения ID",
      },
      devices: {
        type: "string",
        enum: ["all", "desktop", "phone", "tablet"],
        description: "Тип устройства: all (все), desktop, phone, tablet (по умолчанию all)",
      },
    },
    required: ["phrase", "period", "fromDate"],
  },
};

export async function handleDynamics(
  client: WordstatClient,
  input: DynamicsInput
): Promise<string> {
  const result = await client.getDynamics({
    phrase: input.phrase,
    period: input.period,
    fromDate: input.fromDate,
    toDate: input.toDate,
    regions: input.regions,
    devices: input.devices,
  });

  return JSON.stringify(result, null, 2);
}
