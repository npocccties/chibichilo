<?php
require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}

$db = require(__DIR__.'/../database.php');

$microcontent_id = $_POST['microcontent_id'];

// NOTE: read mc_microcontent with video
// FIXME: mc_microcontent.video カラムは非推奨だが稼働中の環境に存在してしまっている
$sth = $db->prepare(<<<'SQL'
  SELECT
    mc_microcontent.name,
    mc_microcontent.video,
    mc_microcontent.description,
    mc_microcontent.createdby,
    video.type,
    video.src
  FROM
    mc_microcontent LEFT JOIN video ON (mc_microcontent.id=video.mc_microcontent_id)
  WHERE
    mc_microcontent.id=? AND mc_microcontent.deleted=0
SQL);

$sth->execute([$microcontent_id]);
$row = $sth->fetch();

// NOTE: microcontent not found
if (!$row) return;

$content_name = $row['name'];
$content_type = $row['type'] ?? 'youtube';
// FIXME: mc_microcontent.video カラムは非推奨だが稼働中の環境に存在してしまっている
$content_src = $row['src'] ?? $row['video'];
$content_description = $row['description'];
$content_createdby = $row['createdby'];

// NOTE: read mc_subtitle
$sth = $db->prepare(<<<'SQL'
  SELECT id, lang FROM mc_subtitle
  WHERE
    microcontentid=? AND deleted=0
  ORDER BY lang
SQL);

$sth->execute([$microcontent_id]);

$subtitles = array();
foreach ($sth as $row) {
  $subtitle = array();
  $subtitle['id'] = $row['id'];
  $subtitle['cname'] = $row['lang'];
  array_push($subtitles, $subtitle);
}

// NOTE: read mc_skill
$skills = array();
foreach ($db->query('SELECT id, name FROM mc_skill') as $row) {
  $skill = array();
  $skill['id'] = $row['id'];
  $skill['name'] = $row['name'];
  $skill['checked'] = '';
  array_push($skills, $skill);
}

// NOTE: read mc_microcontent_skill.skillid
$sth = $db->prepare(<<<'SQL'
  SELECT skillid FROM mc_microcontent_skill
  WHERE
    microcontentid=?
SQL);

$sth->execute([$microcontent_id]);

foreach ($sth as $row) {
  foreach ($skills as &$skill) {
    if ($skill['id'] === $row['skillid']) {
      $skill['checked'] = 'checked';
      break;
    }
  }
}

// NOTE: read mc_task
$tasks = array();
foreach ($db->query('SELECT id, name FROM mc_task') as $row) {
  $task = array();
  $task['id'] = $row['id'];
  $task['name'] = $row['name'];
  $task['checked'] = '';
  array_push($tasks, $task);
}

// NOTE: read mc_microcontent_task.taskid
$sth = $db->prepare(<<<'SQL'
  SELECT taskid FROM mc_microcontent_task
  WHERE
    microcontentid=?
SQL);

$sth->execute([$microcontent_id]);

foreach ($sth as $row) {
  foreach ($tasks as &$task) {
    if ($task['id'] === $row['taskid']) {
      $task['checked'] = 'checked';
      break;
    }
  }
}

// NOTE: read mc_level
$levels = array();
foreach ($db->query('SELECT id, name FROM mc_level') as $row) {
  $level = array();
  $level['id'] = $row['id'];
  $level['name'] = $row['name'];
  $level['checked'] = '';
  array_push($levels, $level);
}

// NOTE: read mc_microcontent_level.levelid
$sth = $db->prepare(<<<'SQL'
  SELECT levelid FROM mc_microcontent_level
  WHERE
    microcontentid=?
SQL);

$sth->execute([$microcontent_id]);

foreach ($sth as $row) {
  foreach ($levels as &$level) {
    if ($level['id'] === $row['levelid']) {
      $level['checked'] = 'checked';
      break;
    }
  }
}

header('Content-Type: application/json');
echo json_encode([
  'title' => $content_name,
  'type' => $content_type,
  'src' => $content_src,
  'description' => $content_description,
  'createdby' => $content_createdby,
  'subtitles' => $subtitles,
  'skills' => $skills,
  'tasks' => $tasks,
  'levels' => $levels
]);
