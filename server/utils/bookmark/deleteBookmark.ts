import type { BookmarkSchema } from "$server/models/bookmark";
import prisma from "$server/utils/prisma";
import type { Bookmark } from "@prisma/client";

async function deleteBookmark({
  id,
}: {
  id: BookmarkSchema["id"];
}): Promise<Bookmark | undefined> {
  const deleted = await prisma.bookmark.delete({
    where: { id },
  });

  if (!deleted) {
    return;
  }
  return deleted;
}

export default deleteBookmark;
