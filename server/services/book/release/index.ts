import type { ReleaseProps } from "$server/models/book/release";
import type { BookParams } from "$server/validators/bookParams";
import { createSchema, createHooks, create } from "./create";
import { updateSchema, updateHooks, update } from "./update";
import { showSchema, showHooks, show } from "./show";

export type Params = BookParams;
export type Props = ReleaseProps;

export const method = {
  get: showSchema,
  post: createSchema,
  put: updateSchema,
};

export const hooks = {
  get: showHooks,
  post: createHooks,
  put: updateHooks,
};

export { show, create, update };
