import { isInstructor } from "./roles";
import { LtiLaunchBody } from "$server/validators/ltiLaunchBody";

describe("isInstructor()", function () {
  test("ロールが管理者", function () {
    const ltiLaunchBody = Object.assign(new LtiLaunchBody(), {
      oauth_version: "1.0",
      oauth_nonce: "fda3c48f27abd42ef090ec67d68c0c7d",
      oauth_timestamp: "1606374897",
      oauth_consumer_key: "test",
      oauth_signature_method: "HMAC-SHA1",
      oauth_signature: "bUsB7foUKLehmQDGE3PcouKw9rg=",
      lti_message_type: "basic-lti-launch-request",
      lti_version: "LTI-1p0",
      resource_link_id: "1",
      user_id: "2",
      roles:
        "urn:lti:sysrole:ims/lis/Administrator,urn:lti:instrole:ims/lis/Administrator",
      context_id: "2",
      resource_link_title: "chibichilo1",
      context_title: "1",
      lis_person_name_full: "Admin User",
    });

    expect(isInstructor(ltiLaunchBody)).toBe(true);
  });

  test("LIS Context Role 名前空間の省略", function () {
    const ltiLaunchBody = Object.assign(new LtiLaunchBody(), {
      oauth_version: "1.0",
      oauth_nonce: "fda3c48f27abd42ef090ec67d68c0c7d",
      oauth_timestamp: "1606374897",
      oauth_consumer_key: "test",
      oauth_signature_method: "HMAC-SHA1",
      oauth_signature: "bUsB7foUKLehmQDGE3PcouKw9rg=",
      lti_message_type: "basic-lti-launch-request",
      lti_version: "LTI-1p0",
      resource_link_id: "1",
      user_id: "2",
      roles: "Instructor",
      context_id: "2",
      resource_link_title: "chibichilo1",
      context_title: "1",
      lis_person_name_full: "Instructor User",
    });

    expect(isInstructor(ltiLaunchBody)).toBe(true);
  });
});
