import { flatten } from "flat";
import { fromS, fromMs } from "hh-mm-ss";
import learningStatusLabel from "$utils/learningStatusLabel";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import type { ActivityRewatchRateProps } from "$server/validators/activityRewatchRate";
import { round } from "$server/utils/math";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

export const keyOrder = [
  "learner.ltiConsumerId",
  "ltiContext.id",
  "ltiContext.title",
  "learner.ltiUserId",
  "learner.id",
  "learner.name",
  "learner.email",
  "book.id",
  "book.name",
  "topic.id",
  "topic.name",
  "topic.timeRequired",
  "totalTimeMs",
  "status",
  "completionRate",
  "rewatchRate",
  "createdAt",
  "updatedAt",
] as const;

export const label: Readonly<{ [key in (typeof keyOrder)[number]]: string }> = {
  "learner.ltiConsumerId": "LMSクライアントID",
  "ltiContext.id": "LMSコースID",
  "ltiContext.title": "LMSコース名",
  "learner.ltiUserId": "LMSユーザID",
  "learner.id": "ユーザID",
  "learner.name": "ユーザ名",
  "learner.email": "メールアドレス",
  "book.id": "ブックID",
  "book.name": "ブック名",
  "topic.id": "トピックID",
  "topic.name": "トピック名",
  "topic.timeRequired": "動画の長さ",
  totalTimeMs: "ユニーク視聴時間",
  status: "学習状況",
  completionRate: "学習完了率",
  rewatchRate: "繰返視聴割合",
  createdAt: "初回アクセス",
  updatedAt: "最終アクセス",
};

/**
 * 単一の学習分析データをローカライズしたキーバリューに変換
 * @param activity 単一の学習分析データ
 * @param session 教員のセッション
 */
export function getLocaleEntries(
  activity: BookActivitySchema,
  rewatchRate: ActivityRewatchRateProps | undefined,
  session: SessionSchema
): Record<string, string | number | undefined> {
  const flattenActivity: Record<
    (typeof keyOrder)[number],
    string | number | Date | undefined
  > = flatten({
    ...activity,
    session,
  });

  if (!NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD) {
    rewatchRate = undefined;
  }

  const a = {
    ...flattenActivity,
    "topic.timeRequired": fromS(
      activity.topic.timeRequired ?? 0,
      "hh:mm:ss.sss"
    ),
    totalTimeMs: fromMs(activity.totalTimeMs ?? 0, "hh:mm:ss.sss"),
    completionRate: round(
      (activity.totalTimeMs ?? 0) / (activity.topic.timeRequired * 1000),
      -3 // 小数点第4位で四捨五入
    ),
    status: learningStatusLabel[activity.status],
    rewatchRate: NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
      ? rewatchRate?.rewatchRate ?? 0
      : undefined,
    createdAt: activity.createdAt?.toLocaleString(),
    updatedAt: activity.updatedAt?.toLocaleString(),
  };

  const data = keyOrder
    .map((key) => [label[key], a[key] as string | number | undefined])
    .filter(([, value]) => value !== undefined);

  return Object.fromEntries(data);
}

export default getLocaleEntries;
