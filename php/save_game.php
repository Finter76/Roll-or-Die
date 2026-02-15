<?php
require_once('config.php');

if(!isset($_SESSION['id'])){
    http_response_code(403);
    exit("Non loggato");
}

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if($data === null){
    http_response_code(400);
    exit("JSON non valido");
}

if ($conn->connect_error) {
    die("Connessione fallita" . $conn->connect_error);
}

$coins = $data['player']['resources']['gold'];
$floor = $data['world']['levelMap'];
$kills = $data['world']['kills'];

$stmt = $conn->prepare("UPDATE Users SET game_state = ?, coins = ?, max_floor = ?, kills = ? WHERE id = ?");
if(!$stmt){
    die($conn->error);
}
$stmt->bind_param("siiii", $json, $coins, $floor, $kills, $_SESSION['id']);
$stmt->execute();

$stmt->close();
$conn->close();

echo "OK";
