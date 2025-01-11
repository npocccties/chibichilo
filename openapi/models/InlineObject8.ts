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
 * 
 * @export
 * @interface InlineObject8
 */
export interface InlineObject8 {
    /**
     * 
     * @type {string}
     * @memberof InlineObject8
     */
    version?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineObject8
     */
    comment?: string;
    /**
     * 
     * @type {boolean}
     * @memberof InlineObject8
     */
    shared?: boolean;
    /**
     * 
     * @type {Array<number>}
     * @memberof InlineObject8
     */
    topics?: Array<number>;
}

export function InlineObject8FromJSON(json: any): InlineObject8 {
    return InlineObject8FromJSONTyped(json, false);
}

export function InlineObject8FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject8 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'version': !exists(json, 'version') ? undefined : json['version'],
        'comment': !exists(json, 'comment') ? undefined : json['comment'],
        'shared': !exists(json, 'shared') ? undefined : json['shared'],
        'topics': !exists(json, 'topics') ? undefined : json['topics'],
    };
}

export function InlineObject8ToJSON(value?: InlineObject8 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'version': value.version,
        'comment': value.comment,
        'shared': value.shared,
        'topics': value.topics,
    };
}


