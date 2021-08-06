import topicSearch from "./topicSearch";

test("トピック名による絞り込み", () => {
  const topic = {
    id: 1,
    resourceId: 1,
    name: "Topic 1",
    description: "",
    language: "en",
    timeRequired: 10,
    shared: true,
    license: "",
    creator: {
      id: 1,
      name: "",
      ltiConsumerId: "",
      ltiUserId: "",
      email: "",
      settings: {},
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    resource: {
      id: 1,
      videoId: 1,
      url: "https://example/",
      providerUrl: "https://example/",
      details: {},
    },
    details: {},
  };
  expect(
    topicSearch([topic, { ...topic, name: "なんとかかんとか" }], {
      keywords: ["top"],
      ltiResourceLinks: [],
    })
  ).toEqual([topic]);
});
