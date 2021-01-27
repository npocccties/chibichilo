import { FastifyInstance } from "fastify";
import * as lti from "./lti";
import * as user from "./user";
import * as book from "./book";
import * as books from "./books";
import * as topics from "./topics";
import * as topic from "./topic";
import * as resources from "./resources";
import * as resource from "./resource";
import * as event from "./event";
import session from "./session";

const routers = [
  lti,
  user,
  book,
  books,
  topics,
  topic,
  resources,
  resource,
  event,
];

async function routes(fastify: FastifyInstance) {
  for (const router of routers) {
    for (const route of Object.values(router)) {
      await fastify.register(route);
    }
  }

  await fastify.register(session);
}

export default routes;
