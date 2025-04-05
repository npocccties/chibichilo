import getLocaleEntries from "./getLocaleEntries";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import * as csv from "$utils/csv";
import fetchRewatchRate from "$utils/fetchRewatchRate";

import { NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD } from "$utils/env";

/**
 * ブラウザーで視聴分析データをCSVファイル(BOM付きUTF-8)に変換しエクスポート
 * @param data 視聴分析データ
 * @param filename ダウンロードするファイル名
 * @param session 教員のセッション
 */
async function download(
  data: BookActivitySchema[],
  filename: string,
  session: SessionSchema,
  currentLtiContextOnly: boolean
) {
  if (data.length === 0) return;

  const rewatchRate = NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD
    ? await fetchRewatchRate({ currentLtiContextOnly })
    : undefined;

  const decoratedData = data
    .filter(
      (obj, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t.ltiContext &&
            obj.ltiContext &&
            t.ltiContext.id === obj.ltiContext.id &&
            t.learner.id === obj.learner.id &&
            t.book.id === obj.book.id &&
            t.topic.id === obj.topic.id
        )
    )
    .map((a) =>
      getLocaleEntries(
        a,
        rewatchRate?.activityRewatchRate.find(
          (r) => r.learnerId === a.learner.id && r.topicId === a.topic.id
        ) ?? undefined,
        session
      )
    );
  csv.download(decoratedData, filename);
}

export default download;
