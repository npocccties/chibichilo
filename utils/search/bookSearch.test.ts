import bookSearch from "./bookSearch";

test("キーワードによる絞り込み", () => {
  const book = {
    id: 1,
    name: "foobar",
    description: "",
    language: "en",
    timeRequired: null,
    shared: true,
    author: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
    ltiResourceLinks: [],
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    sections: [],
    details: {},
  };
  expect(
    bookSearch([{ ...book, name: "foo" }, { ...book, name: "bar" }, book], {
      keywords: ["foo", "bar"],
      ltiResourceLinks: [],
    })
  ).toEqual([book]);
});

test("セクション名による絞り込み", () => {
  const book = {
    id: 1,
    name: "foobar",
    description: "",
    language: "en",
    timeRequired: null,
    shared: true,
    author: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
    ltiResourceLinks: [],
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 1,
        name: "Section 1",
        topics: [
          {
            id: 1,
            resourceId: 1,
            name: "Topic 1",
            description: "",
            language: "en",
            timeRequired: 10,
            shared: true,
            creator: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
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
          },
        ],
      },
    ],
    details: {},
  };
  expect(
    bookSearch([book, { ...book, sections: [] }], {
      keywords: ["sec"],
      ltiResourceLinks: [],
    })
  ).toEqual([book]);
});

test("トピック名による絞り込み", () => {
  const book = {
    id: 1,
    name: "foobar",
    description: "",
    language: "en",
    timeRequired: null,
    shared: true,
    author: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
    ltiResourceLinks: [],
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 1,
        name: "Section 1",
        topics: [
          {
            id: 1,
            resourceId: 1,
            name: "Topic 1",
            description: "",
            language: "en",
            timeRequired: 10,
            shared: true,
            creator: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
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
          },
        ],
      },
    ],
    details: {},
  };
  expect(
    bookSearch([book, { ...book, sections: [] }], {
      keywords: ["top"],
      ltiResourceLinks: [],
    })
  ).toEqual([book]);
});

test("LTI Resource Link による絞り込み", () => {
  const book = {
    id: 1,
    name: "foobar",
    description: "",
    language: "en",
    timeRequired: null,
    shared: true,
    author: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
    ltiResourceLinks: [
      {
        consumerId: "test",
        contextId: "foo",
        id: "bar",
        contextTitle: "コース1",
        contextLabel: "C1",
        title: "リンク1",
        bookId: 1,
        authorId: 1,
      },
    ],
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    sections: [],
    details: {},
  };
  expect(
    bookSearch([{ ...book, ltiResourceLinks: [] }, book], {
      keywords: ["foobar"],
      ltiResourceLinks: [
        {
          consumerId: "test",
          contextId: "foo",
        },
      ],
    })
  ).toEqual([book]);
});

test("ブック名が空でもセクション名・トピック名による絞り込み", () => {
  const book = {
    id: 1,
    name: "",
    description: "",
    language: "en",
    timeRequired: null,
    shared: true,
    author: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
    ltiResourceLinks: [],
    createdAt: new Date(),
    publishedAt: new Date(),
    updatedAt: new Date(),
    sections: [
      {
        id: 1,
        name: "Section 1",
        topics: [
          {
            id: 1,
            resourceId: 1,
            name: "Topic 1",
            description: "",
            language: "en",
            timeRequired: 10,
            shared: true,
            creator: { id: 1, name: "", ltiConsumerId: "", ltiUserId: "" },
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
          },
        ],
      },
    ],
    details: {},
  };
  expect(
    bookSearch([book], {
      keywords: ["sec", "top"],
      ltiResourceLinks: [],
    })
  ).toEqual([book]);
});
