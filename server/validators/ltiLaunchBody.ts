import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

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
  launch_presentation_return_url?: string;
}

export const ltiLaunchBodySchema = validationMetadatasToSchemas().LtiLaunchBody;
