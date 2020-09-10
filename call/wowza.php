<?php
// wowza.php - Wowza ビデオの識別子からApple HLS File URL を得るためのエンドポイント
// クエリパラメーター: src - Wowza ビデオの識別子 (e.g. `example.mp4`)

$src = $_GET['src'];

if (!(is_string($src) && strlen($src) > 0)) {
  http_response_code(404);
  return;
}

require_once(__DIR__.'/../config.php');

use const Config\WOWZA_BASE_URL;
use const Config\WOWZA_SECURE_TOKEN;
use const Config\WOWZA_QUERY_PREFIX;
use const Config\WOWZA_EXPIRES_IN;

require_once(__DIR__.'/../lti_session.php');

if (!$context->valid) {
  http_response_code(401);
  return;
}

function validate(string $src): bool {
  $path = explode('/', $src);
  return count(array_intersect(['', '.', '..'], $path)) === 0;
}

if (!validate($src)) {
  http_response_code(400);
  return;
}

function base64_urlsafe(string $data): string {
  return strtr(base64_encode($data), '+/', '-_');
}

function build_hash(string $path, array $query): string {
  // FIXME: SHA512 以外は未対応
  $token = $path.'?'.WOWZA_SECURE_TOKEN.http_build_query($query);
  return base64_urlsafe(hash('sha512', $token, true));
}

function build_query(string $src): string {
  $basepath = parse_url(WOWZA_BASE_URL, PHP_URL_PATH);
  $path = preg_replace('/^\//', '', $basepath)."/{$src}";
  $expires_at = time() + WOWZA_EXPIRES_IN;
  $query = [
    WOWZA_QUERY_PREFIX.'endtime' => $expires_at
  ];
  $hash = build_hash($path, $query);
  return http_build_query(array_merge(
    $query,
    [WOWZA_QUERY_PREFIX.'hash' => $hash]
  ));
}

function build(string $src): string {
  $query = build_query($src);
  return WOWZA_BASE_URL."/{$src}?{$query}";
}

header('Content-Type: application/json');
echo json_encode([
  'url' => build($src)
]);
