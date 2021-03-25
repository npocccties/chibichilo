import { LtiResourceLinkSchema } from "$server/models/ltiResourceLink";

export type Query = {
  keywords: string[];
  ltiResourceLinks: Array<
    Pick<LtiResourceLinkSchema, "consumerId" | "contextId">
  >;
};
