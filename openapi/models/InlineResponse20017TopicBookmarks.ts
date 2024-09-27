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
import {
    LTIContext,
    LTIContextFromJSON,
    LTIContextFromJSONTyped,
    LTIContextToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse20017TopicBookmarks
 */
export interface InlineResponse20017TopicBookmarks {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20017TopicBookmarks
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20017TopicBookmarks
     */
    updatedAt: string;
    /**
     * 
     * @type {object}
     * @memberof InlineResponse20017TopicBookmarks
     */
    tag?: object;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20017TopicBookmarks
     */
    memoContent?: string;
    /**
     * 
     * @type {LTIContext}
     * @memberof InlineResponse20017TopicBookmarks
     */
    ltiContext: LTIContext;
}

export function InlineResponse20017TopicBookmarksFromJSON(json: any): InlineResponse20017TopicBookmarks {
    return InlineResponse20017TopicBookmarksFromJSONTyped(json, false);
}

export function InlineResponse20017TopicBookmarksFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20017TopicBookmarks {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'updatedAt': json['updatedAt'],
        'tag': !exists(json, 'tag') ? undefined : json['tag'],
        'memoContent': !exists(json, 'memoContent') ? undefined : json['memoContent'],
        'ltiContext': LTIContextFromJSON(json['ltiContext']),
    };
}

export function InlineResponse20017TopicBookmarksToJSON(value?: InlineResponse20017TopicBookmarks | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'updatedAt': value.updatedAt,
        'tag': value.tag,
        'memoContent': value.memoContent,
        'ltiContext': LTIContextToJSON(value.ltiContext),
    };
}

