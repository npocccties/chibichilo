import type { FastifyRequest } from "fastify";
import { type Mock, type Mocked, type MockedFunction, vi } from "vitest";
import init from "./init";
import * as userServices from "$server/utils/user";
import * as resourceLinkServices from "$server/utils/ltiResourceLink";
import * as ltiServices from "$server/utils/ltiv1p3/services";
import { getSystemSettings } from "$server/utils/systemSettings";

vi.mock("$server/utils/user");
vi.mock("$server/utils/ltiResourceLink");
vi.mock("$server/utils/systemSettings");
vi.mock("$server/utils/ltiv1p3/services");
vi.mock("$server/utils/prisma", () => ({}));

const mockedUserServices = userServices as unknown as Mocked<
  typeof userServices
>;
const mockedResourceLinkServices = resourceLinkServices as unknown as Mocked<
  typeof resourceLinkServices
>;
const mockedGetSystemSettings = getSystemSettings as unknown as MockedFunction<
  typeof getSystemSettings
>;

describe("init()", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedGetSystemSettings.mockReturnValue(
      {} as ReturnType<typeof getSystemSettings>
    );
    (ltiServices as unknown as Record<string, Mock>).findClient = vi
      .fn()
      .mockResolvedValue({ id: "client" });
    (ltiServices as unknown as Record<string, Mock>).getMemberships = vi
      .fn()
      .mockResolvedValue([]);
  });

  test("session.ltiAgsEndpoint.lineitem が保存されること", async () => {
    const mockSession = {
      oauthClient: { id: "test-consumer" },
      ltiUser: { id: "u1" },
      ltiContext: { id: "c1", title: "T", label: "L" },
      ltiMessageType: "LtiResourceLinkRequest",
      ltiResourceLinkRequest: { id: "r1", title: "RT" },
      ltiTargetLinkUri: "http://localhost:8080/book?bookId=1",
      ltiAgsEndpoint: { lineitem: "https://example.com/lineitem" },
      ltiRoles: [],
    };

    mockedUserServices.upsertUser.mockResolvedValue({ id: 1 } as never);
    mockedResourceLinkServices.findLtiResourceLink.mockResolvedValue(null);

    await init({ session: mockSession } as unknown as FastifyRequest);

    expect(
      mockedResourceLinkServices.upsertLtiResourceLink
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        lineItem: "https://example.com/lineitem",
      }),
      undefined
    );
  });
});
