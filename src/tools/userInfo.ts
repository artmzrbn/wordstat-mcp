import type { WordstatClient } from "../api/wordstatClient.js";

export const userInfoDefinition = {
  name: "wordstat_user_info",
  description:
    "Получить информацию о пользователе и состоянии квоты. " +
    "Возвращает логин, лимит квоты, использованную и оставшуюся квоту.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

export async function handleUserInfo(client: WordstatClient): Promise<string> {
  const result = await client.getUserInfo();

  return JSON.stringify(result, null, 2);
}
