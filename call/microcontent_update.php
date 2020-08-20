<?php
require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}
if (!$context->isInstructor()) {
  http_response_code(403);
  return;
}

$db = require(__DIR__.'/../database.php');

$uid = $context->getUserKey();
$time = time();

$json = file_get_contents('php://input');
$arr = json_decode($json, true);
$title = $arr['title'];
$video = $arr['video'];
$description = $arr['description'];
$skill = $arr['skill'];
$task = $arr['task'];
$level = $arr['level'];
$microcontentid = $arr['id'];

$db->prepare(<<<'SQL'
  UPDATE mc_microcontent
  SET
    name=:title, video=:video, description=:description, timemodified=:time, modifiedby=:uid
  WHERE
    id=:microcontentid
SQL)->execute([
  ':title' => $title,
  ':video' => $video,
  ':description' => $description,
  ':time' => $time,
  ':uid' => $uid,
  ':microcontentid' => $microcontentid
]);

$db->prepare(<<<'SQL'
  DELETE FROM mc_microcontent_skill
  WHERE
    microcontentid=?
SQL)->execute([$microcontentid]);

foreach ($skill as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_skill
      (microcontentid, skillid)
    VALUES
      (?, ?)
  SQL)->execute([$microcontentid, $row]);
}

$db->prepare(<<<'SQL'
  DELETE FROM mc_microcontent_task
  WHERE
    microcontentid=?
SQL)->execute([$microcontentid]);

foreach ($task as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_task
      (microcontentid, taskid)
    VALUES
      (?, ?)
  SQL)->execute([$microcontentid, $row]);
}

$db->prepare(<<<'SQL'
  DELETE FROM mc_microcontent_level
  WHERE
    microcontentid=?
SQL)->execute([$microcontentid]);

foreach ($level as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_level
      (microcontentid, levelid)
    VALUES
      (?, ?)
  SQL)->execute([$microcontentid, $row]);
}

$lang = $arr['lang'];
$subtitles = $arr['subtitles'] ?: [$arr['lang']];

if (!$lang && !is_array($subtitles)) {
  // FIXME: クライアント側の不具合
  // http_response_code(400);
  echo "no_subtitle";
  return;
}

$subtitles[] = ['lang' => $lang];

foreach ($subtitles as $sub) {
  if (!$sub['lang']) continue;
  $sth = $db->prepare(<<<'SQL'
    SELECT id, lang FROM mc_subtitle
    WHERE
      microcontentid=? AND lang=? AND deleted=0
  SQL);

  $sth->execute([$microcontentid, $sub['lang']]);

  if ($row = $sth->fetch()) {
    $subtitle_id = $row['id'];

    $db->prepare(<<<'SQL'
      UPDATE mc_subtitle
      SET
        timemodified=:time,
        modifiedby=:uid,
        deleted=0
      WHERE
        id=:subtitle_id
    SQL)->execute([
      ':time' => $time,
      ':uid' => $uid,
      ':subtitle_id' => $subtitle_id
    ]);
  } else {
    $db->prepare(<<<'SQL'
      INSERT INTO mc_subtitle
        (microcontentid, lang, timecreated, timemodified, createdby, modifiedby)
      VALUES
        (:microcontentid, :lang, :time, :time, :uid, :uid)
    SQL)->execute([
      ':microcontentid' => $microcontentid,
      ':lang' => $sub['lang'],
      ':time' => $time,
      ':uid' => $uid
    ]);
  }
}

if ($lang) {
  // NOTE: for static/js/common.js
  echo "{$microcontentid}_{$lang}";
} else {
  // NOTE: for components/video.ts
  echo $microcontentid;
}
