import type { Prisma } from "@prisma/client";
import type { AuthorFilter } from "$server/models/authorFilter";

/** 著者フィルターの表示範囲の Prisma クエリーの生成 */
function createScopes(
  filter: AuthorFilter
): Array<Prisma.BookWhereInput & Prisma.TopicWhereInput> {
  const sharedScope = { shared: true };
  const selfScope = { authors: { some: { userId: filter.by } } };
  const defaultScopes = {
    all: [{ OR: [sharedScope, selfScope] }],
    self: [selfScope],
    other: [sharedScope, { NOT: selfScope }],
  };
  const adminScopes = {
    all: [],
    self: [selfScope],
    other: [{ NOT: selfScope }],
  };

  switch(filter?.type){
    case "all":
    case "self":
    case "other":
      return "admin" in filter && filter.admin
        ? adminScopes[filter.type]
        : defaultScopes[filter.type];
    default:
      return [];
  }
}

export default createScopes;

export function createScopesBook(
  filter: AuthorFilter
): Array<Prisma.BookWhereInput> {
  const sharedScope = { shared: true };
  const selfScope = { authors: { some: { userId: filter.by } } };
  const editScope = { release: null };
  const defaultScopes = {
    edit: [selfScope, editScope],
    release: [selfScope, { NOT: editScope }],
    "other-release": [sharedScope, { NOT: selfScope }, { NOT: editScope }],
  };
  const adminScopes = {
    edit: [editScope],
    release: [{ NOT: editScope }],
    "other-release": [{ NOT: selfScope }, { NOT: editScope }],
  };

  switch(filter?.type){
    case "edit":
    case "release":
    case "other-release":
      return "admin" in filter && filter.admin
        ? adminScopes[filter.type]
        : defaultScopes[filter.type];
    default:
      return createScopes(filter);
  }
}

export function createScopesTopic(
  filter: AuthorFilter
): Array<Prisma.TopicWhereInput> {
  const sharedScope = { shared: true };
  const selfScope = { authors: { some: { userId: filter.by } } };
  const editScope = { topicSection: { every: { section: { book: { release: null }}}}};
  const defaultScopes = {
    edit: [selfScope, editScope],
    release: [selfScope, { NOT: editScope }],
    "other-release": [sharedScope, { NOT: selfScope }, { NOT: editScope }],
  };
  const adminScopes = {
    edit: [editScope],
    release: [{ NOT: editScope }],
    "other-release": [{ NOT: selfScope }, { NOT: editScope }],
  };

  switch(filter?.type){
    case "edit":
    case "release":
    case "other-release":
      return "admin" in filter && filter.admin
        ? adminScopes[filter.type]
        : defaultScopes[filter.type];
    default:
      return createScopes(filter);
  }
}
