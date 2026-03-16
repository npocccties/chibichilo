import type Method from "$server/types/method";
import { updateSchema, updateHooks, update } from "./update";
import { showSchema, showHooks, show } from "./show";
import { syncSchema, syncHooks, sync } from "./sync";

export type { Body } from "./update";

export const method: Method = {
  get: showSchema,
  put: updateSchema,
  post: syncSchema,
};

export const hooks = {
  get: showHooks,
  put: updateHooks,
  post: syncHooks,
};

export { show, update, sync };
