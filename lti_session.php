<?php
require_once(__DIR__.'/config.php');

// Load up the LTI Support code
require_once(__DIR__.'/ims-blti/blti.php');

use const Config\OAUTH_CONSUMERS;

function blti_context(): BLTI {
    $index = NULL;
    $context = NULL;
    $oauth_consumer_keys = array_column(OAUTH_CONSUMERS, 'oauth_consumer_key');

    if (realpath($_SERVER['SCRIPT_FILENAME']) === __DIR__.'/index.php' && $_SERVER['REQUEST_METHOD'] === 'POST') {
        $index = array_search($_POST['oauth_consumer_key'], $oauth_consumer_keys);
    } elseif (isset($_SESSION['_basic_lti_context']) && isset($_SESSION['_basic_lti_context']['oauth_consumer_key'])) {
        $index = array_search($_SESSION['_basic_lti_context']['oauth_consumer_key'], $oauth_consumer_keys);
    }

    if (is_int($index)) {
        // Initialize, all secrets are 'secret', do not set session, and do not redirect
        $context = new BLTI(OAUTH_CONSUMERS[$index]['oauth_signature'], true, false);
    } else {
        die("oauth_consumer_key not found");
    }

    return $context;
}

function createdby(PDO $db, int $content_id): string {
    $sth = $db->prepare(<<<'SQL'
        SELECT createdby FROM mc_content
        WHERE
            id=? AND deleted=0
        LIMIT 1
        SQL);
    $sth->execute([$content_id]);
    $row = $sth->fetch();
    return $row['createdby'];
}

function video_createdby(PDO $db, int $id): string {
    $sth = $db->prepare(<<<'SQL'
        SELECT createdby FROM mc_microcontent
        WHERE
            id=? AND deleted=0
        LIMIT 1
        SQL);
    $sth->execute([$id]);
    $row = $sth->fetch();
    return $row['createdby'];
}

//error_reporting(E_ALL & ~E_NOTICE);
//ini_set("display_errors", 1);
session_start();
header('Content-Type: text/plain');

$context = blti_context();
