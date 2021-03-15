# Installation

English | [日本語](INSTALL-ja.md)

## Environment variable

Static contents around the front end are created by executing the `yarn build` command after giving environment variables.
When changing the information of the connection destination of API, .env must be rewritten appropriately.

.env:

| Environment variable                 | Explanation                                          |
| ------------------------------------ | ---------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_PATH`          | Base path for API URLs (デフォルト: 同一オリジン "") |
| `NEXT_PUBLIC_BASE_PATH`              | Base path for static content URLs (デフォルト: "")   |
| `NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL` | 学習活動の送信間隔 (秒) (デフォルト: `10`)           |

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
