<?php
require_once('config.php');

if(!isset($_SESSION['id']) || !$_SESSION['loggedin']){
    http_response_code(403);
    exit(json_encode(["error" => "Non loggato"]));
}

if ($conn->connect_error) {
    http_response_code(500);
    exit(json_encode(["error" => "Connessione al DB fallita"]));
}

$stmt = $conn->prepare("SELECT game_state FROM Users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['id']);
$stmt->execute();
$stmt->bind_result($game_state);
$stmt->fetch();
$stmt->close();

if (empty($game_state)) {
    $game_state = json_encode(null);
}

header("Content-Type: application/json");
echo $game_state;
$conn->close();
?>