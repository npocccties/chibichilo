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
    // TODO:削除。テストしやすくするため、prefixをつける
    const membershipId = `membership#${userId}`;
    const created = await prisma.ltiMember.upsert({
      where: {
        consumerId_contextId_userId: {
          consumerId,
          contextId,
          userId: membershipId,
        },
      },
      update: {
        consumerId,
        contextId,
        userId: membershipId,
      },
      create: {
        consumerId,
        contextId,
        userId: membershipId,
      },
    });
    ltiMembers.push(created);
  }
  return ltiMembers;
}
