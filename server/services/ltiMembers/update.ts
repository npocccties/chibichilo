import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { LtiMemberBodySchema } from "$server/validators/ltiMemberParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { findLtiResourceLink } from "$server/utils/ltiResourceLink";
import { upsertLtiMembers } from "$server/utils/ltiMembers";
import { LtiMembersSchema } from "$server/models/ltiMembers";

export const updateSchema: FastifySchema = {
  summary: "コースの受講者の反映",
  description: outdent`
    コースの受講者の反映をします。
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

  const ltiMembers = await upsertLtiMembers(
    ltiResourceLink.consumerId,
    ltiResourceLink.contextId,
    req.body.user_ids
  );

  return {
    status: 201,
    body: ltiMembers,
  };
}
