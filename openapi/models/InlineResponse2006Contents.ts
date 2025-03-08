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
    InlineResponse2004BookAuthors,
    InlineResponse2004BookAuthorsFromJSON,
    InlineResponse2004BookAuthorsFromJSONTyped,
    InlineResponse2004BookAuthorsToJSON,
    InlineResponse2005,
    InlineResponse2005FromJSON,
    InlineResponse2005FromJSONTyped,
    InlineResponse2005ToJSON,
    InlineResponse2006Keywords,
    InlineResponse2006KeywordsFromJSON,
    InlineResponse2006KeywordsFromJSONTyped,
    InlineResponse2006KeywordsToJSON,
    InlineResponse2006PublicBooks,
    InlineResponse2006PublicBooksFromJSON,
    InlineResponse2006PublicBooksFromJSONTyped,
    InlineResponse2006PublicBooksToJSON,
    InlineResponse2006RelatedBooks,
    InlineResponse2006RelatedBooksFromJSON,
    InlineResponse2006RelatedBooksFromJSONTyped,
    InlineResponse2006RelatedBooksToJSON,
    InlineResponse2006Resource,
    InlineResponse2006ResourceFromJSON,
    InlineResponse2006ResourceFromJSONTyped,
    InlineResponse2006ResourceToJSON,
    InlineResponse2006Sections,
    InlineResponse2006SectionsFromJSON,
    InlineResponse2006SectionsFromJSONTyped,
    InlineResponse2006SectionsToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse2006Contents
 */
export interface InlineResponse2006Contents {
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Contents
     */
    type: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006Contents
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Contents
     */
    name?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Contents
     */
    language?: string;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006Contents
     */
    timeRequired?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006Contents
     */
    startTime?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2006Contents
     */
    stopTime?: number;
    /**
     * 
     * @type {boolean}
     * @memberof InlineResponse2006Contents
     */
    shared?: boolean;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Contents
     */
    license?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2006Contents
     */
    description?: string;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2006Contents
     */
    createdAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2006Contents
     */
    updatedAt?: Date;
    /**
     * 
     * @type {object}
     * @memberof InlineResponse2006Contents
     */
    details?: object;
    /**
     * 
     * @type {Array<InlineResponse2004BookAuthors>}
     * @memberof InlineResponse2006Contents
     */
    authors?: Array<InlineResponse2004BookAuthors>;
    /**
     * 
     * @type {Array<InlineResponse2006Keywords>}
     * @memberof InlineResponse2006Contents
     */
    keywords?: Array<InlineResponse2006Keywords>;
    /**
     * 
     * @type {Array<InlineResponse2006RelatedBooks>}
     * @memberof InlineResponse2006Contents
     */
    relatedBooks?: Array<InlineResponse2006RelatedBooks>;
    /**
     * 
     * @type {InlineResponse2006Resource}
     * @memberof InlineResponse2006Contents
     */
    resource?: InlineResponse2006Resource;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2006Contents
     */
    publishedAt?: Date;
    /**
     * 
     * @type {Array<InlineResponse2006Sections>}
     * @memberof InlineResponse2006Contents
     */
    sections?: Array<InlineResponse2006Sections>;
    /**
     * 
     * @type {Array<InlineResponse2005>}
     * @memberof InlineResponse2006Contents
     */
    ltiResourceLinks?: Array<InlineResponse2005>;
    /**
     * 
     * @type {Array<InlineResponse2006PublicBooks>}
     * @memberof InlineResponse2006Contents
     */
    publicBooks?: Array<InlineResponse2006PublicBooks>;
}

export function InlineResponse2006ContentsFromJSON(json: any): InlineResponse2006Contents {
    return InlineResponse2006ContentsFromJSONTyped(json, false);
}

export function InlineResponse2006ContentsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2006Contents {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'type': json['type'],
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'language': !exists(json, 'language') ? undefined : json['language'],
        'timeRequired': !exists(json, 'timeRequired') ? undefined : json['timeRequired'],
        'startTime': !exists(json, 'startTime') ? undefined : json['startTime'],
        'stopTime': !exists(json, 'stopTime') ? undefined : json['stopTime'],
        'shared': !exists(json, 'shared') ? undefined : json['shared'],
        'license': !exists(json, 'license') ? undefined : json['license'],
        'description': !exists(json, 'description') ? undefined : json['description'],
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'updatedAt': !exists(json, 'updatedAt') ? undefined : (new Date(json['updatedAt'])),
        'details': !exists(json, 'details') ? undefined : json['details'],
        'authors': !exists(json, 'authors') ? undefined : ((json['authors'] as Array<any>).map(InlineResponse2004BookAuthorsFromJSON)),
        'keywords': !exists(json, 'keywords') ? undefined : ((json['keywords'] as Array<any>).map(InlineResponse2006KeywordsFromJSON)),
        'relatedBooks': !exists(json, 'relatedBooks') ? undefined : ((json['relatedBooks'] as Array<any>).map(InlineResponse2006RelatedBooksFromJSON)),
        'resource': !exists(json, 'resource') ? undefined : InlineResponse2006ResourceFromJSON(json['resource']),
        'publishedAt': !exists(json, 'publishedAt') ? undefined : (new Date(json['publishedAt'])),
        'sections': !exists(json, 'sections') ? undefined : ((json['sections'] as Array<any>).map(InlineResponse2006SectionsFromJSON)),
        'ltiResourceLinks': !exists(json, 'ltiResourceLinks') ? undefined : ((json['ltiResourceLinks'] as Array<any>).map(InlineResponse2005FromJSON)),
        'publicBooks': !exists(json, 'publicBooks') ? undefined : ((json['publicBooks'] as Array<any>).map(InlineResponse2006PublicBooksFromJSON)),
    };
}

export function InlineResponse2006ContentsToJSON(value?: InlineResponse2006Contents | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'type': value.type,
        'id': value.id,
        'name': value.name,
        'language': value.language,
        'timeRequired': value.timeRequired,
        'startTime': value.startTime,
        'stopTime': value.stopTime,
        'shared': value.shared,
        'license': value.license,
        'description': value.description,
        'createdAt': value.createdAt === undefined ? undefined : (value.createdAt.toISOString()),
        'updatedAt': value.updatedAt === undefined ? undefined : (value.updatedAt.toISOString()),
        'details': value.details,
        'authors': value.authors === undefined ? undefined : ((value.authors as Array<any>).map(InlineResponse2004BookAuthorsToJSON)),
        'keywords': value.keywords === undefined ? undefined : ((value.keywords as Array<any>).map(InlineResponse2006KeywordsToJSON)),
        'relatedBooks': value.relatedBooks === undefined ? undefined : ((value.relatedBooks as Array<any>).map(InlineResponse2006RelatedBooksToJSON)),
        'resource': InlineResponse2006ResourceToJSON(value.resource),
        'publishedAt': value.publishedAt === undefined ? undefined : (value.publishedAt.toISOString()),
        'sections': value.sections === undefined ? undefined : ((value.sections as Array<any>).map(InlineResponse2006SectionsToJSON)),
        'ltiResourceLinks': value.ltiResourceLinks === undefined ? undefined : ((value.ltiResourceLinks as Array<any>).map(InlineResponse2005ToJSON)),
        'publicBooks': value.publicBooks === undefined ? undefined : ((value.publicBooks as Array<any>).map(InlineResponse2006PublicBooksToJSON)),
    };
}


