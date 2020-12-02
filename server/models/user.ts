import { User } from "@prisma/client";
import jsonSchema from "$server/prisma/json-schema.json";

export type UserProps = Omit<User, "id">;

export type UserSchema = User;

const { id, ltiUserId, name } = jsonSchema.definitions.User.properties;

export const userSchema = {
  type: "object",
  properties: { id, ltiUserId, name },
};
