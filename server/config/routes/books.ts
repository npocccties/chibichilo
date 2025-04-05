import type { FastifyInstance } from "fastify";
import makeHooks from "$server/utils/makeHooks";
import handler from "$server/utils/handler";
import * as service from "$server/services/books";
import * as importService from "$server/services/booksImport";
import * as bookIds from "$server/services/bookIds";

export async function books(fastify: FastifyInstance) {
  const { method, index } = service;
  const hooks = makeHooks(fastify, service.hooks);

  fastify.get<{ Querystring: service.Query }>(
    "/books",
    { schema: method.get, ...hooks.get },
    handler(index)
  );
}

export async function importBooks(fastify: FastifyInstance) {
  const basePath = "/books/import";
  const { importSchema, importHooks, importBooks } = importService;
  const hooks = makeHooks(fastify, importHooks);

  fastify.post<{
    Body: importService.Params;
  }>(basePath, { schema: importSchema, ...hooks.post }, handler(importBooks));
}

export async function bookId(fastify: FastifyInstance) {
  const path = "/bookIds";
  const { method, index } = bookIds;
  const hooks = makeHooks(fastify, bookIds.hooks);

  fastify.get(path, { schema: method.get, ...hooks.get }, handler(index));
}
