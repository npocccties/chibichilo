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
 * @interface InlineResponse2003PublicBooks
 */
export interface InlineResponse2003PublicBooks {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2003PublicBooks
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2003PublicBooks
     */
    bookId?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2003PublicBooks
     */
    userId?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof InlineResponse2003PublicBooks
     */
    domains?: Array<string>;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2003PublicBooks
     */
    expireAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2003PublicBooks
     */
    token?: string;
}

export function InlineResponse2003PublicBooksFromJSON(json: any): InlineResponse2003PublicBooks {
    return InlineResponse2003PublicBooksFromJSONTyped(json, false);
}

export function InlineResponse2003PublicBooksFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2003PublicBooks {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'bookId': !exists(json, 'bookId') ? undefined : json['bookId'],
        'userId': !exists(json, 'userId') ? undefined : json['userId'],
        'domains': !exists(json, 'domains') ? undefined : json['domains'],
        'expireAt': !exists(json, 'expireAt') ? undefined : (new Date(json['expireAt'])),
        'token': !exists(json, 'token') ? undefined : json['token'],
    };
}

export function InlineResponse2003PublicBooksToJSON(value?: InlineResponse2003PublicBooks | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'bookId': value.bookId,
        'userId': value.userId,
        'domains': value.domains,
        'expireAt': value.expireAt === undefined ? undefined : (value.expireAt.toISOString()),
        'token': value.token,
    };
}

