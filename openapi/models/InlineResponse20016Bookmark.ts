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
    InlineResponse20016Tag,
    InlineResponse20016TagFromJSON,
    InlineResponse20016TagFromJSONTyped,
    InlineResponse20016TagToJSON,
    InlineResponse20016Topic,
    InlineResponse20016TopicFromJSON,
    InlineResponse20016TopicFromJSONTyped,
    InlineResponse20016TopicToJSON,
    LTIContext,
    LTIContextFromJSON,
    LTIContextFromJSONTyped,
    LTIContextToJSON,
} from './';

/**
 * 
 * @export
 * @interface InlineResponse20016Bookmark
 */
export interface InlineResponse20016Bookmark {
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Bookmark
     */
    id: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Bookmark
     */
    topicId: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Bookmark
     */
    tagId: number;
    /**
     * 
     * @type {number}
     * @memberof InlineResponse20016Bookmark
     */
    userId: number;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20016Bookmark
     */
    ltiContextId?: string;
    /**
     * 
     * @type {string}
     * @memberof InlineResponse20016Bookmark
     */
    ltiConsumerId?: string;
    /**
     * 
     * @type {InlineResponse20016Tag}
     * @memberof InlineResponse20016Bookmark
     */
    tag: InlineResponse20016Tag;
    /**
     * 
     * @type {InlineResponse20016Topic}
     * @memberof InlineResponse20016Bookmark
     */
    topic: InlineResponse20016Topic;
    /**
     * 
     * @type {LTIContext}
     * @memberof InlineResponse20016Bookmark
     */
    ltiContext: LTIContext;
}

export function InlineResponse20016BookmarkFromJSON(json: any): InlineResponse20016Bookmark {
    return InlineResponse20016BookmarkFromJSONTyped(json, false);
}

export function InlineResponse20016BookmarkFromJSONTyped(json: any, ignoreDiscriminator: boolean): InlineResponse20016Bookmark {
    if ((json === undefined) || (json === null)) {
        return json;
    }
    return {
        
        'id': json['id'],
        'topicId': json['topicId'],
        'tagId': json['tagId'],
        'userId': json['userId'],
        'ltiContextId': !exists(json, 'ltiContextId') ? undefined : json['ltiContextId'],
        'ltiConsumerId': !exists(json, 'ltiConsumerId') ? undefined : json['ltiConsumerId'],
        'tag': InlineResponse20016TagFromJSON(json['tag']),
        'topic': InlineResponse20016TopicFromJSON(json['topic']),
        'ltiContext': LTIContextFromJSON(json['ltiContext']),
    };
}

export function InlineResponse20016BookmarkToJSON(value?: InlineResponse20016Bookmark | null): any {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    return {
        
        'id': value.id,
        'topicId': value.topicId,
        'tagId': value.tagId,
        'userId': value.userId,
        'ltiContextId': value.ltiContextId,
        'ltiConsumerId': value.ltiConsumerId,
        'tag': InlineResponse20016TagToJSON(value.tag),
        'topic': InlineResponse20016TopicToJSON(value.topic),
        'ltiContext': LTIContextToJSON(value.ltiContext),
    };
}


