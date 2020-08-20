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

$content_id = $_POST['content_id'];

if (!$context->isAdministrator() && createdby($db, $content_id) !== $context->getUserKey()) {
  http_response_code(403);
  return;
}

$sth = $db->prepare(<<<'SQL'
  SELECT name FROM mc_content
  WHERE
    id=? AND deleted=0
SQL);

$sth->execute([$content_id]);
$row = $sth->fetch();

// NOTE: content not found
if (!$row) return;

$content_name = $row['name'];

// NOTE: read mc_toc
$sth = $db->prepare(<<<'SQL'
  SELECT name, microcontentid FROM mc_toc
  WHERE
    contentid=?
  ORDER BY sort
SQL);

$sth->execute([$content_id]);

$tocs = array();
foreach ($sth as $row) {
  $toc = array();
  $toc['id'] = $row['microcontentid'];
  $toc['cname'] = $row['name'];
  array_push($tocs, $toc);
}

$arr = array('title' => $content_name, 'contents' => $tocs);
header('Content-Type: application/json');
echo json_encode($arr);
