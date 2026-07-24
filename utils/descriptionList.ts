import groupBy from "lodash.groupby";
import getLocaleListString from "$utils/getLocaleListString";
import type { ContentAuthors } from "$server/models/content";
import type DescriptionList from "$atoms/DescriptionList";

type Value = Parameters<typeof DescriptionList>[0]["value"];

export function authors(content: ContentAuthors): Value {
  return Object.entries(
    groupBy(content.authors, (author) => author.roleName)
  ).map(([key, value]) => ({
    key,
    value: getLocaleListString(
      value.map((author) => author.name),
      "ja"
    ),
  }));
}
