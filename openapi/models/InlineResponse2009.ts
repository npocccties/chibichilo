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
 * @interface InlineResponse2009
 */
export interface InlineResponse2009 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009
     */
    publicToken: string;
}

export function InlineResponse2009FromJSON(json: any): InlineResponse2009 {
    return InlineResponse2009FromJSONTyped(json, false);
}

export function InlineResponse2009FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2009 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'publicToken': json['publicToken'],
    };
}

export function InlineResponse2009ToJSON(value?: InlineResponse2009 | null): any {
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


