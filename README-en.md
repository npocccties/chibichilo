# ViLOG

[English](README-en.md) |[Japanese](README-ja.md)

## What kind of program is it?

ViLOG is an open-source program for analyzing video viewing logs. This program allows you to compile video contents already existing on Wowza, YouTube, and Vimeo into easy-to-use contents for learners and to collect and visualize video viewing logs. This system is an LTI tool provider and can be used in conjunction with LMS such as Moodle and BlackBoard.

<!--- わかりやすい動画例を添付する。 --- LTI リンクを起点とする操作例 Gif か mp4 へのリンク-->

## How to Use ViLOG

Please read the installation guide (INSTALL-ja.md).

### Learning Analytics

Instructors or administrators can download CSV files (with BOM) as learning analytics data.
The details of each column in the CSV file are as follows.

| CSV                        | RDB                        | 説明                                                                                        |
| -------------------------- | -------------------------- | ------------------------------------------------------------------------------------------- |
| `User ID`                  | `users.id`                 | Learner - Identifier                                                                        |
| `Username`                 | `users.name`               | Learner - Full name                                                                         |
| `Email address`            | `users.email`              | Learner - Email address ("" is invalid value)                                               |
| `Course ID`                | -                          | LTI - Shortened course name                                                                 |
| `Course name`              | -                          | LTI - Course name                                                                           |
| `Book ID`                  | `books.id`                 | Book - Identifier                                                                           |
| `Book name`                | `books.name`               | Book - Title                                                                                |
| `Topic ID`                 | `topics.id`                | Topic - Identifier                                                                          |
| `Topic name`               | `topics.name`              | Topic - Name of topic                                                                       |
| `Video length`             | `topics.time_required`     | Topic - Required learning time (in seconds)                                                 |
| `Viewing time`             | `activities.total_time_ms` | Learning activities - Total time (in ms)                                                    |
| `Status of learning`       | -                          | Status of learning - Completed: "completed", Incomplete: "incomplete", Unopened: "unopened" |
| `Learning completion rate` | -                          | 学習完了率 - ユニーク視聴時間が動画の長さを占める割合 (パーセント)                          |
| `First access`             | `activities.created_at`    | 学習活動 - 作成日                                                                           |
| `Last access`              | `activities.updated_at`    | 学習活動 - 更新日                                                                           |

## Architecture

[アーキテクチャの概要](ARCHITECTURE.md)を参照してください。

## Documents

TBA

<!--インストールしたあと、下記の URL から操作方法を学んでください。--?

<!--## 貢献方法

contributing.md を参考にしてください。著作権が発生するほどのコードやドキュメントを貢献していただいた方々には、Authors.rst にお名前と連絡用のメールアドレスを記載します。-->

## License

MIT
