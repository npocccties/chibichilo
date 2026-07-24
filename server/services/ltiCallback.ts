import type { FastifyRequest } from "fastify";
import outdent from "$utils/outdent";
import { validateOrReject } from "class-validator";
import type { SessionSchema } from "$server/models/session";
import type { LtiLaunchPresentationSchema } from "$server/models/ltiLaunchPresentation";
import type { LtiAgsEndpointSchema } from "$server/models/ltiAgsEndpoint";
import type { LtiNrpsParameterSchema } from "$server/models/ltiNrpsParameter";
import { LtiDlSettingsSchema } from "$server/models/ltiDlSettings";
import findClient from "$server/utils/ltiv1p3/findClient";
import { ltiCallbackUrl } from "$server/utils/ltiv1p3/callbackUrl";
import { implicitAuthentication } from "openid-client";
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
    body: LtiCallbackBody,
    response: {
      ...init.response,
      401: {},
    },
  },
};

export async function post(req: FastifyRequest<{ Body: Props }>) {
  const callbackUrl = ltiCallbackUrl(req);
  const client = await findClient(req.session.oauthClient.id);

  if (!client) {
    req.log.error(`Client "${req.session.oauthClient.id}" が存在しません`);
    await req.session.destroy();
    return { status: 401 };
  }

  try {
    const url = new URL(callbackUrl);
    url.hash = new URLSearchParams(
      req.body as Record<string, string>
    ).toString();
    const claims = await implicitAuthentication(
      client,
      url,
      req.session.oauthClient.nonce,
      { expectedState: req.session.state }
    );
    const ltiClaims = new LtiClaims(claims as Partial<LtiClaims>);
    await validateOrReject(ltiClaims);
    const session = {
      oauthClient: req.session.oauthClient,
      ltiMessageType:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/message_type"],
      ltiVersion: "1.3.0",
      ltiDeploymentId:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/deployment_id"],
      ltiTargetLinkUri:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/target_link_uri"],
      ltiUser: {
        id: claims.sub,
        name: claims.name as string | undefined,
        email: claims.email as string | undefined,
      },
      ltiRoles: ltiClaims["https://purl.imsglobal.org/spec/lti/claim/roles"],
      ltiResourceLinkRequest:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/resource_link"],
      ltiContext:
        ltiClaims["https://purl.imsglobal.org/spec/lti/claim/context"],
      ltiResourceLink: null,
    } as const satisfies Omit<SessionSchema, "user" | "systemSettings">;
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
    const ltiDlSettings: undefined | LtiDlSettingsSchema =
      ltiClaims[LtiDlSettingsSchema.$id];
    Object.assign(req.session, {
      state: undefined,
      ...session,
      ...(ltiLaunchPresentation && { ltiLaunchPresentation }),
      ...(ltiAgsEndpoint && { ltiAgsEndpoint }),
      ...(ltiNrpsParameter && { ltiNrpsParameter }),
      ...(LtiDlSettingsSchema && { ltiDlSettings }),
    });

    return await init(req);
  } catch (error) {
    req.log.error(error);
    await req.session.destroy();
    return { status: 401 };
  }
}
