import type { FastifySchema, FastifyRequest } from "fastify";
import outdent from "$utils/outdent";
import { bookSchema } from "$server/models/book";
import type { BookParams } from "$server/validators/bookParams";
import { bookParamsSchema } from "$server/validators/bookParams";
import authUser from "$server/auth/authUser";
import findBook from "$server/utils/book/findBook";
import { isInstructor } from "$utils/session";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import { getDisplayableBook } from "$utils/displayableBook";
import type { ContentAuthors } from "$server/models/content";
import type { FastifySessionObject } from "@fastify/session";

export const showSchema: FastifySchema = {
  summary: "ブックの取得",
  description: outdent`
    ブックの詳細を取得します。
    教員または管理者いずれでもない場合、LTIリソースとしてリンクされているブックでなければなりません。`,
  params: bookParamsSchema,
  querystring: {
    type: "object",
    properties: {
      lti_consumer_id: { type: "string" },
      lti_context_id: { type: "string" },
    },
  },
  response: {
    200: bookSchema,
    403: {},
    404: {},
  },
};

export const showHooks = {
  auth: [authUser],
};

export async function show({
  session,
  params,
  query,
}: FastifyRequest<{
  Params: BookParams;
  Querystring: {
    lti_consumer_id?: string;
    lti_context_id?: string;
  };
}>) {
  const { book_id: bookId } = params;
  if (
    !isInstructor(session) &&
    !(await checkLtiResourceLink(bookId, session, query))
  ) {
    return { status: 403 };
  }
  const rawBook = await findBook(bookId, session.user.id);
  if (rawBook == null) {
    return { status: 404, body: undefined };
  }
  const currentLtiContext = {
    ltiConsumerId:
      query?.lti_consumer_id ?? session.ltiResourceLink?.consumerId,
    ltiContextId: query?.lti_context_id ?? session.ltiResourceLink?.contextId,
  };

  const effectiveLtiResourceLink = session.ltiResourceLink
    ? { ...session.ltiResourceLink, bookId: bookId }
    : undefined;

  const book = getDisplayableBook(
    rawBook,
    (content) => isContentEditable(session, content),
    effectiveLtiResourceLink,
    undefined,
    isInstructor(session),
    currentLtiContext
  );
  if (book == null) {
    return { status: 403 };
  }
  return {
    status: 200,
    body: book,
  };
}
function isContentEditable(
  session: FastifySessionObject,
  content: ContentAuthors
): boolean {
  if (isInstructor(session)) {
    return true;
  }
  return (
    content.authors?.some((author) => author.id === session.user?.id) ?? false
  );
}
