# chibichilo-server

## 開発

### 前提条件

2021-09-03 現在、以下の環境で動作確認済み

- Docker v20
- Docker Compose v1.29
- Node.js v16
- Yarn v1.22

### 手順

データベースを構築します。開発環境は次のコマンドで構築します。

```sh
docker-compose up -d
```

デフォルトでは URL `postgresql://postgres:password@localhost/postgres` で接続可能な PostgreSQL データベースが構築されます。

.env.sample を参照し、書き換えてデータベースへの接続情報を書き込みます。

```sh
cp .env.sample .env
```

依存パッケージ群をインストールします。

```sh
yarn
```

その接続情報をもとにしてデータベースをマイグレートし、開発用サーバーを起動します。

```sh
yarn dev
```

データベースのマイグレートのみを実行する場合は次のコマンドを実行します。

```sh
yarn migrate
```

データベースのビジュアルエディター[Prisma Studio](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-studio)を利用できます。

```sh
yarn prisma studio
```

開発用サーバーを起動後、`http://localhost:{PORT}{BASE_PATH}/swagger` にアクセスすると API ドキュメントツール[Swagger UI](https://swagger.io/tools/swagger-ui/) を利用できます。

例: http://localhost:8080/api/v2/swagger

### 撤去

データベースを撤去します。**データベースの中身はすべて消去されます。**

```
docker-compose down
```

## 環境変数

| 名称                                 | 説明                                                                                                                                                               |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PORT`                               | ポート (デフォルト: `8080`)                                                                                                                                        |
| `API_BASE_PATH`                      | ベースとなるパス (デフォルト: `/api/v2` )                                                                                                                          |
| `FRONTEND_ORIGIN`                    | フロントエンドのオリジン (デフォルト: 無効 ""、例: `http://localhost:3000`)                                                                                        |
| `FRONTEND_PATH`                      | フロントエンドのパス (デフォルト: `/`)                                                                                                                             |
| `SESSION_SECRET`                     | セッションストアの秘密鍵                                                                                                                                           |
| `OPENID_PRIVATE_KEY`                 | クライアント認証用の PEM 形式の秘密鍵の文字列 (デフォルト: 無効)                                                                                                   |
| `OPENID_PRIVATE_KEY_PATH`            | クライアント認証用の PEM 形式の秘密鍵のファイルパス (デフォルトまたは `OPENID_PRIVATE_KEY` が有効の場合: 無効 "")                                                  |
| `DATABASE_URL`                       | [PostgreSQL 接続 URL][database_connection_url]                                                                                                                     |
| `HTTPS_CERT_PATH`                    | HTTPS を使うための証明書のファイルパス (デフォルト: 無効)                                                                                                          |
| `HTTPS_KEY_PATH`                     | HTTPS を使うための証明書の秘密鍵のファイルパス (デフォルト: 無効)                                                                                                  |
| `WOWZA_BASE_URL`                     | Wowza Content base URL (デフォルト: 無効)                                                                                                                          |
| `WOWZA_SECURE_TOKEN`                 | Wowza SecureToken Shared Secret (デフォルト: "")                                                                                                                   |
| `WOWZA_QUERY_PREFIX`                 | Wowza SecureToken Hash Query Parameter Prefix (デフォルト: `wowzatoken`)                                                                                           |
| `WOWZA_EXPIRES_IN`                   | Wowza SecureToken lifetime (seconds) (デフォルト: いつまでも持続 `0`)                                                                                              |
| `WOWZA_SCP_HOST`                     | 一括登録時の動画ファイルのアップロード先 (デフォルト: "")                                                                                                          |
| `WOWZA_SCP_PORT`                     | 一括登録時の動画ファイルのアップロード先 ssh ポート番号 (デフォルト: `22`)                                                                                         |
| `WOWZA_SCP_USERNAME`                 | 一括登録時の動画ファイルのアップロード先 ssh ユーザー名 (デフォルト: "")                                                                                           |
| `WOWZA_SCP_PRIVATE_KEY`              | 一括登録時の動画ファイルのアップロード先 ssh ユーザーの秘密鍵 (デフォルト: 無効)                                                                                   |
| `WOWZA_SCP_PRIVATE_KEY_PATH`         | 一括登録時の動画ファイルのアップロード先 ssh ユーザーの秘密鍵のパス (デフォルトまたは `WOWZA_SCP_PRIVATE_KEY` が有効の場合: 無効)                                  |
| `WOWZA_SCP_PASS_PHRASE`              | 一括登録時の動画ファイルのアップロード先 ssh ユーザーの秘密鍵のパスワード (デフォルト: "")                                                                         |
| `WOWZA_SCP_SERVER_PATH`              | 一括登録時の動画ファイルのアップロード先フォルダ (デフォルト: "")                                                                                                  |
| `WOWZA_THUMBNAIL_BASE_URL`           | サムネイル画像の URL (デフォルト: "")                                                                                                                              |
| `WOWZA_THUMBNAIL_EXTENSION`          | 生成されるサムネイル画像の拡張子 (デフォルト: "jpg")                                                                                                               |
| `ZOOM_API_KEY`                       | Zoom API アクセスキー                                                                                                                                              |
| `ZOOM_API_SECRET`                    | Zoom API シークレット                                                                                                                                              |
| `ZOOM_IMPORT_CONSUMER_KEY`           | Zoom インポートのユーザー検索に用いるコンシューマーキー (デフォルト: 無効 ""、例: 設定値 `OAUTH_CONSUMER_KEY` と同じ値)                                            |
| `ZOOM_IMPORT_INTERVAL`               | Zoom インポートの実行時間 (デフォルト: 無効 ""、例: 毎朝 6 時実行 `1 6 * * *`)                                                                                     |
| `ZOOM_IMPORT_TO`                     | Zoom からインポートした動画のアップロード先 (デフォルト: 無効 ""、例: `wowza`)                                                                                     |
| `ZOOM_IMPORT_WOWZA_BASE_URL`         | Zoom からインポートした動画の URL のルート (デフォルト: 無効 ""、例: フロント側の設定値の `NEXT_PUBLIC_API_BASE_PATH` と同じ値)                                    |
| `ZOOM_IMPORT_AUTODELETE`             | Zoom からインポートした動画の自動削除設定 (デフォルト: 無効 ""、例: `1`)                                                                                           |
| `ZOOM_IMPORT_DISABLE_AUTOPUBLIC`     | Zoom からインポートした動画に公開 URL を発行しない (デフォルト: 無効(自動で公開 URL を発行する) ""、例: `1`)                                                       |
| `ZOOM_IMPORT_PUBLIC_DEFAULT_DOMAINS` | Zoom からインポートした動画の公開 URL に公開範囲ドメインを自動設定する。`,` で区切ると複数のドメインの指定が可能 (デフォルト: ""、例: `example.com`)               |
| `PUBLIC_ACCESS_HASH_ALGORITHM`       | 公開 URL のトークン生成に利用するハッシュアルゴリズム (デフォルト: "sha256"、`openssl help` コマンドの "Message Digest commands" の項目に表示される値が利用可能)   |
| `PUBLIC_ACCESS_CRYPTO_ALGORITHM`     | Wowza 動画と字幕のトークン生成に利用する暗号化アルゴリズム (デフォルト: "aes-256-cbc"、`openssl help` コマンドの "Cipher commands" の項目に表示される値が利用可能) |
| `ACTIVITY_RATE_MIN`                  | 学習活動の完了とみなす最小の視聴時間の割合 (デフォルト:`0.9`)                                                                                                      |

[database_connection_url]: https://www.prisma.io/docs/reference/database-connectors/connection-urls/

### ヒント: 秘密鍵の生成

秘密鍵には十分なエントロピーをもつ乱数を使用してください。

例:

```sh
echo SESSION_SECRET=$(node -r crypto -pe 'crypto.randomBytes(32).toString("hex")') >> .env
```

## 本番環境へのデプロイ

### ビルド

次のコマンドを実行し、フロントエンドの静的ファイルを生成し配置します。

```sh
git clone https://github.com/npocccties/chibichilo.git
cd chibichilo
yarn
yarn build
```

server/dist ディレクトリ以下にファイルが作られれば成功です。

### データベースのマイグレーション

データベースのマイグレーションを行います。

```sh
cd server
echo 'DATABASE_URL={PostgreSQL 接続 URL}' >> .env
yarn migrate
```

### LTI v1.3 の設定

マイグレーション後、接続する PostgreSQL に対して、次の SQL を発行し、LTI Platform の設定を行います。

```sql
INSERT INTO "lti_platform" ("issuer", "metadata") VALUES ('{Platform ID}', '{
  "jwks_uri": "{Public keyset URL}",
  "token_endpoint": "{Access token URL}",
  "authorization_endpoint": "{Authentication request URL}"
}');
INSERT INTO "lti_consumer" ("platform_id", "id") VALUES ('{Platform ID}', '{Client ID}');
```

例: Moodle 3.7+ の場合

Platform ID が `https://example` (Moodle) の場合の例:

ツールの追加は、Moodle ログイン後、[Site administration] > [Plugins] > [Activity modules] > [External tool] > [Manage tools] にアクセスして行います。

ツールの設定の例:

| 項目                                             | 説明                                                                             |
| ------------------------------------------------ | -------------------------------------------------------------------------------- |
| Tool Name                                        | ツール名                                                                         |
| Tool URL                                         | デプロイ先の URL を指定 (例: `https://chibichilo.example/`)                      |
| LTI version                                      | `LTI 1.3`                                                                        |
| Public key type                                  | `RSA key`                                                                        |
| Public key                                       | 公開鍵を指定 (後述)                                                              |
| Initiate login URL                               | ログイン初期化エンドポイント (例: `https://chibichilo.example/api/v2/lti/login`) |
| Redirection URI(s)                               | リダイレクト URI (例: `https://chibichilo.example/api/v2/lti/callback`)          |
| Services > IMS LTI Assignment and Grade Services | "Use this service for grade sync"                                                |
| Services > IMS LTI Names and Role Provisioning   | "Use this service to retrieve members' information as per privacy settings" |

Client ID はツール追加後に払い出されます。ツール追加後、[View configuration details] を参照してください。
設定値に合わせて SQL を発行します。

SQL:

```sql
INSERT INTO "lti_platform" ("issuer", "metadata") VALUES ('https://example', '{
  "jwks_uri": "https://example/mod/lti/certs.php",
  "token_endpoint": "https://example/mod/lti/token.php",
  "authorization_endpoint": "https://example/mod/lti/auth.php"
}');
INSERT INTO "lti_consumer" ("platform_id", "id") VALUES ('https://example', '***');
```

ローカル環境で開発用サーバー [docker-compose.yml](../docker-compose.yml) を使うケース:

```sql
INSERT INTO "lti_platform" ("issuer", "metadata") VALUES ('http://localhost:8081', '{
  "jwks_uri": "http://moodle:8080/mod/lti/certs.php",
  "token_endpoint": "http://moodle:8080/mod/lti/token.php",
  "authorization_endpoint": "http://localhost:8081/mod/lti/auth.php"
}');
INSERT INTO "lti_consumer" ("platform_id", "id") VALUES ('http://localhost:8081', '***');
```

### クライアント認証用の鍵の生成

クライアント認証用の鍵を生成します。

例えば OpenSSL を利用して次のコマンドを実行します。

```sh
openssl genrsa -out credentials/private-key.pem
openssl rsa -in credentials/private-key.pem -pubout -out credentials/public-key.pem
```

生成した公開鍵 `credentials/public-key.pem` の内容 (`-----BEGIN PUBLIC KEY-----` の行から始まる文字列) は、ツールの公開鍵 (Public key) として LMS に登録します。

生成した秘密鍵は、そのパスを環境変数 `OPENID_PRIVATE_KEY_PATH` に指定します。

```sh
echo OPENID_PRIVATE_KEY_PATH="$(pwd)/credentials/private-key.pem" >> .env
```

### 既存システムの LTI v1.3 への移行

従来の LTI v1.0/v1.1 で登録されているシステムの LTI v1.3 への移行は下記の手順で作業を行います。

**注意: Moodle の場合を例に説明します。他の LMS をご使用の場合はその LMS に合わせてご対処ください。**

#### 必要に応じて: LMS のアップデート

もし LMS が LTI v1.3 に対応していない場合、対応しているバージョンにアップデートします。

| LMS    | LTI v1.3 サポート状況 |
| ------ | --------------------- |
| Moodle | v3.7 以降             |

#### 既存の LTI v1.1 Tool Consumer ID の取得

Moodle の場合、管理者としてログイン後、[Site administration] > [Plugins] > [Activity modules] > [External tool] > [Manage tools] にアクセスして、既存の LTI v1.1 Tool Consumer ID の取得します。

#### LTI バージョンを v1.3 に変更

LMS から対象の LTI v1.1 Tool Consumer ID をメモした後、LTI v1.3 の設定を行います。本文書の[LTI v1.3 の設定]の項を参照してください。

#### 移行の実施

設定値に合わせて SQL を発行します。なお、下記の例では、Client ID として `***` と記載していますが、新しく LMS によって払い出された Client ID に適宜書き換えてください。その他のパラメーターに関しても同様に適宜書き換えてください。

LTI v1.1 Tool Consumer ID が `example`、Platform ID が `https://example` の Moodle の場合の例:

```sql
INSERT INTO "lti_platform" ("issuer", "metadata") VALUES ('https://example', '{
  "jwks_uri": "https://example/mod/lti/certs.php",
  "token_endpoint": "https://example/mod/lti/token.php",
  "authorization_endpoint": "https://example/mod/lti/auth.php"
}');
UPDATE "lti_consumer" SET "platform_id" = 'https://example', "id" = '***', "secret" = '' WHERE "id" = 'example';
UPDATE "lti_context" SET "consumer_id" = '***' WHERE "consumer_id" = 'example';
UPDATE "lti_resource_link" SET "consumer_id" = '***' WHERE "consumer_id" = 'example';
UPDATE "users" SET "lti_consumer_id" = '***' WHERE "lti_consumer_id" = 'example';
```

既存システムの LTI v1.3 への移行の実施手順としては以上です。

### LTI v1.0/v1.1 の設定 (非推奨)

従来どおり LTI v1.0/v1.1 を使用する場合、マイグレーション後、次の SQL を発行し、LTI Tool Consumer の設定を行います。

```sql
INSERT INTO "lti_consumer" ("id", "secret") VALUES ('{LMS に登録する OAuth Consumer Key}', '{LMS に登録する OAuth Consumer Secret}');
```

#### ヒント: PostgreSQL への接続

[psql コマンド](https://www.postgresql.org/docs/current/app-psql.html) を使うことで接続できます。

```sh
psql "$DATABASE_URL"
```

#### 別の方法: Prisma Studio を使う

データベースのビジュアルエディター Prisma Studio を使い、LTI Tool Consumer の設定を行います。

```sh
yarn --cwd server prisma studio
```

コマンドの実行し、ブラウザーから Prisma Studio にアクセスした後、 [Open a Model] → [LtiConsumer] を開きます。
[Add Record] を押し適切な LMS に登録する OAuth Consumer Key とその秘密鍵の値をそれぞれ `id` と `secret` に書き加えます。
[Save 1 change] ボタンを押すと、 OAuth Consumer を追加できます。

### 起動

dist ディレクトリをサーバー上に配置し、各環境変数とともに `NODE_ENV=production node dist/index.js | logger -p daemon.info -t chibichilo-server` とコマンドを実行することでアプリケーションを起動できます。
[プロセスマネージャ PM2 を使って本番環境のサーバー上で起動する](https://future-architect.github.io/typescript-guide/deploy.html#id3)などしましょう。
