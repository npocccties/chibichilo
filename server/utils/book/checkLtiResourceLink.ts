import prisma from "$server/utils/prisma";
import type { FastifySessionObject } from "@fastify/session";

/**
 * Checks if the current user has access to the specified book through LTI context.
 * The priority of the check is:
 * 1. Explicit query parameters
 * 2. Current session context
 * 3. User's memberships
 */
async function checkLtiResourceLink(
  bookId: number,
  session: FastifySessionObject,
  query: { lti_context_id?: string; lti_consumer_id?: string }
): Promise<boolean> {
  // 1. If lti_context_id is provided in the query,
  // strictly verify the resource link in that context.
  if (query.lti_context_id) {
    const validLink = await prisma.ltiResourceLink.findFirst({
      where: {
        bookId: bookId,
        consumerId: query.lti_consumer_id ?? session.oauthClient.id,
        contextId: query.lti_context_id,
      },
    });
    return validLink !== null;
  }
  // 2. Check if the book matches the resource link in the current session.
  if (session.ltiResourceLink?.bookId === bookId) {
    return true;
  }
  // 3. Check if the user is a member of any context where the book is linked.
  // This allows access from bookmarks or other entry points without explicit context query parameters.
  if (session.user?.id) {
    const memberAccess = await prisma.ltiResourceLink.findFirst({
      where: {
        bookId: bookId,
        context: {
          members: {
            some: { userId: session.user.ltiUserId },
          },
        },
      },
    });
    if (memberAccess) return true;
    // 4. Fallback: Check if the user has any existing activity records for this book.
    // This allows access if the user has previously interacted with the book via LTI,
    // even if explicit context query parameters are missing.
    const hasActivity = await prisma.activity.findFirst({
      where: {
        learnerId: session.user.id,
        bookId: bookId,
      },
    });
    if (hasActivity) return true;
  }
  return false;
}

export default checkLtiResourceLink;
