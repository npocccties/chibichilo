import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { LtiMemberBodySchema } from "$server/validators/ltiMemberParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { updateLtiMembers } from "$server/utils/ltiMembers";
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
  const ltiMembers = await updateLtiMembers(
    req.session.oauthClient.id,
    req.session.ltiContext.id,
    req.session.ltiContext.title,
    req.session.ltiContext.label,
    req.body.members
  );

  return {
    status: 201,
    body: ltiMembers,
  };
}
