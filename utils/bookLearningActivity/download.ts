import getLocaleEntries from "./getLocaleEntries";
import type { BookActivitySchema } from "$server/models/bookActivity";
import type { SessionSchema } from "$server/models/session";
import * as csv from "$utils/csv";

/**
 * ブラウザーで視聴分析データをCSVファイル(BOM付きUTF-8)に変換しエクスポート
 * @param data 視聴分析データ
 * @param filename ダウンロードするファイル名
 * @param session 教員のセッション
 */
function download(
  data: BookActivitySchema[],
  filename: string,
  session: SessionSchema
) {
  if (data.length === 0) return;
  const decoratedData = data.map((a) => getLocaleEntries(a, session));
  csv.download(decoratedData, filename);
}

export default download;
