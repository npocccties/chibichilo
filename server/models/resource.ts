import { Resource, Prisma } from "@prisma/client";
import jsonSchema from "$server/prisma/json-schema.json";
import { VideoResourceSchema, videoResourceSchema } from "./videoResource";

export type ResourceProps = Omit<
  Prisma.ResourceCreateWithoutTopicsInput,
  "details"
>;

export type ResourceSchema = VideoResourceSchema | Resource;

const { id, url, details } = jsonSchema.definitions.Resource.properties;
export const resourceSchema = {
  anyOf: [
    videoResourceSchema,
    {
      type: "object",
      properties: {
        id,
        url,
        details,
      },
    },
  ],
};
