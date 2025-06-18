import type { AuthorFilter } from "$server/models/authorFilter";
import { createScopesBook } from "$server/utils/search/createScopes";

function createLinkScope(
  filter: AuthorFilter,
  course: { oauthClientId: string; ltiContextId: string }
) {
  if (filter.type === "all" && filter.admin) return {};
  return {
    OR: [
      {
        consumerId: course.oauthClientId,
//        contextId: course.ltiContextId,
        contextId: "3",
      },
      {
        creatorId: filter.by,
        book: { AND: createScopesBook(filter) },
      },
    ],
  };
}

export default createLinkScope;
