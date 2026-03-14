import { isInstructor } from "$server/utils/session";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { SessionSchema } from "$server/models/session";
import prisma from "$server/utils/prisma";

/** 受講者の取得 */
async function findLtiMembersWithTimeRangeCount(
  rewatchThreshold: number,
  session: SessionSchema,
  {
    consumerId,
    contextId,
  }: Pick<LtiResourceLinkSchema, "consumerId" | "contextId">,
  currentLtiContextOnly?: boolean,
  administrator?: boolean
) {
  // NOTE: 表示可能な範囲
  // 教員・TAの場合…すべて表示
  // それ以外… 共有されている範囲または著者に含まれる範
  const displayable = isInstructor(session)
    ? undefined
    : [{ shared: true }, { authors: { some: { userId: session.user.id } } }];
  const topicActivityScope = {
    topic: {
      topicSection: {
        some: {
          section: {
            book: {
              ltiResourceLinks: { some: { consumerId, contextId } },
              // NOTE: 表示可能な範囲 … 共有されている範囲または著者に含まれる範囲
              OR: displayable,
            },
          },
        },
      },
    },
  };

  const activityScope =
    currentLtiContextOnly ?? true
      ? {
          ltiConsumerId: consumerId,
          ltiContextId: contextId,
          ...topicActivityScope,
          ...{ bookId: { not: 0 } },
        }
      : {
          ltiConsumerId: "",
          ltiContextId: "",
          ...topicActivityScope,
          ...{ bookId: 0 },
        };

  const whereClause = administrator
    ? {
        ltiMembersAdmin: { some: { consumerId, contextId } },
      }
    : {
        ltiMembers: { some: { consumerId, contextId } },
      };

  const learners = await prisma.user.findMany({
    select: {
      activities: {
        select: {
          id: true,
          bookId: true,
          totalTimeMs: true,
          topic: {
            select: {
              id: true,
              timeRequired: true,
            },
          },
          learnerId: true,
          _count: {
            select: {
              timeRangeCounts: {
                where: {
                  count: {
                    gte: rewatchThreshold,
                  },
                },
              },
            },
          },
        },
        where: {
          ...activityScope,
        },
      },
    },
    where: {
      ...whereClause,
    },
  });

  return learners;
}

async function findAllActivityWithTimeRangeCount(
  rewatchThreshold: number,
  session: SessionSchema,
  currentLtiContextOnly: boolean,
  administrator?: boolean
) {
  const consumerId = session.oauthClient.id;
  const contextId = session.ltiContext.id;

  const ltiMembers = await findLtiMembersWithTimeRangeCount(
    rewatchThreshold,
    session,
    { consumerId, contextId },
    currentLtiContextOnly,
    administrator
  );

  return ltiMembers.flatMap(({ activities }) => activities);
}

export default findAllActivityWithTimeRangeCount;
