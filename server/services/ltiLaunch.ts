import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authLtiLaunch from "$server/auth/authLtiLaunch";
import type { LtiLaunchBody } from "$server/validators/ltiLaunchBody";
import { ltiLaunchBodySchema } from "$server/validators/ltiLaunchBody";
import init from "./init";

export type Props = LtiLaunchBody;

export const method = {
  post: {
    summary: "LTI v1.1 起動エンドポイント (非推奨)",
    deprecated: true,
    description: outdent`
      LTI v1.1 ツールとして起動するためのエンドポイントです。
      このエンドポイントをLMSのLTIツールのURLに指定して利用します。
      成功時 ${init.frontendUrl} にリダイレクトします。`,
    consumes: ["application/x-www-form-urlencoded"],
    body: ltiLaunchBodySchema,
    response: init.response,
  },
};

export const hooks = {
  post: { auth: [authLtiLaunch] },
};

export async function post(req: FastifyRequest<{ Body: Props }>) {
  return await init(req);
}
