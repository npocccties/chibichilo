import outdent from "outdent";

const topics = [
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-011.xhtml
  {
    id: 1,
    name: "分数関数",
    timeRequired: 60,
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
    resource: { url: "https://www.youtube.com/watch?v=KxNMj61Rgnc" },
  },
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-012.xhtml
  {
    id: 2,
    name: "無理関数",
    timeRequired: 49,
    description: outdent`無理関数の基本的な形は次のとおりです。

      4-2

      これを平行移動すると次のような形になります。

      4-3

      y=√x のグラフは、原点から始まり、放物線を-90° 回転した形のグラフが得られます。

      y= - √x の場合は符号が反転しているため、y=√xのグラフをx軸に対して、反転したグラフが得られます。
      `,
    resource: { url: "https://www.youtube.com/watch?v=OAG9FApdp3A" },
  },
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-013.xhtml
  {
    id: 3,
    name: "三角関数",
    timeRequired: 49,
    description: outdent`三角関数はsin x、及びcos xが基本的な関数です。

      sin2x　とcos2x　の和が1になります。

      sin xの値はx=0、x=π と x=2πで、0をとります。

      また、x=π/2とx=3π/2で、それぞれ +1と-1をとります。

      その間を滑らかに繋ぐとy=sin xのグラフを得られます。

      y=cos xのグラフは、y=sin xのグラフをx軸方向に-π/2だけ平行移動すると得られます。
      `,
    resource: { url: "https://www.youtube.com/watch?v=wfSJoAopdMs" },
  },
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-014.xhtml
  {
    id: 4,
    name: "指数関数",
    timeRequired: 82,
    description: outdent`指数関数は、f(x)=2x、f(x)=1/2x、aを定数とした f(x)=ax など、変数 x が指数の位置に来ている関数の総称です。

      例えば、y=2x

      という指数関数は、x=0のとき1であり、xが増加すると急激に増加し、xが減少すると急激に減少する形のグラフとなります。

      y=1/2x、y=2-xに相当する指数関数のグラフもx=0のとき1であり、y=2xのグラフとは逆にxが増加するにつれて急激に減少し、xが減少するにつれて急激に増加するというグラフとなります。

      これらは、定数a が a＞1 の場合、0＜a＜1の場合にそれぞれ一般的に成立します。

      指数関数の特徴として恒等式、

      f(x+y)=ax+y+axay=f(x)f(y)

      という関係式が常に成立します。
      `,
    resource: { url: "https://www.youtube.com/watch?v=yZKWFOwP4XE" },
  },
  // © 2015 NPO CCC-TIES, 行木孝夫 / CC-BY https://dev.chilos.jp/book/uncompress/cb00301/OEBPS/vol-1/text/vol-001-015.xhtml
  {
    id: 5,
    name: "対数関数",
    timeRequired: 49,
    description: outdent`対数関数は、f(x)=log2x（x>0）という対数によって定義される関数です。

      y=log2x

      という関数の値は、x=1で0をとり、xが減少するにつれて急激に減少し、xが増加するにつれて緩やかに増加していくグラフとなります。

      対数関数の性質として、f(xy)=f(x)+f(y)という恒等式が成立します。

      これは、対数の定義から解る関係式です。
      `,
    resource: { url: "https://www.youtube.com/watch?v=zgjfuCXSTPw" },
  },
];

export default topics;
