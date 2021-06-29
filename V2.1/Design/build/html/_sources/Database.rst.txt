DataBase
===========

.. @suppress SentenceLength

ER図
------------------------------------------------

.. Cspell:ignore abstruct

詳細は、個別に記述する。下記は、ER図の例

.. uml::
    skinparam monochrome true

    entity "1. Resource/教育用外部リソース" {
    * id: Int
    topics: "Topic/トピック"[]?
    video: "Video/ビデオ"?
    videoId: Int?
    * "url/外部リソースのアドレス": String
    * "details/詳細": Json
    }

    entity "2. Video/ビデオ" {
    * id: Int
    * resource: "Resource/教育用外部リソース"
    tracks: "Track/ビデオのトラック (字幕・キャプション)"[]?
    "providerUrl/動画プロバイダーの識別子": String?
    }

    entity "3. Track/ビデオのトラック (字幕・キャプション)" {
    * id: Int
    * video: "Video/ビデオ"
    * videoId: Int
    * "kind/種別 subtitles": String
    * "language/言語 ISO 639-1 code": String
    }

    entity "4. Topic/トピック" {
    * id: Int
    * resource: "Resource/教育用外部リソース"
    * resourceId: Int
    keywords: "Keyword/キーワード"[]?
    topicSection: "TopicSection/セクション内トピック"[]?
    activities: "Activity/学習活動"[]?
    * "name/トピック名称": String
    * "description/説明": String
    * "timeRequired/学習所要時間 (秒)": Int
    * "creator/作成者": "User/利用者"
    * creatorId: Int
    * "createdAt/作成日": DateTime
    * "updatedAt/更新日": DateTime
    * "details/詳細": Json
    }

    entity "5. Keyword/キーワード" {
    * id: Int
    topics: "Topic/トピック"[]?
    books: "Book/ブック"[]?
    * "name/名称 (カンマ , を含めない)": String
    }

    entity "6. LtiContext" {
    * id: String
    resourceLinks: LtiResourceLink[]?
    * title: String
    }

    entity "7. LtiResourceLink" {
    * id: String
    * context: LtiContext
    * contextId: String
    * title: String
    * book: Book
    * bookId: Int
    }

    entity "8. Book/ブック" {
    * id: Int
    keywords: "Keyword/キーワード"[]?
    sections: "Section/セクション"[]?
    ltiResourceLinks: LtiResourceLink[]?
    * "name/題名": String
    * "abstruct/概要": String
    * "author/著作者": "User/利用者"
    * authorId: Int
    * "publishedAt/公開日": DateTime
    * "createdAt/作成日": DateTime
    * "updatedAt/更新日": DateTime
    * "details/詳細": Json
    }

    entity "9. Section/セクション" {
    * id: Int
    * book: "Book/ブック"
    * bookId: Int
    topicSections: "TopicSection/セクション内トピック"[]?
    * "order/順番 (昇順)": Int
    "name/名称 (NULLならば匿名のトピックの集まり)": String?
    }

    entity "19. TopicSection/セクション内トピック" {
    * id: Int
    * section: "Section/セクション"
    * sectionId: Int
    * topic: "Topic/トピック"
    * topicId: Int
    * "order/順番 (昇順)": Int
    }

    entity "11. User/利用者" {
    * id: Int
    createdTopics: "Topic/トピック"[]?
    writtenBooks: "Book/ブック"[]?
    * ltiUserId: String
    activities: "Activity/学習活動"[]?
    * "name/氏名": String
    }

    entity "12. Activity/学習活動" {
    * id: Int
    * topic: "Topic/トピック"
    * topicId: Int
    * learner: "User/利用者"
    * learnerId: Int
    * "type/学習活動種別 completed": String
    * "createdAt/作成日": DateTime
    * "updatedAt/更新日": DateTime
    }

    "Resource/教育用外部リソース" ||..o{ "Topic/トピック"
    "Resource/教育用外部リソース" ||..o| "Video/ビデオ"
    "Video/ビデオ" ||..o{ "Track/ビデオのトラック (字幕・キャプション)"
    "Topic/トピック" }o..o{ "Keyword/キーワード"
    LtiContext ||..o{ LtiResourceLink
    "Book/ブック" ||..o{ LtiResourceLink
    "Book/ブック" }o..o{ "Keyword/キーワード"
    "Book/ブック" ||..o{ "Section/セクション"
    "Section/セクション" ||..o{ "TopicSection/セクション内トピック"
    "Topic/トピック" ||..o| "TopicSection/セクション内トピック"
    "Book/ブック" }o..|| "User/利用者"
    "Topic/トピック" }o..|| "User/利用者"
    "Topic/トピック" ||..o{ "Activity/学習活動"
    "User/利用者" ||..o{ "Activity/学習活動"

上記プロパティの詳細は `ChibiCHiLO/schema.prisma <https://github.com/cccties/ChibiCHiLO/blob/54bcd12465eb74a33dab9b1b037ce954fdf6df52/server/prisma/schema.prisma>`_ にコメントしてあります。
