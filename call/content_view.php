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

// NOTE: resource not found
if (!$row) {
  http_response_code(404);
  return;
}

$content_id = $row['contentid'];

// NOTE: read mc_content.name
$sth = $db->prepare(<<<'SQL'
  SELECT name FROM mc_content
  WHERE
    id=? AND deleted=0
SQL);

$sth->execute([$content_id]);
$row = $sth->fetch();

// NOTE: content not found
if (!$row) {
  http_response_code(404);
  return;
}

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
