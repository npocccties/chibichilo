import type { ReleaseItemSchema } from "$server/models/releaseResult";
import ReleaseItemList from "./ReleaseItemList";

export default {
  title: "organisms/ReleaseItemList",
  component: ReleaseItemList,
};

const author1 = {
  id: 1,
  ltiConsumerId: "",
  ltiUserId: "2",
  name: "作成 太郎",
  email: "author1@example.com",
  roleName: "作成者",
};

const item1: ReleaseItemSchema = {
  name: "数学I",
  createdAt: new Date("2024-09-03T23:22:00.593Z"),
  updatedAt: new Date("2024-09-14T04:41:03.563Z"),
  authors: [author1],
  release: {
    releasedAt: new Date("2022-09-14T04:41:03.603Z"),
    version: "1.0",
    comment: "2022年度",
  },
};

const item2: ReleaseItemSchema = {
  name: "数学I",
  createdAt: new Date("2024-09-03T23:22:00.593Z"),
  updatedAt: new Date("2024-09-14T04:41:03.563Z"),
  authors: [author1],
  release: {
    releasedAt: new Date("2023-09-14T04:41:03.603Z"),
    version: "2.0",
    comment: "2023年度",
  },
};

const item3: ReleaseItemSchema = {
  name: "数学I",
  createdAt: new Date("2024-09-03T23:22:00.593Z"),
  updatedAt: new Date("2024-09-14T04:41:03.563Z"),
  authors: [author1],
  release: {
    releasedAt: new Date("2024-09-14T04:41:03.603Z"),
    version: "3.0",
    comment: "2024年度",
  },
};

const releases: Array<ReleaseItemSchema> = [item1, item2, item3];

const defaultProps = {
  releases,
};

export const Default = () => {
  return <ReleaseItemList {...defaultProps} />;
};
