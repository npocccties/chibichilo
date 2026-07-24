import type { FromSchema } from "json-schema-to-ts";

/** System Settings */
export const SystemSettingsSchema = {
  type: "object",
  required: ["zoomImportEnabled", "wowzaUploadEnabled"],
  properties: {
    zoomImportEnabled: { type: "boolean" },
    wowzaUploadEnabled: { type: "boolean" },
  },
  additionalProperties: false,
} as const;

/** System Settings */
export type SystemSettingsSchema = FromSchema<typeof SystemSettingsSchema>;
