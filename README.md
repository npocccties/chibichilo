# GakuNinLMS-LTI-MC

GakuNinLMS-LTI-MC, utilizing LTI, is a system that can create and browse learning contents using micro contents.

## Settng File

Set the connection information to various services using config.php.
Refer to config.php.sample and place config.php which requires rewriting when necessary.

Command:

```sh
cp config.php.sample config.php
```

config.php:

| Const                | type       | Explanation                                   |
| -------------------- | ---------- | --------------------------------------------- |
| `OAUTH_CONSUMERS`    | consumer[] | consumer array of objects                     |
| `DB_HOST`            | string     | RDB Host name                                 |
| `DB_USERNAME`        | string     | RDB Username                                  |
| `DB_PASSWORD`        | string     | RDB User password                             |
| `DB_DATABASE`        | string     | RDB Database name                             |
| `WOWZA_BASE_URL`     | string     | WOWZA Content base URL                        |
| `WOWZA_SECURE_TOKEN` | string     | WOWZA SecureToken Shared Secret               |
| `WOWZA_QUERY_PREFIX` | string     | WOWZA SecureToken Hash Query Parameter Prefix |
| `WOWZA_EXPIRES_IN`   | int        | WOWZA SecureToken lifetime (seconds)          |

consumer object: Associative array of authentication information of OAuth

| Key                  | Value              | Type   |
| -------------------- | ------------------ | ------ |
| `oauth_consumer_key` | OAuth Consumer Key | string |
| `oauth_signature`    | OAuth Signature    | string |

## Environment variable

Static contents around the front end are created by executing the `yarn build` command after giving environment variables.
When changing the information of the connection destination of API, .env must be rewritten appropriately.

.env:

| Environment variable              | Explanation                       |
| --------------------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_BASE_PATH`       | Base path for API URLs            |
| `NEXT_PUBLIC_SUBTITLE_STORE_PATH` | URL path for saved subtitle files |
| `NEXT_PUBLIC_LMS_URL`             | Learning management system URL    |
| `NEXT_PUBLIC_BASE_PATH`           | Base path for static content URLs |

## Build front-ends

### Prerequisites

As of 2020-06-10, confirm the build in the following environment.

- Node.js v14.3.0
- Yarn 1.22.4

### Build

Execute the following command.

```sh
yarn && yarn build
```

### Storybook

To confirm some UI on the browser, execute the following command after executing `yarn`.

```sh
yarn storybook
```
