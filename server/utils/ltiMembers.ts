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
    // NOTE：未ログインユーザーは、Userテーブルに保存されていないのでltiMemberのupsert処理前にUserテーブルに仮の値で保存する
    await prisma.user.upsert({
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
    });

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
