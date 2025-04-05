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
import {
    InlineResponse2007Books,
    InlineResponse2007BooksFromJSON,
    InlineResponse2007BooksFromJSONTyped,
    InlineResponse2007BooksToJSON,
} from './';

/**
 * 成功時
 * @export
 * @interface InlineResponse20013
 */
export interface InlineResponse20013 {
    /**
     * 
     * @type {Array<InlineResponse2007Books>}
     * @memberof InlineResponse20013
     */
    books?: Array<InlineResponse2007Books>;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20013
     */
    page?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20013
     */
    perPage?: number;
}

export function InlineResponse20013FromJSON(json: any): InlineResponse20013 {
    return InlineResponse20013FromJSONTyped(json, false);
}

export function InlineResponse20013FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20013 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'books': !exists(json, 'books') ? undefined : ((json['books'] as Array<any>).map(InlineResponse2007BooksFromJSON)),
        'page': !exists(json, 'page') ? undefined : json['page'],
        'perPage': !exists(json, 'perPage') ? undefined : json['perPage'],
    };
}

export function InlineResponse20013ToJSON(value?: InlineResponse20013 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'books': value.books === undefined ? undefined : ((value.books as Array<any>).map(InlineResponse2007BooksToJSON)),
        'page': value.page,
        'perPage': value.perPage,
    };
}


