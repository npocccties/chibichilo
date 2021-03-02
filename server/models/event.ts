import { IsOptional, IsString } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

export type EventType =
  | "forward"
  | "back"
  | "changepage"
  | "timeupdate"
  | "seeking"
  | "seeked"
  | "trackchange"
  | "firstplay"
  | "play"
  | "pause"
  | "ratechange"
  | "ended"
  | "beforeunload-ended"
  | "pagehide-ended"
  | "unload-ended"
  | "hidden-ended"
  | "current-time";

/**
 * syslogに記録するための視聴ログオブジェクト (v1互換)
 * 無効値 ("", null, undefined, [], false, 0, "0") ならば "-" として記録
 */
export class Event {
  /** Event */
  @IsOptional()
  @IsString()
  event?: EventType;

  /** Event Value */
  @IsOptional()
  @IsString()
  detail?: string;

  /**
   * Video名
   * YouTubeの場合: YouTube Video ID等
   */
  @IsOptional()
  @IsString()
  file?: string;

  /**
   * URLパラメーター
   * YouTubeの場合: YouTube動画視聴ページのURLクエリー ("?" 含めず)
   */
  @IsOptional()
  @IsString()
  query?: string;

  /** ユーザが視聴している現在のビデオ再生位置 */
  @IsOptional()
  @IsString()
  current?: string;

  /**
   * LTIに送られたリソース情報
   * LtiLaunchBody["oauth_consumer_key"] + ":" + LtiLaunchBody["resource_link_id"]
   * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
   */
  @IsOptional()
  @IsString()
  rid?: string;

  /**
   * LTIに送られたユーザ情報
   * LtiLaunchBody["oauth_consumer_key"] + ":" + LtiLaunchBody["user_id"]
   * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
   */
  @IsOptional()
  @IsString()
  uid?: string;

  /**
   * LTIに送られたコース情報
   * LtiLaunchBody["oauth_consumer_key"] + ":" + LtiLaunchBody["context_id"]
   * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
   */
  @IsOptional()
  @IsString()
  cid?: string;

  /**
   * LTIに送られたnonce
   * ウィンドウ間で共有しない LtiLaunchBody["oauth_nonce"]
   * ツール起動時に sessionStorage に記録したセッション情報を使い続ける
   */
  @IsOptional()
  @IsString()
  nonce?: string;
}

export const eventSchema = validationMetadatasToSchemas().Event;
