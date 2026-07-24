import { api } from "$utils/api";
import { load } from "./loggerSessionPersister";
import { send } from "./logger";
import { loadLtiContext } from "$store/session"; // 追加
import type { SessionSchema } from "$server/models/session";

jest.mock("@vimeo/player", () =>
  jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    ready: jest.fn().mockResolvedValue(undefined),
  }))
);
jest.mock("./loggerSessionPersister");
jest.mock("$store/session", () => ({
  ...jest.requireActual("$store/session"),
  loadLtiContext: jest.fn(),
}));
jest.mock("$utils/api");
jest.mock("$store/player/storage", () => ({
  loadPlaybackRate: jest.fn().mockReturnValue(1),
  savePlaybackRate: jest.fn(),
}));

describe("logger.ts / send() の検証", () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    jest.mocked(load).mockReturnValue(mockSession);
    // loadLtiContext が値を返すように設定 (sessionStorage の代わり)
    jest.mocked(loadLtiContext).mockReturnValue({
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

    jest.mocked(load).mockReturnValue(mockSession);
    jest.mocked(loadLtiContext).mockReturnValue({
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
