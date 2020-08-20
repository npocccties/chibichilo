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

// NOTE: read mc_skill
$skills = array();
foreach ($db->query('SELECT id, name FROM mc_skill') as $row) {
  $skill = array();
  $skill['id'] = $row['id'];
  $skill['name'] = $row['name'];
  array_push($skills, $skill);
}

// NOTE: read mc_task
$tasks = array();
foreach ($db->query('SELECT id, name FROM mc_task') as $row) {
  $task = array();
  $task['id'] = $row['id'];
  $task['name'] = $row['name'];
  array_push($tasks, $task);
}

// NOTE: read mc_level
$levels = array();
foreach ($db->query('SELECT id, name FROM mc_level') as $row) {
  $level = array();
  $level['id'] = $row['id'];
  $level['name'] = $row['name'];
  array_push($levels, $level);
}

$arr = array('skills' => $skills, 'tasks' => $tasks, 'levels' => $levels);
header('Content-Type: application/json');
echo json_encode($arr);
