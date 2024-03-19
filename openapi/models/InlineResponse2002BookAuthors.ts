/* tslint:disable */
/* eslint-disable */
/**
 * chibichilo-server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.3.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    ApiV2LtiMembersUserSettings,
    ApiV2LtiMembersUserSettingsFromJSON,
    ApiV2LtiMembersUserSettingsFromJSONTyped,
    ApiV2LtiMembersUserSettingsToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse2002BookAuthors
 */
export interface InlineResponse2002BookAuthors {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2002BookAuthors
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002BookAuthors
     */
    ltiConsumerId: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002BookAuthors
     */
    ltiUserId: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002BookAuthors
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002BookAuthors
     */
    email?: string;
    /**
     * 
     * @type {ApiV2LtiMembersUserSettings}
     * @memberof InlineResponse2002BookAuthors
     */
    settings?: ApiV2LtiMembersUserSettings;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2002BookAuthors
     */
    roleName: string;
}

export function InlineResponse2002BookAuthorsFromJSON(json: any): InlineResponse2002BookAuthors {
    return InlineResponse2002BookAuthorsFromJSONTyped(json, false);
}

export function InlineResponse2002BookAuthorsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2002BookAuthors {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'ltiConsumerId': json['ltiConsumerId'],
        'ltiUserId': json['ltiUserId'],
        'name': json['name'],
        'email': !exists(json, 'email') ? undefined : json['email'],
        'settings': !exists(json, 'settings') ? undefined : ApiV2LtiMembersUserSettingsFromJSON(json['settings']),
        'roleName': json['roleName'],
    };
}

export function InlineResponse2002BookAuthorsToJSON(value?: InlineResponse2002BookAuthors | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'ltiConsumerId': value.ltiConsumerId,
        'ltiUserId': value.ltiUserId,
        'name': value.name,
        'email': value.email,
        'settings': ApiV2LtiMembersUserSettingsToJSON(value.settings),
        'roleName': value.roleName,
    };
}

