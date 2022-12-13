import type { FastifyRequest } from "fastify";
import { outdent } from "outdent";
import { validateOrReject } from "class-validator";
import type { SessionSchema } from "$server/models/session";
import type { LtiLaunchPresentationSchema } from "$server/models/ltiLaunchPresentation";
import type { LtiAgsEndpointSchema } from "$server/models/ltiAgsEndpoint";
import type { LtiNrpsParameterSchema } from "$server/models/ltiNrpsParameter";
import findClient from "$server/utils/ltiv1p3/findClient";
import init from "./init";
import { LtiCallbackBody } from "$server/validators/ltiCallbackBody";
import { LtiClaims } from "$server/validators/ltiClaims";

export type Props = LtiCallbackBody;

export const method = {
  post: {
    summary: "LTI v1.3 リダイレクトURI",
    description: outdent`
      LTIツールとして起動するためのエンドポイントです。
      このエンドポイントをLMSのLTIツールのリダイレクトURIに指定して利用します。
      成功時 ${init.frontendUrl} にリダイレクトします。`,
    consumes: ["application/x-www-form-urlencoded"],
    body: LtiCallbackBody,
    response: {
      ...init.response,
      401: {},
    },
  },
};

export async function post(req: FastifyRequest<{ Body: Props }>) {
  const callbackUrl = `${req.protocol}://${req.hostname}/api/v2/lti/callback`;
  const client = await findClient(req.session.oauthClient.id);

  if (!client) {
    req.log.error(`Client "${req.session.oauthClient.id}" が存在しません`);
    await req.session.destroy();
    return { status: 401 };
  }

  try {
    const token = await client.callback(callbackUrl, req.body, {
      state: req.session.state,
      nonce: req.session.oauthClient.nonce,
    });
    const claims = token.claims();
    const ltiClaims = new LtiClaims(claims as Partial<LtiClaims>);
    await validateOrReject(ltiClaims);
    const session: Omit<SessionSchema, "user" | "systemSettings"> = {
      oauthClient: req.session.oauthClient,
      ltiVersion: "1.3.0",
      ltiUser: {
        id: claims.sub,
        name: claims.name,
        email: claims.email,
      },
      ltiRoles: ltiClaims["https://purl.imsglobal.org/spec/lti/claim/roles"],
      ltiResourceLinkRequest:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/resource_link"],
      ltiContext:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/context"],
      ltiResourceLink: null,
    } as const;
    let ltiLaunchPresentation: undefined | LtiLaunchPresentationSchema;
    if (
      "https://purl.imsglobal.org/spec/lti/claim/launch_presentation" in
      ltiClaims
    ) {
      ltiLaunchPresentation = {
        returnUrl:
          ltiClaims[
            "https://purl.imsglobal.org/spec/lti/claim/launch_presentation"
          ]?.return_url,
      };
    }
    const ltiAgsEndpoint: undefined | LtiAgsEndpointSchema =
      ltiClaims["https://purl.imsglobal.org/spec/lti-ags/claim/endpoint"];
    const ltiNrpsParameter: undefined | LtiNrpsParameterSchema =
      ltiClaims[
        "https://purl.imsglobal.org/spec/lti-nrps/claim/namesroleservice"
      ];
    Object.assign(req.session, {
      state: undefined,
      ...session,
      ...(ltiLaunchPresentation && { ltiLaunchPresentation }),
      ...(ltiAgsEndpoint && { ltiAgsEndpoint }),
      ...(ltiNrpsParameter && { ltiNrpsParameter }),
    });

    return await init(req);
  } catch (error) {
    req.log.error(error);
    await req.session.destroy();
    return { status: 401 };
  }
}
