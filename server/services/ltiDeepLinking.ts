import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import bookExists from "$server/utils/book/bookExists";
import { FRONTEND_ORIGIN } from "$server/utils/env";
import { createPrivateKey } from "$server/utils/ltiv1p3/jwk";
import findClient from "$server/utils/ltiv1p3/findClient";
import { getDlResponseJwt } from "$server/utils/ltiv1p3/deepLinking";

const Query = {
  type: "object",
  required: ["book_id"],
  properties: {
    book_id: {
      type: "integer",
    },
  },
} as const satisfies JSONSchema;

export type Query = FromSchema<typeof Query>;

export const method = {
  get: {
    summary: "LTI Deep Linking Response の取得",
    description: outdent`
      LTI Deep Linking ResponseのためのJWTを取得するためのエンドポイントです。
      教員または管理者でなければなりません。`,
    querystring: Query,
    response: {
      200: {
        type: "object",
        properties: {
          jwt: { type: "string" },
        },
      },
      400: {},
      401: {},
      403: {},
      404: {},
    },
  } as const satisfies FastifySchema,
};

export const hooks = {
  get: {
    auth: [authUser, authInstructor],
  },
};

export async function index(req: FastifyRequest<{ Querystring: Query }>) {
  const url = req.session.ltiDlSettings?.deep_link_return_url;
  const client = await findClient(req.session.oauthClient.id);

  if (!url) return { status: 401 };
  if (!client) return { status: 401 };

  const privateKey = await createPrivateKey();

  if (!privateKey) return { status: 403 };

  const found = await bookExists(req.query.book_id);

  if (!found) return { status: 404 };

  const jwt = await getDlResponseJwt(client, {
    privateKey,
    deploymentId: req.session.ltiDeploymentId,
    data: req.session.ltiDlSettings?.data,
    contentItems: [
      {
        type: "ltiResourceLink",
        url: `${
          FRONTEND_ORIGIN || `${req.protocol}://${req.hostname}`
        }/book?bookId=${found.id}`,
      },
    ],
  });

  return {
    status: jwt ? 200 : 400,
    body: jwt ? { jwt } : null,
  };
}
