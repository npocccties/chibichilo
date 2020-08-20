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

$time = time();
$uid = $context->getUserKey();

$json = file_get_contents('php://input');
$arr = json_decode($json, true);
$title = $arr['title'];
$contentid = $arr['id'];

if (!$context->isAdministrator() && createdby($db, $contentid) !== $context->getUserKey()) {
  http_response_code(403);
  return;
}

$db->prepare(<<<'SQL'
  UPDATE mc_content
  SET
    name=:title, timemodified=:time, modifiedby=:uid
  WHERE
    id=:contentid
SQL)->execute([
  ':title' => $title,
  ':time' => $time,
  ':uid' => $uid,
  ':contentid' => $contentid
]);

$db->prepare(<<<'SQL'
  DELETE FROM mc_toc
  WHERE
    contentid=?
SQL)->execute([$contentid]);

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

echo "ok";
