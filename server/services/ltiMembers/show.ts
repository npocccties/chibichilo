import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { getMemberships } from "$server/utils/ltiv1p3/services";
import type { FastifyRequest, FastifySchema } from "fastify";
import findClient from "$server/utils/ltiv1p3/findClient";
import { LtiNrpsContextMembershipSchema } from "$server/models/ltiNrpsContextMembership";

export const showSchema: FastifySchema = {
  summary: "LTI-NRPS 受講者の取得",
  description: outdent`
      LTI Names and Role Provisioning Serviceを用いて、LMSメンバーを取得
      教員または管理者でなければなりません。`,
  response: {
    200: LtiNrpsContextMembershipSchema,
    401: {},
  },
};

export const showHooks = {
  auth: [authUser, authInstructor],
};

export async function show({ session }: FastifyRequest) {
  const client = await findClient(session.oauthClient.id);
  if (!client) {
    return {
      status: 401,
    };
  }

  const membership = await getMemberships(
    client,
    session.ltiNrpsParameter?.context_memberships_url
  );
  if (!membership) {
    return {
      status: 401,
    };
  }

  return {
    status: 200,
    body: membership,
  };
}
