import type { Prisma } from "$node_modules/@prisma/client";
import type { SectionProps } from "$server/models/book/section";
import prisma from "../prisma";
import { cloneTopic } from "../topic/cloneTopic";
import { cloneTopicUniqueIds } from "../uniqueId";

export async function cloneSections(origTopics: number[], sections: SectionProps[], authors: Prisma.AuthorshipUncheckedCreateInput[]) {
  for (const section of sections) {
    for (const topic of section.topics) {
      if (origTopics && origTopics.includes(topic.id)) continue;
      const found = await prisma.topic.findUnique({
        where: { id: topic.id },
        include: { resource: true, keywords: true }
      });
      if (!found) continue;
      const { id: _id, resourceId: _resourceId, ...orig } = found;
      found.shared = false;
      const cloned = await cloneTopic(topic.id, orig, authors);
      if (cloned) {
        await cloneTopicUniqueIds(topic.id, cloned.id);
        topic.id = cloned.id;
      }
    }
  }
  return sections;
}
