<?php
require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}

$db = require(__DIR__.'/../database.php');
$lang = require(__DIR__.'/../lang.php');

$microcontent_id = $_POST['microcontent_id'];

// NOTE: read mc_microcontent
$sth = $db->prepare(<<<'SQL'
  SELECT name, video, description, createdby FROM mc_microcontent
  WHERE
    id=? AND deleted=0
SQL);

$sth->execute([$microcontent_id]);
$row = $sth->fetch();

// NOTE: microcontent not found
if (!$row) {
  http_response_code(404);
  echo "no_microcontent";
  return;
}

$name = $row['name'];
$video = $row['video'];
$link = "//www.youtube.com/watch?v={$video}";
$videoquery = "v={$video}";
$description = $row['description'];
$createdby = $row['createdby'];

// NOTE: read mc_subtitle.lang
$sth = $db->prepare(<<<'SQL'
  SELECT lang FROM mc_subtitle
  WHERE
    microcontentid=? AND deleted=0
  ORDER BY lang
SQL);

$sth->execute([$microcontent_id]);

$tracks = array();
foreach ($sth as $row) {
  $track = array();
  $track['srclang'] = $row['lang'];

  foreach ($lang as $v) {
    if ($v['code'] === $track['srclang']) {
      $track['label'] = $v['name'];
    }
  }

  array_push($tracks, $track);
}

$arr = array('name' => $name, 'video' => $link, 'videofile' => $video, 'videoquery' => $videoquery, 'description' => $description, 'createdby' => $createdby, 'tracks' => $tracks);
header('Content-Type: application/json');
echo json_encode($arr);
