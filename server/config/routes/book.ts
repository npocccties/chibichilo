import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/book";
import * as activityService from "$server/services/book/activity";
import * as authorsService from "$server/services/book/authors";
import * as showPublicService from "$server/services/book/public";
import * as showZoomService from "$server/services/book/zoom";
import * as releaseService from "$server/services/book/release";
import * as treeService from "$server/services/book/tree";

const basePath = "/book";
const pathWithParams = `${basePath}/:book_id`;

export async function book(fastify: FastifyInstance) {
  const { method, show, create, update, destroy } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{
    Params: service.Params;
  }>(pathWithParams, { schema: method.get, ...hooks.get }, handler(show));

  fastify.post<{
    Body: service.Props;
  }>(basePath, { schema: method.post, ...hooks.post }, handler(create));

  fastify.put<{
    Params: service.Params;
    Body: service.Props;
  }>(pathWithParams, { schema: method.put, ...hooks.put }, handler(update));

  fastify.delete<{
    Params: service.Params;
  }>(
    pathWithParams,
    { schema: method.delete, ...hooks.delete },
    handler(destroy)
  );
}

export async function bookActivity(fastify: FastifyInstance) {
  const path = `${pathWithParams}/activity`;
  const { method, show, update } = activityService;
  const hooks = makeHooks(fastify, activityService.hooks);

  fastify.get<{
    Params: activityService.Params;
    Querystring: activityService.Query;
  }>(path, { schema: method.get, ...hooks.get }, handler(show));

  fastify.put<{
    Params: activityService.Params;
    Querystring: activityService.Query;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}
export async function bookAuthors(fastify: FastifyInstance) {
  const path = `${pathWithParams}/authors`;
  const { method, update } = authorsService;
  const hooks = makeHooks(fastify, authorsService.hooks);

  fastify.put<{
    Params: authorsService.Params;
    Body: authorsService.Props;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}

export async function bookPublic(fastify: FastifyInstance) {
  const path = `${basePath}/public/:token`;
  const { schema, hook, method } = showPublicService;
  const hooks = makeHooks(fastify, { get: hook });

  fastify.get<{
    Params: showPublicService.Params;
    Headers: showPublicService.Headers;
  }>(path, { schema, ...hooks.get }, handler(method));
}
export async function bookZoom(fastify: FastifyInstance) {
  const path = `${basePath}/zoom/:meetingId`;
  const { schema, hook, method } = showZoomService;
  const hooks = makeHooks(fastify, { get: hook });

  fastify.get<{ Params: showZoomService.Params }>(
    path,
    { schema, ...hooks.get },
    handler(method)
  );
}

export async function bookRelease(fastify: FastifyInstance) {
  const path = `${pathWithParams}/release`;
  const { method, update } = releaseService;
  const hooks = makeHooks(fastify, releaseService.hooks);

  fastify.put<{
    Params: releaseService.Params;
    Body: releaseService.Props;
  }>(path, { schema: method.put, ...hooks.put }, handler(update));
}

export async function bookTree(fastify: FastifyInstance) {
  const path = `${pathWithParams}/tree`;
  const { method, show } = treeService;
  const hooks = makeHooks(fastify, treeService.hooks);

  fastify.get<{
    Params: treeService.Params;
  }>(path, { schema: method.get, ...hooks.get }, handler(show));
}
