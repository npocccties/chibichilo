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
    InlineResponse2003BookAuthors,
    InlineResponse2003BookAuthorsFromJSON,
    InlineResponse2003BookAuthorsFromJSONTyped,
    InlineResponse2003BookAuthorsToJSON,
    InlineResponse2005Release,
    InlineResponse2005ReleaseFromJSON,
    InlineResponse2005ReleaseFromJSONTyped,
    InlineResponse2005ReleaseToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse2009Releases
 */
export interface InlineResponse2009Releases {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2009Releases
     */
    id?: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009Releases
     */
    name?: string;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2009Releases
     */
    publishedAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2009Releases
     */
    createdAt?: Date;
    /**
     * 
     * @type {Date}
     * @memberof InlineResponse2009Releases
     */
    updatedAt?: Date;
    /**
     * 
     * @type {Array<InlineResponse2003BookAuthors>}
     * @memberof InlineResponse2009Releases
     */
    authors?: Array<InlineResponse2003BookAuthors>;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009Releases
     */
    poid?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009Releases
     */
    oid?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009Releases
     */
    pid?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2009Releases
     */
    vid?: string;
    /**
     * 
     * @type {InlineResponse2005Release}
     * @memberof InlineResponse2009Releases
     */
    release?: InlineResponse2005Release;
}

export function InlineResponse2009ReleasesFromJSON(json: any): InlineResponse2009Releases {
    return InlineResponse2009ReleasesFromJSONTyped(json, false);
}

export function InlineResponse2009ReleasesFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2009Releases {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': !exists(json, 'id') ? undefined : json['id'],
        'name': !exists(json, 'name') ? undefined : json['name'],
        'publishedAt': !exists(json, 'publishedAt') ? undefined : (new Date(json['publishedAt'])),
        'createdAt': !exists(json, 'createdAt') ? undefined : (new Date(json['createdAt'])),
        'updatedAt': !exists(json, 'updatedAt') ? undefined : (new Date(json['updatedAt'])),
        'authors': !exists(json, 'authors') ? undefined : ((json['authors'] as Array<any>).map(InlineResponse2003BookAuthorsFromJSON)),
        'poid': !exists(json, 'poid') ? undefined : json['poid'],
        'oid': !exists(json, 'oid') ? undefined : json['oid'],
        'pid': !exists(json, 'pid') ? undefined : json['pid'],
        'vid': !exists(json, 'vid') ? undefined : json['vid'],
        'release': !exists(json, 'release') ? undefined : InlineResponse2005ReleaseFromJSON(json['release']),
    };
}

export function InlineResponse2009ReleasesToJSON(value?: InlineResponse2009Releases | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'name': value.name,
        'publishedAt': value.publishedAt === undefined ? undefined : (value.publishedAt.toISOString()),
        'createdAt': value.createdAt === undefined ? undefined : (value.createdAt.toISOString()),
        'updatedAt': value.updatedAt === undefined ? undefined : (value.updatedAt.toISOString()),
        'authors': value.authors === undefined ? undefined : ((value.authors as Array<any>).map(InlineResponse2003BookAuthorsToJSON)),
        'poid': value.poid,
        'oid': value.oid,
        'pid': value.pid,
        'vid': value.vid,
        'release': InlineResponse2005ReleaseToJSON(value.release),
    };
}


