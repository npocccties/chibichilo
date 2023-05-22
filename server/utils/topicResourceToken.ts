import crypto from "crypto";
import {
  API_BASE_PATH,
  WOWZA_EXPIRES_IN,
  SESSION_SECRET,
  PUBLIC_ACCESS_CRYPTO_ALGORITHM,
  VTT_ACCESS_TOKEN_EXPIRES_IN,
} from "$server/utils/env";

const SEPARATOR = "/";
const ENCODING = "base64url";
// 秘密鍵は32文字固定で、長くても短くてもダメ。SESSION_SECRET は最短32文字
const SECRET_KEY = SESSION_SECRET.substring(0, 32);
// providerUrl == "https://www.wowza.com/" ではないwowza動画が存在するため、wowza以外のサービスでなければwowzaと判定する
const EXCEPT_WOWZA_URL = ["https://www.youtube.com/", "https://vimeo.com/"];

export function getAccessToken(value: Record<string, unknown>) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    PUBLIC_ACCESS_CRYPTO_ALGORITHM,
    SECRET_KEY,
    iv
  );
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value)),
    cipher.final(),
  ]);
  return iv.toString(ENCODING) + SEPARATOR + encrypted.toString(ENCODING);
}

export function parseAccessToken(accessToken: string) {
  const [iv, encrypted] = accessToken.split(SEPARATOR);
  const decipher = crypto.createDecipheriv(
    PUBLIC_ACCESS_CRYPTO_ALGORITHM,
    SECRET_KEY,
    Buffer.from(iv, ENCODING)
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted, ENCODING)),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString());
}

export function getWowzaAccessToken(
  ip: string,
  url: string,
  providerUrl: string | null | undefined
) {
  if (!ip || EXCEPT_WOWZA_URL.includes(providerUrl ?? "")) return "";

  const value = {
    ip,
    expired:
      WOWZA_EXPIRES_IN > 0
        ? new Date(new Date().getTime() + WOWZA_EXPIRES_IN * 1000)
        : null,
    url,
  };
  return getAccessToken(value);
}

export function checkWowzaAccessToken(
  accessToken: string,
  ip: string,
  path: string
) {
  if (!accessToken) return false;

  try {
    const value = parseAccessToken(accessToken);
    return (
      value.ip == ip &&
      (WOWZA_EXPIRES_IN === 0 ||
        new Date(value.expired).getTime() > new Date().getTime()) &&
      new URL(value.url).pathname == `${API_BASE_PATH}/wowza/${path}`
    );
  } catch (e) {
    return false;
  }
}

export function getVttAccessToken(
  ip: string,
  resourceId: number,
  videoTrackId: number
) {
  if (!ip) return "";

  const value = {
    ip,
    expired: new Date(
      new Date().getTime() + VTT_ACCESS_TOKEN_EXPIRES_IN * 1000
    ),
    resourceId,
    videoTrackId,
  };
  return getAccessToken(value);
}

export function checkVttAccessToken(
  accessToken: string,
  ip: string,
  resourceId: number,
  videoTrackId: number
) {
  if (!accessToken) return false;

  try {
    const value = parseAccessToken(accessToken);
    return (
      value.ip == ip &&
      new Date(value.expired).getTime() > new Date().getTime() &&
      value.resourceId == resourceId &&
      value.videoTrackId == videoTrackId
    );
  } catch (e) {
    return false;
  }
}
