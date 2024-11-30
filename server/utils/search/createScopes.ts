import type { Prisma } from "@prisma/client";
import type { AuthorFilter } from "$server/models/authorFilter";

/** 著者フィルターの表示範囲の Prisma クエリーの生成 */
export function createScopesBook(
  filter: AuthorFilter
): Array<Prisma.BookWhereInput> {
  const sharedScope = { release: { shared: true } };
  const selfScope = { authors: { some: { userId: filter.by } } };
  const editScope = { release: null };
  const defaultScopes = {
    all: [{ OR: [sharedScope, selfScope] }],
    self: [selfScope],
    other: [sharedScope, { NOT: selfScope }],
    edit: [selfScope, editScope],
    release: [selfScope, { NOT: editScope }],
    "other-release": [sharedScope, { NOT: selfScope }, { NOT: editScope }],
  };
  const adminScopes = {
    all: [],
    self: [selfScope],
    other: [{ NOT: selfScope }],
    edit: [editScope],
    release: [{ NOT: editScope }],
    "other-release": [{ NOT: selfScope }, { NOT: editScope }],
  };

  switch(filter?.type){
    case "all":
    case "self":
    case "other":
    case "edit":
    case "release":
    case "other-release":
      return "admin" in filter && filter.admin
        ? adminScopes[filter.type]
        : defaultScopes[filter.type];
    default:
      return [];
  }
}

export function createScopesTopic(
  filter: AuthorFilter
): Array<Prisma.TopicWhereInput> {
  const sharedScope = { topicSection: { some: { section: { book: { release: { shared: true }}}}}};
  const selfScope = { authors: { some: { userId: filter.by } } };
  const editScope = { topicSection: { every: { section: { book: { release: null }}}}};
  const defaultScopes = {
    all: [{ OR: [sharedScope, selfScope] }],
    self: [selfScope],
    other: [sharedScope, { NOT: selfScope }],
    edit: [selfScope, editScope],
    release: [selfScope, { NOT: editScope }],
    "other-release": [sharedScope, { NOT: selfScope }, { NOT: editScope }],
  };
  const adminScopes = {
    all: [],
    self: [selfScope],
    other: [{ NOT: selfScope }],
    edit: [editScope],
    release: [{ NOT: editScope }],
    "other-release": [{ NOT: selfScope }, { NOT: editScope }],
  };

  switch(filter?.type){
    case "all":
    case "self":
    case "other":
    case "edit":
    case "release":
    case "other-release":
      return "admin" in filter && filter.admin
        ? adminScopes[filter.type]
        : defaultScopes[filter.type];
    default:
      return [];
  }
}
