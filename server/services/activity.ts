import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { LearnerSchema } from "$server/models/learner";
import { CourseBookSchema } from "$server/models/courseBook";
import { BookActivitySchema } from "$server/models/bookActivity";
import { ActivityQuery } from "$server/validators/activityQuery";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import findAllActivity from "$server/utils/activity/findAllActivity";

export type Query = ActivityQuery;

export const method = {
  get: {
    summary: "受講者の学習活動一覧",
    description: outdent`
      受講者の学習活動の一覧を取得します。
      受講者以外の学習活動は含みません。
      現在のセッションの LTI Context に紐づくブックに含まれる表示可能なトピックの学習活動を得ます。
      教員または管理者でなければなりません。
      自身以外の作成した共有されていないブック・トピックの学習活動は含みません。`,
    querystring: ActivityQuery,
    response: {
      200: {
        description: "成功時",
        type: "object",
        properties: {
          learners: { type: "array", items: LearnerSchema },
          courseBooks: { type: "array", items: CourseBookSchema },
          bookActivities: { type: "array", items: BookActivitySchema },
        },
        required: ["learners", "courseBooks", "bookActivities"],
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function index({
  session,
  query,
}: FastifyRequest<{ Querystring: Query }>) {
  const body = await findAllActivity(
    session,
    query.current_lti_context_only,
    query.lti_consumer_id,
    query.lti_context_id
  );

  return { status: 200, body };
}
