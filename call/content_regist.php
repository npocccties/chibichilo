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
$resource_link_id = $context->getResourceKey();

$content_id = $_POST['content_id'];

// NOTE: read mc_resource.id
$sth = $db->prepare(<<<'SQL'
  SELECT id FROM mc_resource
  WHERE
    resourcelinkid=? AND deleted=0
  LIMIT 1
SQL);

$sth->execute([$resource_link_id]);

if ($row = $sth->fetch()) {
  $resource_id = $row['id'];

  $db->prepare(<<<'SQL'
    UPDATE mc_resource
    SET
      contentid=:content_id,
      timemodified=:time,
      modifiedby=:uid
    WHERE
      id=:resource_id
  SQL)->execute([
    ':content_id' => $content_id,
    ':time' => $time,
    ':uid' => $uid,
    ':resource_id' => $resource_id
  ]);

  echo "update";
} else {
  $db->prepare(<<<'SQL'
    INSERT INTO mc_resource
      (resourcelinkid, contentid, timecreated, timemodified, createdby, modifiedby)
    VALUES
      (:resource_link_id, :content_id, :time, :time, :uid, :uid)
  SQL)->execute([
    ':resource_link_id' => $resource_link_id,
    ':content_id' => $content_id,
    ':time' => $time,
    ':uid' => $uid
  ]);

  http_response_code(201);
  echo "new";
}
