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
 * 成功時
 * @export
 * @interface InlineResponse2006
 */
export interface InlineResponse2006 {
    /**
     * 
     * @type {Array<object>}
     * @memberof InlineResponse2006
     */
    resources?: Array<object>;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006
     */
    page?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006
     */
    perPage?: number;
}

export function InlineResponse2006FromJSON(json: any): InlineResponse2006 {
    return InlineResponse2006FromJSONTyped(json, false);
}

export function InlineResponse2006FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2006 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'resources': !exists(json, 'resources') ? undefined : json['resources'],
        'page': !exists(json, 'page') ? undefined : json['page'],
        'perPage': !exists(json, 'perPage') ? undefined : json['perPage'],
    };
}

export function InlineResponse2006ToJSON(value?: InlineResponse2006 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'resources': value.resources,
        'page': value.page,
        'perPage': value.perPage,
    };
}


