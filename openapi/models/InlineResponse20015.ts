/* tslint:disable */
/* eslint-disable */
/**
 * chibichilo-server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.3.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    InlineResponse20015Bookmark,
    InlineResponse20015BookmarkFromJSON,
    InlineResponse20015BookmarkFromJSONTyped,
    InlineResponse20015BookmarkToJSON,
} from './';

/**
 * 成功時
 * @export
 * @interface InlineResponse20015
 */
export interface InlineResponse20015 {
    /**
     * 
     * @type {Array<InlineResponse20015Bookmark>}
     * @memberof InlineResponse20015
     */
    bookmark: Array<InlineResponse20015Bookmark>;
}

export function InlineResponse20015FromJSON(json: any): InlineResponse20015 {
    return InlineResponse20015FromJSONTyped(json, false);
}

export function InlineResponse20015FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20015 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'bookmark': ((json['bookmark'] as Array<any>).map(InlineResponse20015BookmarkFromJSON)),
    };
}

export function InlineResponse20015ToJSON(value?: InlineResponse20015 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'bookmark': ((value.bookmark as Array<any>).map(InlineResponse20015BookmarkToJSON)),
    };
}


