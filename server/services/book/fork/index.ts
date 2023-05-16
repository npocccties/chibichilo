import type { BookParams } from "$server/validators/bookParams";
import { createSchema, createHooks, create } from "./create";

export type Params = BookParams;

export const method = {
  post: createSchema,
};

export const hooks = {
  post: createHooks,
};

export { create };
