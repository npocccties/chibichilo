.. role:: strike
.. role:: underline
    

ログデータ
=============================================

本システムのログデータを理解するためには、本システムが扱う「イベント」についても理解しておく必要がある。

イベントについては、 :ref:`sect-event` を参照すること。


ログ出力をする対象者
--------------------------------------------

.. _table-definition-of-logging-user:

.. list-table:: ログ出力するユーザーの定義
   :widths: 5 2 20 15
   :header-rows: 1

   * - 対象
     - ログ取得?
     - LTIでの対象判定
     - 補足
   * - 管理者
     - いいえ
     - | roles に administrator
       | が含まれている
     - | LMSの管理者からの
       | アクセスを想定
   * - 教師
     - いいえ
     - | roles に administrator が含まれておらず，
       | instructor が含まれている
     - | LMSの教師やサポーターから
       | のアクセスを想定
   * - 受講者
     - はい
     - 上記以外
     - | LMSの受講者からのアクセス
       | を想定

ログの出力先
------------------------------------------------

syslogへ出力する。

ログの出力タイミング
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

イベントのタイミングで、出力する。

なので、学生がVideo視聴している間10sec毎を基本として、各種イベントが起きた時には、下記のログフォーマットで書き出す。



.. @suppress SentenceLength KatakanaEndHyphen InvalidSymbol

ログのフォーマット
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. Cspell:ignore tnah wowzatokencustomparameter videoplayerlog videoplayer

syslogへ、TSV(タブ区切り)で出力する。

フォーマットについては、 `ログ出力の仕様を整理・定義する · Issue #18 · npocccties/ChibiCHiLO <https://github.com/npocccties/ChibiCHiLO/issues/18>`_ でも議論しているので、必要に応じて参照すること。

.. _tableログフォーマット:

.. list-table:: ログフォーマット
   :widths: 1 2 8 8
   :header-rows: 1

   * - No.
     - 項目名
     - 内容例
     - 補足
   * - 1
     - | サーバー時間
       | （年月日）
     - 2000-01-01
     -
   * - 2
     - | サーバー時間
       | (時分秒)
     - 01:01:01
     -
   * - 3
     - | サーバー時間
       | (タイムゾーン)
     - JST
     -
   * - 4
     - Event
     -
     -
   * - 5
     - Event Value
     -
     -
   * - 6
     - Video名
     - | tnahJxT-td8 (Youtubeの場合)
       | sample.mp4 (Wowzaの場合)
       | 1084537  (Vimeo は現在未対応)
     -
   * - 7
     - URLパラメーター
     - | v=tnahJxT-td8 (Youtubeの場合)
       | wowzatokencustomparameter=..(略)..==
       | (Wowzaの場合)
       | ※未想定 (Vimeo は現在未対応)
     -
   * - 8
     - | ユーザが視聴している現在の
       | ビデオ再生位置
     - 0 や 16.462621 など
     -
   * - 9
     - Client IP Address
     - xxx.xxx.xxx.xxx
     -
   * - 10
     - ブラウザのUA
     -
     - 下記参照
   * - 11
     - LTIに送られたリソース情報
     - hoge:1 や huga:1 など
     - getResourceKey()で取得する値
   * - 12
     - LTIに送られたユーザ情報
     - hoge:1 や huga:1 など
     - getUserKey()で取得する値
   * - 13
     - LTIに送られたコース情報
     - hoge:1 や huga:1 など
     - getCourseKey()で取得する値
   * - 14
     - LTIに送られたnonce
     - d8317e3ec7f0d339209d787f9edd78dc
     -
   * - 15
     - | マイクロコンテンツ
       | 判定キーワード
     - videoplayerlog
     - 固定
   * - 16
     - video種別
     - | YouTube
       | Vimeo
       | Wowza
     - | 新規追加
       | 20201104


サーバ時間(年月日)
   前システムから踏襲する。YYYY-MM-DD のformatで、0を前置する．

