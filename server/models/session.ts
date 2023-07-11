import type { LtiResourceLinkSchema } from "./ltiResourceLink";
import { ltiResourceLinkSchema } from "./ltiResourceLink";
import { UserSchema } from "$server/models/user";
import { OauthClientSchema } from "./oauthClient";
import { LtiMessageTypeSchema } from "./ltiMessageType";
import { LtiVersionSchema } from "./ltiVersion";
import { LtiDeploymentIdSchema } from "./ltiDeploymentId";
import { LtiTargetLinkUriSchema } from "./ltiTargetLinkUri";
import { LtiUserSchema } from "./ltiUser";
import { LtiRolesSchema } from "./ltiRoles";
import { LtiResourceLinkRequestSchema } from "./ltiResourceLinkRequest";
import { LtiContextSchema } from "./ltiContext";
import { LtiLaunchPresentationSchema } from "./ltiLaunchPresentation";
import { LtiAgsEndpointSchema } from "./ltiAgsEndpoint";
import { LtiNrpsParameterSchema } from "./ltiNrpsParameter";
import { LtiDlSettingsSchema } from "./ltiDlSettings";
import { SystemSettingsSchema } from "./systemSettings";

/** セッション */
export type SessionSchema = {
  oauthClient: OauthClientSchema;
  ltiMessageType: LtiMessageTypeSchema;
  ltiVersion: LtiVersionSchema;
  ltiDeploymentId: LtiDeploymentIdSchema;
  ltiTargetLinkUri?: LtiTargetLinkUriSchema;
  ltiUser: LtiUserSchema;
  ltiRoles: LtiRolesSchema;
  ltiResourceLinkRequest?: LtiResourceLinkRequestSchema;
  ltiContext: LtiContextSchema;
  ltiLaunchPresentation?: LtiLaunchPresentationSchema;
  ltiAgsEndpoint?: LtiAgsEndpointSchema;
  ltiNrpsParameter?: LtiNrpsParameterSchema;
  ltiDlSettings?: LtiDlSettingsSchema;
  ltiResourceLink: null | LtiResourceLinkSchema;
  user: UserSchema;
  systemSettings: SystemSettingsSchema;
};

export const sessionSchema = {
  description: "セッション情報",
  type: "object",
  required: [
    "oauthClient",
    "ltiMessageType",
    "ltiVersion",
    "ltiDeploymentId",
    "ltiUser",
    "ltiRoles",
    "ltiContext",
    "user",
    "systemSettings",
  ],
  properties: {
    oauthClient: OauthClientSchema,
    ltiMessageType: LtiMessageTypeSchema,
    ltiVersion: LtiVersionSchema,
    ltiDeploymentId: LtiDeploymentIdSchema,
    ltiTargetLinkUri: LtiTargetLinkUriSchema,
    ltiUser: LtiUserSchema,
    ltiRoles: LtiRolesSchema,
    ltiResourceLinkRequest: LtiResourceLinkRequestSchema,
    ltiContext: LtiContextSchema,
    ltiLaunchPresentation: LtiLaunchPresentationSchema,
    ltiAgsEndpoint: LtiAgsEndpointSchema,
    ltiNrpsParameter: LtiNrpsParameterSchema,
    ltiDlSettings: LtiDlSettingsSchema,
    ltiResourceLink: {
      ...ltiResourceLinkSchema,
      nullable: true,
    },
    user: UserSchema,
    systemSettings: SystemSettingsSchema,
  },
  additionalProperties: false,
} as const;
