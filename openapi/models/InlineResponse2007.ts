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
    InlineResponse2002BookSettings,
    InlineResponse2002BookSettingsFromJSON,
    InlineResponse2002BookSettingsFromJSONTyped,
    InlineResponse2002BookSettingsToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse2007
 */
export interface InlineResponse2007 {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse2007
     */
    id: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    ltiConsumerId: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    ltiUserId: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse2007
     */
    email?: string;
    /**
     * 
     * @type {InlineResponse2002BookSettings}
     * @memberof InlineResponse2007
     */
    settings?: InlineResponse2002BookSettings;
}

export function InlineResponse2007FromJSON(json: any): InlineResponse2007 {
    return InlineResponse2007FromJSONTyped(json, false);
}

export function InlineResponse2007FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2007 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'ltiConsumerId': json['ltiConsumerId'],
        'ltiUserId': json['ltiUserId'],
        'name': json['name'],
        'email': !exists(json, 'email') ? undefined : json['email'],
        'settings': !exists(json, 'settings') ? undefined : InlineResponse2002BookSettingsFromJSON(json['settings']),
    };
}

export function InlineResponse2007ToJSON(value?: InlineResponse2007 | null): any {
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
        'settings': InlineResponse2002BookSettingsToJSON(value.settings),
    };
}