サーバ時間（時分秒)
   前システムから踏襲する。HH:MM:SS のformat で、0を前置する。

サーバー時間(タイムゾーン)
   前システムから踏襲する。2021-01-13の段階では、JST固定です。次期ログ開発で改修予定です。

イベント
   イベントについては、 :ref:`sect-event`　を参照せよ。

イベント値
   イベント値について、 :ref:`sect-event` に書いていないので、ここか、イベントの方で定義する。これって、「イベントとは別に取得した情報」のことを指していますか?
   時間の場合は，ユーザが視聴している現在のビデオ再生位置と同じ値(0 や 16.462621 など)でコンマ秒まで出る．

Video名
   Videoを識別する固有の文字列です。YouTubeはビデオIDになります。
   wowzaだと動画のファイル名．
   vimeo は未対応だが，対応するならvimeoのビデオIDを想定している。

URLパラメータ
   URLのパラメータを記述する。YouTube, vimeo, wowza で入るものが異なる。 `この辺の議論を参照せよ。<https://github.com/npocccties/ChibiCHiLO/issues/18#issuecomment-758419047>`_

ビデオ再生位置
   これは、暗黙の了解として「ユーザが視聴している現在のビデオ再生位置」というのが正確な表現になります。
   位置の単位はコンマ秒含む秒単位（0 や16.462621 など）最大値はTypeScript,JavaScriptにて表現できる範囲でお願いします。

Client IP Address
  ご指摘がありました。しかし、結論からいうと現在のログはIPv4だけで良いです。次期ログ開発時に、IPv6のアドレスが必要かを議論します。see also `2021-01-19 ミーティングで確認する内容 · Issue #16 · npocccties/ChibiCHiLO-private <https://github.com/npocccties/ChibiCHiLO-private/issues/16>`_ を確認する。それまでは、IPv4のみの環境で、フォーマットは既存と同じ、xxx.xxx.xxx.xxx の十進数を.(dot)で区切った数値になります。

ブラウザのUA
   使っているブラウザのユーザエージェントをそのまま記録する。ユーザが設定しているUAをそのまま記録する。

.. @suppress DoubledJoshi

LTIに送られたリソース情報
   :ref:`table利用している連携データ` を参照してください。`Learning Tools Interoperability | IMS Global Learning Consortium <https://www.imsglobal.org/activity/learning-tools-interoperability>`_ によると、Learning Platform (Moodle/blackboard) から、Learning Tool (Chibi-CHiLO) に、LTIプロトロルを用いてデータを送ってくるので、LTIに送るというのはちょっと違和感があります。あと、lti:1 getUserKey() で取得する値というのは、:ref:`table利用している連携データ` の中身について話だと理解している。しかしどのように利用しているのか。具体的なデータは何かを以下のコース情報、リソース情報に書いてあげる必要がある。
   LMSから送られる～に名称を変更したほうがいいか？
   lti:1 のコロン(:)より前は，LMSから送られる oauth_consumer_key が入る．LTI_keyがhogeなら，hoge:1 となる
   利用している連携データは resource_link_id

LTIに送られたユーザ情報
   同上
   利用している連携データは user_id

LTIに送られたコース情報
   同上
   利用している連携データは context_id

.. @suppress

LTIに送られたnonce
   nonceはLTIサーバにLMSから情報を送るたびに変化する一意の文字列です．
   同じユーザが同じコースにあるリソースから来たとしても，変化するので，視聴しなおしたかどうか．判断回数などが分かるようになる
   moodleは"6f9beca26ec542e84c71931ad1276137"，backboardは"352126796144595" のように桁数も使用する文字の種類も違うようだが，LTIに情報を送るたびに変化するという仕様は同じ．

マイクロコンテンツ判定キーワード
   本ログの識別子として、videoplayer関係のログであることを示す。固定値

video種別
   :strike:`YouTube,vimeo,wowza の区別が付くように種別を入れる。2020-11-04追加` この部分の追加は、次期log開発時に追加する。

