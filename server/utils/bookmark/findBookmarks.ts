import type { BookmarkSchema, BookmarkTagMenu } from "$server/models/bookmark";
import prisma from "$server/utils/prisma";
import type { BookmarkQuery } from "$server/validators/bookmarkQuery";
import type { User } from "@prisma/client";

type TopicIdParam = {
  topicId: BookmarkSchema["topicId"];
  tagIds?: BookmarkSchema["tagId"][];
  isExistMemoContent?: BookmarkQuery["isExistMemoContent"];
};
type TagIdParam = {
  topicId?: BookmarkSchema["topicId"];
  tagIds: BookmarkSchema["tagId"][];
  isExistMemoContent?: BookmarkQuery["isExistMemoContent"];
};

type FindBookmarksParams = {
  ltiConsumerId: BookmarkSchema["ltiConsumerId"];
  ltiContextId: BookmarkSchema["ltiContext"]["id"];
  bookId?: BookmarkSchema["bookId"];
  userId?: User["id"];
} & (TopicIdParam | TagIdParam);

export const bookmarkWithTopicQuery = {
  include: {
    tag: true,
    book: {
      select: {
        id: true,
        name: true,
      },
    },
    topic: {
      select: {
        id: true,
        name: true,
        timeRequired: true,
        bookmarks: {
          select: {
            id: true,
            bookId: true,
            updatedAt: true,
            tag: true,
            ltiContext: true,
          },
        },
      },
    },
    ltiContext: true,
  },
};

export const createIncludeQueryWithUserContext = (userId?: User["id"]) => {
  return {
    include: {
      tag: true,
      book: {
        select: {
          id: true,
          name: true,
        },
      },
      topic: {
        select: {
          id: true,
          name: true,
          timeRequired: true,
          bookmarks: {
            select: {
              id: true,
              bookId: true,
              updatedAt: true,
              tag: true,
              memoContent: true,
              ltiContext: true,
            },
            where: {
              userId,
            },
          },
        },
      },
      ltiContext: true,
    },
  };
};

async function findBookmarks({
  ltiContextId,
  ltiConsumerId,
  topicId,
  bookId,
  tagIds,
  isExistMemoContent = false,
  userId,
}: FindBookmarksParams): Promise<{
  bookmark: BookmarkSchema[];
  bookmarkTagMenu: BookmarkTagMenu;
}> {
  if (topicId !== undefined) {
    const bookmark = await prisma.bookmark.findMany({
      where: {
        ltiContextId: ltiContextId,
        ltiConsumerId: ltiConsumerId,
        topicId: topicId,
        bookId: bookId,
        userId: userId,
      },
      ...bookmarkWithTopicQuery,
    });

    const bookmarkTagMenu = await prisma.tag.findMany();

    return {
      bookmark,
      bookmarkTagMenu,
    };
  } else if (tagIds !== undefined) {
    const bookmark = await prisma.bookmark.findMany({
      where: {
        OR: [
          ...tagIds.map((tagId) => ({ tagId })),
          ...(isExistMemoContent ? [{ memoContent: { not: "" } }] : []),
        ],
        userId: userId,
        bookId: bookId,
      },
      distinct: ["ltiConsumerId", "ltiContextId", "topicId", "bookId"],
      ...createIncludeQueryWithUserContext(userId),
    });

    const bookmarkTagMenu = await prisma.tag.findMany();

    return {
      bookmark,
      bookmarkTagMenu,
    };
  }

  return {
    bookmark: [],
    bookmarkTagMenu: [],
  };
}

export default findBookmarks;
