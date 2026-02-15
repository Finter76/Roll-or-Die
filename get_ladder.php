<?php
require_once("config.php");

header('Content-Type: application/json');

if ($conn->connect_error) {
    http_response_code(500);
    exit(json_encode(["error" => "Connessione fallita"]));
}

$stmt = $conn->prepare("SELECT username, coins, kills, max_floor FROM Users ORDER BY max_floor DESC, coins DESC LIMIT 10");

if(!$stmt->execute()){
    http_response_code(500);
    exit(json_encode(["error" => "Errore query"]));
}

$stmt->bind_result($username, $coins, $kills, $floor);

$ladder = [];

while($stmt->fetch()){
    $ladder[] = [
        "username" => $username,
        "coins" => $coins,
        "kills" => $kills,
        "max_floor" => $floor
    ];
}

$stmt->close();
$conn->close();

$ladderJson = json_encode($ladder);
echo $ladderJson;
