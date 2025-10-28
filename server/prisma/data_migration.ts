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
      ...topicInclude,
    },
    timeRanges: true,
    timeRangeLogs: true,
    timeRangeCounts: true,
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

type ActivityTimeRangeProps = {
  startMs: number;
  endMs: number;
};

type ActivityTimeRangeLogProps = {
  startMs: number;
  endMs: number;
  createdAt: string;
  updatedAt: string;
};

type ActivityTimeRangeCountProps = {
  startMs: number;
  endMs: number;
  count: number;
};

type ActivityProps = {
  id: number;
  timeRanges: ActivityTimeRangeProps[];
  timeRangeLogs: ActivityTimeRangeLogProps[];
  timeRangeCounts: ActivityTimeRangeCountProps[];
  bookId: number;
  topicId: number;
  learnerId: number;
  ltiConsumerId: string;
  ltiContextId: string;
  totalTimeMs: number;
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
  const created = await prisma.bookmark.create({
    data: { ...bookmark },
    ...bookmarkInclude,
  });

  if (!created) {
    return;
  }
  return created;
}

async function createActivity({
  activity,
}: {
  activity: ActivityProps;
}): Promise<ActivitySchema | undefined> {
  const created = await prisma.activity.create({
    data: { ...activity },
    ...activityInclude,
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

async function bookmarkMigration() {
  const bookmarks = await findAllBookmarks();
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

async function activityMigration() {
  const activities = await findAllActivities();

  for (const activity of activities) {
    if (!activity.ltiConsumerId) {
      continue;
    }
    for (const topicSection of activity.topic.topicSection) {
      const created = await createActivity({
        activity: {
          timeRanges: {
            create: activity.timeRanges.map(({ startMs, endMs }) => ({
              startMs,
              endMs,
            })),
          },
          timeRangeLogs: {
            create: activity.timeRangeLogs.map(
              ({ startMs, endMs, createdAt, updatedAt }) => ({
                startMs,
                endMs,
                createdAt,
                updatedAt,
              })
            ),
          },
          timeRangeCounts: {
            create: activity.timeRangeCounts.map(
              ({ startMs, endMs, count }) => ({ startMs, endMs, count })
            ),
          },

          bookId: topicSection.section.bookId,
          topicId: activity.topicId,
          learnerId: activity.learnerId,
          ltiConsumerId: activity.ltiConsumerId,
          ltiContextId: activity.ltiContextId,
          totalTimeMs: activity.totalTimeMs,
          createdAt: activity.createdAt,
          updatedAt: activity.updatedAt,
        },
      });
    }
  }
}

async function main() {
  dotenv.config();
  let exitCode = 1;
  try {
    console.log("Seeding...");
    console.log("Migrating Bookmark...");
    await bookmarkMigration();
    console.log("Migrating Activity...");
    await activityMigration();
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
