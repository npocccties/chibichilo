import useSWR from "swr";
import type { BookSchema } from "$server/models/book";
import { api } from "./api";
import type { ActivitySchema } from "$server/models/activity";
import { useSessionAtom } from "$store/session";
import { useActivityAtom } from "$store/activity";
import { isInstructor } from "./session";
import {
  NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY,
  NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL,
} from "./env";

const key = "/api/v2/book/{book_id}/activity";
const initialActivity: [] = [];

async function updateBookActivity({
  bookId,
  ltiConsumerId,
  ltiContextId,
}: {
  key: typeof key;
  bookId: BookSchema["id"];
  ltiConsumerId: string | null;
  ltiContextId: string | null;
}) {
  if (!bookId) return;
  const res = await api.apiV2BookBookIdActivityPut({
    bookId,
    currentLtiContextOnly: NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY,
    ltiConsumerId: ltiConsumerId ?? undefined,
    ltiContextId: ltiContextId ?? undefined,
  });
  return res.activity as Array<ActivitySchema>;
}

function useBookActivity(
  bookId: BookSchema["id"] | undefined,
  ltiConsumerId?: string | null,
  ltiContextId?: string | null
) {
  const { session } = useSessionAtom();
  const isLeaner = session?.user?.id && !isInstructor(session);

  // The hook is ready when:
  // 1. The user is a learner.
  // 2. The book ID is valid.
  // 3. LTI identifiers are provided (string or null).
  //
  // 'undefined' means the state is still pending (e.g., waiting for Jotai hydration
  // or the values were not passed from the parent component).
  // SWR will wait until these values settle into either 'string' or 'null'.
  const isReady =
    isLeaner &&
    Number.isFinite(bookId) &&
    ltiConsumerId !== undefined &&
    ltiContextId !== undefined;

  const { data = initialActivity } = useSWR(
    isReady ? { key, bookId, ltiConsumerId, ltiContextId } : null,
    updateBookActivity,
    { refreshInterval: NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL * 1_000 }
  );
  useActivityAtom(data);

  return { data };
}

export default useBookActivity;
