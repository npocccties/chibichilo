import { Configuration } from "$openapi/runtime";
import { DefaultApi } from "$openapi/apis";
import { NEXT_PUBLIC_API_BASE_PATH } from "./env";

const isDev = process.env.NODE_ENV !== "production";

const config = new Configuration({
  basePath: NEXT_PUBLIC_API_BASE_PATH,
  credentials: isDev ? "include" : "same-origin",
});

export const api = new DefaultApi(config);
