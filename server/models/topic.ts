import { Topic, Prisma } from "@prisma/client";
import jsonSchema from "$server/prisma/json-schema.json";
import {
  ResourceProps,
  ResourceSchema,
  resourcePropsSchema,
  resourceSchema,
} from "./resource";
import { UserSchema, userSchema } from "./user";

export type TopicProps = Pick<
  Prisma.TopicCreateWithoutCreatorInput,
  "name" | "language" | "timeRequired" | "shared" | "description"
> & {
  resource: ResourceProps;
};

export type TopicSchema = Omit<Topic, "creatorId"> & {
  creator: UserSchema;
  resource: ResourceSchema;
};

const {
  id,
  name,
  language,
  timeRequired,
  shared,
  description,
  createdAt,
  updatedAt,
  details,
} = jsonSchema.definitions.Topic.properties;

export const topicPropsSchema = {
  type: "object",
  properties: {
    name,
    language: { ...language, nullable: true },
    timeRequired,
    shared: { ...shared, nullable: true },
    description,
    resource: resourcePropsSchema,
  },
};

export const topicSchema = {
  type: "object",
  properties: {
    id,
    name,
    language,
    timeRequired,
    shared,
    description,
    createdAt,
    updatedAt,
    details,
    creator: userSchema,
    resource: resourceSchema,
  },
};
