import { IsOptional, IsBoolean } from "class-validator";
import { validationMetadatasToSchemas } from "class-validator-jsonschema";

export class UserSettingsProp {
  @IsOptional()
  @IsBoolean()
  zoomImportEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  zoomImportAutodelete?: boolean;
}

export const userSettingsPropSchema =
  validationMetadatasToSchemas().UserSettingsProp;
