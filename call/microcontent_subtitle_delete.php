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
$subtitleid = $_POST['subtitleid'];

$db->prepare(<<<'SQL'
  UPDATE mc_subtitle
  SET
    timemodified=:time, modifiedby=:uid, deleted=1
  WHERE
    id=:subtitleid
SQL)->execute([
  ':subtitleid' => $subtitleid,
  ':time' => $time,
  ':uid' => $uid
]);

echo "ok";
