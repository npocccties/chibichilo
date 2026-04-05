import useSWR from "swr";
import type { BookSchema } from "$server/models/book";
import type { LtiContextSchema } from "$server/models/ltiContext";
import { api } from "./api";
import type { ActivitySchema } from "$server/models/activity";
import { useLtiContextAtom, useSessionAtom } from "$store/session";
import { useActivityAtom } from "$store/activity";
import { isInstructor } from "./session";
import {
  NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY,
  NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL,
} from "./env";

const key = "/api/v2/book/{book_id}/activity";
const initialActivity: [] = [];

// The hook is enabled only for learners to track their progress.
// SWR fetching is deferred until the following conditions are met:
// 1. The user is identified as a learner (session is loaded and user is not an instructor).
// 2. A valid numeric book ID is provided.
// 3. The LTI context identifiers are fully resolved and ready to be used.
//
export function checkIsReady(params: {
  isLearner: boolean | "" | 0 | undefined | null;
  bookId: number | undefined;
  isLtiContextReady: boolean;
}) {
  return (
    Boolean(params.isLearner) &&
    Number.isFinite(params.bookId) &&
    params.isLtiContextReady
  );
}

async function updateBookActivity({
  bookId,
  ltiConsumerId,
  ltiContextId,
}: {
  key: typeof key;
  bookId: BookSchema["id"];
  ltiConsumerId: LtiContextSchema["consumerId"];
  ltiContextId: LtiContextSchema["id"];
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

function useBookActivity(bookId: BookSchema["id"] | undefined) {
  const { session } = useSessionAtom();
  const { ltiConsumerId, ltiContextId, isLtiContextReady } =
    useLtiContextAtom();

  const isLearner = session?.user?.id && !isInstructor(session);
  const isReady = checkIsReady({
    isLearner,
    bookId,
    isLtiContextReady,
  });
  const { data = initialActivity } = useSWR(
    isReady ? { key, bookId, ltiConsumerId, ltiContextId } : null,
    updateBookActivity,
    { refreshInterval: NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL * 1_000 }
  );
  useActivityAtom(data);
  return { data };
}

export default useBookActivity;
