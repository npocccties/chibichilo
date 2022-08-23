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
 * @interface InlineResponse20012
 */
export interface InlineResponse20012 {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    type: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    version: InlineResponse20012VersionEnum;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    title?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    author_name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    author_url?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    provider_name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    provider_url?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    cache_age?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    thumbnail_url?: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20012
     */
    thumbnail_width?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20012
     */
    thumbnail_height?: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20012
     */
    html?: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20012
     */
    width?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20012
     */
    height?: number;
}

export function InlineResponse20012FromJSON(json: any): InlineResponse20012 {
    return InlineResponse20012FromJSONTyped(json, false);
}

export function InlineResponse20012FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20012 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'version': json['version'],
        'title': !exists(json, 'title') ? undefined : json['title'],
        'author_name': !exists(json, 'author_name') ? undefined : json['author_name'],
        'author_url': !exists(json, 'author_url') ? undefined : json['author_url'],
        'provider_name': !exists(json, 'provider_name') ? undefined : json['provider_name'],
        'provider_url': !exists(json, 'provider_url') ? undefined : json['provider_url'],
        'cache_age': !exists(json, 'cache_age') ? undefined : json['cache_age'],
        'thumbnail_url': !exists(json, 'thumbnail_url') ? undefined : json['thumbnail_url'],
        'thumbnail_width': !exists(json, 'thumbnail_width') ? undefined : json['thumbnail_width'],
        'thumbnail_height': !exists(json, 'thumbnail_height') ? undefined : json['thumbnail_height'],
        'html': !exists(json, 'html') ? undefined : json['html'],
        'width': !exists(json, 'width') ? undefined : json['width'],
        'height': !exists(json, 'height') ? undefined : json['height'],
    };
}

export function InlineResponse20012ToJSON(value?: InlineResponse20012 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'version': value.version,
        'title': value.title,
        'author_name': value.author_name,
        'author_url': value.author_url,
        'provider_name': value.provider_name,
        'provider_url': value.provider_url,
        'cache_age': value.cache_age,
        'thumbnail_url': value.thumbnail_url,
        'thumbnail_width': value.thumbnail_width,
        'thumbnail_height': value.thumbnail_height,
        'html': value.html,
        'width': value.width,
        'height': value.height,
    };
}

/**
* @export
* @enum {string}
*/
export enum InlineResponse20012VersionEnum {
    _1_0 = '1.0'
}

