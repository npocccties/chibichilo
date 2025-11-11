import dotenv from "dotenv";
import { Prisma } from "@prisma/client";
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
  try {
    const created = await prisma.bookmark.create({
      data: { ...bookmark },
      ...bookmarkInclude,
    });

    if (!created) {
      return;
    }
    return created;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // 重複データができてしまったらスキップ
      console.warn("Duplicate entry detected. Skipping creation.");
      return;
    } else {
      throw error; // ロールバック
    }
  }
}

async function createActivity({
  activity,
}: {
  activity: ActivityProps;
}): Promise<ActivitySchema | undefined> {
  try {
    const created = await prisma.activity.create({
      data: { ...activity },
      ...activityInclude,
    });

    if (!created) {
      return;
    }
    return created;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      // 重複データができてしまったらスキップ
      console.warn("Duplicate entry detected. Skipping creation.");
      return;
    } else {
      throw error; // ロールバック
    }
  }
}

async function deleteOriginalBookBookmark({
  bookmark,
}: {
  bookmark: BookmarkProps;
}): Promise<BookmarkSchema | undefined> {
  try {
    const deleted = await prisma.bookmark.delete({
      where: { id: bookmark.id, bookId: 0 },
    });

    if (!deleted) {
      return;
    }
    return deleted;
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      // レコードが存在しなかったらスキップ
      console.warn("Deletion skipped: target record not found.");
    } else {
      throw error; // ロールバック
    }
  }
}

async function deleteOriginalBookActivity({
  activity,
}: {
  activity: ActivityProps;
}): Promise<ActivitySchema | undefined> {
  const deleted = await prisma.$transaction(async (tx) => {
    try {
      await tx.activityTimeRange.deleteMany({
        where: { activityId: activity.id },
      });
      await tx.activityTimeRangeLog.deleteMany({
        where: { activityId: activity.id },
      });
      await tx.activityTimeRangeCount.deleteMany({
        where: { activityId: activity.id },
      });
      await tx.activity.delete({
        where: {
          bookId_topicId_learnerId_ltiConsumerId_ltiContextId: {
            bookId: 0,
            topicId: activity.topicId,
            learnerId: activity.learnerId,
            ltiConsumerId: activity.ltiConsumerId,
            ltiContextId: activity.ltiContextId,
          },
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        // レコードが存在しなかったらスキップ
        console.warn("Deletion skipped: target record not found.");
      } else {
        throw error; // ロールバック
      }
    }
  });

  if (!deleted) {
    return;
  }

  return deleted;
}

async function findAllActivities() {
  const activities = await prisma.activity.findMany({
    select: {
      id: true,
    },
  });
  return activities;
}

async function findActivity(id) {
  const activities = await prisma.activity.findUnique({
    where: { id: id },
    ...activityInclude,
  });
  return activities;
}

async function bookmarkMigration() {
  const bookmarks = await findAllBookmarks();
  for (const bookmark of bookmarks) {
    console.log(
      `[Copy bookmark] topicId: ${bookmark.topicId}, userId: ${bookmark.userId}, tagId: ${bookmark.tagId}, ltiConsumerId: ${bookmark.ltiConsumerId}, ltiContextId: ${bookmark.ltiContextId}`
    );
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
    await deleteOriginalBookBookmark({ bookmark });
  }
}

async function activityMigration() {
  // activityIdのみのリストを取得（timeRangeLogs等が大きい問題への対策）
  const activities = await findAllActivities();

  for (const a of activities) {
    // 1件ずつActivityを取得（このときにtimeRangeLogs等も取得）
    const activity = await findActivity(a.id);
    if (!activity.ltiConsumerId || !activity.ltiContextId) {
      continue;
    }
    console.log(
      `[Copy activity] topicId: ${activity.topicId}, learnerId: ${activity.learnerId}, ltiConsumerId: ${activity.ltiConsumerId}, ltiContextId: ${activity.ltiContextId}`
    );
    const timeRanges = activity.timeRanges.map(({ startMs, endMs }) => ({
      startMs,
      endMs,
    }));
    const timeRangeLogs = activity.timeRangeLogs.map(
      ({ startMs, endMs, createdAt, updatedAt }) => ({
        startMs,
        endMs,
        createdAt,
        updatedAt,
      })
    );
    const timeRangeCounts = activity.timeRangeCounts.map(
      ({ startMs, endMs, count }) => ({ startMs, endMs, count })
    );
    for (const topicSection of activity.topic.topicSection) {
      const created = await createActivity({
        activity: {
          timeRanges: {
            create: timeRanges,
          },
          timeRangeLogs: {
            create: timeRangeLogs,
          },
          timeRangeCounts: {
            create: timeRangeCounts,
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
    await deleteOriginalBookActivity({ activity });
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
