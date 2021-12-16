import { useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import type { BookSchema } from "$server/models/book";
import {
  usePlayerTrackerAtom,
  usePlayerTrackingAtom,
} from "$store/playerTracker";
import Book from "$templates/Book";
import Placeholder from "$templates/Placeholder";
import BookNotFoundProblem from "$templates/BookNotFoundProblem";
import { useSessionAtom } from "$store/session";
import { useBook } from "$utils/book";
import { useBookAtom } from "$store/book";
import { useVideoAtom } from "$store/video";
import type { TopicSchema } from "$server/models/topic";
import type { ContentAuthors } from "$types/content";
import { pagesPath } from "$utils/$path";
import { useActivityTracking } from "$utils/activity";
import logger from "$utils/eventLogger/logger";

export type Query = { bookId: BookSchema["id"] };

function Show(query: Query) {
  const { session, isContentEditable } = useSessionAtom();
  const { book, error } = useBook(
    query.bookId,
    isContentEditable,
    session?.ltiResourceLink
  );
  const { updateBook, itemIndex, nextItemIndex, itemExists, updateItemIndex } =
    useBookAtom();
  useEffect(() => {
    if (book) updateBook(book);
    return updateBook(undefined);
  }, [book, updateBook]);
  useActivityTracking();
  const { video } = useVideoAtom();
  const tracking = usePlayerTrackingAtom();
  useEffect(() => {
    const videoInstance = video.get(itemExists(itemIndex)?.resource.url ?? "");
    if (!videoInstance) return;
    if (videoInstance.type === "vimeo") {
      tracking({ player: videoInstance.player, url: videoInstance.url });
    } else {
      videoInstance.player.ready(() => {
        tracking({ player: videoInstance.player });
      });
    }
  }, [video, itemExists, itemIndex, tracking]);
  const playerTracker = usePlayerTrackerAtom();
  useEffect(() => {
    if (playerTracker) logger(playerTracker);
  }, [playerTracker]);
  const handleTopicNext = useCallback(
    (index: ItemIndex = nextItemIndex) => {
      const topic = itemExists(index);
      if (topic) playerTracker?.next(topic.id);
      updateItemIndex(index);
    },
    [playerTracker, nextItemIndex, itemExists, updateItemIndex]
  );
  const router = useRouter();
  const handleBookEditClick = () => {
    const action = book && isContentEditable(book) ? "edit" : "generate";
    return router.push(pagesPath.book[action].$url({ query }));
  };
  const handleOtherBookLinkClick = () => {
    return router.push(pagesPath.books.$url());
  };
  const handleTopicEditClick = (
    topic: Pick<TopicSchema, "id"> & ContentAuthors
  ) => {
    const action = isContentEditable(topic) ? "edit" : "generate";
    const url = pagesPath.book.topic[action].$url({
      query: { ...query, topicId: topic.id },
    });
    return router.push(url);
  };
  const handlers = {
    linked: query.bookId === session?.ltiResourceLink?.bookId,
    onTopicEnded: handleTopicNext,
    onItemClick: handleTopicNext,
    onBookEditClick: handleBookEditClick,
    onOtherBookLinkClick: handleOtherBookLinkClick,
    onTopicEditClick: handleTopicEditClick,
  };

  if (error) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return <Book book={book} index={itemIndex} {...handlers} />;
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);

  if (!Number.isFinite(bookId)) return <BookNotFoundProblem />;

  return <Show bookId={bookId} />;
}

export default Router;
