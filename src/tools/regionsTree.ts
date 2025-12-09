import type { WordstatClient, RegionsTreeResponse } from "../api/wordstatClient.js";
import { cache, CACHE_TTL } from "../cache/cache.js";

const CACHE_KEY = "regions_tree";

export const regionsTreeDefinition = {
  name: "wordstat_regions_tree",
  description:
    "Получить дерево всех доступных регионов Wordstat. " +
    "Используйте этот метод для получения ID регионов, которые можно передать в другие методы. " +
    "Этот метод НЕ расходует дневную квоту и кэшируется на 24 часа.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export async function handleRegionsTree(client: WordstatClient): Promise<string> {
  // Check cache first
  const cached = cache.get<RegionsTreeResponse>(CACHE_KEY);
  if (cached) {
    return JSON.stringify(
      {
        ...cached,
        _cached: true,
        _cacheInfo: "Данные из кэша (TTL: 24 часа)",
      },
      null,
      2
    );
  }

  // Fetch from API
  const result = await client.getRegionsTree();

  // Store in cache
  cache.set(CACHE_KEY, result, CACHE_TTL.REGIONS_TREE);

  return JSON.stringify(result, null, 2);
}
