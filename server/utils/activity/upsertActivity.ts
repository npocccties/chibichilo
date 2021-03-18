import { IntervalTree } from "$server/utils/intervalTree";
import type { User, Topic, Activity } from "@prisma/client";
import type { ActivityProps } from "$server/models/activity";
import type { ActivityTimeRangeProps } from "$server/models/activityTimeRange";
import prisma from "$server/utils/prisma";

function findActivity(learnerId: User["id"], topicId: Topic["id"]) {
  return prisma.activity.findUnique({
    where: { topicId_learnerId: { topicId, learnerId } },
    select: { id: true, timeRanges: { orderBy: { startMs: "asc" } } },
  });
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

function cleanup(activityId: Activity["id"]) {
  return prisma.activityTimeRange.deleteMany({ where: { activityId } });
}

function upsert(
  learnerId: User["id"],
  topicId: Topic["id"],
  timeRanges: ActivityTimeRangeProps[]
) {
  const totalTimeMs = timeRanges.reduce(
    (a, { startMs, endMs }) => a + endMs - startMs,
    0
  );
  const input = {
    learner: { connect: { id: learnerId } },
    topic: { connect: { id: topicId } },
    totalTimeMs,
    timeRanges: { create: timeRanges },
  };
  return prisma.activity.upsert({
    where: { topicId_learnerId: { topicId, learnerId } },
    create: input,
    update: { ...input, updatedAt: new Date() },
  });
}

async function upsertActivity(
  learnerId: User["id"],
  topicId: Topic["id"],
  activity: ActivityProps
): Promise<ActivityProps> {
  const exists = await findActivity(learnerId, topicId);
  const timeRanges = merge(exists?.timeRanges ?? [], activity.timeRanges);

  await prisma.$transaction([
    ...(exists ? [cleanup(exists.id)] : []),
    upsert(learnerId, topicId, timeRanges),
  ]);

  return { timeRanges };
}

export default upsertActivity;
