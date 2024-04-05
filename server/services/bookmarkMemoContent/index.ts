import type { BookmarkMemoContentProps } from "$server/models/bookmarkMemoContent";
import type { BookmarkParams } from "$server/validators/bookmarkParams";
import { createSchema, createHooks, create } from "./create";
import { updateSchema, updateHooks, update } from "./update";

export type Props = BookmarkMemoContentProps;

export type Params = BookmarkParams;

export const method = {
  post: createSchema,
  put: updateSchema,
};

export const hooks = {
  post: createHooks,
  put: updateHooks,
};

export { create, update };
