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
 * @interface InlineResponse20011
 */
export interface InlineResponse20011 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20011
     */
    publicToken: string;
}

export function InlineResponse20011FromJSON(json: any): InlineResponse20011 {
    return InlineResponse20011FromJSONTyped(json, false);
}

export function InlineResponse20011FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20011 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'publicToken': json['publicToken'],
    };
}

export function InlineResponse20011ToJSON(value?: InlineResponse20011 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'publicToken': value.publicToken,
    };
}


