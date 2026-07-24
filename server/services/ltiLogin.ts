import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import type { LtiVersionSchema } from "$server/models/ltiVersion";
import type { OauthClientSchema } from "$server/models/oauthClient";
import { LtiLoginProps } from "$server/validators/ltiLoginProps";
import createAccount from "$server/utils/ltiv1p3/createAccount";

export type Props = LtiLoginProps;

const baseSchema = {
  summary: "LTI v1.3 ログイン初期化エンドポイント",
  description: outdent`
    LTIツールとして起動するためのエンドポイントです。
    このエンドポイントをLMSのLTIツールのログイン初期化エンドポイントに指定して利用します。
    Authorizationエンドポイントにリダイレクトします。`,
  response: {
    302: {},
  },
};

export const method = {
  get: {
    ...baseSchema,
    consumes: [],
    querystring: LtiLoginProps,
  },
  post: {
    ...baseSchema,
    consumes: ["application/x-www-form-urlencoded"],
    body: LtiLoginProps,
  },
};

async function baseAction(req: FastifyRequest, props: Props) {
  const callbackUrl = `${req.protocol}://${req.hostname}/api/v2/lti/callback`;
  const { state, nonce, authorizationUrl } = await createAccount(
    props,
    callbackUrl
  );
  const oauthClient: OauthClientSchema = { id: props.client_id, nonce };
  const ltiVersion: LtiVersionSchema = "1.3.0";

  Object.assign(req.session, { state, oauthClient, ltiVersion });

  return {
    status: 302,
    headers: { location: authorizationUrl },
  };
}

export async function get(req: FastifyRequest<{ Querystring: Props }>) {
  return await baseAction(req, req.query);
}

export async function post(req: FastifyRequest<{ Body: Props }>) {
  return await baseAction(req, req.body);
}
