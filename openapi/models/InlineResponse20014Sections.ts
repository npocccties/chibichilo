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
import {
    InlineResponse2007Topic,
    InlineResponse2007TopicFromJSON,
    InlineResponse2007TopicFromJSONTyped,
    InlineResponse2007TopicToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse20014Sections
 */
export interface InlineResponse20014Sections {
    /**
     * 
     * @type {Array<InlineResponse2007Topic>}
     * @memberof InlineResponse20014Sections
     */
    topics: Array<InlineResponse2007Topic>;
}

export function InlineResponse20014SectionsFromJSON(json: any): InlineResponse20014Sections {
    return InlineResponse20014SectionsFromJSONTyped(json, false);
}

export function InlineResponse20014SectionsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20014Sections {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'topics': ((json['topics'] as Array<any>).map(InlineResponse2007TopicFromJSON)),
    };
}

export function InlineResponse20014SectionsToJSON(value?: InlineResponse20014Sections | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'topics': ((value.topics as Array<any>).map(InlineResponse2007TopicToJSON)),
    };
}


