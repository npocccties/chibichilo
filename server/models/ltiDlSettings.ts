import type { FromSchema, JSONSchema } from "json-schema-to-ts";

export const LtiDlSettingsSchema = {
  $id: "https://purl.imsglobal.org/spec/lti-dl/claim/deep_linking_settings",
  title: "LTI Deep Linking Settings",
  type: "object",
  required: [
    "deep_link_return_url",
    "accept_types",
    "accept_presentation_document_targets",
  ],
  properties: {
    deep_link_return_url: {
      type: "string",
    },
    accept_types: {
      type: "array",
      items: { type: "string" },
    },
    accept_presentation_document_targets: {
      type: "array",
      items: { type: "string" },
    },
    accept_media_types: {
      type: "string",
    },
    accept_multiple: {
      type: "boolean",
    },
    accept_lineitem: {
      type: "boolean",
    },
    auto_create: {
      type: "boolean",
    },
    title: {
      type: "string",
    },
    text: {
      type: "string",
    },
    data: {
      type: "string",
    },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/** LTI Deep Linking Settings */
export type LtiDlSettingsSchema = FromSchema<typeof LtiDlSettingsSchema>;
