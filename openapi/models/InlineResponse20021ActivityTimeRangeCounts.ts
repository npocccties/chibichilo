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
/**
 * 
 * @export
 * @interface InlineResponse20021ActivityTimeRangeCounts
 */
export interface InlineResponse20021ActivityTimeRangeCounts {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20021ActivityTimeRangeCounts
     */
    activityId?: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20021ActivityTimeRangeCounts
     */
    startMs: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20021ActivityTimeRangeCounts
     */
    endMs: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20021ActivityTimeRangeCounts
     */
    count?: number;
}

export function InlineResponse20021ActivityTimeRangeCountsFromJSON(json: any): InlineResponse20021ActivityTimeRangeCounts {
    return InlineResponse20021ActivityTimeRangeCountsFromJSONTyped(json, false);
}

export function InlineResponse20021ActivityTimeRangeCountsFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20021ActivityTimeRangeCounts {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'activityId': !exists(json, 'activityId') ? undefined : json['activityId'],
        'startMs': json['startMs'],
        'endMs': json['endMs'],
        'count': !exists(json, 'count') ? undefined : json['count'],
    };
}

export function InlineResponse20021ActivityTimeRangeCountsToJSON(value?: InlineResponse20021ActivityTimeRangeCounts | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'activityId': value.activityId,
        'startMs': value.startMs,
        'endMs': value.endMs,
        'count': value.count,
    };
}


