import type { Prisma } from "@prisma/client";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import prisma from "./prisma";
import bookExists from "./book/bookExists";

export const ltiResourceLinkIncludingContextArg = {
  include: { context: true },
} as const;

export function ltiResourceLinkToSchema(
  props: Prisma.LtiResourceLinkGetPayload<
    typeof ltiResourceLinkIncludingContextArg
  >
): LtiResourceLinkSchema {
  const { context, ...link } = props;
  return {
    ...link,
    contextTitle: context.title,
    contextLabel: context.label,
  };
}

export async function upsertLtiResourceLink(
  props: LtiResourceLinkSchema
): Promise<LtiResourceLinkSchema | null> {
  const {
    consumerId,
    contextId,
    contextTitle,
    contextLabel,
    bookId,
    creatorId,
    ...link
  } = props;

  const found = await bookExists(bookId);
  if (!found) return null;

  const contextInput = {
    id: contextId,
    title: contextTitle,
    label: contextLabel,
    consumer: { connect: { id: consumerId } },
  };
  const linkInput = {
    ...link,
    context: { connect: { consumerId_id: { consumerId, id: contextId } } },
    book: { connect: { id: bookId } },
    consumer: { connect: { id: consumerId } },
    creator: { connect: { id: creatorId } },
    updatedAt: new Date(),
  };

  await prisma.$transaction([
    prisma.ltiContext.upsert({
      where: { consumerId_id: { consumerId, id: contextInput.id } },
      create: contextInput,
      update: contextInput,
    }),
    prisma.ltiResourceLink.upsert({
      where: { consumerId_id: { consumerId, id: linkInput.id } },
      create: linkInput,
      update: linkInput,
    }),
  ]);

  return props;
}

export async function findLtiResourceLink({
  consumerId,
  id,
}: Pick<
  LtiResourceLinkSchema,
  "consumerId" | "id"
>): Promise<LtiResourceLinkSchema | null> {
  const link = await prisma.ltiResourceLink.findUnique({
    where: { consumerId_id: { consumerId, id } },
    include: { context: true },
  });

  return (
    link && {
      ...link,
      contextTitle: link.context.title,
      contextLabel: link.context.label,
    }
  );
}

export async function destroyLtiResourceLink({
  consumerId,
  id,
}: Pick<LtiResourceLinkSchema, "consumerId" | "id">) {
  try {
    await prisma.ltiResourceLink.delete({
      where: { consumerId_id: { consumerId, id } },
    });
  } catch {
    return;
  }
}
