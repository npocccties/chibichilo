<?php
require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}

$db = require(__DIR__.'/../database.php');

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
if (!$row) return;

$content_name = $row['name'];
//$content_video = $row['video'];
class UUID {
    public static function v4() {
      return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
          mt_rand(0, 0xffff), mt_rand(0, 0xffff),
          mt_rand(0, 0xffff),
          mt_rand(0, 0x0fff) | 0x4000,
          mt_rand(0, 0x3fff) | 0x8000,
          mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
      );
    }
    public static function is_valid($uuid) {
        return preg_match('/^\{?[0-9a-f]{8}\-?[0-9a-f]{4}\-?[0-9a-f]{4}\-?'.
                          '[0-9a-f]{4}\-?[0-9a-f]{12}\}?$/i', $uuid) === 1;
    }
}
$v4uuid = UUID::v4();
use const Config\WOWZA_URL;
use const Config\WOWZA_PATH;
use const Config\WOWZA_SECRET;
use const Config\WOWZA_TOKEN;
use const Config\WOWZA_START;
use const Config\WOWZA_END;
$contenturl  = WOWZA_URL.WOWZA_PATH.$row['video'].'/playlist.m3u8';
$contentpath = WOWZA_PATH.$row['video'];
$wowzasecret = WOWZA_SECRET;
$wowzatoken  = WOWZA_TOKEN;
$wowzastart = WOWZA_START;
$wowzaend = strtotime(date('d-m-Y H:i:s')) + WOWZA_END;
$customparameter = $v4uuid;
$hashstr = hash('sha512', $contentpath.'?'.$wowzasecret.'&'.$wowzatoken.'customparameter='.$customparameter.'&'.$wowzatoken.'endtime='.$wowzaend.'&'.$wowzatoken.'starttime='.$wowzastart.'', true);
$usableHash= strtr(base64_encode($hashstr), '+/', '-_');
$wowzaquery = $wowzatoken."customparameter=".$customparameter."&".$wowzatoken."endtime=".$wowzaend."&".$wowzatoken."starttime=".$wowzastart."&".$wowzatoken."hash=".$usableHash."";
$content_video = $contenturl."?".$wowzaquery;
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

$arr = array('title' => $content_name, 'video' => $content_video, 'description' => $content_description, 'createdby' => $content_createdby, 'subtitles' => $subtitles, 'skills' => $skills, 'tasks' => $tasks, 'levels' => $levels);
header('Content-Type: application/json');
echo json_encode($arr);
