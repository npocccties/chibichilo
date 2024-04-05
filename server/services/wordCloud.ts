import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { WordCloudSchema } from "$server/models/wordCloud";
import { WordCloudParams } from "$server/validators/wordCloudParams";
import findWordCloud from "$server/utils/wordCloud/findWordCloud";

export type Params = WordCloudParams;

export const method = {
  get: {
    summary: "ワードクラウド",
    description: outdent`
      ワードクラウドに関するデータを取得します。
      教員または管理者でなければなりません。`,
    params: WordCloudParams,
    response: {
      200: WordCloudSchema,
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({
  session,
  params,
}: FastifyRequest<{ Params: WordCloudParams }>) {
  const { bookId } = params;
  const wordCloud = await findWordCloud(
    bookId,
    session.user.id,
    session.ltiContext.id,
    session.oauthClient.id
  );

  return {
    status: 200,
    body: wordCloud,
  };
}
