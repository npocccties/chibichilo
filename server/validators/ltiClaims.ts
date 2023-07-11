import {
  Equals,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsIn,
  MaxLength,
  ValidateNested,
  IsBoolean,
} from "class-validator";
import { LtiMessageTypeSchema } from "$server/models/ltiMessageType";
import { LtiDeploymentIdSchema } from "$server/models/ltiDeploymentId";
import { LtiTargetLinkUriSchema } from "$server/models/ltiTargetLinkUri";
import { LtiDlSettingsSchema } from "$server/models/ltiDlSettings";

/** LTI v1.3 Message Claims */
export class LtiClaims {
  constructor(props?: Partial<LtiClaims>) {
    if (!props) return;
    Object.assign(this, {
      ...props,
      "https://purl.imsglobal.org/spec/lti/claim/context": new ContextClaim(
        props["https://purl.imsglobal.org/spec/lti/claim/context"]
      ),
    });
    if ("https://purl.imsglobal.org/spec/lti/claim/resource_link" in props) {
      Object.assign(this, {
        "https://purl.imsglobal.org/spec/lti/claim/resource_link":
          new ResourceLinkClaim(
            props["https://purl.imsglobal.org/spec/lti/claim/resource_link"]
          ),
      });
    }
    if (
      "https://purl.imsglobal.org/spec/lti/claim/launch_presentation" in props
    ) {
      Object.assign(this, {
        "https://purl.imsglobal.org/spec/lti/claim/launch_presentation":
          new LaunchPresentationClaim(
            props[
              "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
            ]
          ),
      });
    }
    if ("https://purl.imsglobal.org/spec/lti-ags/claim/endpoint" in props) {
      Object.assign(this, {
        "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint":
          new AgsEndpointClaim(
            props["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"]
          ),
      });
    }
    if (
      "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice" in props
    ) {
      Object.assign(this, {
        "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice":
          new NrpsParameterClaim(
            props[
              "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"
            ]
          ),
      });
    }
    if (LtiDlSettingsSchema.$id in props) {
      Object.assign(this, {
        [LtiDlSettingsSchema.$id]: new DeepLinkingSettingsClaim(
          props[LtiDlSettingsSchema.$id]
        ),
      });
    }
  }
  @IsIn(LtiMessageTypeSchema.enum)
  [LtiMessageTypeSchema.$id]!: LtiMessageTypeSchema;
  @Equals("1.3.0")
  "https://purl.imsglobal.org/spec/lti/claim/version"!: "1.3.0";
  @IsNotEmpty()
  @MaxLength(255)
  [LtiDeploymentIdSchema.$id]!: LtiDeploymentIdSchema;
  @IsOptional()
  [LtiTargetLinkUriSchema.$id]?: LtiTargetLinkUriSchema;
  @IsOptional()
  @ValidateNested()
  "https://purl.imsglobal.org/spec/lti/claim/resource_link"?: ResourceLinkClaim;
  @IsNotEmpty()
  @IsString({ each: true })
  "https://purl.imsglobal.org/spec/lti/claim/roles"!: string[];
  @IsNotEmpty() // NOTE: 依存している実装箇所が存在するため必須
  @ValidateNested()
  "https://purl.imsglobal.org/spec/lti/claim/context"!: ContextClaim;
  @IsOptional()
  "https://purl.imsglobal.org/spec/lti/claim/tool_platform"?: unknown;
  @IsOptional()
  "https://purlimsglobal.org/spec/lti/claim/role_scope_mentor"?: unknown;
  @IsOptional()
  @ValidateNested()
  "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"?: LaunchPresentationClaim;
  @IsOptional()
  @ValidateNested()
  "https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"?: AgsEndpointClaim;
  @IsOptional()
  @ValidateNested()
  "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"?: NrpsParameterClaim;
  @IsOptional()
  @ValidateNested()
  [LtiDlSettingsSchema.$id]?: DeepLinkingSettingsClaim;
  @IsOptional()
  "https://purl.imsglobal.org/spec/lti/claim/lis"?: unknown;
  @IsOptional()
  "https://purl.imsglobal.org/spec/lti/claim/custom"?: unknown;
}

class ResourceLinkClaim {
  constructor(props?: Partial<ResourceLinkClaim>) {
    Object.assign(this, props);
  }
  @IsOptional()
  @IsString()
  id?: string;
  @IsOptional()
  @IsString()
  title?: string;
}

class ContextClaim {
  constructor(props?: Partial<ContextClaim>) {
    Object.assign(this, props);
  }
  @IsNotEmpty()
  @IsString()
  id!: string;
  @IsOptional()
  @IsString()
  label?: string;
  @IsOptional()
  @IsString()
  title?: string;
}

class LaunchPresentationClaim {
  constructor(props?: Partial<LaunchPresentationClaim>) {
    Object.assign(this, props);
  }
  @IsOptional()
  @IsString()
  return_url?: string;
}

class AgsEndpointClaim {
  constructor(props?: Partial<AgsEndpointClaim>) {
    Object.assign(this, props);
  }
  @IsOptional()
  @IsString()
  lineitems?: string;
  @IsOptional()
  @IsString()
  lineitem?: string;
  @IsOptional()
  @IsString({ each: true })
  scope?: string[];
}

class NrpsParameterClaim {
  constructor(props?: Partial<NrpsParameterClaim>) {
    Object.assign(this, props);
  }
  @IsString()
  context_memberships_url!: string;
  @IsString({ each: true })
  service_versions!: string[];
}

class DeepLinkingSettingsClaim {
  constructor(props?: Partial<DeepLinkingSettingsClaim>) {
    Object.assign(this, props);
  }
  @IsString()
  deep_link_return_url!: string;
  @IsString({ each: true })
  accept_types!: string[];
  @IsString({ each: true })
  accept_presentation_document_targets!: string[];
  @IsOptional()
  @IsString({ each: true })
  accept_media_types?: string[];
  @IsOptional()
  @IsBoolean()
  accept_multiple?: boolean;
  @IsOptional()
  @IsBoolean()
  accept_lineitem?: boolean;
  @IsOptional()
  @IsBoolean()
  auto_create?: boolean;
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  text?: string;
  @IsOptional()
  @IsString()
  data?: string;
}
