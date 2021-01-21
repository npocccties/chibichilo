import { outdent } from "outdent";
import Method from "$server/types/method";
import {
  LtiResourceLinkProps,
  ltiResourceLinkPropsSchema,
  ltiResourceLinkSchema,
} from "$server/models/ltiResourceLink";
import {
  LtiResourceLinkParams,
  ltiResourceLinkParamsSchema,
} from "$server/validators/ltiResourceLinkParams";
import {
  findLtiResourceLink,
  upsertLtiResourceLink,
  destroyLtiResourceLink,
} from "$server/utils/ltiResourceLink";
import { authInstructorHandler } from "$server/utils/authInstructorHandler";

export type Params = LtiResourceLinkParams;
export type Props = LtiResourceLinkProps;

export const method: Method = {
  get: {
    summary: "LTI Resource Linkの取得",
    description: outdent`
      LTI Resource Linkの詳細を取得します。
      教員または管理者でなければなりません。`,
    params: ltiResourceLinkParamsSchema,
    response: {
      200: ltiResourceLinkSchema,
      404: {},
    },
  },
  put: {
    summary: "LTI Resource Linkの更新",
    description: outdent`
      LTI Resource Linkを更新します。
      教員または管理者でなければなりません。`,
    params: ltiResourceLinkParamsSchema,
    body: ltiResourceLinkPropsSchema,
    response: {
      201: ltiResourceLinkSchema,
      400: {},
    },
  },
  delete: {
    summary: "LTI Resource Linkの削除",
    description: outdent`
      LTI Resource Linkを削除します。
      教員または管理者でなければなりません。`,
    params: ltiResourceLinkParamsSchema,
    response: {
      204: {},
    },
  },
};

export const preHandler = authInstructorHandler;

export async function show({ params }: { params: LtiResourceLinkParams }) {
  const link = await findLtiResourceLink(params.lti_resource_link_id);

  return {
    status: link == null ? 404 : 200,
    body: link,
  };
}

export async function update({
  body,
  params,
}: {
  body: Props;
  params: LtiResourceLinkParams;
}) {
  const link = await upsertLtiResourceLink({
    ...body,
    id: params.lti_resource_link_id,
  });

  return {
    status: link == null ? 400 : 201,
    body: link,
  };
}

export async function destroy({ params }: { params: LtiResourceLinkParams }) {
  await destroyLtiResourceLink(params.lti_resource_link_id);

  return {
    status: 204,
  };
}
