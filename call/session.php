<?php
require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}

$db = require(__DIR__.'/../database.php');
$rid = $context->getResourceKey();

// NOTE: read mc_resource.contentid
$sth = $db->prepare(<<<'SQL'
  SELECT contentid FROM mc_resource
  WHERE
    resourcelinkid=? AND deleted=0
  LIMIT 1
SQL);

$sth->execute([$rid]);
$row = $sth->fetch();
$contentid = $row ? intval($row['contentid']) : NULL;

header('Content-Type: application/json');
echo json_encode([
  'id' => $context->getUserKey(),
  'role' => $context->isAdministrator()
    ? 'administrator'
    :($context->isInstructor()
      ? 'instructor'
      : ''),
  'contents' => $contentid,
  'lmsResource' => $context->getResourceKey(),
  'lmsCourse' => $context->getCourseKey()
]);
