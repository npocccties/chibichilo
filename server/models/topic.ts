import { Topic } from "@prisma/client";
import jsonSchema from "$server/prisma/json-schema.json";
import { ResourceProps, ResourceSchema, resourceSchema } from "./resource";

export type TopicProps = Pick<
  Topic,
  "name" | "timeRequired" | "description"
> & {
  resource: ResourceProps;
};

export type TopicSchema = Topic & {
  resource: ResourceSchema;
};

const {
  id,
  name,
  timeRequired,
  description,
  createdAt,
  updatedAt,
  details,
} = jsonSchema.definitions.Topic.properties;
export const topicSchema = {
  type: "object",
  properties: {
    id,
    name,
    timeRequired,
    description,
    createdAt,
    updatedAt,
    details,
    creatorId: { type: "integer" },
    resource: resourceSchema,
  },
};
