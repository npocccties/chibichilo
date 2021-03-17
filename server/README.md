# chibichilo-server

## 開発

### 前提条件

2021-02-15 現在、以下の環境で動作確認済み

- Docker v20
- Docker Compose v1.28
- Node v14
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

| 名称                 | 説明                                                                        |
| -------------------- | --------------------------------------------------------------------------- |
| `PORT`               | ポート (デフォルト: `8080`)                                                 |
| `API_BASE_PATH`      | ベースとなるパス (デフォルト: `/api/v2` )                                   |
| `FRONTEND_ORIGIN`    | フロントエンドのオリジン (デフォルト: 無効 ""、例: `http://localhost:3000`) |
| `FRONTEND_PATH`      | フロントエンドのパス (デフォルト: `/`)                                      |
| `SESSION_SECRET`     | セッションストアの秘密鍵                                                    |
| `DATABASE_URL`       | [PostgreSQL 接続 URL][database_connection_url]                              |
| `HTTPS_CERT_PATH`    | HTTPS を使うための証明書のファイルパス (デフォルト: 無効)                   |
| `HTTPS_KEY_PATH`     | HTTPS を使うための証明書の秘密鍵のファイルパス (デフォルト: 無効)           |
| `WOWZA_BASE_URL`     | Wowza Content base URL (デフォルト: 無効)                                   |
| `WOWZA_SECURE_TOKEN` | Wowza SecureToken Shared (デフォルト: "") Secret                            |
| `WOWZA_QUERY_PREFIX` | Wowza SecureToken Hash Query Parameter Prefix (デフォルト: `wowzatoken`)    |
| `WOWZA_EXPIRES_IN`   | Wowza SecureToken lifetime (seconds) (デフォルト: いつまでも持続 `0`)       |

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
git clone https://github.com/npocccties/ChibiCHiLO.git
cd ChibiCHiLO
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

### LTI Tool Consumer の設定

マイグレーション後、接続する PostgreSQL に対して、次の SQL を実行し、LTI Tool Consumer の設定を行います。

```sql
INSERT INTO "lti_consumer" VALUES ('{LMS に登録する OAuth Consumer Key}', '{LMS に登録する OAuth Consumer Secret}');
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
