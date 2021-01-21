import { Prisma } from "@prisma/client";
import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
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
  };
}

export async function upsertLtiResourceLink(
  props: LtiResourceLinkSchema
): Promise<LtiResourceLinkSchema | null> {
  const { contextId, contextTitle, bookId, ...link } = props;

  const found = await bookExists(bookId);
  if (!found) return null;

  const contextInput = { id: contextId, title: contextTitle };
  const linkInput = {
    ...link,
    context: { connect: { id: contextId } },
    book: { connect: { id: bookId } },
  };

  await prisma.$transaction([
    prisma.ltiContext.upsert({
      where: { id: contextInput.id },
      create: contextInput,
      update: contextInput,
    }),
    prisma.ltiResourceLink.upsert({
      where: { id: linkInput.id },
      create: linkInput,
      update: linkInput,
    }),
  ]);

  return props;
}

export async function findLtiResourceLink(
  id: LtiResourceLinkSchema["id"]
): Promise<LtiResourceLinkSchema | null> {
  const link = await prisma.ltiResourceLink.findUnique({
    where: { id },
    include: { context: true },
  });

  return (
    link && {
      ...link,
      contextTitle: link.context.title,
    }
  );
}

export async function destroyLtiResourceLink(id: LtiResourceLinkSchema["id"]) {
  try {
    await prisma.ltiResourceLink.delete({ where: { id } });
  } catch {
    return;
  }
}
