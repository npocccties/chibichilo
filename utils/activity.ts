import { useEffect, useMemo } from "react";
import throttle from "lodash.throttle";
import usePrevious from "@rooks/use-previous";
import type { TopicSchema } from "$server/models/topic";
import type { BookSchema } from "$server/models/book";
import { useSessionAtom } from "$store/session";
import { useBookAtom } from "$store/book";
import { usePlayerTrackerAtom } from "$store/playerTracker";
import type { PlayerTracker } from "./eventLogger/playerTracker";
import { api } from "./api";
import {
  NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY,
  NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL,
} from "./env";

const secToMs = (sec: number) => Math.floor(sec * 1000);

const buildUpdateHandler =
  (
    topicId: TopicSchema["id"],
    bookId: BookSchema["id"],
    playerTracker: PlayerTracker
  ) =>
  async () => {
    const timeRanges = await playerTracker.getPlayed();
    const body = {
      timeRanges: timeRanges.map(([low, high]) => ({
        startMs: secToMs(low),
        endMs: secToMs(high),
      })),
    };
    await api.apiV2TopicTopicIdActivityPut({
      topicId,
      currentLtiContextOnly: NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY,
      bookId,
      body,
    });
  };

/** 学習活動のトラッキングの開始 (要: useBook()) */
export function useActivityTracking() {
  const { session, isInstructor } = useSessionAtom();
  const { book, itemIndex, itemExists } = useBookAtom();
  const loggedin = Boolean(session?.user?.id);
  const topic = itemExists(itemIndex);
  const playerTracker = usePlayerTrackerAtom();
  const unchanged = playerTracker === usePrevious(playerTracker);
  const updateHandler = useMemo(() => {
    if (!loggedin) return;
    if (isInstructor) return;
    if (unchanged) return;
    return (
      topic &&
      book &&
      playerTracker &&
      buildUpdateHandler(topic.id, book.id, playerTracker)
    );
  }, [isInstructor, unchanged, topic, book, playerTracker, loggedin]);
  const throttled = useMemo(
    () =>
      updateHandler &&
      throttle(updateHandler, NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL * 1000),
    [updateHandler]
  );
  useEffect(() => {
    if (throttled) playerTracker?.on("timeupdate", throttled);
  }, [playerTracker, throttled]);
}
