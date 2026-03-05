import prisma from "$server/utils/prisma";
import type { SessionSchema } from "$server/models/session";
import type { ActivityQuery } from "$server/validators/activityQuery";
import type { GradeTarget } from "$server/models/gradeTarget";
import { NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY } from "$utils/env";

export async function getGradeTargets(
  bookId: number,
  userId: number,
  session: SessionSchema,
  query: ActivityQuery
): Promise<GradeTarget[]> {
  // If not explicitly specified in the query,
  // the resource link information in the session takes precedence.
  if (!query.lti_consumer_id && !query.lti_context_id) {
    const lineItem = session.ltiAgsEndpoint?.lineitem;
    if (lineItem) {
      return [
        {
          consumerId: session.oauthClient.id,
          contextId: session.ltiContext.id,
          lineItem: lineItem,
          label: "Session Context",
        },
      ];
    }
    return [];
  }
  // Identifying the base context. (the context of the current request)
  const baseContext = {
    consumerId: query.lti_consumer_id ?? session.oauthClient.id,
    contextId: query.lti_context_id ?? session.ltiContext.id,
  };
  const targetContexts = [baseContext];
  // Build a list of contexts (courses) to explore.
  const ltiContextOnly =
    query.current_lti_context_only ?? NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY;
  if (!ltiContextOnly) {
    // In Broadcast mode: Get all courses from LtiMember and merge.
    const userWithMemberships = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        ltiMembers: {
          select: { consumerId: true, contextId: true },
        },
      },
    });
    // Merge without duplicates. (in case baseContext is not included in memberships)
    const memberships = userWithMemberships?.ltiMembers ?? [];
    for (const m of memberships) {
      if (
        !targetContexts.some(
          (c) => c.consumerId === m.consumerId && c.contextId === m.contextId
        )
      ) {
        targetContexts.push(m);
      }
    }
  }
  // Get all resource links where this book is located in the specified contexts.
  const linkedResources = await prisma.ltiResourceLink.findMany({
    where: {
      bookId,
      lineItem: { not: "" },
      OR: targetContexts.map((c) => ({
        consumerId: c.consumerId,
        contextId: c.contextId,
      })),
    },
    select: { consumerId: true, contextId: true, lineItem: true },
  });
  // Building a target list. (de-duplication)
  const targets: GradeTarget[] = [];
  const existingUrls = new Set<string>();
  for (const resource of linkedResources) {
    if (!existingUrls.has(resource.lineItem)) {
      targets.push({
        consumerId: resource.consumerId,
        contextId: resource.contextId,
        lineItem: resource.lineItem,
        label: ltiContextOnly ? "Target Context" : "Broadcast",
      });
      existingUrls.add(resource.lineItem);
    }
  }
  return targets;
}
