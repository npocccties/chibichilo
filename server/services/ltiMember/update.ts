import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { LtiMemberBodySchema } from "$server/validators/ltiMemberParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { findLtiResourceLink } from "$server/utils/ltiResourceLink";
import { upsertLtiMember } from "$server/utils/ltiMember";
import { LtiMembersSchema } from "$server/models/ltiMember";

export const updateSchema: FastifySchema = {
  summary: "LTI Member のデータの更新",
  description: outdent`
    LTI Memberを更新します。
    教員または管理者でなければなりません。`,
  body: LtiMemberBodySchema,
  response: {
    201: LtiMembersSchema,
    400: {},
    403: {},
  },
};

export type Body = LtiMemberBodySchema;

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export async function update(
  req: FastifyRequest<{
    Body: Body;
  }>
) {
  const ltiResourceLink = await findLtiResourceLink({
    consumerId: req.session.oauthClient.id,
    id: req.session.ltiResourceLinkRequest.id,
  });

  if (!ltiResourceLink) {
    return {
      status: 400,
    };
  }

  if (!isInstructor(req.session)) {
    return {
      status: 403,
    };
  }

  const ltiMembers = await upsertLtiMember(
    ltiResourceLink.consumerId,
    ltiResourceLink.contextId,
    req.body.user_ids
  );

  return {
    status: 201,
    body: ltiMembers,
  };
}
