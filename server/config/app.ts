import type { FastifyInstance } from "fastify";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import helmet from "@fastify/helmet";
import cors from "@fastify/cors";
import session from "@fastify/session";
import type { SessionStore } from "@fastify/session";
import cookie from "@fastify/cookie";
import auth from "@fastify/auth";
import formbody from "@fastify/formbody";
import multipart from "@fastify/multipart";
import pkg from "$server/package.json";
import { buildValidatorCompiler } from "./validations";
import routes from "./routes";

export type Options = {
  basePath: string;
  allowOrigin: string[];
  sessionSecret: string;
  sessionStore: SessionStore;
};

async function app(fastify: FastifyInstance, options: Options) {
  const { basePath, allowOrigin, sessionSecret, sessionStore } = options;

  await fastify.register(swagger, {
    swagger: {
      info: {
        title: pkg.name,
        version: pkg.version,
      },
    },
  });
  await fastify.register(swaggerUi, {
    routePrefix: `${basePath}/swagger`,
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
    frameguard: false,
  });

  await Promise.all([
    fastify.register(cors, {
      origin: allowOrigin,
      credentials: true,
    }),
    fastify.register(cookie),
    fastify.register(session, {
      secret: sessionSecret,
      store: sessionStore,
      cookie: {
        // NOTE: secure: true では HTTP をサポートできないため。
        //       HTTPS のサポートのみであれば取り除いて。
        secure: "auto",
        // NOTE: SameSite=Lax では iframe に埋め込み時 Cookie が送信されないため。
        sameSite: "none",
      },
    }),
    fastify.register(auth),
    fastify.register(formbody),
    fastify.register(multipart),
  ]);

  const validatorCompiler = buildValidatorCompiler();
  fastify.setValidatorCompiler(validatorCompiler);
  await fastify.register(routes, { prefix: basePath });
}

export default app;
