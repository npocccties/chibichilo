import { flatten } from "flat";
import type { BookmarkStats } from "$server/models/bookmarkStats";

export const keyOrder = ["topicId", "tagLabel", "totalCount"] as const;

export const label = {
  topicId: "トピックID",
  tagLabel: "タグ",
  totalCount: "合計",
} satisfies { [key in (typeof keyOrder)[number]]: string };

/**
 * ブックマークの統計情報をローカライズしたキーバリューに変換
 * @param data ブックマークの統計情報
 */
export function getLocaleEntries(
  bookmarkStats: BookmarkStats[number]
): Record<string, string | number | undefined> {
  const bs: Record<
    (typeof keyOrder)[number],
    string | number | Date | undefined
  > = flatten(bookmarkStats);

  const data = keyOrder
    .map((key) => [label[key], bs[key] as string | number | undefined])
    .filter(([, value]) => value !== undefined);

  return Object.fromEntries(data);
}

export default getLocaleEntries;
