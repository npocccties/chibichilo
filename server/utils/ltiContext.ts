import prisma from "$server/utils/prisma";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LtiContextSchema } from "$server/models/ltiContext";

export async function upsertLtiContext(
  consumerId: LtiResourceLinkSchema["consumerId"],
  contextId: LtiResourceLinkSchema["contextId"],
  contextTitle: LtiContextSchema["title"],
  contextLabel: LtiContextSchema["label"],
  contextMembershipsUrl: string
) {
  const contextInput = {
    id: contextId,
    title: contextTitle || "",
    label: contextLabel || "",
    consumer: { connect: { id: consumerId } },
    contextMembershipsUrl: contextMembershipsUrl || "",
  };

  return await prisma.ltiContext.upsert({
    where: { consumerId_id: { consumerId, id: contextInput.id } },
    create: contextInput,
    update: contextInput,
  });
}
