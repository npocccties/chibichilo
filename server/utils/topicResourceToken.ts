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

type WowzaClaim = {
  expired: string | null;
  url: string;
};

type VttClaim = {
  expired: string;
  resourceId: number;
  videoTrackId: number;
};

type Claim = WowzaClaim | VttClaim;

export function getAccessToken<Value extends Claim>(value: Value) {
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

export function parseAccessToken<Value extends Claim>(
  accessToken: string
): Value {
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
  url: string,
  providerUrl: string | null | undefined
) {
  if (EXCEPT_WOWZA_URL.includes(providerUrl ?? "")) return "";

  const value = {
    expired:
      WOWZA_EXPIRES_IN > 0
        ? new Date(new Date().getTime() + WOWZA_EXPIRES_IN * 1000).toISOString()
        : null,
    url,
  };
  return getAccessToken(value);
}

export function checkWowzaAccessToken(accessToken: string, path: string) {
  if (!accessToken) return false;

  try {
    const value = parseAccessToken<WowzaClaim>(accessToken);
    return (
      WOWZA_EXPIRES_IN !== 0 &&
      value.expired != null &&
      new Date(value.expired).getTime() > new Date().getTime() &&
      new URL(value.url).pathname == `${API_BASE_PATH}/wowza/${path}`
    );
  } catch {
    return false;
  }
}

export function getVttAccessToken(resourceId: number, videoTrackId: number) {
  const value = {
    expired: new Date(
      new Date().getTime() + VTT_ACCESS_TOKEN_EXPIRES_IN * 1000
    ).toISOString(),
    resourceId,
    videoTrackId,
  };
  return getAccessToken<VttClaim>(value);
}

export function checkVttAccessToken(
  accessToken: string,
  resourceId: number,
  videoTrackId: number
) {
  if (!accessToken) return false;

  try {
    const value = parseAccessToken<VttClaim>(accessToken);
    return (
      new Date(value.expired).getTime() > new Date().getTime() &&
      value.resourceId == resourceId &&
      value.videoTrackId == videoTrackId
    );
  } catch {
    return false;
  }
}
