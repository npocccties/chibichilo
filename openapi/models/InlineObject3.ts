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
    ApiV2BookBookIdKeywords,
    ApiV2BookBookIdKeywordsFromJSON,
    ApiV2BookBookIdKeywordsFromJSONTyped,
    ApiV2BookBookIdKeywordsToJSON,
    ApiV2BookBookIdSections,
    ApiV2BookBookIdSectionsFromJSON,
    ApiV2BookBookIdSectionsFromJSONTyped,
    ApiV2BookBookIdSectionsToJSON,
    InlineResponse2006PublicBooks,
    InlineResponse2006PublicBooksFromJSON,
    InlineResponse2006PublicBooksFromJSONTyped,
    InlineResponse2006PublicBooksToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineObject3
 */
export interface InlineObject3 {
    /**
     * 
     * @type {string}
     * @memberof InlineObject3
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineObject3
     */
    description?: string;
    /**
     * 
     * @type {boolean}
     * @memberof InlineObject3
     */
    shared?: boolean;
    /**
     * 
     * @type {Array<ApiV2BookBookIdSections>}
     * @memberof InlineObject3
     */
    sections?: Array<ApiV2BookBookIdSections>;
    /**
     * 
     * @type {Array<ApiV2BookBookIdKeywords>}
     * @memberof InlineObject3
     */
    keywords?: Array<ApiV2BookBookIdKeywords>;
    /**
     * 
     * @type {Array<InlineResponse2006PublicBooks>}
     * @memberof InlineObject3
     */
    publicBooks?: Array<InlineResponse2006PublicBooks>;
}

export function InlineObject3FromJSON(json: any): InlineObject3 {
    return InlineObject3FromJSONTyped(json, false);
}

export function InlineObject3FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject3 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'name': !exists(json, 'name') ? undefined : json['name'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'shared': !exists(json, 'shared') ? undefined : json['shared'],
        'sections': !exists(json, 'sections') ? undefined : ((json['sections'] as Array<any>).map(ApiV2BookBookIdSectionsFromJSON)),
        'keywords': !exists(json, 'keywords') ? undefined : ((json['keywords'] as Array<any>).map(ApiV2BookBookIdKeywordsFromJSON)),
        'publicBooks': !exists(json, 'publicBooks') ? undefined : ((json['publicBooks'] as Array<any>).map(InlineResponse2006PublicBooksFromJSON)),
    };
}

export function InlineObject3ToJSON(value?: InlineObject3 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'name': value.name,
        'description': value.description,
        'shared': value.shared,
        'sections': value.sections === undefined ? undefined : ((value.sections as Array<any>).map(ApiV2BookBookIdSectionsToJSON)),
        'keywords': value.keywords === undefined ? undefined : ((value.keywords as Array<any>).map(ApiV2BookBookIdKeywordsToJSON)),
        'publicBooks': value.publicBooks === undefined ? undefined : ((value.publicBooks as Array<any>).map(InlineResponse2006PublicBooksToJSON)),
    };
}


