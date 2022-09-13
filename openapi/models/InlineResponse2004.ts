/* tslint:disable */
/* eslint-disable */
/**
 * chibichilo-server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    InlineResponse2004Contents,
    InlineResponse2004ContentsFromJSON,
    InlineResponse2004ContentsFromJSONTyped,
    InlineResponse2004ContentsToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse2004
 */
export interface InlineResponse2004 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    totalCount: number;
    /**
     * 
     * @type {Array<InlineResponse2004Contents>}
     * @memberof InlineResponse2004
     */
    contents: Array<InlineResponse2004Contents>;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    page: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    perPage: number;
}

export function InlineResponse2004FromJSON(json: any): InlineResponse2004 {
    return InlineResponse2004FromJSONTyped(json, false);
}

export function InlineResponse2004FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2004 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'totalCount': json['totalCount'],
        'contents': ((json['contents'] as Array<any>).map(InlineResponse2004ContentsFromJSON)),
        'page': json['page'],
        'perPage': json['perPage'],
    };
}

export function InlineResponse2004ToJSON(value?: InlineResponse2004 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'totalCount': value.totalCount,
        'contents': ((value.contents as Array<any>).map(InlineResponse2004ContentsToJSON)),
        'page': value.page,
        'perPage': value.perPage,
    };
}


