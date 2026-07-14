import { api } from "$utils/api";
import { load } from "./loggerSessionPersister";
import { send } from "./logger";
import { loadLtiContext } from "$store/session";
import type { SessionSchema } from "$server/models/session";
import type * as SessionStore from "$store/session";
import { vi } from "vitest";

vi.mock("@vimeo/player", () => ({
  default: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
    ready: vi.fn().mockResolvedValue(undefined),
  })),
}));
vi.mock("./loggerSessionPersister");
vi.mock("$store/session", async (importOriginal) => {
  const actual = await importOriginal<typeof SessionStore>();
  return {
    ...actual,
    loadLtiContext: vi.fn(),
  };
});
vi.mock("$utils/api");
vi.mock("$store/player/storage", () => ({
  loadPlaybackRate: vi.fn().mockReturnValue(1),
  savePlaybackRate: vi.fn(),
}));

describe("logger.ts / send() の検証", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // window.location simulation.
    global.location = {
      ...global.location,
      pathname: "/default-browser-path",
    } as unknown as Location;
  });

  afterAll(() => {
    // @ts-expect-error: Clean up globals in the test environment.
    delete global.location;
  });

  const commonStats = {
    url: "http://example.com",
    currentTime: 10,
    topicId: 1,
    providerUrl: "youtube",
    firstPlay: false,
  };

  it("loadLtiContext() に pathname が含まれる場合、そちらを優先して送信すること", async () => {
    const mockPathname = "/bookmark";
    const mockSession = {
      oauthClient: { id: "client", nonce: "nonce" },
      ltiUser: { id: "user" },
      ltiContext: { id: "context" },
      ltiResourceLink: { bookId: 1 },
    } as unknown as SessionSchema;

    vi.mocked(load).mockReturnValue(mockSession);
    vi.mocked(loadLtiContext).mockReturnValue({
      ltiConsumerId: "cons-id",
      ltiContextId: "ctx-id",
      pathname: mockPathname,
    });

    await send("play", commonStats);

    expect(api.apiV2EventPost).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ path: mockPathname }),
      })
    );
  });

  it("loadLtiContext() の pathname が未定義の場合、location.pathname の値を送信すること", async () => {
    const mockSession = {
      oauthClient: { id: "client", nonce: "nonce" },
      ltiUser: { id: "user" },
      ltiContext: { id: "context" },
      ltiResourceLink: { bookId: 1 },
    } as unknown as SessionSchema;

    vi.mocked(load).mockReturnValue(mockSession);
    vi.mocked(loadLtiContext).mockReturnValue({
      ltiConsumerId: "cons-id",
      ltiContextId: "ctx-id",
      pathname: undefined,
    });

    await send("play", commonStats);

    expect(api.apiV2EventPost).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({
          path: "/default-browser-path",
        }),
      })
    );
  });
});
