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
 * @interface InlineResponse2001Keywords
 */
export interface InlineResponse2001Keywords {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2001Keywords
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2001Keywords
     */
    name: string;
}

export function InlineResponse2001KeywordsFromJSON(json: any): InlineResponse2001Keywords {
    return InlineResponse2001KeywordsFromJSONTyped(json, false);
}

export function InlineResponse2001KeywordsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2001Keywords {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'name': json['name'],
    };
}

export function InlineResponse2001KeywordsToJSON(value?: InlineResponse2001Keywords | null): any {
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

