import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import authUser from "$server/auth/authUser";
import authInstructor from "$server/auth/authInstructor";
import { isInstructor } from "$server/utils/session";
import { ActivityTimeRangeCountProps } from "$server/validators/activityTimeRangeCount";
import { ActivityTimeRangeCountParams } from "$server/validators/activityTimeRangeCountParams";
import findActivityTimeRangeCount from "$server/utils/activity/findActivityTimeRangeCount";

export type Params = ActivityTimeRangeCountParams;

export const method = {
  get: {
    summary: "受講者の視聴行動回数の取得",
    description: outdent`
      受講者の視聴行動回数を取得します。
      教員または管理者でなければなりません。`,
    params: ActivityTimeRangeCountParams,
    response: {
      200: {
        type: "object",
        properties: {
          activityId: { type: "integer" },
          activityTimeRangeCounts: {
            type: "array",
            items: ActivityTimeRangeCountProps,
          },
        },
        required: ["activityTimeRangeCounts"],
      },
    },
  },
} as const;

export const hooks = {
  get: { auth: [authUser, authInstructor] },
};

export async function show({
  session,
  params,
}: FastifyRequest<{ Params: ActivityTimeRangeCountParams }>) {
  const { activityId } = params;

  if (!isInstructor(session)) {
    return { status: 403 };
  }

  const activityTimeRangeCounts = await findActivityTimeRangeCount(activityId);

  return {
    status: activityTimeRangeCounts == null ? 404 : 200,
    body: {
      activityId: activityId,
      activityTimeRangeCounts: activityTimeRangeCounts,
    },
  };
}
