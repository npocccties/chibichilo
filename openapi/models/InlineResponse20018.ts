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
    InlineResponse20017BookmarkTagMenu,
    InlineResponse20017BookmarkTagMenuFromJSON,
    InlineResponse20017BookmarkTagMenuFromJSONTyped,
    InlineResponse20017BookmarkTagMenuToJSON,
} from './';

/**
 * 成功時
 * @export
 * @interface InlineResponse20018
 */
export interface InlineResponse20018 {
    /**
     * 
     * @type {Array<InlineResponse20017BookmarkTagMenu>}
     * @memberof InlineResponse20018
     */
    bookmarkTagMenu: Array<InlineResponse20017BookmarkTagMenu>;
}

export function InlineResponse20018FromJSON(json: any): InlineResponse20018 {
    return InlineResponse20018FromJSONTyped(json, false);
}

export function InlineResponse20018FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20018 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'bookmarkTagMenu': ((json['bookmarkTagMenu'] as Array<any>).map(InlineResponse20017BookmarkTagMenuFromJSON)),
    };
}

export function InlineResponse20018ToJSON(value?: InlineResponse20018 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'bookmarkTagMenu': ((value.bookmarkTagMenu as Array<any>).map(InlineResponse20017BookmarkTagMenuToJSON)),
    };
}


