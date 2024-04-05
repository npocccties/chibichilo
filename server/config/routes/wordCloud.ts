import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/bookmarks";
import * as wordCloudService from "$server/services/wordCloud";

const basePath = "/wordCloud";
const pathWithParams = `${basePath}/:bookId`;

export async function wordCloud(fastify: FastifyInstance) {
  const { method, index } = wordCloudService;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Params: wordCloudService.Params }>(
    pathWithParams,
    { schema: method.get, ...hooks.get },
    handler(index)
  );
}
