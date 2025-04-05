import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/activityTimeRangeCount";

const basePath = "/activityTimeRangeCount";
const pathWithParams = `${basePath}/:activityId`;

export async function activityTimeRangeCount(fastify: FastifyInstance) {
  const { method, show } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Params: service.Params }>(
    pathWithParams,
    { schema: method.get, ...hooks.get },
    handler(show)
  );
}
