import prisma from "$server/utils/prisma";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { MemberSchema } from "$server/models/member";

export async function upsertLtiMember(
  consumerId: LtiResourceLinkSchema["consumerId"],
  contextId: LtiResourceLinkSchema["contextId"],
  userIds: MemberSchema["user_id"][]
) {
  const ltiMembers = [];
  for (const userId of userIds) {
    const created = await prisma.ltiMember.upsert({
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
    });
    ltiMembers.push(created);
  }
  return ltiMembers;
}
