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
 * @interface InlineResponse20019TopicBookmarks
 */
export interface InlineResponse20019TopicBookmarks {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20019TopicBookmarks
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20019TopicBookmarks
     */
    updatedAt: string;
    /**
     * 
     * @type {object}
     * @memberof InlineResponse20019TopicBookmarks
     */
    tag?: object;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20019TopicBookmarks
     */
    memoContent?: string;
    /**
     * 
     * @type {LTIContext}
     * @memberof InlineResponse20019TopicBookmarks
     */
    ltiContext: LTIContext;
}

export function InlineResponse20019TopicBookmarksFromJSON(json: any): InlineResponse20019TopicBookmarks {
    return InlineResponse20019TopicBookmarksFromJSONTyped(json, false);
}

export function InlineResponse20019TopicBookmarksFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20019TopicBookmarks {
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

export function InlineResponse20019TopicBookmarksToJSON(value?: InlineResponse20019TopicBookmarks | null): any {
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


