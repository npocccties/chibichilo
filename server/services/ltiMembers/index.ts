import type Method from "$server/types/method";
import { updateSchema, updateHooks, update } from "./update";
import { showSchema, showHooks, show } from "./show";

export type { Body } from "./update";

export const method: Method = {
  get: showSchema,
  put: updateSchema,
};

export const hooks = {
  get: showHooks,
  put: updateHooks,
};

export { show, update };
