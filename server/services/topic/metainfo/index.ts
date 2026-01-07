import type { MetainfoProps } from "$server/models/metainfo";
import type { TopicParams } from "$server/validators/topicParams";
import { updateSchema, updateHooks, update } from "./update";

export type Params = TopicParams;
export type Props = MetainfoProps;

export const method = {
  put: updateSchema,
};

export const hooks = {
  put: updateHooks,
};

export { update };
