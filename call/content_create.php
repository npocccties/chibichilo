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

$db->prepare(<<<'SQL'
  INSERT INTO mc_content
    (name, timecreated, timemodified, createdby, modifiedby)
  VALUES
    (:title, :time, :time, :uid, :uid)
  SQL)->execute([
    ':title' => $title, ':time' => $time, ':uid' => $uid]);

$contentid = $db->lastInsertId();

// NOTE: create mc_toc
foreach ($arr['contents'] as $i => $row) {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_toc
      (name, contentid, microcontentid, sort)
    VALUES
      (?, ?, ?, ?)
  SQL)->execute([
    $row[1], $contentid, $row[0], $i]);
}

http_response_code(201);
echo $contentid;
