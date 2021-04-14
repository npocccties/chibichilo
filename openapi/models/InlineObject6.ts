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
/**
 * 
 * @export
 * @interface InlineObject6
 */
export interface InlineObject6 {
    /**
     * 
     * @type {string}
     * @memberof InlineObject6
     */
    language?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineObject6
     */
    content?: string;
}

export function InlineObject6FromJSON(json: any): InlineObject6 {
    return InlineObject6FromJSONTyped(json, false);
}

export function InlineObject6FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject6 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'language': !exists(json, 'language') ? undefined : json['language'],
        'content': !exists(json, 'content') ? undefined : json['content'],
    };
}

export function InlineObject6ToJSON(value?: InlineObject6 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'language': value.language,
        'content': value.content,
    };
}

