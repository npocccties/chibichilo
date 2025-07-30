import dotenv from "dotenv";
import prisma from "$server/utils/prisma";
import type { ActivitySchema } from "$server/models/activity";
import type { BookmarkSchema } from "$server/models/bookmark";

const topicInclude = {
  select: {
    topicSection: {
      select: {
        section: {
          select: {
            bookId: true,
          },
        },
      },
    },
  },
};

const bookmarkInclude = {
  include: {
    tag: true,
    topic: {
      ...topicInclude,
      // select: {
      //   id: true,
      //   name: true,
      //   timeRequired: true,
      //   bookmarks: {
      //     select: {
      //       id: true,
      //       updatedAt: true,
      //       tag: true,
      //       ltiContext: true,
      //     },
      //   },
      // },
    },
    ltiContext: true,
  },
};

const activityInclude = {
  include: {
    ltiContext: { select: { id: true, title: true, label: true } },
    learner: {
      select: {
        id: true,
        name: true,
        email: true,
        ltiUserId: true,
        ltiConsumerId: true,
      },
    },
    topic: {
      // select: { id: true, name: true, timeRequired: true },
      ...topicInclude,
    },
  },
};

type BookmarkProps = {
  id: number;
  ltiConsumerId: string;
  ltiContextId: string;
  tagId: number | null;
  userId: number;
  topicId: number;
  bookId: number;
  memoContent: string;
  createdAt: string;
  updatedAt: string;
};

async function findAllBookmarks() {
  const bookmarks = await prisma.bookmark.findMany({
    ...bookmarkInclude,
  });
  return bookmarks;
}

async function createBookmark({
  bookmark,
}: {
  bookmark: BookmarkProps;
}): Promise<BookmarkSchema | undefined> {
  console.log(bookmark);
  const created = await prisma.bookmark.create({
    data: { ...bookmark },
    ...bookmarkInclude,
  });

  if (!created) {
    return;
  }
  return created;
}

async function findAllActivities() {
  const activities = await prisma.activity.findMany({
    ...activityInclude,
  });
  return activities;
}

async function bookmark_migration() {
  const bookmarks = await findAllBookmarks();
  console.log(bookmarks);
  for (const bookmark of bookmarks) {
    for (const topicSection of bookmark.topic.topicSection) {
      const created = await createBookmark({
        bookmark: {
          ltiConsumerId: bookmark.ltiConsumerId,
          ltiContextId: bookmark.ltiContextId,
          tagId: bookmark.tagId,
          userId: bookmark.userId,
          topicId: bookmark.topicId,
          bookId: topicSection.section.bookId,
          memoContent: bookmark.memoContent,
          createdAt: bookmark.createdAt,
          updatedAt: bookmark.updatedAt,
        },
      });
    }
  }
}

async function activity_migration() {
  const activities = await findAllActivities();
  activities.forEach((activity) => {
    activity.topic.topicSection.forEach((topic_section) => {
      const bookId = topic_section.section.bookId;
      console.log(bookId);
    });
  });
  console.log(activities);
}

async function main() {
  dotenv.config();
  let exitCode = 1;
  try {
    console.log("Seeding...");
    await bookmark_migration();
    //    await activity_migration();
    console.log("Seeding completed.");
    exitCode = 0;
  } catch (error) {
    console.error(
      error instanceof Error ? error.stack ?? error.message : error
    );
  } finally {
    await prisma.$disconnect();
    process.exit(exitCode);
  }
}

void main();
