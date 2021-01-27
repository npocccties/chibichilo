import { FastifyInstance } from "fastify";
import handler from "$server/utils/handler";
import { IndexQuery, indexService } from "$server/services/books";

export async function books(fastify: FastifyInstance) {
  fastify.get<{
    Querystring: IndexQuery;
  }>(
    "/books",
    {
      schema: indexService.method.get,
      preHandler: indexService.preHandler(fastify),
    },
    handler(indexService.get)
  );
}
