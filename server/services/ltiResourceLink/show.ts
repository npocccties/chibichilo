import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import { ltiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LtiResourceLinkParams } from "$server/validators/ltiResourceLinkParams";
import { ltiResourceLinkParamsSchema } from "$server/validators/ltiResourceLinkParams";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { findLtiResourceLink } from "$server/utils/ltiResourceLink";

export const showSchema: FastifySchema = {
  summary: "LTI Resource Linkの取得",
  description: outdent`
    LTI Resource Linkの詳細を取得します。
    教員または管理者でなければなりません。`,
  params: ltiResourceLinkParamsSchema,
  response: {
    200: ltiResourceLinkSchema,
    404: {},
  },
};

export const showHooks = {
  auth: [authUser, authInstructor],
};

export async function show({
  params,
  session,
}: FastifyRequest<{ Params: LtiResourceLinkParams }>) {
  const link = await findLtiResourceLink({
    consumerId: params.lti_consumer_id,
    id: params.lti_resource_link_id,
  });

  session.ltiResourceLink = link;

  return {
    status: link == null ? 404 : 200,
    body: link,
  };
}
