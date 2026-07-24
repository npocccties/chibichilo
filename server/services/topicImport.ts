import type { FastifySchema } from "fastify";
import { outdent } from "outdent";
import {
  BooksImportParams,
  booksImportResultSchema,
} from "$server/models/booksImportParams";
import type { SessionSchema } from "$server/models/session";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { importTopicUtil } from "$server/utils/book/importBooksUtil";
import type { TopicParams } from "$server/validators/topicParams";
import { topicParamsSchema } from "$server/validators/topicParams";
import topicExists from "$server/utils/topic/topicExists";
import { isUsersOrAdmin } from "$server/utils/session";

export type Params = BooksImportParams;

export const importSchema: FastifySchema = {
  summary: "トピックの上書きインポート",
  description: outdent`
    トピックを上書きインポートします。
    教員または管理者でなければなりません。
    教員は自身の著作のトピックでなければなりません。`,
  params: topicParamsSchema,
  body: BooksImportParams,
  response: {
    201: booksImportResultSchema,
    400: booksImportResultSchema,
    403: {},
    404: {},
  },
};

export const importHooks = {
  post: { auth: [authUser, authInstructor] },
};

export async function importTopic({
  session,
  params,
  body,
}: {
  session: SessionSchema;
  params: TopicParams;
  body: BooksImportParams;
}) {
  const found = await topicExists(params.topic_id);

  if (!found) return { status: 404 };
  if (!isUsersOrAdmin(session, found.authors)) return { status: 403 };

  const result = await importTopicUtil(session.user, body, params.topic_id);
  return {
    status: result.errors && result.errors.length ? 400 : 201,
    body: result,
  };
}
