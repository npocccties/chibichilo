import type { ReleaseProps } from "$server/models/book/release";
import type { BookParams } from "$server/validators/bookParams";
import { updateSchema, updateHooks, update } from "./update";

export type Params = BookParams;
export type Props = ReleaseProps;

export const method = {
  put: updateSchema,
};

export const hooks = {
  put: updateHooks,
};

export { update };
