import type { TopicParams } from "$server/validators/topicParams";
import { showSchema, showHooks, show } from "./show";

export type Params = TopicParams;

export const method = {
  get: showSchema,
};

export const hooks = {
  get: showHooks,
};

export { show };
