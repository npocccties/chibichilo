import type { Topic } from "@prisma/client";
import prisma from "$server/utils/prisma";
import { findTopicUniqueIds, updateTopicSpid } from "../uniqueId";

async function destroyTopic(id: Topic["id"]) {
  try {
    const ops = [
      prisma.topicSection.deleteMany({
        where: { topicId: id },
      }),
      prisma.section.deleteMany({
        where: { topicSections: { every: { topicId: id } } },
      }),
      prisma.activityTimeRange.deleteMany({
        where: { activity: { topicId: id } },
      }),
      prisma.activity.deleteMany({
        where: { topicId: id },
      }),
      prisma.authorship.deleteMany({
        where: { topicId: id },
      }),
      prisma.topic.deleteMany({
        where: { id },
      }),
      prisma.track.deleteMany({
        where: { video: { resource: { topics: { every: { id } } } } },
      }),
      prisma.video.deleteMany({
        where: { resource: { topics: { every: { id } } } },
      }),
      prisma.zoomMeeting.deleteMany({
        where: { resource: { topics: { every: { id } } } },
      }),
      prisma.resource.deleteMany({
        where: { topics: { every: { id } } },
      }),
    ];
    const ids = await findTopicUniqueIds(id);
    // unique id が見つかって、vid があるとき、spid を更新する
    if (ids && ids.vid) {
      ops.push(updateTopicSpid(ids));
    }
    await prisma.$transaction(ops);
  } catch {
    return;
  }
}

export default destroyTopic;
