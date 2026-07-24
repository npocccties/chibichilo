import type {
  FastifyInstance,
  RawRequestDefaultExpression,
  RawServerBase,
  RawServerDefault,
  RawReplyDefaultExpression,
  RouteShorthandOptions,
} from "fastify";
import type { RouteGenericInterface } from "fastify/types/route";
import type { FastifyAuthFunction } from "@fastify/auth";
import type Hooks from "$server/types/hooks";

function makePreHandler(
  fastify: FastifyInstance,
  { auth }: { auth: FastifyAuthFunction[] }
) {
  if (auth.length === 0) return {};
  return { preHandler: fastify.auth(auth, { relation: "and", run: "all" }) };
}

function makeHooks<
  RawServer extends RawServerBase = RawServerDefault,
  RawRequest extends
    RawRequestDefaultExpression<RawServer> = RawRequestDefaultExpression<RawServer>,
  RawReply extends
    RawReplyDefaultExpression<RawServer> = RawReplyDefaultExpression<RawServer>,
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
>(fastify: FastifyInstance, hooks: Hooks) {
  return Object.fromEntries(
    [...Object.entries(hooks)].map(([key, value]) => [
      key,
      makePreHandler(fastify, { auth: value?.auth ?? [] }),
    ])
  ) as {
    [K in keyof Hooks]: RouteShorthandOptions<
      RawServer,
      RawRequest,
      RawReply,
      RouteGeneric
    >;
  };
}

export default makeHooks;
