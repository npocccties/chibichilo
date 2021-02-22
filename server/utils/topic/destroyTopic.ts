import { Topic } from "@prisma/client";
import prisma from "$server/utils/prisma";

async function destroyTopic(id: Topic["id"]) {
  try {
    await prisma.$transaction([
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
      prisma.topic.deleteMany({
        where: { id },
      }),
      prisma.track.deleteMany({
        where: { video: { resource: { topics: { every: { id } } } } },
      }),
      prisma.video.deleteMany({
        where: { resource: { topics: { every: { id } } } },
      }),
      prisma.resource.deleteMany({
        where: { topics: { every: { id } } },
      }),
    ]);
  } catch {
    return;
  }
}

export default destroyTopic;
