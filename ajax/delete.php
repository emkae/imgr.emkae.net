<?php
if (isset($_SESSION['user'])) {
  $user_id = $_SESSION['user']['id'];
  $session_key = session_id();
  $session_key2 = (isset($_GET['key']) === true) ? $_GET['key'] : '';
  $filehash = (isset($_GET['filehash']) === true) ? $_GET['filehash'] : '';
  $fileext = (isset($_GET['fileext']) === true) ? $_GET['fileext'] : '';
  if ($session_key === $session_key2) {
    include './database_connection.php';
    if ($stmt = $mysqli->prepare("DELETE FROM files WHERE fk_user_id=? AND filehash=? AND fileext=?")) {
      $stmt->bind_param("iss", $user_id, $filehash, $fileext);
    }
    $stmt->execute();
    $file = $filehash.'.'.$fileext;
    $count = $stmt->affected_rows;
    if ($count > 0) {
      $file = $filehash . '.' . $fileext;
      if (unlink("i/$file") === false) {
        success_false("Could not unlink file $file.");
      } else {
        success_true("File $file deleted.");
      }
    } else {
      success_false("Could not find file $file in database.");
    }
  } else {
    success_false("Key verification failed.");
  }
} else {
  success_false("Not logged in.");
}
?>
