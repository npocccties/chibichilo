<?php
require_once(__DIR__.'/config.php');

use const Config\DB_HOST;
use const Config\DB_USERNAME;
use const Config\DB_PASSWORD;
use const Config\DB_DATABASE;

return new PDO(
  'mysql:host='.DB_HOST.';dbname='.DB_DATABASE,
  DB_USERNAME,
  DB_PASSWORD,
  [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
  ]
);
