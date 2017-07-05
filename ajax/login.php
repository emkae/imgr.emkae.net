<?php
if (isset($_SESSION['user']) === true) {
  success_true($_SESSION['user']['id']);
} else {
  include './database_connection.php';
  if (isset($_POST) === false) {
    success_false("No Post data supplied.");
  }

  if (isset($_POST['email']) === false) {
    success_false("No email post data supplied.");
  }
  if (isset($_POST['password']) === false) {
    success_false("No password post data supplied.");
  }

  if ($stmt = $mysqli->prepare("SELECT id FROM users WHERE email=? AND password=? LIMIT 1")) {
    $email = $_POST['email'];
    $password = hash('sha512', $_POST['password']);
    $stmt->bind_param("ss", $email, $password);
  }

  $stmt->execute();

  $result = $stmt->get_result();

  if ($result->num_rows > 0 ) {
    $data = $result->fetch_assoc();
    if (is_int($data['id'])) {
      $_SESSION['user'] = array('id' => intval($data['id']));
      success_true(array('userId' => $data['id'], 'userKey' => session_id()));
    }
  } else {
    success_false("Not found.");
  }
}
?>
