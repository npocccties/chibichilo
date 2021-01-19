# chibichilo-server

## 開発

### 前提条件

2020-12-16 現在、以下の環境で動作確認済み

- Docker v20
- Docker Compose v1.27
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

| 名称                    | 説明                                                              |
| ----------------------- | ----------------------------------------------------------------- |
| `PORT`                  | ポート (デフォルト: `8080`)                                       |
| `API_BASE_PATH`         | ベースとなるパス (例: `/api/v2` )                                 |
| `FRONTEND_ORIGIN`       | フロントエンドのオリジン (例: `http://localhost:3000`)            |
| `FRONTEND_PATH`         | フロントエンドのパス (例: `http://localhost:3000/` ならば `/`)    |
| `SESSION_SECRET`        | セッションストアの秘密鍵                                          |
| `OAUTH_CONSUMER_KEY`    | LMS に登録されている OAuth Consumer Key                           |
| `OAUTH_CONSUMER_SECRET` | LMS に登録されている OAuth Consumer Secret                        |
| `DATABASE_URL`          | [PostgreSQL 接続 URL][database_connection_url]                    |
| `HTTPS_CERT_PATH`       | HTTPS を使うための証明書のファイルパス (デフォルト: 無効)         |
| `HTTPS_KEY_PATH`        | HTTPS を使うための証明書の秘密鍵のファイルパス (デフォルト: 無効) |

[database_connection_url]: https://www.prisma.io/docs/reference/database-connectors/connection-urls/

## 本番環境へのデプロイ

### 前提

フロントエンドの静的ファイルを生成し public ディレクトリ以下に配置します。
加えて、サーバー上のデータベースはあらかじめマイグレートしておく必要があります。

### ビルド

次のコマンドを実行してビルドします。

```sh
yarn build
```

dist ディレクトリ以下に作られたファイルが作られれば成功です。

### 起動

dist ディレクトリをサーバー上に配置し、各環境変数とともに `NODE_ENV=production node dist/index.js | logger -p daemon.info -t chibichilo-server` とコマンドを実行することでアプリケーションを起動できます。
[プロセスマネージャ PM2 を使って本番環境のサーバー上で起動する](https://future-architect.github.io/typescript-guide/deploy.html#id3)などしましょう。
