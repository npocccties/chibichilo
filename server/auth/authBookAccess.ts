import type { FastifyRequest } from "fastify";
import { isInstructor } from "$utils/session";
import checkLtiResourceLink from "$server/utils/book/checkLtiResourceLink";
import createError from "http-errors";

function extractBookId(req: FastifyRequest): number | null {
  const params = req.params as Record<string, string | undefined>;
  const body = req.body as Record<string, unknown> | undefined;
  const query = req.query as Record<string, string | undefined>;
  const candidates = [params?.book_id, body?.bookId, query?.book_id];

  const isPresent = (c: unknown): c is string | number => c != null && c !== "";
  const isValidId = (n: number) => !Number.isNaN(n) && n > 0;
  return (
    candidates.map((c) => (isPresent(c) ? Number(c) : NaN)).find(isValidId) ??
    null
  );
}

/**
 * Authorization hook to check if the user has access to the book.
 * * NOTE:
 * Ideally, this should be executed as a pure Fastify `preHandler` to return a 403 Forbidden.
 * However, to avoid side effects by modifying the shared infrastructure (server/utils/makeHooks.ts),
 * this is currently implemented as an `auth` hook (using @fastify/auth).
 * * While @fastify/auth defaults to 401 Unauthorized upon failure, we explicitly throw
 * a `createError(403)` to override this behavior. This ensures proper 403 responses
 * and maintains consistency with the OpenAPI schema, avoiding the generation of `InlineResponse403`.
 */
async function authBookAccess(req: FastifyRequest) {
  const session = req.session;
  if (!session || !session.user) {
    throw new Error("user authorization required");
  }
  const bookId = extractBookId(req);
  if (!bookId || isNaN(bookId)) {
    throw createError(400, "Bad Request: bookId is missing or invalid");
  }
  const query = req.query as {
    lti_consumer_id?: string;
    lti_context_id?: string;
  };
  const isAuthorized =
    isInstructor(session) ||
    (await checkLtiResourceLink(bookId, session, query));

  if (!isAuthorized) {
    throw createError(403, "Forbidden: You do not have access to this book");
  }
}

export default authBookAccess;
