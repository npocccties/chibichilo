import type { BookmarkProps, BookmarkSchema } from "$server/models/bookmark";
import type { SessionSchema } from "$server/models/session";
import prisma from "$server/utils/prisma";
import { bookmarkWithTopicQuery } from "$server/utils/bookmark/findBookmarks";

async function createBookmark({
  session,
  bookmark,
}: {
  session: SessionSchema;
  bookmark: BookmarkProps;
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
      ...bookmark,
      userId: session.user.id,
      ltiConsumerId,
      ltiContextId,
    },
    ...bookmarkWithTopicQuery,
  });

  if (!created) {
    return;
  }
  return created;
}

export default createBookmark;
