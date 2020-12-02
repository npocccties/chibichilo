import { Book, Topic, Section, TopicSection } from "@prisma/client";
import { TopicProps } from "$server/models/topic";
import { BookProps, BookSchema } from "$server/models/book";
import { SectionProps } from "$server/models/book/section";
import prisma from "./prisma";
import { parse } from "./videoResource";
import { bookIncludingTopicsArg, bookToBookSchema } from "./bookToBookSchema";

const topicSectionCreateInput = (creatorId: Topic["creatorId"]) => (
  topic: TopicProps,
  order: TopicSection["order"]
) => {
  const videoProviderUrl = parse(topic.resource.url)?.providerUrl;
  const videoCreateInput =
    videoProviderUrl == null
      ? undefined
      : { create: { providerUrl: videoProviderUrl, tracks: {} } };
  const resourceCreateInput = {
    url: topic.resource.url,
    details: {},
    video: videoCreateInput,
  };
  const topicCreateInput = {
    ...topic,
    details: {},
    creator: { connect: { id: creatorId } },
    resource: { create: resourceCreateInput },
  };

  return {
    order: order,
    topic: { create: topicCreateInput },
  };
};

const sectionCreateInput = (creatorId: Topic["creatorId"]) => (
  section: SectionProps,
  order: Section["order"]
) => {
  const topicSectionsCreateInput = section.topics.map(
    topicSectionCreateInput(creatorId)
  );

  return {
    order,
    name: section.name,
    topicSections: {
      create: topicSectionsCreateInput,
    },
  };
};

export async function createBook(book: BookProps) {
  const { author, ...props } = book;

  const sectionsCreateInput = book.sections.map(sectionCreateInput(author.id));

  await prisma.book.create({
    data: {
      ...props,
      details: {},
      author: {
        connect: { id: author.id },
      },
      sections: {
        create: sectionsCreateInput,
      },
    },
  });
}

export async function findBook(
  bookId: Book["id"]
): Promise<BookSchema | undefined> {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: bookIncludingTopicsArg,
  });
  if (book == null) return;

  return bookToBookSchema(book);
}
