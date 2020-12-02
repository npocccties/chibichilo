import { Book, Section, TopicSection, User } from "@prisma/client";
import { BookSchema } from "$server/models/book";
import { SectionSchema } from "$server/models/book/section";
import { TopicSchema } from "$server/models/topic";
import {
  topicsWithResourcesArg,
  topicToTopicSchema,
  TopicWithResource,
} from "./topicToTopicSchema";

export const bookIncludingTopicsArg = {
  author: true,
  sections: {
    orderBy: {
      order: "asc",
    },
    include: {
      topicSections: {
        orderBy: {
          order: "asc",
        },
        include: {
          topic: { include: topicsWithResourcesArg },
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

type BookWithTopics = Book & {
  author: User;
  sections: SectionWithTopics[];
};

export function bookToBookSchema(book: BookWithTopics): BookSchema {
  return {
    ...book,
    author: book.author,
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
