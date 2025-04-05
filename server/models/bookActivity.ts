import type { FromSchema } from "json-schema-to-ts";
import { ActivitySchema } from "./activity";
import { LearningStatus } from "./learningStatus";

/** ブックでの学習活動 */
export const BookActivitySchema = {
  type: "object",
  properties: {
    ...ActivitySchema.properties,
    book: {
      type: "object",
      properties: { id: { type: "integer" }, name: { type: "string" } },
      required: ["id", "name"],
    },
    status: LearningStatus,
  },
  required: ["learner", "topic", "book", "status"],
} as const;

/** ブックでの学習活動 */
export type BookActivitySchema = Pick<ActivitySchema, "learner" | "topic"> &
  Partial<
    Pick<
      ActivitySchema,
      "id" | "ltiContext" | "totalTimeMs" | "createdAt" | "updatedAt"
    >
  > &
  Pick<FromSchema<typeof BookActivitySchema>, "book" | "status">;
