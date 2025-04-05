# Installation

English | [日本語](INSTALL-ja.md)

## Environment variable

Static contents around the front end are created by executing the `yarn build` command after giving environment variables.
When changing the information of the connection destination of API, .env must be rewritten appropriately.

.env:

| Environment variable                          | Explanation                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_BASE_PATH`                   | Base path for API URLs (デフォルト: 同一オリジン "")                                                                      |
| `NEXT_PUBLIC_BASE_PATH`                       | Base path for static content URLs (デフォルト: "")                                                                        |
| `NEXT_PUBLIC_ACTIVITY_LTI_CONTEXT_ONLY`       | 学習活動の LTI Context ごとでの取得 (フォーマット: [YAML 1.1 真偽値](https://yaml.org/type/bool.html)) (デフォルト: 無効) |
| `NEXT_PUBLIC_ACTIVITY_SEND_INTERVAL`          | 学習活動の送信間隔 (秒) (デフォルト: `10`)                                                                                |
| `NEXT_PUBLIC_VIDEO_MAX_HEIGHT`                | max-height for scroll-following video player (デフォルト: `40vh`)                                                         |
| `NEXT_PUBLIC_NO_EMBED`                        | Do not allow anyone to embed. Disabled by default.                                                                        |
| `NEXT_PUBLIC_ACTIVITY_REWATCH_RATE_THRESHOLD` | Threshold for visualizing rewatched activities based on activity rewatch rate (between `0` and `1`) (Default: `0.1`)      |
| `NEXT_PUBLIC_REWATCH_GRAPH_COUNT_THRESHOLD`   | Threshold for plotting learners' activity counts on a rewatch graph (Default: `20`)                                       |
| `NEXT_PUBLIC_REWATCH_GRAPH_PLOT_SIZE`         | Radius size of plot points on a rewatch graph (Default: `5.0`)                                                            |
| `NEXT_PUBLIC_ENABLE_TOPIC_VIEW_RECORD`        | Option for enabling topic view record (Format: [YAML 1.1 Boolean](https://yaml.org/type/bool.html)) (Default: `true`)     |
| `NEXT_PUBLIC_ENABLE_TAG_AND_BOOKMARK`         | Option for enabling tag and bookmark (Format: [YAML 1.1 Boolean](https://yaml.org/type/bool.html)) (Default: `true`)      |
| `NEXT_PUBLIC_NO_DEEP_LINK_UI`                 | Do not allow anyone to DeepLink UI. Disabled by default.                                                                  |

## Build front-ends

### Prerequisites

As of 2023-03-29, confirm the build in the following environment.

- Node.js LTS

### Build

Execute the following command.

```sh
corepack enable yarn
yarn && yarn build
```

### Storybook

To confirm some UI on the browser, execute the following command after executing `yarn`.

```sh
yarn storybook
```

## Customization

### Logo

Customize the logo image which layout in AppBar be able by overwrite the `./public/logo.png` .

Consider the logo image will be resized in a range of width 100px / height 48px with keeping aspect ratio.

### Favicon

Customize the favicon image which layout in tab be able by overwrite the `./public/favicon.ico` .

The sizes are as follows.

- 16px × 16px
- 32px × 32px
- 48px × 48px

### Video player

Some video player has scroll-follow and has been applied height limitation by css.

To change value of the height limitation, Set value of [<length> Data Type](https://developer.mozilla.org/en-US/docs/Web/CSS/Length) to `NEXT_PUBLIC_VIDEO_MAX_HEGIHT`.

To disable the height limitation, Set "unset" to `NEXT_PUBLIC_VIDEO_MAX_HEIGHT`.
