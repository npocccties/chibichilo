import { Prisma, Section, TopicSection } from "@prisma/client";
import { BookSchema } from "$server/models/book";
import { SectionSchema } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
  TopicWithResource,
} from "$server/utils/topicToTopicSchema";
import {
  ltiResourceLinkIncludingContextArg,
  ltiResourceLinkToSchema,
} from "$server/utils/ltiResourceLink";

export const bookIncludingTopicsArg = {
  include: {
    author: true,
    ltiResourceLinks: ltiResourceLinkIncludingContextArg,
    sections: {
      orderBy: { order: "asc" },
      include: {
        topicSections: {
          orderBy: { order: "asc" },
          include: { topic: topicsWithResourcesArg },
        },
      },
    },
  },
} as const;

type TopicSectionWithTopic = TopicSection & {
  topic: TopicWithResource;
};

type SectionWithTopics = Section & {
  topicSections: TopicSectionWithTopic[];
};

type BookWithTopics = Prisma.BookGetPayload<typeof bookIncludingTopicsArg>;

export function bookToBookSchema(book: BookWithTopics): BookSchema {
  return {
    ...book,
    author: book.author,
    ltiResourceLinks: book.ltiResourceLinks.map(ltiResourceLinkToSchema),
    sections: book.sections.map(sectionToSectionSchema),
  };
}

function sectionToSectionSchema(section: SectionWithTopics): SectionSchema {
  return {
    ...section,
    topics: section.topicSections.map(topicSectionToTopicSchema),
  };
}

function topicSectionToTopicSchema(
  topicSection: TopicSectionWithTopic
): TopicSchema {
  return {
    ...topicSection,
    ...topicToTopicSchema(topicSection.topic),
  };
}
