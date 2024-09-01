import type { ReleaseProps } from "$server/models/book/release";
import type { BookParams } from "$server/validators/bookParams";
import { createSchema, createHooks, create } from "./create";
import { updateSchema, updateHooks, update } from "./update";

export type Params = BookParams;
export type Props = ReleaseProps;

export const method = {
  post: createSchema,
  put: updateSchema,
};

export const hooks = {
  post: createHooks,
  put: updateHooks,
};

export { create, update };
