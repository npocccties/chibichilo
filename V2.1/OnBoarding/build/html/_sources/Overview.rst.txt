CHiBi-CHiLO --- マイクロ・コンテンツ・システム Onboarding 文書
==================================================================


本システムの目的
-----------------------------------------------------------------

この文書は、本システム CHiBi-CHiLO(呼称、ちびちろ)の開発に参加するに
あたって、いくつか知っておいた方が良い知識を伝達するための文書です。

* ドキュメント関係
* 開発関係
* テスト関係


対象者
-----------------------------------------------------------------

chibi-chilo の開発に参加したいが、様子がわからない人

chibi-chilo には、下記に挙げているような技術背景をもっており、相当な知識量が必要です。

当初は全部を知る必要はないかもしれませんが、最終的にはすべてを知ることになるでしょう。

開発に参加する
-----------------------------------------------------------------

* `最初のコントリビューション · Issue #343 · npocccties/chibichilo <https://github.com/npocccties/chibichilo/issues/343>`_


ドキュメント関係
-----------------------------------------------------------------

* `Documentation layout · Issue #357 · npocccties/chibichilo <https://github.com/npocccties/chibichilo/issues/357>`_

開発関係
------------------------------------------------------------------



言語
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

TypeScript を使っています。もし、あなたが TypeScript に慣れていないなら、

* `仕事ですぐに使えるTypeScript — 仕事ですぐに使えるTypeScript ドキュメント <https://future-architect.github.io/typescript-guide/index.html#>`_

* `TypeScript Deep Dive 日本語版について - TypeScript Deep Dive 日本語版 <https://typescript-jp.gitbook.io/deep-dive/>`_

などを参考にすると良いかも知れません。

TypeScript は、JavaScript に派生したプログラム言語なので、JavaScript の知識も必要です。もし知識が足りない場合は、下記のようなドキュメントを参照するのが良いでしょう。

* `JavaScript | MDN <https://developer.mozilla.org/ja/docs/Web/JavaScript>`_
* `JavaScript Primer - 迷わないための入門書 #jsprimer <https://jsprimer.net/>`_


フレームワークなどの使っている技術
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* `React – ユーザインターフェース構築のための JavaScript ライブラリ <https://ja.reactjs.org/>`_
* `Next.js by Vercel - The React Framework <https://nextjs.org/>`_
* `Prisma - Next-generation Node.js and TypeScript ORM for Databases <https://www.prisma.io/>`_
* `Home - OpenAPI Initiative <https://www.openapis.org/>`_

  *  旧名 swagger

* Atomic Design


Dawtabase
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

開発環境
------------------------------------------------------------------

こだわりがないなら、 `TypeScript Programming with Visual Studio Code <https://code.visualstudio.com/docs/languages/typescript>`_ で良いとおもいます。

開発時には、docker を使ってデータベースを利用しています。

Deploy
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

主に、Vercel を使っていますが、差異を吸収できるなら、netlify などの別のサービスでも構わないでしょう。

* `Develop. Preview. Ship. For the best frontend teams – Vercel <https://vercel.com/>`_
* `Netlify: Develop & deploy the best web experiences in record time <https://www.netlify.com/>`_


 テスト関係
------------------------------------------------------------------

テストサーバリスト、および、テスト用ID一覧は、wiki にまとまっているが、外部には公開していない。アクセスしたければ要申請です。

