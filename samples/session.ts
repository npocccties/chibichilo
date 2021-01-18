import ltiResourceLink from "./ltiResourceLink";
import user from "./user";

const session = {
  ltiLaunchBody: {
    oauth_version: "1.0",
    oauth_nonce: "1234567890",
    oauth_timestamp: "1234567890",
    oauth_consumer_key: "key",
    oauth_signature_method: "HMAC-SHA1",
    oauth_signature: "1234567890abcdeABCDE",
    lti_message_type: "basic-lti-launch-request",
    lti_version: "LTI-1p0",
    resource_link_id: "_1234_1",
    user_id: "1234567890abcdefg",
    roles: "urn:lti:role:ims/lis/Instructor",
    context_id: "1234567890abcdefg",
    resource_link_title: "テスト教材",
    context_title: "テストコース",
    lis_person_name_full: "山田 太郎",
  },
  ltiResourceLink,
  user,
};

export default session;
