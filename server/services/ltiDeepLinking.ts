import type { FastifyRequest, FastifySchema } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import findBook from "$server/utils/book/findBook";
import { createPrivateKey } from "$server/utils/ltiv1p3/jwk";
import findClient from "$server/utils/ltiv1p3/findClient";
import {
  createLtiResourceLinkContentItem,
  getDlResponseJwt,
} from "$server/utils/ltiv1p3/deepLinking";
import { getDisplayableBook } from "$utils/displayableBook";
import { FRONTEND_ORIGIN } from "$server/utils/env";

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

  const book = await findBook(req.query.book_id, req.session.user.id);

  if (!book) return { status: 404 };

  const topics =
    getDisplayableBook(
      book,
      (content) =>
        content.authors.some((author) => author.id === req.session.user.id),
      { bookId: book.id, creatorId: req.session.user.id }
    )?.sections.flatMap((section) => section.topics.flat()) ?? [];

  const contentItems = [
    createLtiResourceLinkContentItem({
      url: `${
        FRONTEND_ORIGIN || `${req.protocol}://${req.hostname}`
      }/book?bookId=${book.id}`,
      scoreMaximum: topics.length,
      title: req.session.ltiDlSettings?.title,
      text: req.session.ltiDlSettings?.text,
    }),
  ];

  const jwt = await getDlResponseJwt(client, {
    privateKey,
    deploymentId: req.session.ltiDeploymentId,
    data: req.session.ltiDlSettings?.data,
    contentItems,
  });

  return {
    status: jwt ? 200 : 400,
    body: jwt ? { jwt } : null,
  };
}
