import getLocaleListString from "$utils/getLocaleListString";
import type { ContentAuthors } from "$server/models/content";

export function authors(content: ContentAuthors): string {
  return getLocaleListString(
    content.authors.map((author) => author.name),
    "ja"
  );
}
