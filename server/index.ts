import fastify from "fastify";
import path from "path";
import {
  PORT,
  API_BASE_PATH,
  SESSION_SECRET,
  FRONTEND_ORIGIN,
  FRONTEND_PATH,
  HTTPS_CERT,
  HTTPS_KEY,
} from "$server/utils/env";
import { sessionStore } from "$server/utils/prisma";
import staticHandler from "$server/utils/staticHandler";
import type { Options } from "$server/config/app";
import app from "$server/config/app";
import { setupZoomImportScheduler } from "$server/utils/zoom/importScheduler";

const isDev = process.env.NODE_ENV !== "production";
const options = { bodyLimit: 1431655766 }; // base64 で 1GiB

if (HTTPS_CERT && HTTPS_KEY) {
  Object.assign(options, { https: { cert: HTTPS_CERT, key: HTTPS_KEY } });
}

void fastify({ logger: isDev, trustProxy: true, ...options })
  .get(
    path.join(FRONTEND_PATH, "*"),
    staticHandler({
      public: path.join(__dirname, "public"),
      rewrites: [{ source: "**", destination: "/index.html" }],
    })
  )
  .register(app, {
    basePath: API_BASE_PATH,
    allowOrigin: FRONTEND_ORIGIN === "" ? [] : [FRONTEND_ORIGIN],
    sessionSecret: SESSION_SECRET,
    sessionStore: sessionStore as Options["sessionStore"],
  })
  .listen({ port: PORT, host: "::" }); // TODO: UNIXドメインソケット(引数にファイルパスを指定)未対応

void setupZoomImportScheduler();
