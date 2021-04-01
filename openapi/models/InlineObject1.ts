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
    ApiV2BookBookIdSections,
    ApiV2BookBookIdSectionsFromJSON,
    ApiV2BookBookIdSectionsFromJSONTyped,
    ApiV2BookBookIdSectionsToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineObject1
 */
export interface InlineObject1 {
    /**
     * 
     * @type {string}
     * @memberof InlineObject1
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineObject1
     */
    description?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineObject1
     */
    language?: string;
    /**
     * 
     * @type {boolean}
     * @memberof InlineObject1
     */
    shared?: boolean;
    /**
     * 
     * @type {Array<ApiV2BookBookIdSections>}
     * @memberof InlineObject1
     */
    sections?: Array<ApiV2BookBookIdSections>;
}

export function InlineObject1FromJSON(json: any): InlineObject1 {
    return InlineObject1FromJSONTyped(json, false);
}

export function InlineObject1FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject1 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': !exists(json, 'name') ? undefined : json['name'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'language': !exists(json, 'language') ? undefined : json['language'],
        'shared': !exists(json, 'shared') ? undefined : json['shared'],
        'sections': !exists(json, 'sections') ? undefined : ((json['sections'] as Array<any>).map(ApiV2BookBookIdSectionsFromJSON)),
    };
}

export function InlineObject1ToJSON(value?: InlineObject1 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'description': value.description,
        'language': value.language,
        'shared': value.shared,
        'sections': value.sections === undefined ? undefined : ((value.sections as Array<any>).map(ApiV2BookBookIdSectionsToJSON)),
    };
}

