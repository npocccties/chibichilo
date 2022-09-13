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
import {
    InlineResponse2003Resource,
    InlineResponse2003ResourceFromJSON,
    InlineResponse2003ResourceFromJSONTyped,
    InlineResponse2003ResourceToJSON,
} from './';

/**
 * 成功時
 * @export
 * @interface InlineResponse20011
 */
export interface InlineResponse20011 {
    /**
     * 
     * @type {Array<InlineResponse2003Resource>}
     * @memberof InlineResponse20011
     */
    resources?: Array<InlineResponse2003Resource>;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20011
     */
    page?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20011
     */
    perPage?: number;
}

export function InlineResponse20011FromJSON(json: any): InlineResponse20011 {
    return InlineResponse20011FromJSONTyped(json, false);
}

export function InlineResponse20011FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20011 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'resources': !exists(json, 'resources') ? undefined : ((json['resources'] as Array<any>).map(InlineResponse2003ResourceFromJSON)),
        'page': !exists(json, 'page') ? undefined : json['page'],
        'perPage': !exists(json, 'perPage') ? undefined : json['perPage'],
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
        
        'resources': value.resources === undefined ? undefined : ((value.resources as Array<any>).map(InlineResponse2003ResourceToJSON)),
        'page': value.page,
        'perPage': value.perPage,
    };
}


