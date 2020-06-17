<?php
require_once(__DIR__.'/lti_session.php');

if (!$context->valid) {
  header('Content-Type: text/html', true, 401);
  echo "<p style=\"color:red\">Could not establish context: ".htmlspecialchars($context->message)."<p>\n";
  return;
}

$nonce = urlencode($_POST["oauth_nonce"]);
header("Location: v1?nonce={$nonce}");
