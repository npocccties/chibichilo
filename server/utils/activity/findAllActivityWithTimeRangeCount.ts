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

  // Step 1: activities を先に絞り込む（_count サブクエリなし）
  // _count に where 句を持つ Prisma クエリは activities_time_range_counts 全件スキャンになるため分離
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

  const activities = learners.flatMap(({ activities }) => activities);

  // Step 2: 絞り込んだ activity_id に対してのみ count を取得（相関クエリ化）
  // activities が空でも Prisma は `in: []` を正しく処理する（0件返却）
  const activityIds = activities.map((a) => a.id);
  const countRows = await prisma.activityTimeRangeCount.groupBy({
    by: ["activityId"],
    where: {
      activityId: { in: activityIds },
      count: { gte: rewatchThreshold },
    },
    _count: { activityId: true },
  });
  const countMap = new Map(
    countRows.map((r) => [r.activityId, r._count.activityId])
  );

  // Step 3: マージして元の形式に戻す
  return learners.map((learner) => ({
    ...learner,
    activities: learner.activities.map((activity) => ({
      ...activity,
      _count: {
        timeRangeCounts: countMap.get(activity.id) ?? 0,
      },
    })),
  }));
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
