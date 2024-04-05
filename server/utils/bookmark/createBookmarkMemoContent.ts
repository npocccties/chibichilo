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
  if (!session.ltiResourceLink?.consumerId) {
    return;
  }
  const created = await prisma.bookmark.create({
    data: {
      userId: session.user.id,
      tagId: null,
      ltiConsumerId: session.ltiResourceLink?.consumerId,
      ltiContextId: session.ltiContext.id,
      ...bookmark,
    },
    ...bookmarkWithTopicQuery,
  });

  if (!created) {
    return;
  }
  return created;
}

export default createBookmarkMemoContent;
