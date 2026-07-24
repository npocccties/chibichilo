import useSWRImmutable from "swr/immutable";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";
import type { TopicSchema } from "$server/models/topic";

const key = "/api/v2/lti/deep_linking";

async function getDlResponseJwt({
  bookId,
  topicId,
}: {
  bookId: BookSchema["id"];
  topicId: TopicSchema["id"] | undefined;
}): Promise<string | undefined> {
  const { jwt } = await api.apiV2LtiDeepLinkingGet({ bookId, topicId });
  return jwt;
}

export function useDlResponseJwt(
  bookId: BookSchema["id"],
  topicId?: TopicSchema["id"]
): string | undefined {
  const { data } = useSWRImmutable({ key, bookId, topicId }, getDlResponseJwt, {
    refreshInterval: 60_000,
  });
  return data;
}
