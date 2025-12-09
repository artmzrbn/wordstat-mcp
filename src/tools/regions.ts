import type { WordstatClient } from "../api/wordstatClient.js";

export interface RegionsInput {
  phrase: string;
}

export const regionsDefinition = {
  name: "wordstat_regions",
  description:
    "Получить распределение запросов по регионам за последние 30 дней. " +
    "Возвращает количество запросов, долю и индекс интереса (affinity index) для каждого региона.",
  inputSchema: {
    type: "object" as const,
    properties: {
      phrase: {
        type: "string",
        description: "Ключевое слово или фраза для анализа",
      },
    },
    required: ["phrase"],
  },
};

export async function handleRegions(
  client: WordstatClient,
  input: RegionsInput
): Promise<string> {
  const result = await client.getRegions({
    phrase: input.phrase,
  });

  return JSON.stringify(result, null, 2);
}
