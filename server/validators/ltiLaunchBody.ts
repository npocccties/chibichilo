import type { LtiLaunchPresentationSchema } from "$server/models/ltiLaunchPresentation";
import type { SessionSchema } from "$server/models/session";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

/**
 * LTI v1.1 起動時リクエスト
 * @deprecated
 */
export class LtiLaunchBody {
  @IsNotEmpty()
  @IsString()
  oauth_version!: string;

  @IsNotEmpty()
  @IsString()
  oauth_nonce!: string;

  @IsNotEmpty()
  @IsString()
  oauth_timestamp!: string;

  @IsNotEmpty()
  @IsString()
  oauth_consumer_key!: string;

  @IsNotEmpty()
  @IsString()
  oauth_signature_method!: string;

  @IsNotEmpty()
  @IsString()
  oauth_signature!: string;

  @IsNotEmpty()
  @IsString()
  lti_message_type!: string;

  @IsNotEmpty()
  @IsString()
  lti_version!: string;

  @IsNotEmpty()
  @IsString()
  resource_link_id!: string;

  @IsNotEmpty()
  @IsString()
  user_id!: string;

  @IsNotEmpty()
  @IsString()
  roles!: string;

  @IsNotEmpty()
  @IsString()
  context_id!: string;

  @IsOptional()
  @IsString()
  resource_link_title?: string;

  @IsOptional()
  @IsString()
  context_title?: string;

  @IsOptional()
  @IsString()
  context_label?: string;

  @IsOptional()
  @IsString()
  lis_person_name_full?: string;

  @IsOptional()
  @IsString()
  lis_person_contact_email_primary?: string;

  @IsOptional()
  @IsString()
  launch_presentation_return_url?: string;
}

export const ltiLaunchBodySchema = validationMetadatasToSchemas().LtiLaunchBody;

export function toSessionSchema(
  body: LtiLaunchBody
): Omit<SessionSchema, "ltiResourceLink" | "user" | "systemSettings"> {
  let ltiLaunchPresentation: undefined | LtiLaunchPresentationSchema;
  if ("launch_presentation_return_url" in body) {
    ltiLaunchPresentation = {
      returnUrl: body.launch_presentation_return_url,
    };
  }

  return {
    oauthClient: { id: body.oauth_consumer_key, nonce: body.oauth_nonce },
    ltiMessageType: "LtiResourceLinkRequest", // NOTE: basic-lti-launch-request だが前方互換
    ltiVersion: "1.0.0",
    ltiDeploymentId: "", // NOTE: 前方互換
    ltiUser: {
      id: body.user_id,
      name: body.lis_person_name_full,
      email: body.lis_person_contact_email_primary,
    },
    ltiRoles: body.roles.split(","),
    ltiResourceLinkRequest: {
      id: body.resource_link_id,
      title: body.resource_link_title,
    },
    ltiContext: {
      id: body.context_id,
      label: body.context_label,
      title: body.context_title,
    },
    ...(ltiLaunchPresentation && { ltiLaunchPresentation }),
  };
}
