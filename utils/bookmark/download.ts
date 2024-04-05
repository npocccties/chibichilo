import type { BookmarkStats } from "$server/models/bookmarkStats";
import { api } from "$utils/api";
import * as csv from "$utils/csv";
import getLocaleEntries from "./getLocaleEntries";

/**
 * ブラウザーでブックマークの統計情報のデータをCSVファイル(BOM付きUTF-8)に変換しエクスポート
 * @param filename ダウンロードするファイル名
 * @param currentLtiContextOnly true: このコースでの活動, それ以外: すべて
 */
async function download(filename: string, currentLtiContextOnly: boolean) {
  const res = await api.apiV2BookmarkStatsGet({ currentLtiContextOnly });
  const data = res.stats ?? [];
  if (data.length === 0) return;
  const decoratedData = (data as BookmarkStats).map((bs) =>
    getLocaleEntries(bs)
  );
  csv.download(decoratedData, filename);
}

export default download;
