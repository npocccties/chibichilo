import useSWRImmutable from "swr/immutable";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";

const key = "/api/v2/lti/deep_linking";

async function getDlResponseJwt({
  bookId,
}: {
  bookId: BookSchema["id"];
}): Promise<string | undefined> {
  const { jwt } = await api.apiV2LtiDeepLinkingGet({ bookId });
  return jwt;
}

export function useDlResponseJwt(bookId: BookSchema["id"]): string | undefined {
  const { data } = useSWRImmutable({ key, bookId }, getDlResponseJwt, {
    refreshInterval: 60_000,
  });
  return data;
}
