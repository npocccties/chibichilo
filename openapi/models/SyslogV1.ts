/* tslint:disable */
/* eslint-disable */
/**
 * chibichilo-server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.5.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
/**
 * 無効値 ("", null, undefined, [], false, 0, "0") ならば "-" として記録
 * @export
 * @interface SyslogV1
 */
export interface SyslogV1 {
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    event?: string;
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    detail?: string;
    /**
     * YouTubeの場合: YouTube Video ID等
     * @type {string}
     * @memberof SyslogV1
     */
    file?: string;
    /**
     * YouTubeの場合: YouTube動画視聴ページのURLクエリー ("?" 含めず)
     * @type {string}
     * @memberof SyslogV1
     */
    query?: string;
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    current?: string;
    /**
     * OauthClient["id"] + ":" + LtiResourceLinkRequest["id"]
     * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
     * @type {string}
     * @memberof SyslogV1
     */
    rid?: string;
    /**
     * OauthClient["id"] + ":" + LtiUser["id"]
     * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
     * @type {string}
     * @memberof SyslogV1
     */
    uid?: string;
    /**
     * OauthClient["id"] + ":" + LtiContext["id"]
     * ツール起動時に sessionStorage に記録したセッション情報を使い続け、ウィンドウ間で共有しない
     * @type {string}
     * @memberof SyslogV1
     */
    cid?: string;
    /**
     * ウィンドウ間で共有しない OauthClient["nonce"]
     * ツール起動時に sessionStorage に記録したセッション情報を使い続ける
     * @type {string}
     * @memberof SyslogV1
     */
    nonce?: string;
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    videoType?: string;
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    path?: string;
    /**
     * 
     * @type {string}
     * @memberof SyslogV1
     */
    playbackRate?: string;
}

export function SyslogV1FromJSON(json: any): SyslogV1 {
    return SyslogV1FromJSONTyped(json, false);
}

export function SyslogV1FromJSONTyped(json: any, ignoreDiscriminator: boolean): SyslogV1 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'event': !exists(json, 'event') ? undefined : json['event'],
        'detail': !exists(json, 'detail') ? undefined : json['detail'],
        'file': !exists(json, 'file') ? undefined : json['file'],
        'query': !exists(json, 'query') ? undefined : json['query'],
        'current': !exists(json, 'current') ? undefined : json['current'],
        'rid': !exists(json, 'rid') ? undefined : json['rid'],
        'uid': !exists(json, 'uid') ? undefined : json['uid'],
        'cid': !exists(json, 'cid') ? undefined : json['cid'],
        'nonce': !exists(json, 'nonce') ? undefined : json['nonce'],
        'videoType': !exists(json, 'videoType') ? undefined : json['videoType'],
        'path': !exists(json, 'path') ? undefined : json['path'],
        'playbackRate': !exists(json, 'playbackRate') ? undefined : json['playbackRate'],
    };
}

export function SyslogV1ToJSON(value?: SyslogV1 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'event': value.event,
        'detail': value.detail,
        'file': value.file,
        'query': value.query,
        'current': value.current,
        'rid': value.rid,
        'uid': value.uid,
        'cid': value.cid,
        'nonce': value.nonce,
        'videoType': value.videoType,
        'path': value.path,
        'playbackRate': value.playbackRate,
    };
}


