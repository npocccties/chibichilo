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
    InlineResponse20016TopicBookmarks,
    InlineResponse20016TopicBookmarksFromJSON,
    InlineResponse20016TopicBookmarksFromJSONTyped,
    InlineResponse20016TopicBookmarksToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse20016Topic
 */
export interface InlineResponse20016Topic {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Topic
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20016Topic
     */
    name: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Topic
     */
    timeRequired: number;
    /**
     * 
     * @type {Array<InlineResponse20016TopicBookmarks>}
     * @memberof InlineResponse20016Topic
     */
    bookmarks: Array<InlineResponse20016TopicBookmarks>;
}

export function InlineResponse20016TopicFromJSON(json: any): InlineResponse20016Topic {
    return InlineResponse20016TopicFromJSONTyped(json, false);
}

export function InlineResponse20016TopicFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20016Topic {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
        'timeRequired': json['timeRequired'],
        'bookmarks': ((json['bookmarks'] as Array<any>).map(InlineResponse20016TopicBookmarksFromJSON)),
    };
}

export function InlineResponse20016TopicToJSON(value?: InlineResponse20016Topic | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'timeRequired': value.timeRequired,
        'bookmarks': ((value.bookmarks as Array<any>).map(InlineResponse20016TopicBookmarksToJSON)),
    };
}

