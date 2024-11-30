import type { Prisma } from "@prisma/client";
import type { AuthorFilter } from "$server/models/authorFilter";

/** 著者フィルターの表示範囲の Prisma クエリーの生成 */

type Scopes<T> = { sharedScope: T, selfScope: T, editScope: T };

function defaultScopes<T>(
  filter: AuthorFilter,
  { sharedScope, selfScope, editScope }: Scopes<T>
){
  switch(filter?.type) {
    case "all": return [{ OR: [sharedScope, selfScope] }];
    case "self": return [selfScope];
    case "other": return [sharedScope, { NOT: selfScope }];
    case "edit": return [selfScope, editScope];
    case "release": return [selfScope, { NOT: editScope }];
    case "other-release": return [sharedScope, { NOT: selfScope }, { NOT: editScope }];
    default: return [];
  }
}

function adminScopes<T>(
  filter: AuthorFilter,
  { selfScope, editScope }: Scopes<T>
){
  switch(filter?.type) {
    case "all": return [];
    case "self": return [selfScope];
    case "other": return [{ NOT: selfScope }];
    case "edit": return [editScope];
    case "release": return [{ NOT: editScope }];
    case "other-release": return [{ NOT: selfScope }, { NOT: editScope }];
    default: return [];
  }
}

export function createScopes<T>(
  filter: AuthorFilter,
  scopes: Scopes<T>
){
  return "admin" in filter && filter.admin
    ? adminScopes<T>(filter, scopes)
    : defaultScopes<T>(filter, scopes);
}

export function createScopesBook(
  filter: AuthorFilter
): Array<Prisma.BookWhereInput> {
  const scopes = {
    sharedScope: { release: { shared: true } },
    selfScope: { authors: { some: { userId: filter.by } } },
    editScope: { release: null },
  };
  return createScopes<Prisma.BookWhereInput>(filter, scopes);
}

export function createScopesTopic(
  filter: AuthorFilter
): Array<Prisma.TopicWhereInput> {
  const scopes = {
    sharedScope: { topicSection: { some: { section: { book: { release: { shared: true }}}}}},
    selfScope: { authors: { some: { userId: filter.by } } },
    editScope: { topicSection: { every: { section: { book: { release: null }}}}},
  };
  return createScopes<Prisma.TopicWhereInput>(filter, scopes);
}
