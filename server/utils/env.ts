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
};
