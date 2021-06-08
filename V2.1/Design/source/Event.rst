.. @suppress
.. _sect-event:

イベント
===========================================================


イベントとは、LTIシステムで、学生が学習コンテンツを視聴した時と行動を記録するために定義された「きっかけ」を記録する。イベントの発生源は、

#. video.js
#. ChibiCHiLOのフロントエンド が、ChangePage Eventを送出している。

がある。video.jsは、多数のイベントを取得できるが、現時点のシテスムでは、下記のイベントのみをログに書き出す。

` <https://github.com/webdino-butterfly/butterfly/blob/master/docs/log.md#%E3%82%A4%E3%83%99%E3%83%B3%E3%83%88>`_
2020/10/05時点での閲覧

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

   現在は，自動遷移か手動遷移の区別はついていない．区別が必用かは検討事項とする．
