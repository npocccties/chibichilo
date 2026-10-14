import type { FastifyInstance } from "fastify";
import type { FastifyAuthFunction } from "@fastify/auth";
import type Hooks from "$server/types/hooks";

function makePreHandler(
  fastify: FastifyInstance,
  { auth }: { auth: FastifyAuthFunction[] }
) {
  if (auth.length === 0) return {};
  return { preHandler: fastify.auth(auth, { relation: "and", run: "all" }) };
}

function makeHooks(fastify: FastifyInstance, hooks: Hooks) {
  return Object.fromEntries(
    [...Object.entries(hooks)].map(([key, value]) => [
      key,
      makePreHandler(fastify, { auth: value?.auth ?? [] }),
    ])
  );
}

export default makeHooks;
