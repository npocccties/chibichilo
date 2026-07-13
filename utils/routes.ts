import type { BookSchema } from "$server/models/book";
import type { TopicSchema } from "$server/models/topic";
import type { Query as BookQuery } from "$pages/book";
import type { Query as BookEditQuery } from "$pages/book/edit";
import { withQuery } from "$utils/toPath";

export const paths = {
  index: "/",
  books: "/books",
  booksImport: "/books/import",
  booksTopic: "/books/topic",
  booksTopicEdit: "/books/topic/edit",
  book: "/book",
  bookNew: "/book/new",
  bookEdit: "/book/edit",
  bookEditTopic: "/book/edit/topic",
  bookEditTopicNew: "/book/edit/topic/new",
  bookEditTopicEdit: "/book/edit/topic/edit",
  bookImport: "/book/import",
  bookImportTopic: "/book/import/topic",
  bookImportTopicEdit: "/book/import/topic/edit",
  bookTopic: "/book/topic",
  bookTopicEdit: "/book/topic/edit",
  bookTopicImport: "/book/topic/import",
  bookTopicImportEdit: "/book/topic/import/edit",
  bookRelease: "/book/release",
  bookOverwrite: "/book/overwrite",
  bookLinking: "/book/linking",
  topics: "/topics",
  topicsNew: "/topics/new",
  topicsEdit: "/topics/edit",
  topicsImport: "/topics/import",
  courses: "/courses",
  dashboard: "/dashboard",
  bookmarks: "/bookmarks",
  download: "/download",
  userSettings: "/userSettings",
} as const;

export type AppContext = "books" | "topics" | "courses";

export function contextUrl(context: AppContext): string {
  return paths[context];
}

export function bookUrl(
  query: Partial<Pick<BookQuery, "bookId" | "topicId" | "token" | "zoom">>
): string {
  return withQuery(paths.book, query);
}

export function bookEditUrl(query: BookEditQuery): string {
  return withQuery(paths.bookEdit, query);
}

export function bookNewUrl(query?: {
  context?: "books" | "topics";
  topics?: number | number[];
}): string {
  return withQuery(paths.bookNew, query);
}

export function bookImportUrl(query: BookEditQuery): string {
  return withQuery(paths.bookImport, query);
}

export function bookImportTopicEditUrl(
  query: BookEditQuery & { topicId: number }
): string {
  return withQuery(paths.bookImportTopicEdit, query);
}

export function bookTopicImportEditUrl(
  query: BookEditQuery & { topicId: number }
): string {
  return withQuery(paths.bookTopicImportEdit, query);
}

export function bookTopicImportUrl(query: BookEditQuery): string {
  return withQuery(paths.bookTopicImport, query);
}

export function bookEditTopicEditUrl(
  query: BookEditQuery & { topicId: number }
): string {
  return withQuery(paths.bookEditTopicEdit, query);
}

export function bookEditTopicNewUrl(query: BookEditQuery): string {
  return withQuery(paths.bookEditTopicNew, query);
}

export function bookOverwriteUrl(query: { bookId: BookSchema["id"] }): string {
  return withQuery(paths.bookOverwrite, query);
}

export function bookReleaseUrl(query: BookEditQuery): string {
  return withQuery(paths.bookRelease, query);
}

export function bookLinkingUrl(query: {
  bookId: BookSchema["id"];
  topicId?: TopicSchema["id"];
}): string {
  return withQuery(paths.bookLinking, query);
}

export function bookTopicEditUrl(
  query: BookEditQuery & { topicId: number }
): string {
  return withQuery(paths.bookTopicEdit, query);
}

export function booksImportUrl(query: { context: "books" }): string {
  return withQuery(paths.booksImport, query);
}

export function topicsEditUrl(query: { topicId: TopicSchema["id"] }): string {
  return withQuery(paths.topicsEdit, query);
}

export function topicsImportUrl(query: { topicId: TopicSchema["id"] }): string {
  return withQuery(paths.topicsImport, query);
}
