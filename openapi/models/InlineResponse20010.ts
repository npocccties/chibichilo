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
    InlineResponse20010BookActivities,
    InlineResponse20010BookActivitiesFromJSON,
    InlineResponse20010BookActivitiesFromJSONTyped,
    InlineResponse20010BookActivitiesToJSON,
    InlineResponse20010CourseBooks,
    InlineResponse20010CourseBooksFromJSON,
    InlineResponse20010CourseBooksFromJSONTyped,
    InlineResponse20010CourseBooksToJSON,
    InlineResponse2005Learner,
    InlineResponse2005LearnerFromJSON,
    InlineResponse2005LearnerFromJSONTyped,
    InlineResponse2005LearnerToJSON,
} from './';

/**
 * 成功時
 * @export
 * @interface InlineResponse20010
 */
export interface InlineResponse20010 {
    /**
     * 
     * @type {Array<InlineResponse2005Learner>}
     * @memberof InlineResponse20010
     */
    learners: Array<InlineResponse2005Learner>;
    /**
     * 
     * @type {Array<InlineResponse20010CourseBooks>}
     * @memberof InlineResponse20010
     */
    courseBooks: Array<InlineResponse20010CourseBooks>;
    /**
     * 
     * @type {Array<InlineResponse20010BookActivities>}
     * @memberof InlineResponse20010
     */
    bookActivities: Array<InlineResponse20010BookActivities>;
}

export function InlineResponse20010FromJSON(json: any): InlineResponse20010 {
    return InlineResponse20010FromJSONTyped(json, false);
}

export function InlineResponse20010FromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20010 {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'learners': ((json['learners'] as Array<any>).map(InlineResponse2005LearnerFromJSON)),
        'courseBooks': ((json['courseBooks'] as Array<any>).map(InlineResponse20010CourseBooksFromJSON)),
        'bookActivities': ((json['bookActivities'] as Array<any>).map(InlineResponse20010BookActivitiesFromJSON)),
    };
}

export function InlineResponse20010ToJSON(value?: InlineResponse20010 | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'learners': ((value.learners as Array<any>).map(InlineResponse2005LearnerToJSON)),
        'courseBooks': ((value.courseBooks as Array<any>).map(InlineResponse20010CourseBooksToJSON)),
        'bookActivities': ((value.bookActivities as Array<any>).map(InlineResponse20010BookActivitiesToJSON)),
    };
}

