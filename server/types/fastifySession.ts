import { User } from "@prisma/client";
import { LtiLaunchBody } from "$server/validators/ltiLaunchBody";

declare module "fastify" {
  interface Session {
    user?: User;
    ltiLaunchBody?: LtiLaunchBody;
  }
}
