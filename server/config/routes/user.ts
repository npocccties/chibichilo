import { FastifyInstance } from "fastify";
import handler from "$server/utils/handler";
import * as booksService from "$server/services/user/books";
import * as topicsService from "$server/services/user/topics";

const basePath = "/user/:user_id";

export async function books(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: booksService.Query;
    Params: booksService.Params;
  }>(
    `${basePath}/books`,
    {
      schema: booksService.method.get,
      preHandler: booksService.preHandler(fastify),
    },
    handler(booksService.get)
  );
}

export async function topics(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: topicsService.Query;
    Params: topicsService.Params;
  }>(
    `${basePath}/topics`,
    {
      schema: topicsService.method.get,
      preHandler: topicsService.preHandler(fastify),
    },
    handler(topicsService.get)
  );
}
