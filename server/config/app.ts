import { FastifyInstance } from "fastify";
import swagger from "fastify-swagger";
import helmet from "fastify-helmet";
import cors from "fastify-cors";
import session from "fastify-session";
import cookie from "fastify-cookie";
import auth from "fastify-auth";
import formbody from "fastify-formbody";
import multipart from "fastify-multipart";
import addHours from "date-fns/addHours";
import pkg from "$server/package.json";
import routes from "./routes";

export type Options = {
  basePath: string;
  sessionSecret: string;
  sessionStore: session.SessionStore;
};

async function app(fastify: FastifyInstance, options: Options) {
  const { basePath, sessionSecret, sessionStore } = options;

  await fastify.register(swagger, {
    routePrefix: `${basePath}/swagger`,
    swagger: {
      info: {
        title: pkg.name,
        version: pkg.version,
      },
    },
    exposeRoute: true,
  });

  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"].concat(fastify.swaggerCSP.script),
        styleSrc: ["'self'"].concat(fastify.swaggerCSP.style),
      },
    },
  });

  await Promise.all([
    fastify.register(cors),
    fastify.register(cookie),
    fastify.register(session, {
      secret: sessionSecret,
      store: sessionStore,
      cookie: {
        secure: "auto",
        maxAge: addHours(0, 1).getTime(),
      },
    }),
    fastify.register(auth),
    fastify.register(formbody),
    fastify.register(multipart, {
      attachFieldsToBody: true,
      limits: { fileSize: 1024 ** 3 },
    }),
  ]);

  await fastify.register(routes, { prefix: basePath });
}

export default app;
