import type { MetainfoProps } from "$server/models/metainfo";
import type { BookParams } from "$server/validators/bookParams";
import { updateSchema, updateHooks, update } from "./update";

export type Params = BookParams;
export type Props = MetainfoProps;

export const method = {
  put: updateSchema,
};

export const hooks = {
  put: updateHooks,
};

export { update };
