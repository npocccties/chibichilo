import type { BookmarkProps } from "$server/models/bookmark";
import type { BookmarkParams } from "$server/validators/bookmarkParams";
import { createSchema, createHooks, create } from "./create";
import { destroy, destroyHooks, destroySchema } from "./destroy";

export type Props = BookmarkProps;

export type Params = BookmarkParams;

export const method = {
  post: createSchema,
  delete: destroySchema,
};

export const hooks = {
  post: createHooks,
  delete: destroyHooks,
};

export { create, destroy };
