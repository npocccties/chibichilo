import { Book, Prisma } from "@prisma/client";
import jsonSchema from "$server/prisma/json-schema.json";
import { UserSchema, userSchema } from "./user";
import { SectionProps, SectionSchema, sectionSchema } from "./book/section";

export type BookProps = Omit<
  Prisma.BookCreateWithoutAuthorInput,
  "details" | "sections"
> & {
  author: Pick<UserSchema, "id">;
  sections: Array<SectionProps>;
};

export type BookSchema = Omit<Book, "authorId"> & {
  author: UserSchema;
  sections: SectionSchema[];
};

const {
  id,
  name,
  abstract,
  publishedAt,
  createdAt,
  updatedAt,
  details,
} = jsonSchema.definitions.Book.properties;
export const bookSchema = {
  type: "object",
  properties: {
    id,
    name,
    abstract,
    publishedAt,
    createdAt,
    updatedAt,
    details,
    author: userSchema,
    sections: {
      type: "array",
      items: sectionSchema,
    },
  },
};
