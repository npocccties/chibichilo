# Docs branch の README.md

本ブランチは、CHiBi-CHiLOのドキュメントを書くためのブランチです。

git worktree を使う想定です。

## 本ブランチのブランチレイアウト

- docs 現在のドキュメントを書くブランチ

## ディレクトリ・レイアウト

```
/(repository top)
+V2.1 (2021-04)時点でのリリース予定版のドキュメント
  + UserManual (ユーザマニュアル)
  + Design (設計思想を書いたもの)
  + APIs(予定)
  + その他追加すべきドキュメント
+V3.0 次のリリース予定版のドキュメント(まだない)
  + UserManual (ユーザマニュアル)
  + Design (設計思想を書いたもの)
  + APIs(予定)
  + その他追加すべきドキュメント
```

## 本ブランチと、gh-pages ブランチの関係

本ブランチは、静的サイトジェネレータなどでhtmlを生成する「コンテンツのソース」を管理するブランチです。

~最終的には、GitHub Actions でpushされたら自動生成するようにしたいですが、現状は手でやることになるかと思います。~
~可能なら、makeで再帰的にhtmlをbuildできたらいいなと思って、設定を書いていきたいと思います。~

GitHub Action を整備して、docsブランチにpushされたら、動くようにしました。docsブランチの内容を読み取って、gh-pagesブランチ
に書き込む形になります。

トップページのindex.htmlやlogo.pngもdocsブランチにある内容がdeploy されるようになっています。変更ををかけるなら
docsブランチにある内容に対して変更をかけてください。


docs ブランチで、RestructuredText を書いて、htmlを生成してもらい、生成した結果をコミットして、gh-pages にマージ
するかたちになります。

## 各静的サイトジェネレータに関する設定情報

お手元の環境および、GitHub Actions で設定する際に必要な情報

### sphinx

分かっている人向けの説明：「各ディレクトリの conf.py を確認すること。」

さすがにちょっとひどいので、下記に利用する関連プログラムを列挙する。

2021-03-30 時点において GitHub Actions は、Ubuntu 20.04 が最新の Linux Destribution である。
様々な作法があると思うが、Ubuntu の package をつかって必要なプログラムを揃えることにする。
足りない場合は、pip を使って補う。

- python3-sphinx
- python3-sphinx-rtd-theme
- python3-sphinxcontrib.plantuml

上記を入れると、Read the Docs のテーマと、plantuml の記法が使えるようになる。 pdfの生成は、luaLaTeX などを
設定する必要があるため、当分手動でいいと思います。
