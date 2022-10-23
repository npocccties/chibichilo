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
 * @interface InlineResponse2004PublicBooks
 */
export interface InlineResponse2004PublicBooks {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004PublicBooks
     */
    id?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004PublicBooks
     */
    bookId?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2004PublicBooks
     */
    userId?: number;
    /**
     * 
     * @type {Array<string>}
     * @memberof InlineResponse2004PublicBooks
     */
    domains?: Array<string>;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2004PublicBooks
     */
    expireAt?: Date;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2004PublicBooks
     */
    token?: string;
}

export function InlineResponse2004PublicBooksFromJSON(json: any): InlineResponse2004PublicBooks {
    return InlineResponse2004PublicBooksFromJSONTyped(json, false);
}

export function InlineResponse2004PublicBooksFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2004PublicBooks {
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

export function InlineResponse2004PublicBooksToJSON(value?: InlineResponse2004PublicBooks | null): any {
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

