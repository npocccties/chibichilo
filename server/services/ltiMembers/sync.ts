import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { getMemberships } from "$server/utils/ltiv1p3/services";
import type { FastifyRequest, FastifySchema } from "fastify";
import findClient from "$server/utils/ltiv1p3/findClient";
import { isAdministrator } from "$utils/session";
import { updateLtiMembers } from "$server/utils/ltiMembers";
import prisma from "$server/utils/prisma";

export const syncSchema: FastifySchema = {
  summary: "LTI-NRPS 受講者の同期(全コース)",
  description: outdent`
      LTI Names and Role Provisioning Serviceを用いて、すべてのコースのLMSメンバーを同期します。
      あらかじめ誰かがコースからアクセスして、context_memberships_urlが保存されている必要があります。
      管理者でなければなりません。`,
  response: {
    200: {},
    401: {},
  },
};

export const syncHooks = {
  auth: [authUser, authInstructor],
};

export async function sync({ session }: FastifyRequest) {
  if (!isAdministrator(session)) {
    return {
      status: 401,
    };
  }

  const client = await findClient(session.oauthClient.id);
  if (!client) {
    return {
      status: 401,
    };
  }

  const contexts = (await prisma.ltiContext.findMany({})).filter(
    ({ consumerId, id, contextMembershipsUrl }) =>
      consumerId && id && contextMembershipsUrl
  );

  contexts.forEach(async (context) => {
    const membership = await getMemberships(
      client,
      context.contextMembershipsUrl
    );
    if (membership) {
      await updateLtiMembers(
        context.consumerId,
        context.id,
        context.title,
        context.label,
        membership.members
      );
    }
  });

  return {
    status: 200,
    body: {},
  };
}
