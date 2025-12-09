import type { WordstatClient } from "../api/wordstatClient.js";

export interface TopRequestsInput {
  phrase: string;
  regions?: number[];
  limit?: number;
}

export const topRequestsDefinition = {
  name: "wordstat_top_requests",
  description:
    "Получить топ популярных запросов, содержащих указанную фразу, и похожие запросы. " +
    "Возвращает частотность за последние 30 дней.",
  inputSchema: {
    type: "object" as const,
    properties: {
      phrase: {
        type: "string",
        description: "Ключевое слово или фраза для анализа",
      },
      regions: {
        type: "array",
        items: { type: "number" },
        description:
          "Список ID регионов (опционально). Используйте wordstat_regions_tree для получения ID",
      },
      limit: {
        type: "number",
        minimum: 1,
        maximum: 2000,
        default: 50,
        description: "Количество фраз в ответе (1-2000, по умолчанию 50)",
      },
    },
    required: ["phrase"],
  },
};

export async function handleTopRequests(
  client: WordstatClient,
  input: TopRequestsInput
): Promise<string> {
  const result = await client.getTopRequests({
    phrase: input.phrase,
    regions: input.regions,
    numPhrases: input.limit,
  });

  return JSON.stringify(result, null, 2);
}
