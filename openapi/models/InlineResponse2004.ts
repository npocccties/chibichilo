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
    InlineResponse2004Books,
    InlineResponse2004BooksFromJSON,
    InlineResponse2004BooksFromJSONTyped,
    InlineResponse2004BooksToJSON,
} from './';

/**
 * 作成したブックの一覧
 * @export
 * @interface InlineResponse2004
 */
export interface InlineResponse2004 {
    /**
     * 
     * @type {Array<InlineResponse2004Books>}
     * @memberof InlineResponse2004
     */
    books?: Array<InlineResponse2004Books>;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    page?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004
     */
    perPage?: number;
}

export function InlineResponse2004FromJSON(json: any): InlineResponse2004 {
    return InlineResponse2004FromJSONTyped(json, false);
}

export function InlineResponse2004FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2004 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'books': !exists(json, 'books') ? undefined : ((json['books'] as Array<any>).map(InlineResponse2004BooksFromJSON)),
        'page': !exists(json, 'page') ? undefined : json['page'],
        'perPage': !exists(json, 'perPage') ? undefined : json['perPage'],
    };
}

export function InlineResponse2004ToJSON(value?: InlineResponse2004 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'books': value.books === undefined ? undefined : ((value.books as Array<any>).map(InlineResponse2004BooksToJSON)),
        'page': value.page,
        'perPage': value.perPage,
    };
}


