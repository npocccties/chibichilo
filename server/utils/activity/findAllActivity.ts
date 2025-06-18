import type { SessionSchema } from "$server/models/session";
import type { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";
import type { LearnerSchema } from "$server/models/learner";
import type { CourseBookSchema } from "$server/models/courseBook";
import type { BookActivitySchema } from "$server/models/bookActivity";
import prisma from "$server/utils/prisma";
import { bookIncludingTopicsArg } from "$server/utils/book/bookToBookSchema";
import { toSchema } from "./bookWithActivity";
import { isInstructor } from "$server/utils/session";
import { isAdministrator } from "$utils/session";
import type { LtiContextSchema } from "$server/models/ltiContext";

/** 受講者の取得 */
async function findLtiMembers(
  session: SessionSchema,
  {
    consumerId,
    contextId,
  }: Pick<LtiResourceLinkSchema, "consumerId" | "contextId">,
  currentLtiContextOnly?: boolean
) {
  // NOTE: 表示可能な範囲
  // 教員・TAの場合…すべて表示
  // それ以外… 共有されている範囲または著者に含まれる範
  const displayable = isInstructor(session)
    ? undefined
    : [
        { release: { shared: true } },
        { authors: { some: { userId: session.user.id } } },
      ];
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
        }
      : { ltiConsumerId: "", ltiContextId: "", ...topicActivityScope };

  const learners = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      ltiUserId: true,
      name: true,
      email: true,
      activities: {
        where: {
          ...activityScope,
        },
        include: {
          ltiContext: { select: { id: true, title: true, label: true } },
          learner: {
            select: {
              id: true,
              name: true,
              email: true,
              ltiUserId: true,
              ltiConsumerId: true,
            },
          },
          topic: {
            select: { id: true, name: true, timeRequired: true },
          },
        },
      },
    },
    where: {
      ...{ ltiMembers: { some: { consumerId, contextId } } },
    },
  });

  return learners;
}

/**
 * LTI Context に紐づくブックに含まれる表示可能なトピックの学習活動の取得
 * @param session セッション
 * @param currentLtiContextOnly 現在の LTI Context ごとでの学習状況を取得するか否か (true: LTI Context ごと, それ以外: すべて)
 * @param ltiConsumerId 学習活動のConsumer ID
 * @param ltiContextId 学習活動のContext ID
 */
async function findAllActivity(
  session: SessionSchema,
  currentLtiContextOnly?: boolean | undefined,
  ltiConsumerId?: string | undefined,
  ltiContextId?: string | undefined
): Promise<{
  learners: Array<LearnerSchema>;
  courseBooks: Array<CourseBookSchema>;
  bookActivities: Array<BookActivitySchema>;
}> {
  const isDownloadPage =
    isAdministrator(session) && currentLtiContextOnly === undefined;
  const consumerId = isDownloadPage
    ? ltiConsumerId ?? ""
    : session.oauthClient.id;
  const contextId = isDownloadPage ? ltiContextId ?? "" : session.ltiContext.id;
  const ltiMembers = await findLtiMembers(
    session,
    { consumerId, contextId },
    currentLtiContextOnly
  );

  const ltiResourceLinks = await prisma.ltiResourceLink.findMany({
    where: { consumerId, contextId },
    orderBy: { title: "asc" },
    select: { book: bookIncludingTopicsArg },
  });
  const books = ltiResourceLinks.map(({ book }) => book);

  const activities = ltiMembers.flatMap(({ activities }) => activities);

  const ltiContext = (await prisma.ltiContext.findUnique({
    where: {
      consumerId_id:
        currentLtiContextOnly || isDownloadPage
          ? { consumerId, id: contextId }
          : { consumerId: "", id: "" },
    },
  })) as LtiContextSchema;

  const { courseBooks, bookActivities } = toSchema({
    session,
    books,
    activities,
    learners: ltiMembers,
    ltiConsumerId: consumerId,
    ltiContext,
    isDownloadPage,
  });

  return {
    learners: isDownloadPage ? [] : ltiMembers,
    courseBooks: isDownloadPage ? [] : courseBooks,
    bookActivities,
  };
}

export default findAllActivity;
