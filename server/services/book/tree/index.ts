import type { BookParams } from "$server/validators/bookParams";
import { showSchema, showHooks, show } from "./show";

export type Params = BookParams;

export const method = {
  get: showSchema,
};

export const hooks = {
  get: showHooks,
};

export { show };
