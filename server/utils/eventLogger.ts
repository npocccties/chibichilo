import type { EventSchema } from "$server/models/event";
import format from "date-fns/format";
import utcToZoneTime from "date-fns-tz/utcToZonedTime";

// TODO: 大量に console.log を呼び出すのはブロッキングが発生しうるので避けたほうが望ましい
const logger = console.log;
const separator = "\t";
const eventFieldKeys = [
  "date",
  "time",
  "zone",
  "event",
  "detail",
  "file",
  "query",
  "current",
  "ip",
  "ua",
  "rid",
  "uid",
  "cid",
  "nonce",
  "keyword",
  "videoType",
  "path",
  "topicId",
  "bookId",
  "playbackRate",
] as const;
const keyword = "videoplayerlog";

/** 無効値ならば "-" を返す */
function escape(str?: string): string {
  if (!str) return "-";
  // NOTE: もともとPHPのempty関数によって実装していたため"0"は無効値
  if (str === "0") return "-";
  return str;
}

/** ビデオプレイヤーのイベント情報を標準出力 (loggerコマンド/syslogに書き込む目的) */
function eventLogger(
  event: { ip?: string; ua?: string; url?: string } & EventSchema
) {
  // NOTE: JST (≒UTC+9) 固定
  const date = utcToZoneTime(new Date(), "Asia/Tokyo");
  const eventFields = {
    date: format(date, "yyyy-MM-dd"),
    time: format(date, "HH:mm:ss"),
    zone: "JST",
    keyword,
    ...event,
    // TODO: 将来追加予定
    topicId: "",
    // TODO: 将来追加予定
    bookId: "",
    // TODO: 将来追加予定
    playbackRate: "",
  };

  const entries: string[] = [];

  for (const key of eventFieldKeys) {
    entries.push(escape(eventFields[key] ?? ""));
  }

  logger(entries.join(separator));
}

export default eventLogger;
