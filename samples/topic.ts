import outdent from "outdent";
import resource from "./resource";
import user from "./user";
import { bookmark } from "./bookmark";

const topic = {
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-011.xhtml
  id: 1,
  resourceId: 1,
  name: "分数関数",
  description: outdent`基本的な分数関数は次の関数で定義されます。

  1-1

  これを平行移動すると次の関数の形になります。

  1-2

  x軸方向へ+1、y軸方向へ+1平行移動したグラフになります。

  分数関数を整理するときには分子を低次化します。

  例えば、(x+1)/(x-1) という分数関数であれば、次のように変形します。

  1-3

  このように変形させると計算が簡単になることが多いので、覚えておきましょう。
  `,
  timeRequired: 60,
  startTime: null,
  stopTime: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  details: {},
  authors: [{ ...user, roleName: "作成者" }],
  keywords: [],
  shared: true,
  language: "ja",
  license: "",
  resource,
  bookmarks: [bookmark],
};

export default topic;
