import dotenv from "dotenv";
import fileExists from "./fileExists";

dotenv.config();

const PORT = Number(process.env.PORT ?? "8080");
const API_BASE_PATH = process.env.API_BASE_PATH ?? "/api/v2";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "";
const FRONTEND_PATH = process.env.FRONTEND_PATH || "/";
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";
const OAUTH_CONSUMER_KEY = process.env.OAUTH_CONSUMER_KEY ?? "";
const OAUTH_CONSUMER_SECRET = process.env.OAUTH_CONSUMER_SECRET ?? "";
const HTTPS_CERT = fileExists(process.env.HTTPS_CERT_PATH ?? "");
const HTTPS_KEY = fileExists(process.env.HTTPS_KEY_PATH ?? "");
const WOWZA_BASE_URL = process.env.WOWZA_BASE_URL ?? "";
const WOWZA_SECURE_TOKEN = process.env.WOWZA_SECURE_TOKEN ?? "";
const WOWZA_QUERY_PREFIX = process.env.WOWZA_QUERY_PREFIX ?? "wowzatoken";
const WOWZA_EXPIRES_IN = Number(process.env.WOWZA_EXPIRES_IN ?? "0");
const WOWZA_THUMBNAIL_BASE_URL = process.env.WOWZA_THUMBNAIL_BASE_URL ?? "";
const WOWZA_THUMBNAIL_EXTENSION =
  process.env.WOWZA_THUMBNAIL_EXTENSION ?? "jpg";
const ACTIVITY_RATE_MIN = Number(process.env.ACTIVITY_RATE_MIN ?? "0.9");
const WOWZA_SCP_HOST = process.env.WOWZA_SCP_HOST ?? "";
const WOWZA_SCP_PORT = Number(process.env.WOWZA_SCP_PORT ?? "22");
const WOWZA_SCP_USERNAME = process.env.WOWZA_SCP_USERNAME ?? "";
const WOWZA_SCP_PRIVATE_KEY = process.env.WOWZA_SCP_PRIVATE_KEY;
const WOWZA_SCP_PRIVATE_KEY_PATH = process.env.WOWZA_SCP_PRIVATE_KEY_PATH;
const WOWZA_SCP_PASS_PHRASE = process.env.WOWZA_SCP_PASS_PHRASE ?? "";
const WOWZA_SCP_SERVER_PATH = process.env.WOWZA_SCP_SERVER_PATH ?? "";
const ZOOM_API_KEY = process.env.ZOOM_API_KEY ?? "";
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET ?? "";
const ZOOM_IMPORT_CONSUMER_KEY = process.env.ZOOM_IMPORT_CONSUMER_KEY ?? "";
const ZOOM_IMPORT_INTERVAL = process.env.ZOOM_IMPORT_INTERVAL ?? "";
const ZOOM_IMPORT_TO = process.env.ZOOM_IMPORT_TO ?? "";
const ZOOM_IMPORT_WOWZA_BASE_URL = process.env.ZOOM_IMPORT_WOWZA_BASE_URL ?? "";
const ZOOM_IMPORT_AUTODELETE = Boolean(process.env.ZOOM_IMPORT_AUTODELETE);
const ZOOM_IMPORT_DISABLE_AUTOPUBLIC = Boolean(
  process.env.ZOOM_IMPORT_DISABLE_AUTOPUBLIC
);
const ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS =
  process.env.ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS ?? "";
const PUBLIC_ACCESS_HASH_ALGORITHM =
  process.env.PUBLIC_ACCESS_HASH_ALGORITHM ?? "sha256";
const PUBLIC_ACCESS_CRYPTO_ALGORITHM =
  process.env.PUBLIC_ACCESS_CRYPTO_ALGORITHM ?? "aes-256-cbc";

export {
  PORT,
  API_BASE_PATH,
  FRONTEND_ORIGIN,
  FRONTEND_PATH,
  SESSION_SECRET,
  OAUTH_CONSUMER_KEY,
  OAUTH_CONSUMER_SECRET,
  HTTPS_CERT,
  HTTPS_KEY,
  WOWZA_BASE_URL,
  WOWZA_SECURE_TOKEN,
  WOWZA_QUERY_PREFIX,
  WOWZA_EXPIRES_IN,
  WOWZA_THUMBNAIL_BASE_URL,
  WOWZA_THUMBNAIL_EXTENSION,
  ACTIVITY_RATE_MIN,
  WOWZA_SCP_HOST,
  WOWZA_SCP_PORT,
  WOWZA_SCP_USERNAME,
  WOWZA_SCP_PRIVATE_KEY,
  WOWZA_SCP_PRIVATE_KEY_PATH,
  WOWZA_SCP_PASS_PHRASE,
  WOWZA_SCP_SERVER_PATH,
  ZOOM_API_KEY,
  ZOOM_API_SECRET,
  ZOOM_IMPORT_CONSUMER_KEY,
  ZOOM_IMPORT_INTERVAL,
  ZOOM_IMPORT_TO,
  ZOOM_IMPORT_WOWZA_BASE_URL,
  ZOOM_IMPORT_AUTODELETE,
  ZOOM_IMPORT_DISABLE_AUTOPUBLIC,
  ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS,
  PUBLIC_ACCESS_HASH_ALGORITHM,
  PUBLIC_ACCESS_CRYPTO_ALGORITHM,
};
