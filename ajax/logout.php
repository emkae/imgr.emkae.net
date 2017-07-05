<?php
if (isset($_SESSION['user']) === true) {
  if(session_destroy()) {
    success_true("Session destroyed.");
  } else {
    success_false("Could not destroy session.");
  }
} else {
  success_false("Not logged in.");
}
?>
