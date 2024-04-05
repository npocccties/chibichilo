import type { BookmarkTagMenu } from "$server/models/bookmark";
import prisma from "$server/utils/prisma";

async function findBookmarkTagMenu(): Promise<BookmarkTagMenu> {
  const bookmarkTagMenu = await prisma.tag.findMany();

  return bookmarkTagMenu;
}

export default findBookmarkTagMenu;
