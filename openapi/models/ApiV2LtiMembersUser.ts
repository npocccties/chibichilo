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
    ApiV2LtiMembersUserSettings,
    ApiV2LtiMembersUserSettingsFromJSON,
    ApiV2LtiMembersUserSettingsFromJSONTyped,
    ApiV2LtiMembersUserSettingsToJSON,
} from './';

/**
 * 
 * @export
 * @interface ApiV2LtiMembersUser
 */
export interface ApiV2LtiMembersUser {
    /**
     * 
     * @type {number}
     * @memberof ApiV2LtiMembersUser
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof ApiV2LtiMembersUser
     */
    ltiConsumerId: string;
    /**
     * 
     * @type {string}
     * @memberof ApiV2LtiMembersUser
     */
    ltiUserId: string;
    /**
     * 
     * @type {string}
     * @memberof ApiV2LtiMembersUser
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof ApiV2LtiMembersUser
     */
    email?: string;
    /**
     * 
     * @type {ApiV2LtiMembersUserSettings}
     * @memberof ApiV2LtiMembersUser
     */
    settings?: ApiV2LtiMembersUserSettings;
}

export function ApiV2LtiMembersUserFromJSON(json: any): ApiV2LtiMembersUser {
    return ApiV2LtiMembersUserFromJSONTyped(json, false);
}

export function ApiV2LtiMembersUserFromJSONTyped(json: any, ignoreDiscriminator: boolean): ApiV2LtiMembersUser {
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
    };
}

export function ApiV2LtiMembersUserToJSON(value?: ApiV2LtiMembersUser | null): any {
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
    };
}

