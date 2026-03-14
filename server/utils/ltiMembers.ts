import prisma from "$server/utils/prisma";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LtiNrpsContextMemberSchema } from "$server/models/ltiNrpsContextMember";
import type { LtiContextSchema } from "$server/models/ltiContext";

export async function getLtiMembers(
  consumerId: LtiResourceLinkSchema["consumerId"],
  contextId: LtiResourceLinkSchema["contextId"],
  administrator?: boolean
) {
  const whereclause = {
    where: {
      consumerId,
      contextId,
    },
  };
  if (administrator) {
    return await prisma.ltiMemberAdmin.findMany(whereclause);
  } else {
    return await prisma.ltiMember.findMany(whereclause);
  }
}

export async function updateLtiMembers(
  consumerId: LtiResourceLinkSchema["consumerId"],
  contextId: LtiResourceLinkSchema["contextId"],
  contextTitle: LtiContextSchema["title"],
  contextLabel: LtiContextSchema["label"],
  members: LtiNrpsContextMemberSchema[],
  administrator?: boolean
) {
  const contextInput = {
    id: contextId,
    title: contextTitle || "",
    label: contextLabel || "",
    consumer: { connect: { id: consumerId } },
  };

  const members_context = [
    ...members.map((member) =>
      prisma.user.upsert({
        where: {
          ltiConsumerId_ltiUserId: {
            ltiUserId: member.user_id,
            ltiConsumerId: consumerId,
          },
        },
        update: {
          ltiUserId: member.user_id,
          ltiConsumerId: consumerId,
          name: member?.name,
          email: member?.email,
        },
        create: {
          ltiUserId: member.user_id,
          ltiConsumerId: consumerId,
          name: member?.name || "",
          email: member?.email || "",
        },
      })
    ),
    prisma.ltiContext.upsert({
      where: { consumerId_id: { consumerId, id: contextInput.id } },
      create: contextInput,
      update: contextInput,
    }),
  ];

  if (administrator) {
    await prisma.$transaction([
      ...members_context,
      prisma.ltiMemberAdmin.deleteMany({
        where: {
          consumerId,
          contextId,
        },
      }),
      prisma.ltiMemberAdmin.createMany({
        data: members.map((member) => ({
          consumerId,
          contextId,
          userId: member.user_id,
        })),
      }),
    ]);
  } else {
    await prisma.$transaction([
      ...members_context,
      prisma.ltiMember.deleteMany({
        where: {
          consumerId,
          contextId,
        },
      }),
      prisma.ltiMember.createMany({
        data: members.map((member) => ({
          consumerId,
          contextId,
          userId: member.user_id,
        })),
      }),
    ]);
  }

  const ltiMembers = await getLtiMembers(consumerId, contextId, administrator);
  return ltiMembers;
}
