import type { Resource } from "@prisma/client";
import type {
  VideoResourcePropsSchema,
  VideoResourceSchema,
} from "./videoResource";
import { videoResourcePropsSchema, videoResourceSchema } from "./videoResource";

export type ResourceProps = VideoResourcePropsSchema;

export type ResourceSchema = VideoResourceSchema | Resource;

export const resourcePropsSchema = videoResourcePropsSchema;

// TODO: oneOf/anyOf がオブジェクトでも機能するようになれば使いたい
//       https://github.com/fastify/fast-json-stringify/issues/290
export const resourceSchema = videoResourceSchema;
