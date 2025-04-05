import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export type EventType =
  | "forward"
  | "back"
  | "changepage"
  | "timeupdate"
  | "seeking"
  | "seeked"
  | "trackchange"
  | "play"
  | "pause"
  | "ratechange"
  | "ended"
  | "beforeunload-ended"
  | "pagehide-ended"
  | "unload-ended"
  | "hidden-ended"
  | "current-time"
  | "admin-download"; // ダウンロードページ用

export const EventSchema = {
  title: "syslogに記録するための視聴ログオブジェクト (v1互換)",
  description: `無効値 ("", null, undefined, [], false, 0, "0") ならば "-" として記録`,
  type: "object",
  properties: {
    event: {
      title: "EventType",
      type: "string",
    },
    detail: {
      title: "Value",
      type: "string",
    },
    file: {
      title: "Video名",
      description: "YouTubeの場合: YouTube Video ID等",
      type: "string",
    },
    query: {
      title: "Video URLパラメーター",
      description: `YouTubeの場合: YouTube動画視聴ページのURLクエリー ("?" 含めず)`,
      type: "string",
    },
    current: {
      title: "ユーザが視聴している現在のビデオ再生位置",
      type: "string",
    },
    rid: {
      title: "LTIに送られたリソース情報",
      description: `\
OauthClient["id"] + ":" + LtiResourceLinkRequest["id"]
ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない`,
      type: "string",
    },
    uid: {
      title: "LTIに送られたユーザ情報",
      description: `\
OauthClient["id"] + ":" + LtiUser["id"]
ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない`,
      type: "string",
    },
    cid: {
      title: "LTIに送られたコース情報",
      description: `\
OauthClient["id"] + ":" + LtiContext["id"]
ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない`,
      type: "string",
    },
    nonce: {
      title: "LTIに送られたnonce",
      description: `\
ウィンドウ間で共有しない OauthClient["nonce"]
ツール起動時に sessionStorage に記録したセッション情報を使い続ける`,
      type: "string",
    },
    videoType: {
      title: "Video種別",
      type: "string",
    },
    path: {
      title: "視聴画面URLパス",
      type: "string",
    },
  },
} as const satisfies JSONSchema;

export const EventActivitySchema = {
  title: "syslogに記録するための視聴ログオブジェクト (v1互換)のActivity拡張",
  description: `無効値 ("", null, undefined, [], false, 0, "0") ならば "-" として記録`,
  type: "object",
  properties: {
    topicId: {
      title: "topicId",
      type: "string",
    },
    bookId: {
      title: "bookId",
      type: "string",
    },
    playbackRate: {
      title: "playbackRate",
      type: "string",
    },
  },
} as const satisfies JSONSchema;

export type EventSchema = FromSchema<typeof EventSchema>;
export type EventActivitySchema = FromSchema<typeof EventActivitySchema>;
