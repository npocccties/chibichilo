import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/bookmarks";
import * as bookmarkStatsService from "$server/services/bookmarkStats";

export async function bookmarks(fastify: FastifyInstance) {
  const { method, index } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Querystring: service.Query }>(
    "/bookmarks",
    { schema: method.get, ...hooks.get },
    handler(index)
  );
}

export async function bookmarkStats(fastify: FastifyInstance) {
  const hooks = makeHooks(fastify, bookmarkStatsService.hooks);
  fastify.route({ ...bookmarkStatsService, ...hooks.get });
}
