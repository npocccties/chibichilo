import type { SessionSchema } from "$server/models/session";
import ltiResourceLink from "./ltiResourceLink";
import user from "./user";

const session: SessionSchema = {
  oauthClient: { id: "key", nonce: "1234567890" },
  ltiMessageType: "LtiResourceLinkRequest",
  ltiVersion: "1.3.0",
  ltiDeploymentId: "1",
  ltiTargetLinkUri: "http://localhost:3000/book?bookId=42",
  ltiUser: { id: "1234567890abcdefg", name: "山田 太郎" },
  ltiRoles: ["urn:lti:role:ims/lis/Instructor"],
  ltiResourceLinkRequest: { id: "_1234_1", title: "テスト教材" },
  ltiContext: {
    id: "1234567890abcdefg",
    title: "テストコース",
    label: "テストコース",
  },
  ltiResourceLink,
  user,
  systemSettings: { zoomImportEnabled: false, wowzaUploadEnabled: false },
};

export default session;
