import type { BookmarkTagMenu } from "$server/models/bookmark";

export const bookmark = {
  id: 42,
  userId: 1,
  tagId: 4,
  tag: {
    id: 4,
    emoji: "💖",
    label: "お気に入り",
  },
  topicId: 1,
  bookId: 2,
  topic: {
    id: 1,
    name: "topic-name",
    timeRequired: 60,
    bookmarks: [
      {
        id: 42,
        updatedAt: "2021-01-01T00:00:00.000Z",
        tag: {
          id: 4,
          emoji: "💖",
          label: "お気に入り",
        },
        ltiContext: {
          title: "context-title",
          label: "context-label",
          id: "contextId",
        },
      },
    ],
  },
  ltiContext: {
    title: "context-title",
    label: "context-label",
    id: "contextId",
  },
};

export const bookmarkTagMenu: BookmarkTagMenu = [
  { label: "後で見る", emoji: "📌" },
  { label: "難しい", emoji: "😕" },
  { label: "重要", emoji: "❗" },
  { label: "お気に入り", emoji: "💖" },
  { label: "高評価", emoji: "👍" },
].map((value, i) => ({
  id: i + 1,
  emoji: value.emoji,
  label: value.label,
}));
