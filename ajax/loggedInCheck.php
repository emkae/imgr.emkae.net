<?php
if (isset($_SESSION['user']) === true) {
  success_true(array('userId' => $_SESSION['user']['id'], 'userKey' => session_id()));
} else {
  success_false("Not logged in.");
}
?>
