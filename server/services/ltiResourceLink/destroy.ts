import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import type { LtiResourceLinkParams } from "$server/validators/ltiResourceLinkParams";
import { ltiResourceLinkParamsSchema } from "$server/validators/ltiResourceLinkParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { destroyLtiResourceLink } from "$server/utils/ltiResourceLink";

export const destroySchema: FastifySchema = {
  summary: "LTI Resource Linkの削除",
  description: outdent`
    LTI Resource Linkを削除します。
    教員または管理者でなければなりません。`,
  params: ltiResourceLinkParamsSchema,
  response: {
    204: {},
  },
};

export const destroyHooks = {
  auth: [authUser, authInstructor],
};

// TODO: 複数著者に対応してほしい
export async function destroy({
  params,
  session,
}: FastifyRequest<{ Params: LtiResourceLinkParams }>) {
  await destroyLtiResourceLink({
    consumerId: params.lti_consumer_id,
    id: params.lti_resource_link_id,
  });

  session.ltiResourceLink = null;

  return {
    status: 204,
  };
}
