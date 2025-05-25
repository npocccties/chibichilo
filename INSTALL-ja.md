# インストール方法

[English](INSTALL-en.md) | 日本語

下記のドキュメントを参考に、環境を構築する。

Docker を使っているのは、開発用途である。

本番環境では、 Docker を介さずに、データベースのクラスター化などの検討もして、パフォーマンスやデータのバックアップなどから最適な構成を採ること。

本番投入するなら、継続的なパフォーマンス監視などの安定運用の対策を行うのをオススメする。

[サーバー用インストールドキュメント](./server/README.md)

## 環境変数

フロントエンド周りの静的コンテンツは環境変数を与えた後 `yarn build` コマンドを実行して生成する。
API の接続先の情報を変更する場合 .env を適宜書き換える必要がある。

.env:

| 環境変数                                      | 説明                                                                                                                                                             |
| --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_PATH`                   | API の URL のベースとなるパス (デフォルト: 同一オリジン "")                                                                                                      |
| `NEXT_PUBLIC_BASE_PATH`                       | 静的コンテンツの URL のベースとなるパス (デフォルト: "")                                                                                                         |
| `NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY`       | 学習活動の LTI Context ごとでの取得 (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 無効)                                        |
| `NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL`          | 学習活動の送信間隔 (秒) (デフォルト:`10`)                                                                                                                        |
| `NEXT_PUBLIC_VIDEO_MAX_HEIGHT`                | スクロール追従する動画プレイヤーの max-height (デフォルト: `40vh`)                                                                                               |
| `NEXT_PUBLIC_NO_EMBED`                        | 埋め込みを許可しない (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 無効)                                                       |
| `NEXT_PUBLIC_ACTIVITY_REWATCH_RATE_THRESHOLD` | 繰返視聴割合に基づく可視化のための閾値 (0〜1の値) (デフォルト: `0.1`)                                                                                            |
| `NEXT_PUBLIC_REWATCH_GRAPH_COUNT_THRESHOLD`   | グラフにプロットする視聴回数の上限閾値 (回数) (デフォルト: `20`)                                                                                                 |
| `NEXT_PUBLIC_REWATCH_GRAPH_PLOT_SIZE`         | グラフのプロットの点の半径の大きさ (デフォルト: `5.0`)                                                                                                           |
| `NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD`        | 視聴記録の有効化 (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 有効)                                                           |
| `NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK`         | タグ・感想機能の有効化 (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 有効)                                                     |
| `NEXT_PUBLIC_NO_DEEP_LINK_UI`                 | DeepLink用のUIを無効にする。BlackboardでDeepLinkを使用する際には有効にする (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 無効) |
| `NEXT_PUBLIC_DOWNLOAD_PAGE_SIZE`              | ダウンロードページでの分割視聴分析データの1ファイルあたりのデータ数 (デフォルト: `0`) `0`のとき、視聴分析データは分割されない|

## フロントエンド周りのビルド

### 前提条件

2023-03-29 現在、以下の環境でビルドを確認。

- Node.js LTS

### ビルド

次のコマンドを実行し、フロントエンドの静的ファイルを生成し配置します。

```sh
git clone https://github.com/npocccties/chibichilo.git
cd chibichilo
corepack enable yarn
yarn
yarn build
```

server/dist ディレクトリ以下にファイルが作られれば成功です。

### 成果物のファイル構造

```
server/dist
├── index.js … サーバーを起動するためのエントリーポイント
├── public
│   ├── LICENSE … 使用しているソフトウェアライセンスの詳細
│   ├── logo.png … ロゴ
│   ├── storybook/* … Storybook のためのファイル群
│   └── ...
└── ...
```

### 使用しているソフトウェアライセンスの詳細

使用しているソフトウェアライセンスの詳細を取得するには `yarn` 実行後、以下のコマンドを実行します。

```sh
yarn build:license
```

成功するとテキストファイル `public/LICENSE` が得られます。

### ロゴ

アプリケーションバーに表示するロゴ画像を変更するには `public/logo.png` を上書き後、ビルドします。

ロゴ画像は最大幅 100px、最大高さ 48px の範囲でアスペクト比を維持してリサイズされます。

### Favicon

tab に表示する favicoon 画像を変更するには`public/favicon.ico` を上書き後、ビルドします。

サイズは下記の通り

- 16px × 16px
- 32px × 32px
- 48px × 48px

### 動画プレイヤー

スクロール追従する動画プレイヤーに高さ制限のスタイルを付与しています。

高さ制限の値を変更するには `NEXT_PUBLIC_VIDEO_MAX_HEIGHT` に [<length> データ型](https://developer.mozilla.org/ja/docs/Web/CSS/Length)を設定します。

高さ制限を解除するには `NEXT_PUBLIC_VIDEO_MAX_HEIGHT` に "unset" を設定します。

### Storybook

いくつかの UI をブラウザで確認するには `yarn` 実行後、以下のコマンドを実行します。

```sh
yarn storybook
```
