/* tslint:disable */
/* eslint-disable */
/**
 * chibichilo-server
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * The version of the OpenAPI document: 2.0.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { exists, mapValues } from '../runtime';
import {
    InlineResponse200,
    InlineResponse200FromJSON,
    InlineResponse200FromJSONTyped,
    InlineResponse200ToJSON,
    InlineResponse2001Author,
    InlineResponse2001AuthorFromJSON,
    InlineResponse2001AuthorFromJSONTyped,
    InlineResponse2001AuthorToJSON,
    InlineResponse2006LtiLaunchBody,
    InlineResponse2006LtiLaunchBodyFromJSON,
    InlineResponse2006LtiLaunchBodyFromJSONTyped,
    InlineResponse2006LtiLaunchBodyToJSON,
} from './';

/**
 * セッション情報
 * @export
 * @interface InlineResponse2006
 */
export interface InlineResponse2006 {
    /**
     * 
     * @type {InlineResponse2006LtiLaunchBody}
     * @memberof InlineResponse2006
     */
    ltiLaunchBody?: InlineResponse2006LtiLaunchBody;
    /**
     * 
     * @type {InlineResponse200}
     * @memberof InlineResponse2006
     */
    ltiResourceLink?: InlineResponse200;
    /**
     * 
     * @type {InlineResponse2001Author}
     * @memberof InlineResponse2006
     */
    user?: InlineResponse2001Author;
}

export function InlineResponse2006FromJSON(json: any): InlineResponse2006 {
    return InlineResponse2006FromJSONTyped(json, false);
}

export function InlineResponse2006FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse2006 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'ltiLaunchBody': !exists(json, 'ltiLaunchBody') ? undefined : InlineResponse2006LtiLaunchBodyFromJSON(json['ltiLaunchBody']),
        'ltiResourceLink': !exists(json, 'ltiResourceLink') ? undefined : InlineResponse200FromJSON(json['ltiResourceLink']),
        'user': !exists(json, 'user') ? undefined : InlineResponse2001AuthorFromJSON(json['user']),
    };
}

export function InlineResponse2006ToJSON(value?: InlineResponse2006 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'ltiLaunchBody': InlineResponse2006LtiLaunchBodyToJSON(value.ltiLaunchBody),
        'ltiResourceLink': InlineResponse200ToJSON(value.ltiResourceLink),
        'user': InlineResponse2001AuthorToJSON(value.user),
    };
}


