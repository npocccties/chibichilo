import { IsNotEmpty, IsString, IsInt } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

export class LtiResourceLinkProps {
  @IsNotEmpty()
  @IsString()
  contextId!: string;

  @IsNotEmpty()
  @IsString()
  contextTitle!: string;

  @IsNotEmpty()
  @IsString()
  contextLabel!: string;

  @IsNotEmpty()
  @IsString()
  title!: string;

  @IsInt()
  bookId!: number;
}

export class LtiResourceLinkSchema extends LtiResourceLinkProps {
  @IsNotEmpty()
  @IsString()
  consumerId!: string;

  @IsNotEmpty()
  @IsString()
  id!: string;
}

export const {
  LtiResourceLinkProps: ltiResourceLinkPropsSchema,
  LtiResourceLinkSchema: ltiResourceLinkSchema,
} = validationMetadatasToSchemas();
