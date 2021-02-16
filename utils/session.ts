import { useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import type { TopicSchema } from "$server/models/topic";
import type { BookSchema } from "$server/models/book";
import { Session, isAdministrator, isInstructor } from "$server/utils/session";
import { useUpdateSessionAtom } from "$store/session";
import { api } from "./api";
import topicCreateBy from "./topicCreateBy";
import bookCreateBy from "./bookCreateBy";

export * from "$server/utils/session";

const key = "/api/v2/session";

export function useSessionInit() {
  const { data, error } = useSWR<Session>(key, async () => {
    const res = await api.apiV2SessionGetRaw();
    return res.raw.json();
  });
  const sessionWithState = useMemo(
    () => ({
      session: data,
      isAdministrator: data ? isAdministrator(data) : false,
      isInstructor: data ? isInstructor(data) : false,
      isTopicEditable(topic: Pick<TopicSchema, "creator">) {
        // NOTE: 自身以外の作成したトピックに関しては編集不可
        return topicCreateBy(topic, data?.user);
      },
      isBookEditable(book: Pick<BookSchema, "author">) {
        // NOTE: 自身以外の作成したブックに関しては編集不可
        return bookCreateBy(book, data?.user);
      },
      error: Boolean(error),
    }),
    [data, error]
  );
  const updateSession = useUpdateSessionAtom();
  useEffect(() => {
    updateSession(sessionWithState);
  }, [sessionWithState, updateSession]);

  return sessionWithState;
}

export function revalidateSession(): Promise<Session> {
  return mutate(key);
}
