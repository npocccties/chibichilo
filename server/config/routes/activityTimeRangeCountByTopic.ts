import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/activityTimeRangeCountByTopic";

const basePath = "/activityTimeRangeCountByTopic";
const pathWithParams = `${basePath}/:topicId`;

export async function activityTimeRangeCountByTopic(fastify: FastifyInstance) {
  const { method, show } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Params: service.Params; Querystring: service.Query }>(
    pathWithParams,
    { schema: method.get, ...hooks.get },
    handler(show)
  );
}
