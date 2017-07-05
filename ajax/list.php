<?php
if (isset($_SESSION['user'])) {
  include './database_connection.php';
  $user_id = $_SESSION['user']['id'];
  if ($stmt = $mysqli->prepare("SELECT id, filename, filehash, fileext FROM files WHERE fk_user_id=? ORDER BY id DESC")) {
    $stmt->bind_param("i", $user_id);
  }
  $stmt->execute();
  $result = $stmt->get_result();
  if ($result->num_rows > 0 ) {
    $data = array('success' => true);
    $data['items'] = $result->fetch_all(MYSQLI_ASSOC);
    header('Content-Type: application/json');
    die(json_encode($data));
  } else {
    $data = array('success' => true, 'totalCount' => $result->num_rows);
    header('Content-Type: application/json');
    die(json_encode($data));
  }
} else {
  header('Content-Type: application/json');
  die('{"success": false}');
}
?>
