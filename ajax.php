<?php
session_start();
function success_true($data = false) {
  header('Content-Type: application/json');
  $res = array('success' => true);
  if ($data) {
    $res['data'] = $data;
  }
  die(json_encode($res));
}
function success_false($msg = false) {
  header('Content-Type: application/json');
  $data = array('success' => false);
  if ($msg) {
    $data['msg'] = $msg;
  }
  die(json_encode($data));
}
$do = (isset($_GET['do']) === true) ? $_GET['do'] : '';
switch ($do) {
  case 'login':
    include './ajax/login.php';
    break;
  case 'loggedInCheck':
    include './ajax/loggedInCheck.php';
    break;
  case 'list':
    include './ajax/list.php';
    break;
  case 'upload':
    include './ajax/upload.php';
    break;
  case 'delete':
    include './ajax/delete.php';
    break;
  case 'logout':
    include './ajax/logout.php';
    break;
  default:
    break;
}
?>
