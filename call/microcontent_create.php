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
$type = $arr['type'];
$src = $arr['src'];
// TODO: プロパティ video は非推奨で type, src に移行
$video = $arr['video'];
$description = $arr['description'];
$skill = $arr['skill'];
$task = $arr['task'];
$level = $arr['level'];

try {
  $db->beginTransaction();

  // FIXME: mc_microcontent.video カラムは非推奨だが存在してしまっている
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent
      (name, video, description, timecreated, timemodified, createdby, modifiedby)
    VALUES
      (:title, '', :description, :time, :time, :uid, :uid)
  SQL)->execute([
    ':title' => $title,
    ':description' => $description,
    ':time' => $time,
    ':uid' => $uid
  ]);

  $microcontentid = $db->lastInsertId();

  $db->prepare(<<<'SQL'
    INSERT video
      (mc_microcontent_id, type, src)
    VALUES
      (:id, :type, :src)
  SQL)->execute([
    ':id' => $microcontentid,
    ':type' => $type,
    ':src' => $src
  ]);

  $db->commit();
} catch (PDOException $e) {
  $db->rollBack();
  throw $e;
}

foreach ($skill as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_skill
      (microcontentid, skillid)
    VALUES
      (?, ?)
  SQL)->execute([
    $microcontentid, $row[0]]);
}

foreach ($task as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_task
      (microcontentid, taskid)
    VALUES
      (?, ?)
  SQL)->execute([
    $microcontentid, $row[0]]);
}

foreach ($level as $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_microcontent_level
      (microcontentid, levelid)
    VALUES
      (?, ?)
  SQL)->execute([
    $microcontentid, $row[0]]);
}

$lang = $arr['lang'];
$subtitles = $arr['subtitles'];

if (!$lang && !is_array($subtitles)) {
  // FIXME: クライアント側の不具合
  // http_response_code(400);
  echo "no_subtitle";
  return;
}

$subtitles[] = ['lang' => $lang];

foreach ($subtitles as $sub) {
  if (!$sub['lang']) continue;
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

http_response_code(201);
if ($lang) {
  // NOTE: for static/js/common.js
  echo "{$microcontentid}_{$lang}";
} else {
  // NOTE: for components/video.ts
  echo $microcontentid;
}
