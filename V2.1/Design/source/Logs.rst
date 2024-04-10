.. role:: strike
.. role:: underline
.. @suppress
.. _sect-event:
    

視聴ログ出力機能
=============================================

本機能は学習者がBO(Book Object)を表示した場合、発生するイベントを動画視聴ログとして出力する機能である。

イベント
--------------------------------------------
本システムのログデータを理解するためには、本システムが扱う「イベント」についても理解しておく必要がある。

イベントとは
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
イベントとは、LTIシステムで、学生が学習コンテンツを視聴した時と行動を記録するために定義された「きっかけ」を記録する。イベントの発生源は、

#. video.js
#. ChibiCHiLOのフロントエンド が、ChangePage Eventを送出している。

がある。

ログとして出力するイベント
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
video.jsは、多数のイベントを取得できるが、現時点のシテスムでは、下記のイベントのみをログに書き出す。

詳細は、個別に記述する。

.. Cspell:ignore firstplay seeked ratechange trackchange beforeunload pagehide changepage currenttime timeupdate videojs youtube

.. csv-table::
   :header: "イベント","イベントとは別に取得した情報","video.jsとの対応"
   :widths: 5,1,10

   "firstplay",      "なし",	                  "`firstplay <https://docs.videojs.com/player#event:firstplay>`_"
   "play",           "なし",                    "`play <https://docs.videojs.com/player#event:play>`_"
   "pause",          "なし",	                  "`pause <https://docs.videojs.com/player#event:pause>`_"
   "seeked",         "シーク操作前のビデオ再生位置", "`seeked <https://docs.videojs.com/player#event:seeked>`_"
   "ended",          "なし",                    "`ended <https://docs.videojs.com/player#event:ended>`_"
   ratechange,	      変更した再生速度倍率,	      "`ratechange <https://docs.videojs.com/player#event:ratechange>`_"
   trackchange,      字幕切り替え後の言語,	      "`change <https://docs.videojs.com/texttracklist#event:change>`_ "
   forward,          なし,                      ""
   back,             なし,                      ""
   beforeunload-ended,なし, ""
   pagehide-ended,   なし, ""
   unload-ended,     なし, ""
   hidden-ended,     なし, ""
   current-time,     なし,	""
   changepage,       切り替え先のマイクロコンテンツID, ""

以下の目的で取得している

.. TODO これ状態遷移のこと考えてる?

firstplay
   学習者がページを開いて最初にビデオを再生開始した時間

   videojsのイベントを利用

   videojsでは，最初にビデオを再生開始すると，最初にfirstplayのイベントがとれた後，playのイベントもとれるので，firstplayはいらないかもしれない．

play
   学習者がビデオを再生開始した時間

   videojsのイベントを利用

   videojsでは，ビデオを一時停止した後，再生開始すると，firstplayのイベントはとれず，playのイベントだけとれる．

pause
   学習者がビデオを一時停止した時間

   videojsのイベントを利用

seeked
   学習者がビデオのシークバーを操作した時間

   videojsのイベントを利用

   シークを始めたビデオの再生位置も知りたくて，以下のように書いて，シーク操作前のビデオ再生位置を別途取得

   ::

      /* Record the start and end of seek time */
      let previousTime = 0;
      let currentTime = 0;
      let seekStart: number | null;
      player.on("timeupdate", function () {
         previousTime = currentTime;
         currentTime = player.currentTime();
      });
      player.on("|", function () {
         if (seekStart === null) {
            seekStart = previousTime;
         }
      });
      player.on("seeked", function () {
         sendLog("seeked", player, seekStart?.toString());
         seekStart = null;
      });

ended
   学習者がビデオを最後まで視聴した時間

   videojsのイベントを利用

ratechange
   学習者がビデオの再生速度を変更した時間

   videojsのイベントを利用

   何倍速に変更したのかも知りたくて， `playbackRate <https://docs.videojs.com/player#playbackRate>`_　から，再生速度倍率を別途取得

   YouTubeを視聴する場合，firstplayの直前に等速処理が入り，その時はユーザが視聴している現在のビデオ再生位置がなく - で記録される．

trackchange
   学習者がビデオの字幕を変更した時間

   videojsのイベントを利用

   どの字幕に変更したのかも知りたくて， 以下のように書いて，字幕切り替え後の言語を別途取得

   ::

      /* Record subtitle information */
      let timeout: number;
      player.remoteTextTracks().addEventListener("change", function action() {
         window.clearTimeout(timeout);
         let showing = Array.from(player.remoteTextTracks()).filter(function (
            track
         ) {
            if (track.kind === "subtitles" && track.mode === "showing") {
            return true;
            } else {
            return false;
            }
         })[0];
         timeout = window.setTimeout(function () {
            player.trigger("subtitleChanged", showing);
         }, 10);
      });
      player.on("subtitleChanged", function (_, track) {
         if (track) {
            sendLog("trackchange", player, track.language);
         } else {
            sendLog("trackchange", player, "off");
         }
      });

