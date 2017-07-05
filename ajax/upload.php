<?php
function decode_chunk( $data ) {
  $data = explode( ';base64,', $data );
  if ( ! is_array( $data ) || ! isset( $data[1] ) ) {
    return false;
  }
  $data = base64_decode( $data[1] );
  if ( ! $data ) {
    return false;
  }
  return $data;
}
if (isset($_SESSION['user'])) {
  $user_id = $_SESSION['user']['id'];
  if (isset($_POST['fileChunk']) === false) {
    success_false("No file supplied.");
  }
  $fileChunk = decode_chunk($_POST['fileChunk']);
  if ($fileChunk === false) {
    success_false("File was not correctly encoded, before sending to the server");
  }
  $fileName = $_SERVER['HTTP_X_FILE_NAME'];
  $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
  if (isset($_POST['fileHash']) && !empty($_POST['fileHash'])) {
    $fileHash = $_POST['fileHash'];
  } else {
    $fileHash = hash('sha512', $user_id . ' ' . time() . ' ' . $fileName);
  }
  $fileHashedName = $fileHash . '.' .$fileExtension;
  $fileSize = $_SERVER['HTTP_X_FILE_SIZE'];
  $fileChunksCurrent = $_SERVER['HTTP_X_FILE_CHUNKS_CURRENT'];
  $fileChunksTotal = $_SERVER['HTTP_X_FILE_CHUNKS_TOTAL'];
  $filePath = "i/$fileHashedName";
  // TODO Check database for duplicate instead of file
  /* if (file_exists("i/$fileHashedName")) { */
  /*   success_false("Duplicate filename."); */
  /* } */
  if (file_put_contents($filePath.".tmp", $fileChunk, FILE_APPEND) === false) {
    success_false("Could not append to file $filePath.");
  }
  // all chunks combined
  if ($fileChunksCurrent === $fileChunksTotal) {
    include './database_connection.php';
    if (rename($filePath.".tmp", $filePath) === false) {
      unlink($filePath.".tmp");
      success_false("Could not rename $filePath.tmp to $fileName.");
    }
    if (function_exists('exif_read_data') && exif_imagetype($filePath) === IMAGETYPE_JPEG && ($exifdata = exif_read_data($filePath, 'ANY_TAG', true, false)) !== false) {
      if ($stmt = $mysqli->prepare("INSERT INTO files (fk_user_id, filehash, fileext, exifdata, filename) VALUES (?, ?, ?, ?, ?)")) {
        error_log(print_r($exifdata, 1));
        $stmt->bind_param("issss", $user_id, $fileHash, $fileExtension, json_encode($exifdata), $fileName);
      } else {
        unlink($filePath);
        success_false("Can't prepare statement.");
      }
    } else {
      if ($stmt = $mysqli->prepare("INSERT INTO files (fk_user_id, filehash, fileext, filename) VALUES (?, ?, ?, ?)")) {
        $stmt->bind_param("isss", $user_id, $fileHash, $fileExtension, $fileName);
      } else {
        unlink($filePath);
        success_false("Can't prepare statement.");
      }
    }
    if ($stmt->execute() === false) {
      unlink($filePath);
      success_false("Can't insert into database.");
    }
  } else {
    success_true(array('fileHash' => $fileHash));
  }
} else {
  success_false("Can't write file.");
}
?>
