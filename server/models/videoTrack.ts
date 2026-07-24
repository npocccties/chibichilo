import type { Track, Prisma } from "@prisma/client";

export type VideoTrackProps = Pick<
  Prisma.TrackCreateWithoutVideoInput,
  "language"
> & {
  content: Track["content"] | Blob;
};

export type VideoTrackSchema = Pick<Track, "id" | "kind" | "language"> & {
  url: string;
  accessToken: string;
};

export const videoTrackPropsSchema = {
  type: "object",
  properties: {
    language: { type: "string" },
    content: { type: "string" },
  },
} as const;

export const videoTrackSchema = {
  type: "object",
  properties: {
    id: { type: "integer" },
    kind: { type: "string" },
    language: { type: "string" },
    url: { type: "string" },
    accessToken: { type: "string" },
  },
} as const;
