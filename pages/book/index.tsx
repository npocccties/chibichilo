import { useState, useCallback, useEffect } from "react";
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
import { useBook, getBookIdByZoom } from "$utils/book";
import { useBookAtom } from "$store/book";
import { useVideoAtom } from "$store/video";
import type { TopicSchema } from "$server/models/topic";
import type { ContentAuthors } from "$server/models/content";
import { pagesPath } from "$utils/$path";
import useBookActivity from "$utils/useBookActivity";
import { useActivityTracking } from "$utils/activity";
import { useLoggerInit } from "$utils/eventLogger/loggerSessionPersister";
import logger from "$utils/eventLogger/logger";

export type Query = { bookId: BookSchema["id"]; token?: string; zoom?: number };

function Show(query: Query) {
  const [redirectError, setRedirectError] = useState(false);
  const router = useRouter();
  if (query.zoom) {
    void getBookIdByZoom(query.zoom)
      .then((res) => {
        void router.push(
          // @ts-expect-error 型としてはbookIdがないとエラーになるが、ダミー値を入れるとリダイレクト先urlにbookIdが入ってしまう
          pagesPath.book.$url({ query: { token: res.publicToken } })
        );
      })
      .catch((_) => {
        setRedirectError(true);
      });
  }

  const { session, isContentEditable } = useSessionAtom();
  // 公開URLのときもsyslogには出力する
  useLoggerInit(session);
  const { book, error } = useBook(
    query.bookId,
    isContentEditable,
    session?.ltiResourceLink,
    query.token
  );
  const { data: bookActivity } = useBookActivity(book?.id);
  const { itemIndex, nextItemIndex, itemExists, updateItemIndex } =
    useBookAtom(book);
  useActivityTracking();
  const { video } = useVideoAtom();
  const tracking = usePlayerTrackingAtom();
  useEffect(() => {
    const videoInstance = video.get(String(itemExists(itemIndex)?.id));
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
      if (!topic) return;

      playerTracker?.next(topic.id);
      updateItemIndex(index);
    },
    [playerTracker, nextItemIndex, itemExists, updateItemIndex]
  );
  const handleBookEditClick = () => {
    return router.push(pagesPath.book.edit.$url({ query }));
  };
  const handleBookForkClick = () => {
    return router.push(pagesPath.book.fork.$url({ query }));
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
    linked: book?.id === session?.ltiResourceLink?.bookId,
    onTopicEnded: handleTopicNext,
    onItemClick: handleTopicNext,
    onBookEditClick:
      book && isContentEditable(book) && !book?.release
        ? handleBookEditClick
        : undefined,
    onBookForkClick: book && book?.release ? handleBookForkClick : undefined,
    onOtherBookLinkClick: handleOtherBookLinkClick,
    onTopicEditClick: handleTopicEditClick,
  };

  // 読み込み直後はクエリがなにもないか判断できないので、少し待ってから判断する
  const [timedout, setTimedout] = useState(false);
  if (!timedout) setTimeout(() => setTimedout(true), 5000);
  const queryError =
    timedout &&
    !Number.isFinite(query.bookId) &&
    !query.token &&
    !Number.isFinite(query.zoom);

  if (error || redirectError || queryError) return <BookNotFoundProblem />;
  if (!book) return <Placeholder />;

  return (
    <Book
      book={book}
      bookActivity={bookActivity}
      index={itemIndex}
      {...handlers}
    />
  );
}

function Router() {
  const router = useRouter();
  const bookId = Number(router.query.bookId);
  const token = Array.isArray(router.query.token)
    ? router.query.token[0]
    : router.query.token;
  const zoom = Number(router.query.zoom);

  return <Show bookId={bookId} token={token} zoom={zoom} />;
}

export default Router;
