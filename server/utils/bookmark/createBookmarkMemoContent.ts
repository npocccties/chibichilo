import type { BookmarkMemoContentProps } from "$server/models/bookmarkMemoContent";
import type { SessionSchema } from "$server/models/session";
import type { BookmarkSchema } from "$server/models/bookmark";
import prisma from "$server/utils/prisma";
import { bookmarkWithTopicQuery } from "$server/utils/bookmark/findBookmarks";

async function createBookmarkMemoContent({
  session,
  bookmark,
}: {
  session: SessionSchema;
  bookmark: BookmarkMemoContentProps;
}): Promise<BookmarkSchema | undefined> {
  const ltiConsumerId =
    bookmark.ltiConsumerId ??
    session.ltiResourceLink?.consumerId ??
    session.oauthClient?.id;
  const ltiContextId = bookmark.ltiContextId ?? session.ltiContext?.id;
  if (!ltiConsumerId || !ltiContextId) {
    return;
  }
  const created = await prisma.bookmark.create({
    data: {
      userId: session.user.id,
      tagId: null,
      ltiConsumerId,
      ltiContextId,
      memoContent: bookmark.memoContent,
      topicId: bookmark.topicId,
      bookId: bookmark.bookId,
    },
    ...bookmarkWithTopicQuery,
  });

  if (!created) {
    return;
  }
  return created;
}

export default createBookmarkMemoContent;
