import type { Topic, Section, TopicSection } from "@prisma/client";
import type { SectionProps } from "$server/models/book/section";

const topicSectionCreateInput = (
  topic: Pick<Topic, "id">,
  order: TopicSection["order"]
) => ({ order, topic: { connect: { id: topic.id } } });

const sectionCreateInput = (section: SectionProps, order: Section["order"]) => {
  const topicSectionsCreateInput = section.topics.map(topicSectionCreateInput);

  return {
    order,
    name: section.name,
    topicSections: {
      create: topicSectionsCreateInput,
    },
  };
};

export default sectionCreateInput;
