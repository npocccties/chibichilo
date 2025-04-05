import { IntervalTree } from "$server/utils/intervalTree";
import type {
  User,
  Topic,
  Activity,
  LtiConsumer,
  LtiContext,
} from "@prisma/client";
import type { ActivityProps } from "$server/validators/activityProps";
import type { ActivityTimeRangeProps } from "$server/validators/activityTimeRange";
import type { ActivityTimeRangeLogProps } from "$server/validators/activityTimeRangeLog";
import type { ActivityTimeRangeCountProps } from "$server/validators/activityTimeRangeCount";
import prisma from "$server/utils/prisma";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

const NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL2 = Number(
  process.env.NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL ?? 10
);

const ACTIVITY_COUNT_INTERVAL2 = Number(
  process.env.ACTIVITY_COUNT_INTERVAL ?? 1
);

const ACTIVITY_COUNT_INTERVAL_THRESHOLD_MS =
  (ACTIVITY_COUNT_INTERVAL2 * 1000) / 2.0;

function findActivity({
  learnerId,
  topicId,
  ltiConsumerId,
  ltiContextId,
}: {
  learnerId: User["id"];
  topicId: Topic["id"];
  ltiConsumerId: LtiConsumer["id"];
  ltiContextId: LtiContext["id"];
}) {
  return prisma.activity.findUnique({
    where: {
      topicId_learnerId_ltiConsumerId_ltiContextId: {
        topicId,
        learnerId,
        ltiConsumerId,
        ltiContextId,
      },
    },
    select: {
      id: true,
      topic: true,
      timeRanges: { orderBy: { startMs: "asc" } },
      timeRangeCounts: { orderBy: { startMs: "asc" } },
    },
  });
}

function findTopic(topicId: Topic["id"]) {
  return prisma.topic.findUnique({
    where: {
      id: topicId,
    },
  });
}

