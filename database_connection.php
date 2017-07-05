<?php
include './config.php';
$mysqli = new mysqli(
  $config['mysql_host'],
  $config['mysql_username'],
  $config['mysql_password'],
  $config['mysql_database'],
  $config['mysql_port']
);
if ($mysqli->connect_errno) {
  die('Could not connect to database.');
}
?>
