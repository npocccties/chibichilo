CHiBi-CHiLO --- マイクロ・コンテンツ・システム Onboarding 文書
==================================================================


本システムの目的
-----------------------------------------------------------------

この文書は、本システム CHiBi-CHiLO(呼称、ちびちろ)の開発に参加するに
あたって、いくつか知っておいた方が良い知識を伝達するための文書です。

* ドキュメント関係
* 開発関係
* テスト関係

既存の文書を再利用するために、あえてlinkで紹介している文書もあります。

対象者
-----------------------------------------------------------------

chibi-chilo の開発に参加したいが、様子がわからない人

chibi-chilo には、下記に挙げているような技術背景をもっており、相当な知識量が必要です。

当初は全部を知る必要はないかもしれませんが、最終的にはすべてを知ることになるでしょう。

本ドキュメントの更新方法
------------------------------------------------------------------

* `npocccties/chibichilo at docs <https://github.com/npocccties/chibichilo/tree/docs>`_
  * 上記のリポジトリの docs ブランチを変更します。

* git worktree を使う想定です。

> /(repository top)
> +V2.1 (2021-04)時点でのリリース予定版のドキュメント
>   + UserManual (ユーザマニュアル)
>   + Design (設計思想を書いたもの)
>   + OnBoarding(この文書)
>   + APIs(予定)
>   + その他追加すべきドキュメント
> +V3.0 次のリリース予定版のドキュメント(まだない)
>   + UserManual (ユーザマニュアル)
>   + Design (設計思想を書いたもの)
>   + OnBoarding(この文書)
>   + APIs(予定)
>   + その他追加すべきドキュメント

docsブランチと、gh-pages ブランチの関係
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

本ブランチは、静的サイトジェネレータなどでhtmlを生成する「コンテンツのソース」を管理するブランチです。

GitHub Actions でpushされたら自動生成にしています。 see `chibichilo/sphinx-build.yml at docs · npocccties/chibichilo <https://github.com/npocccties/chibichilo/blob/docs/.github/workflows/sphinx-build.yml>`_
makeで再帰的にhtmlをbuildできたらいいなと思って、設定を書います。

GitHub Action を整備して、docsブランチにpushされたら、動くようにしました。docsブランチの内容を読み取って、gh-pagesブランチ に書き込む形になります。

トップページのindex.htmlやlogo.pngもdocsブランチにある内容がdeploy されるようになっています。変更ををかけるなら docsブランチにある内容に対して変更をかけてください。

既存にあるページは消去しないようですが、2重管理にならないように、docs branch で管理するようにしてください。

docs ブランチで、RestructuredText を書いて、htmlを生成してもらい、生成した結果をコミットして、gh-pages にdeployするかたちになります。

静的サイトジェネレータに関する設定情報
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* `chibichilo/sphinx-build.yml at docs · npocccties/chibichilo <https://github.com/npocccties/chibichilo/blob/docs/.github/workflows/sphinx-build.yml>`_
  * 上記をを参考にbuild環境を整えてください。

分かっている人向けの説明：「各ディレクトリの conf.py を確認すること。」

さすがにちょっとひどいので、下記に利用する関連プログラムを列挙する。

2021-03-30 時点において GitHub Actions は、Ubuntu 20.04 が最新の Linux Destribution である。
様々な作法があると思うが、Ubuntu の package をつかって必要なプログラムを揃えることにする。
足りない場合は、pip を使って補う。

* python3-sphinx
* python3-sphinx-rtd-theme
* python3-sphinxcontrib.plantuml

上記を入れると、Read the Docs のテーマと、plantuml の記法が使えるようになる。 pdfの生成は、luaLaTeX などを設定する必要があるため、pdfの生成は当分手動でいいと思います

開発に参加する
-----------------------------------------------------------------

* `最初のコントリビューション · Issue #343 · npocccties/chibichilo <https://github.com/npocccties/chibichilo/issues/343>`_

* `CHiBi-CHiLO Document <https://npocccties.github.io/chibichilo/>`_ 再帰的で申し訳ないが、先にココにあるドキュメントは先に読んでおいてほしい。

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


Database
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

