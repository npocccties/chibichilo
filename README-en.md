# CHiBi-CHiLO

[English](README-en.md) |[Japanese](README-ja.md)

## What kind of program is it?

CHiBi-CHiLO is an open-source program for analyzing video viewing logs. This program allows you to compile video contents already existing on Wowza, YouTube, and Vimeo into easy-to-use contents for learners and to collect and visualize video viewing logs. This system is an LTI tool provider and can be used in conjunction with LMS such as Moodle and BlackBoard.

<!--- わかりやすい動画例を添付する。 --- LTI リンクを起点とする操作例 Gif か mp4 へのリンク-->

## How to Use CHiBi-CHiLO

Please read the installation guide (INSTALL-ja.md).

### Learning Analytics

Instructors or administrators can download CSV files (with BOM) as learning analytics data.
The details of each column in the CSV file are as follows.

| CSV                        | RDB                        | Explanation                                                                                 |
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
| `Learning completion rate` | -                          | Learning Completion Rate - Unique viewing time as a percentage of video length              |
| `First access`             | `activities.created_at`    | Learning activities - creation date                                                         |
| `Last access`              | `activities.updated_at`    | Learning activities - updated date                                                          |

## Architecture

See [architecture](ARCHITECTURE.md) overview (japanese).

## Documents

TBA

<!--インストールしたあと、下記の URL から操作方法を学んでください。--?

<!--## 貢献方法

contributing.md を参考にしてください。著作権が発生するほどのコードやドキュメントを貢献していただいた方々には、Authors.rst にお名前と連絡用のメールアドレスを記載します。-->

## License

MIT
