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
 * @interface InlineResponse2005Keywords
 */
export interface InlineResponse2005Keywords {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2005Keywords
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2005Keywords
     */
    name: string;
}

export function InlineResponse2005KeywordsFromJSON(json: any): InlineResponse2005Keywords {
    return InlineResponse2005KeywordsFromJSONTyped(json, false);
}

export function InlineResponse2005KeywordsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2005Keywords {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
    };
}

export function InlineResponse2005KeywordsToJSON(value?: InlineResponse2005Keywords | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
    };
}


