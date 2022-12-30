import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { LtiMemberParamsSchema } from "$server/validators/ltiMemberParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { findLtiResourceLink } from "$server/utils/ltiResourceLink";
import { upsertLtiMember } from "$server/utils/ltiMember";
import { LearnerSchema } from "$server/models/learner";

export const updateSchema: FastifySchema = {
  summary: "LTI Member のデータの更新",
  description: outdent`
    LTI Memberを更新します。
    教員または管理者でなければなりません。`,
  params: LtiMemberParamsSchema,
  response: {
    201: LearnerSchema,
    400: {},
    403: {},
  },
};

export type Params = LtiMemberParamsSchema;

export const updateHooks = {
  auth: [authUser, authInstructor],
};

export async function update(
  req: FastifyRequest<{
    Params: Params;
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
    req.params.userIds
  );

  return {
    status: 201,
    body: ltiMembers,
  };
}
