# butterfly

## 設定ファイル

各種サービスへの接続情報など config.php によって設定する。
config.php.sample を参考にして config.php を配置し適宜書き換える必要がある。

コマンド:

```sh
cp config.php.sample config.php
```

config.php:

| 定数              | 型         | 説明                        |
| ----------------- | ---------- | --------------------------- |
| `OAUTH_CONSUMERS` | consumer[] | consumer オブジェクトの配列 |
| `DB_HOST`         | string     | RDB ホスト名                |
| `DB_USERNAME`     | string     | RDB ユーザー名              |
| `DB_PASSWORD`     | string     | RDB ユーザーのパスワード    |
| `DB_DATABASE`     | string     | RDB のデータベース名        |

consumer オブジェクト: OAuth の認証情報の連想配列

| キー                 | 値                 | 型     |
| -------------------- | ------------------ | ------ |
| `oauth_consumer_key` | OAuth Consumer Key | string |
| `oauth_signature`    | OAuth Signature    | string |

## 環境変数

フロントエンド周りの静的コンテンツは環境変数を与えた後 `yarn build` コマンドを実行して生成する。
API の接続先の情報を変更する場合 .env を適宜書き換える必要がある。

.env:

| 環境変数                          | 説明                                    |
| --------------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_API_BASE_PATH`       | API の URL のベースとなるパス           |
| `NEXT_PUBLIC_SUBTITLE_STORE_PATH` | 字幕ファイルの保存先の URL のパス       |
| `NEXT_PUBLIC_LMS_URL`             | 学習管理システムの URL                  |
| `NEXT_PUBLIC_BASE_PATH`           | 静的コンテンツの URL のベースとなるパス |

## フロントエンド周りのビルド

### 前提条件

2020-06-10 現在、以下の環境でビルドを確認。

- Node.js v14.3.0
- Yarn 1.22.4

### ビルド

以下のコマンドを実行。

```sh
yarn && yarn build
```

### Storybook

いくつかの UI をブラウザで確認するには `yarn` 実行後、以下のコマンドを実行。

```sh
yarn storybook
```
