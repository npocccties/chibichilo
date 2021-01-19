import { FastifyInstance } from "fastify";
import handler from "$server/utils/handler";
import * as service from "$server/services/event";

export default async function (fastify: FastifyInstance) {
  const { method, create } = service;
  fastify.post("/event", { schema: method.post }, handler(create));
}
