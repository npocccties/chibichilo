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
 * @interface InlineResponse20021
 */
export interface InlineResponse20021 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20021
     */
    text: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20021
     */
    value: number;
}

export function InlineResponse20021FromJSON(json: any): InlineResponse20021 {
    return InlineResponse20021FromJSONTyped(json, false);
}

export function InlineResponse20021FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20021 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'text': json['text'],
        'value': json['value'],
    };
}

export function InlineResponse20021ToJSON(value?: InlineResponse20021 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'text': value.text,
        'value': value.value,
    };
}


