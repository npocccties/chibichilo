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
    ApiV2TopicTopicIdActivityTimeRanges,
    ApiV2TopicTopicIdActivityTimeRangesFromJSON,
    ApiV2TopicTopicIdActivityTimeRangesFromJSONTyped,
    ApiV2TopicTopicIdActivityTimeRangesToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineObject12
 */
export interface InlineObject12 {
    /**
     * 
     * @type {Array<ApiV2TopicTopicIdActivityTimeRanges>}
     * @memberof InlineObject12
     */
    timeRanges: Array<ApiV2TopicTopicIdActivityTimeRanges>;
}

export function InlineObject12FromJSON(json: any): InlineObject12 {
    return InlineObject12FromJSONTyped(json, false);
}

export function InlineObject12FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineObject12 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'timeRanges': ((json['timeRanges'] as Array<any>).map(ApiV2TopicTopicIdActivityTimeRangesFromJSON)),
    };
}

export function InlineObject12ToJSON(value?: InlineObject12 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'timeRanges': ((value.timeRanges as Array<any>).map(ApiV2TopicTopicIdActivityTimeRangesToJSON)),
    };
}


