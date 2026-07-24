import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";

import {
  WOWZA_SCP_HOST,
  WOWZA_SCP_PORT,
  WOWZA_SCP_USERNAME,
  WOWZA_SCP_PRIVATE_KEY,
  WOWZA_SCP_PRIVATE_KEY_PATH,
  WOWZA_SCP_SERVER_PATH,
} from "$server/utils/env";

export function validateWowzaSettings(logging = true) {
  if (
    !WOWZA_SCP_HOST ||
    !WOWZA_SCP_PORT ||
    !WOWZA_SCP_USERNAME ||
    !(WOWZA_SCP_PRIVATE_KEY || WOWZA_SCP_PRIVATE_KEY_PATH) ||
    !WOWZA_SCP_SERVER_PATH
  ) {
    if (logging)
      logger(
        "INFO",
        `wowza upload is disabled. WOWZA_SCP_HOST:${WOWZA_SCP_HOST} WOWZA_SCP_PORT:${WOWZA_SCP_PORT} WOWZA_SCP_USERNAME:${WOWZA_SCP_USERNAME} WOWZA_SCP_SERVER_PATH:${WOWZA_SCP_SERVER_PATH}`
      );
    return false;
  }
  return true;
}

export function logger(level: string, output: string, error?: Error | unknown) {
  console.log(
    format(utcToZoneTime(new Date(), "Asia/Tokyo"), "yyyy-MM-dd HH:mm:ss"),
    level,
    output,
    "WowzaUploadLog"
  );
  if (error instanceof Error) console.log(error.stack);
}
