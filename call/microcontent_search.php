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

$keyword = $_POST['keyword'];

// NOTE: read mc_microcontent
$sth = $db->prepare(<<<'SQL'
  SELECT id, name, description, createdby FROM mc_microcontent
  WHERE
    (
      name LIKE :keyword OR description LIKE :keyword
    ) AND deleted=0
  ORDER BY id DESC
SQL);

$sth->execute([':keyword' => '%'.addcslashes($keyword, '\_%').'%']);

$tocs = array();
foreach ($sth as $row) {
  $toc = array();
  $toc['id'] = $row['id'];
  $toc['name'] = $row['name'];
  $toc['description'] = $row['description'];
  $toc['createdby'] = $row['createdby'];
  array_push($tocs, $toc);
}

$arr = array('title' => $keyword, 'contents' => $tocs);
header('Content-Type: application/json');
echo json_encode($arr);
