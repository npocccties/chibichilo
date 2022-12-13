import type { SessionSchema } from "$server/models/session";

declare module "fastify" {
  interface Session {
    state?: string;
    oauthClient: SessionSchema["oauthClient"];
    ltiVersion: SessionSchema["ltiVersion"];
    ltiUser: SessionSchema["ltiUser"];
    ltiRoles: SessionSchema["ltiRoles"];
    ltiResourceLinkRequest: SessionSchema["ltiResourceLinkRequest"];
    ltiContext: SessionSchema["ltiContext"];
    ltiLaunchPresentation: SessionSchema["ltiLaunchPresentation"];
    ltiAgsEndpoint: SessionSchema["ltiAgsEndpoint"];
    ltiNrpsParameter: SessionSchema["ltiNrpsParameter"];
    ltiResourceLink: SessionSchema["ltiResourceLink"];
    user: SessionSchema["user"];
    systemSettings: SessionSchema["systemSettings"];
  }
}
