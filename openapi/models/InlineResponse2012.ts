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
/**
 * 
 * @export
 * @interface InlineResponse2012
 */
export interface InlineResponse2012 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2012
     */
    url?: string;
}

export function InlineResponse2012FromJSON(json: any): InlineResponse2012 {
    return InlineResponse2012FromJSONTyped(json, false);
}

export function InlineResponse2012FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2012 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'url': !exists(json, 'url') ? undefined : json['url'],
    };
}

export function InlineResponse2012ToJSON(value?: InlineResponse2012 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'url': value.url,
    };
}

