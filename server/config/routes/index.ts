import type { FastifyInstance } from "fastify";
import * as lti from "./lti";
import * as search from "./search";
import * as user from "./user";
import * as userSettings from "./userSettings";
import * as users from "./users";
import * as book from "./book";
import * as books from "./books";
import * as topics from "./topics";
import * as topic from "./topic";
import * as resources from "./resources";
import * as resource from "./resource";
import * as event from "./event";
import * as wowza from "./wowza";
import * as activity from "./activity";
import session from "./session";
import * as bookmark from "./bookmark";
import * as bookmarks from "./bookmarks";
import * as bookmarkTagMenu from "./bookmarkTagMenu";
import * as bookmarkMemoContent from "./bookmarkMemoContent";
import * as wordCloud from "./wordCloud";

const routers = [
  lti,
  search,
  user,
  userSettings,
  users,
  book,
  books,
  topics,
  topic,
  resources,
  resource,
  event,
  wowza,
  activity,
  bookmark,
  bookmarks,
  bookmarkTagMenu,
  bookmarkMemoContent,
  wordCloud,
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
