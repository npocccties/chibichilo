import type { FastifyRequest, FastifySchema } from "fastify";
import type { FromSchema, JSONSchema } from "json-schema-to-ts";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { BookmarkStats } from "$server/models/bookmarkStats";
import findBookmarkStats from "$server/utils/bookmark/findBookmarkStats";

export const method = "GET" as const;
export const url = "/bookmark_stats";

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

const Query = {
  type: "object",
  properties: {
    /** 現在の LTI Context ごとでの学習状況を取得するか否か (true: LTI Context ごと, それ以外: すべて) */
    current_lti_context_only: { type: "boolean" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

type Query = FromSchema<typeof Query>;

export const schema = {
  description: `\
受講者のブックマークの統計情報を取得します。
教員または管理者でなければなりません。`,
  querystring: Query,
  response: {
    200: {
      description: "成功時",
      type: "object",
      properties: {
        stats: BookmarkStats,
      },
    },
  },
} as const satisfies FastifySchema;

export async function handler(req: FastifyRequest<{ Querystring: Query }>) {
  const ltiContextOnly = Boolean(req.query.current_lti_context_only);
  const ltiContext = {
    id: req.session.ltiContext.id,
    clientId: req.session.oauthClient.id,
  };

  const stats = await findBookmarkStats({
    ltiContextOnly,
    ltiContext,
  });

  return { stats };
}