function findRecentActivityTimeRangeLog(activityId: Activity["id"]) {
  const now = new Date();
  const date = new Date(
    now.getTime() - NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL2 * 1.5 * 1000
  );

  return prisma.activityTimeRangeLog.findMany({
    where: {
      activityId: activityId,
      updatedAt: {
        gte: date,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

function findActivityTimeRangeCount(activityId: Activity["id"]) {
  return prisma.activityTimeRangeCount.findMany({
    where: {
      activityId: activityId,
    },
    orderBy: { startMs: "asc" },
  });
}

async function initActivityTimeRangeCount(topicId: Topic["id"]) {
  const timeRangeCounts: ActivityTimeRangeCountProps[] = [];
  const topic = await findTopic(topicId);
  if (!topic) {
    return timeRangeCounts;
  }
  const startTime = topic.startTime ?? 0;
  const stopTime = topic.stopTime ?? topic.timeRequired;

  for (let t = startTime; t < stopTime; t += ACTIVITY_COUNT_INTERVAL2) {
    timeRangeCounts.push({
      startMs: t * 1000,
      endMs: (t + ACTIVITY_COUNT_INTERVAL2) * 1000,
      count: 0,
    });
  }

  return timeRangeCounts;
}

function toInterval({ startMs, endMs }: ActivityTimeRangeProps) {
  return { low: startMs, high: endMs };
}

function merge(
  self: ActivityTimeRangeProps[],
  other: ActivityTimeRangeProps[]
): ActivityTimeRangeProps[] {
  const tree = new IntervalTree();

  self.forEach((range) => tree.insert(toInterval(range)));
  other.forEach((range) => tree.insertOrExpand(toInterval(range)));

  const timeRanges = [...tree.inOrder()].map(({ low, high }) => ({
    startMs: low,
    endMs: high,
  }));

  return timeRanges;
}

function concatAndMerge(
  self: ActivityTimeRangeLogProps[],
  other: ActivityTimeRangeProps[]
): ActivityTimeRangeProps[] {
  const existTimeRanges: ActivityTimeRangeLogProps[] = [];
  const newTimeRanges: ActivityTimeRangeLogProps[] = [];
  const now = new Date();

  //直近のものを重複排除しつつ、継続視聴の場合は mergeして追記をしないといけない
  other.forEach((range) => {
    // 重複データ: クライアント側から、既存データと同じ startMsとendMsのものが送られてきた
    // 視聴中を表すデータ: クライアント側から、既存データとstartMsが同じでかつendMsが大きいものが送られてきた
    const existTimeRange = self.find(
      (exist) => exist.startMs == range.startMs && exist.endMs <= range.endMs
    );
    if (existTimeRange) {
      existTimeRanges.push({
        startMs: existTimeRange.startMs,
        endMs: range.endMs,
        createdAt: existTimeRange.createdAt,
        updatedAt: now,
      });
      return;
    }

    // 新規データ
    const newTimeRange: ActivityTimeRangeLogProps = {
      startMs: range.startMs,
      endMs: range.endMs,
      createdAt: now,
      updatedAt: now,
    };
    newTimeRanges.push(newTimeRange);
  });

  return existTimeRanges
    .concat(newTimeRanges)
    .map(({ startMs, endMs, createdAt, updatedAt }) => ({
      startMs: startMs,
      endMs: endMs,
      createdAt: createdAt,
      updatedAt: updatedAt,
    }));
}

function purge(
  self: ActivityTimeRangeLogProps[],
  other: ActivityTimeRangeProps[]
): ActivityTimeRangeLogProps[] {
  const purgedTimeRanges: ActivityTimeRangeLogProps[] = [];
  const now = new Date();

  // 過去にカウント済みのものは省く
  other.forEach((range) => {
    // 重複データは省く
    let existTimeRange = self.find(
      (exist) => exist.startMs == range.startMs && exist.endMs == range.endMs
    );
    if (existTimeRange) {
      return;
    }

    // 視聴中を表すデータは、前回までに視聴した区間からの差分のみ取得する
    existTimeRange = self.find(
      (exist) => exist.startMs == range.startMs && exist.endMs < range.endMs
    );
    if (existTimeRange) {
      purgedTimeRanges.push({
        startMs: existTimeRange.endMs,
        endMs: range.endMs,
        createdAt: existTimeRange.createdAt,
        updatedAt: existTimeRange.updatedAt,
      });
      return;
    }

    // 新規データ
    const newTimeRange: ActivityTimeRangeLogProps = {
      startMs: range.startMs,
      endMs: range.endMs,
      createdAt: now,
      updatedAt: now,
    };
    purgedTimeRanges.push(newTimeRange);
  });

  return purgedTimeRanges.map(({ startMs, endMs, createdAt, updatedAt }) => ({
    startMs: startMs,
    endMs: endMs,
    createdAt: createdAt,
    updatedAt: updatedAt,
  }));
}

function countTimeRange(
  timeRangeCounts: ActivityTimeRangeCountProps[],
  timeRangeLogs: ActivityTimeRangeLogProps[]
): ActivityTimeRangeCountProps[] {
  timeRangeCounts.forEach((range) => {
    timeRangeLogs.forEach((log) => {
      if (
        (log.startMs <= range.startMs && range.endMs <= log.endMs) ||
        (range.startMs < log.startMs &&
          range.endMs < log.endMs &&
          range.endMs - log.startMs > ACTIVITY_COUNT_INTERVAL_THRESHOLD_MS) ||
        (log.startMs < range.startMs &&
          log.endMs < range.endMs &&
          log.endMs - range.startMs > ACTIVITY_COUNT_INTERVAL_THRESHOLD_MS)
      ) {
        range.count ??= 0;
        range.count += 1;
      }
    });
  });

  return timeRangeCounts.map(({ startMs, endMs, count }) => ({
    startMs: startMs,
    endMs: endMs,
    count: count,
  }));
}

function cleanup(activityId: Activity["id"]) {
  return prisma.activityTimeRange.deleteMany({ where: { activityId } });
}

function cleanupTimeRangeCounts(activityId: Activity["id"]) {
  return prisma.activityTimeRangeCount.deleteMany({ where: { activityId } });
}

function cleanupRecentTimeRangeLogs(
  timeRangeLogs: ActivityTimeRangeLogProps[]
) {
  const ids = timeRangeLogs
    .map((log: ActivityTimeRangeLogProps) => {
      return log.id;
    })
    .filter((id): id is Exclude<typeof id, undefined> => {
      return id !== undefined;
    });
  return prisma.activityTimeRangeLog.deleteMany({ where: { id: { in: ids } } });
}

function upsert({
  learnerId,
  topicId,
  ltiConsumerId,
  ltiContextId,
  timeRanges,
  timeRangeLogs,
  timeRangeCounts,
}: {
  learnerId: User["id"];
  topicId: Topic["id"];
  ltiConsumerId: LtiConsumer["id"];
  ltiContextId: LtiContext["id"];
  timeRanges: ActivityTimeRangeProps[];
  timeRangeLogs: ActivityTimeRangeLogProps[];
  timeRangeCounts: ActivityTimeRangeCountProps[];
}) {
  const totalTimeMs = timeRanges.reduce(
    (a, { startMs, endMs }) => a + endMs - startMs,
    0
  );
  const input = {
    totalTimeMs,
    timeRanges: { create: timeRanges },
    timeRangeLogs: { create: timeRangeLogs },
    timeRangeCounts: { create: timeRangeCounts },
  };
  return prisma.activity.upsert({
    where: {
      topicId_learnerId_ltiConsumerId_ltiContextId: {
        topicId,
        learnerId,
        ltiConsumerId,
        ltiContextId,
      },
    },
    create: {
      ...input,
      learner: { connect: { id: learnerId } },
      topic: { connect: { id: topicId } },
      ltiContext: {
        connect: {
          consumerId_id: { consumerId: ltiConsumerId, id: ltiContextId },
        },
      },
    },
    update: { ...input, updatedAt: new Date() },
  });
}

function padZeroTimeRangeCount(
  timeRangeCounts: ActivityTimeRangeCountProps[],
  topic: Topic
): ActivityTimeRangeCountProps[] {
  const startTime = topic.startTime ?? 0;
  const stopTime = topic.stopTime ?? topic.timeRequired;

  for (let t = startTime; t < stopTime; t += ACTIVITY_COUNT_INTERVAL2) {
    if (
      timeRangeCounts.find((c) => {
        return (
          c.startMs === t * 1000 &&
          c.endMs === (t + ACTIVITY_COUNT_INTERVAL2) * 1000
        );
      })
    )
      continue;

    timeRangeCounts.push({
      startMs: t * 1000,
      endMs: (t + ACTIVITY_COUNT_INTERVAL2) * 1000,
      count: 0,
    });
  }

  return timeRangeCounts;
}

async function upsertActivity({
  learnerId,
  topicId,
  ltiConsumerId = "",
  ltiContextId = "",
  activity,
}: {
  learnerId: User["id"];
  topicId: Topic["id"];
  ltiConsumerId?: LtiConsumer["id"];
  ltiContextId?: LtiContext["id"];
  activity: ActivityProps;
}): Promise<ActivityProps> {
  const exists = await findActivity({
    learnerId,
    topicId,
    ltiConsumerId,
    ltiContextId,
  });

  let recentTimeRangeLogs: ActivityTimeRangeLogProps[] = [];
  let timeRangeLogs: ActivityTimeRangeLogProps[] = [];
  let timeRangeCounts: ActivityTimeRangeCountProps[] = [];
  if (NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD && exists?.id) {
    recentTimeRangeLogs = await findRecentActivityTimeRangeLog(exists.id);
    const tempTimeRangeCounts = await findActivityTimeRangeCount(exists.id);
    timeRangeCounts = padZeroTimeRangeCount(tempTimeRangeCounts, exists.topic);
  }

  if (NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD && !timeRangeCounts.length) {
    timeRangeCounts = await initActivityTimeRangeCount(topicId);
  }

  const timeRanges = merge(exists?.timeRanges ?? [], activity.timeRanges);

  if (NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD) {
    timeRangeLogs = concatAndMerge(recentTimeRangeLogs, activity.timeRanges);
    const purgedTimeRangeLogs = purge(recentTimeRangeLogs, activity.timeRanges);

    timeRangeCounts = countTimeRange(
      timeRangeCounts,
      purgedTimeRangeLogs
    ).filter((c) => {
      return c.count != 0;
    });
  }

  await prisma.$transaction([
    ...(NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD && exists
      ? [cleanupTimeRangeCounts(exists.id)]
      : []),
    ...(NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD && exists
      ? [cleanupRecentTimeRangeLogs(recentTimeRangeLogs)]
      : []),
    ...(exists ? [cleanup(exists.id)] : []),
    upsert({
      learnerId,
      topicId,
      ltiConsumerId,
      ltiContextId,
      timeRanges,
      timeRangeLogs,
      timeRangeCounts,
    }),
  ]);

  return { timeRanges };
}

export default upsertActivity;