forward
   学習者がビデオの早送りをした時間

   videojsの標準機能になかったので，`videojs-seek-buttons <https://www.npmjs.com/package/videojs-seek-buttons>`__ で機能を実装した．

   早送り処理の途中で 'this.options_.direction' の値が forward か back になっていたので，これをイベントとしてログに飛ばす処理を追加した．

   後から追加しなくてもいいようにしたい．

   （ /lti/node_modules/videojs-seek-buttons/dist/videojs-seek-buttons.es.js　に追加）

   ::

      function postForm(req) {
         const form = new FormData();
         Object.entries(req).forEach(([key, value]) => form.append(key, value));
         return {
         method: "POST",
         body: form,
         };
      }
      const sendLogPath = `/lti//call/log.php`;
      const player = this.player_;
      const currentSrc = player.currentSrc();
      const youtubeQuery = currentSrc.split("?")[1];
      const youtubeVideoId =
         new URLSearchParams(youtubeQuery).get("v");
      const currentTime = player.currentTime();
      const sessionStorageKey = "session";
      const res = sessionStorage.getItem(sessionStorageKey);
      const session = JSON.parse(res);
      const req = {
         event: this.options_.direction,
         detail: "-",
         file: youtubeVideoId,
         query: youtubeQuery,
         current: currentTime.toString(),
         rid: session.lmsResource,
         uid: session.id,
         cid: session.lmsCourse,
         nonce: session.nonce,
      };
      if(!session.role){
         fetch(sendLogPath, postForm(req));
      }

back
   学習者がビデオの巻き戻しをした時間

   他は forward と同様

beforeunload-ended
   学習者がビデオをどこまで視聴したか

   ブラウザのイベントを利用

   ブラウザを閉じたり，別のウィンドウやタブに切り替えたイベントで目的が達成できそうだったので採用した．

pagehide-ended
   beforeunload-endedと同様

unload-ended
   beforeunload-endedと同様

hidden-ended
   beforeunload-endedと同様

current-time
   学習者がビデオをどこまで視聴したか

   スクリプトを作成した．

   ::

      setInterval(function () {
         sendLog("current-time", player);
      }, 10000);

   ブラウザのイベント利用は不安だったので，現在の再生位置を把握できるように一定周期でログをとったほうが安心かなと思い作成した

   現在は，プレイヤーの再生停止の有無に関係なく10秒毎に取得しつづけている

changepage
   学習者が学習コンテンツにある，別のマイクロコンテンツに切り替えた時間
   (時間とするとフォーマットと例が欲しいです。)

   スクリプトを作成した．

   どのマイクロコンテンツに変更したのかも知りたくて， マイクロコンテンツのIDを別途取得 （現在のマイクロコンテンツIDなのか、遷移先のマイクロコンテンツIDなのかとか、説明と具体例が必要かと)
   (現在のchangepageのフォーマットは、変更した時刻+遷移元のマイクロコンテンツIDという理解でいいのでしたっけ)

   現在は，自動遷移か手動遷移の区別はついていない．区別が必要かは検討事項とする．


ログ
--------------------------------------------

ログ出力をする対象者
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

syslogへ出力する。

本ログの識別子として、固定値で 'videoplayerlog' を出力している。

ログの出力タイミング
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

イベントのタイミングで、出力する。

なので、学生がVideo視聴している間10sec毎を基本として、各種イベントが起きた時には、下記のログフォーマットで書き出す。



.. @suppress SentenceLength KatakanaEndHyphen InvalidSymbol

ログのフォーマット
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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
     - | youtube
       | vimeo
       | wowza
     -
   * - 17
     - 視聴URLのパス
     - | /book
       | /bookmarks
     -
   * - 18
     - トピックID
     - | 1
     - | 将来追加予定
   * - 19
     - ブックID
     - | 1
     - | 将来追加予定
   * - 20
     - 再生速度
     - | 0.5 や 1 など
     - | 将来追加予定


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

ログの整形
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

syslog出力時、ログのフォーマット以外の不要な情報が含まれている場合があるのでバッチ等で別途除去する。

   例：シェルスクリプトで前日のログを整形する

   ( cron )

   ::

      30 3 * * * /var/log/chibichilo/log.sh

   ( /var/log/chibichilo/log.sh )

   ::

      #!/bin/sh

      LOGA=/var/log/chibichilo/log_`date --date '1 day ago' +%Y%m%d`.log
      LOGB=/var/log/chibichilo_parse/log_`date --date '1 day ago' +%Y%m%d`.log

      sed -e 's/^.*php.*: //g' -e 's/^.*httpd.*: //g' -e 's/^.*www.*: //g' -e 's/^.*line=//g' -e 's/#012/\n/g' -e 's/#011/	/g'  -e 's/\\x09/	/g'  -e '/current-time	-	-	/d' -e 's@https://youtu.be/@@g' -e 's/::ffff://g' $LOGA > $LOGB
      

