import { api } from "./api";
import useSWR from "swr";

import type { WordCloudParams } from "$server/validators/wordCloudParams";
import type { WordCloudSchema } from "$server/models/wordCloud";

const key = "/api/v2/wordCloud";

async function fetchWordCloud({ bookId }: WordCloudParams) {
  const res = await api.apiV2WordCloudBookIdGet({ bookId });

  return res as unknown as WordCloudSchema;
}

export function useWordCloud({ bookId }: WordCloudParams) {
  const { data, isLoading } = useSWR({ key, bookId }, fetchWordCloud);
  const wordCloud: WordCloudSchema = data || [];
  return { wordCloud, isLoading };
}
