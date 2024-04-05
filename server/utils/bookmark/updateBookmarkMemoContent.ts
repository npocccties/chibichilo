import type { BookmarkMemoContentProps } from "$server/models/bookmarkMemoContent";
import type { SessionSchema } from "$server/models/session";
import type { BookmarkSchema } from "$server/models/bookmark";
import prisma from "$server/utils/prisma";
import { bookmarkWithTopicQuery } from "$server/utils/bookmark/findBookmarks";
import type { BookmarkParams } from "$server/validators/bookmarkParams";

async function updateBookmarkMemoContent({
  id,
  session,
  bookmark,
}: {
  id: BookmarkParams["id"];
  session: SessionSchema;
  bookmark: BookmarkMemoContentProps;
}): Promise<BookmarkSchema | undefined> {
  if (!session.ltiResourceLink?.consumerId) {
    return;
  }
  const updated = await prisma.bookmark.update({
    where: {
      id,
      userId: session.user.id,
      tagId: null,
      ltiConsumerId: session.ltiResourceLink?.consumerId,
      ltiContextId: session.ltiContext.id,
      topicId: bookmark.topicId,
    },
    data: {
      memoContent: bookmark.memoContent,
    },
    ...bookmarkWithTopicQuery,
  });

  if (!updated) {
    return;
  }
  return updated;
}

export default updateBookmarkMemoContent;
