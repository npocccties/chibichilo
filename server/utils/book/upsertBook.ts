import { Topic, Section, TopicSection } from "@prisma/client";
import { TopicSchema } from "$server/models/topic";
import { BookProps, BookSchema } from "$server/models/book";
import { SectionSchema } from "$server/models/book/section";
import prisma from "$server/utils/prisma";
import createBook from "./createBook";
import findBook from "./findBook";
import { topicCreateInput } from "$server/utils/topic";

const topicUpsertInput = (creatorId: Topic["creatorId"]) => (
  topic: TopicSchema,
  order: TopicSection["order"]
) => {
  const topicId = topic.id;
  const topicInput = {
    ...topic,
    creatorId,
  };
  const input = {
    order,
  };
  const create = {
    ...input,
    topic: {
      connectOrCreate: {
        where: { id: topicId },
        create: topicCreateInput(topicInput),
      },
    },
  };
  const update = {
    ...input,
    topic: {
      upsert: {
        where: { id: topicId },
        create: topicCreateInput(topicInput),
        update: topicCreateInput(topicInput),
      },
    },
  };

  return {
    where: { topicId },
    create,
    update,
  };
};

const sectionUpsertInput = (creatorId: Topic["creatorId"]) => (
  section: SectionSchema,
  order: Section["order"]
) => {
  const topicsInput = section.topics.map(topicUpsertInput(creatorId));
  const input = {
    order,
    name: section.name,
  };
  const create = {
    ...input,
    topicSections: { connectOrCreate: topicsInput },
  };
  const update = {
    ...input,
    topicSections: { upsert: topicsInput },
  };

  return {
    where: { id: section.id },
    create,
    update,
  };
};

async function upsertBook(
  props: BookProps | Omit<BookSchema, "ltiResourceLinks">
) {
  if (!("id" in props)) {
    const { id } = await createBook(props);
    const created = await (findBook(id) as Promise<BookSchema>);
    return created;
  }

  const { id, author, ...book } = props;
  const sectionsUpsertInput = book.sections.map(sectionUpsertInput(author.id));
  const input = {
    ...book,
    details: {},
    author: { connect: { id: author.id } },
  };
  const create = {
    ...input,
    sections: { connectOrCreate: sectionsUpsertInput },
  };
  const update = {
    ...input,
    sections: { upsert: sectionsUpsertInput },
  };

  await prisma.book.upsert({
    where: { id },
    create,
    update,
  });

  return props;
}

export default upsertBook;
