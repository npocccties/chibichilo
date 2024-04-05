import type { BookmarkStats } from "$server/models/bookmarkStats";
import prisma from "$server/utils/prisma";
import { bookIncludingTopicsArg } from "$server/utils/book/bookToBookSchema";
import findBookmarkTagMenu from "./findBookmarkTagMenu";

type Option = {
  /** LTI Context ごとでの学習状況を取得するか否か (true: LTI Context ごと, それ以外: すべて) */
  ltiContextOnly: boolean;
  /** LTI Context */
  ltiContext: {
    /** LTI Context ID */
    id: string;
    /** Client ID */
    clientId: string;
  };
};

export default async function findBookmarkStats(
  opt: Option
): Promise<BookmarkStats> {
  const tagMenu = await findBookmarkTagMenu();
  const ltiResourceLinks = opt.ltiContextOnly
    ? []
    : await prisma.ltiResourceLink.findMany({
        where: {
          consumerId: opt.ltiContext.clientId,
          contextId: opt.ltiContext.id,
        },
        include: {
          book: bookIncludingTopicsArg,
        },
      });

  const topics = ltiResourceLinks.flatMap((l) =>
    l.book.sections.flatMap((s) => s.topicSections.flatMap((ts) => ts.topicId))
  );

  const bookmarks = await prisma.bookmark.groupBy({
    by: ["topicId", "tagId"],
    _count: true,
    orderBy: {
      _max: {
        updatedAt: "asc",
      },
    },
    where: opt.ltiContextOnly
      ? {
          ltiContextId: opt.ltiContext.id,
          ltiConsumerId: opt.ltiContext.clientId,
        }
      : {
          topicId: {
            in: topics,
          },
        },
  });

  // 自由記述のタグは別途ワードクラウドで表示するため、タグが存在しないブックマークは除外する
  const stats: BookmarkStats = bookmarks
    .filter((bookmark) => bookmark.tagId !== null)
    .map((b) => ({
      topicId: b.topicId,
      tagLabel: tagMenu.find((t) => t && t.id === b.tagId)?.label ?? "",
      totalCount: b._count,
    }));

  return stats;
}
