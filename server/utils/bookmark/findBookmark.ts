import prisma from "$server/utils/prisma";
import type { BookmarkParams } from "$server/validators/bookmarkParams";

async function findBookmark(id: BookmarkParams["id"]) {
  const bookmark = await prisma.bookmark.findUnique({
    where: { id },
    include: {
      tag: true,
    },
  });

  if (!bookmark) {
    return;
  }

  return bookmark;
}

export default findBookmark;
