import prisma from "$server/utils/prisma";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LtiNrpsContextMemberSchema } from "$server/models/ltiNrpsContextMember";

export async function upsertLtiMembers(
  consumerId: LtiResourceLinkSchema["consumerId"],
  contextId: LtiResourceLinkSchema["contextId"],
  ltiUserIds: LtiNrpsContextMemberSchema["user_id"][]
) {
  const ltiMembers = [];
  for (const userId of ltiUserIds) {
    const [_, newLtiMembers] = await prisma.$transaction([
      prisma.user.upsert({
        where: {
          ltiConsumerId_ltiUserId: {
            ltiUserId: userId,
            ltiConsumerId: consumerId,
          },
        },
        update: {
          ltiUserId: userId,
          ltiConsumerId: consumerId,
        },
        create: {
          ltiUserId: userId,
          ltiConsumerId: consumerId,
          name: "",
        },
      }),
      prisma.ltiMember.upsert({
        where: {
          consumerId_contextId_userId: {
            consumerId,
            contextId,
            userId,
          },
        },
        update: {
          consumerId,
          contextId,
          userId,
        },
        create: {
          consumerId,
          contextId,
          userId,
        },
      }),
    ]);
    ltiMembers.push(newLtiMembers);
  }
  return ltiMembers;
}
