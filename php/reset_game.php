<?php
require_once('config.php');

if(!isset($_SESSION['id'])){
    exit(json_encode(["error" => "Non autorizzato"]));
}

$json = file_get_contents("php://input");
$data = json_decode($json, true);

if($data === null){
    http_response_code(400);
    exit(json_encode(["error" => "JSON non valido"]));
}

$coinsSave = $data['coins'];
$floorSave = $data['floor'];
$killsSave = $data['kills'];

// Recupero i vecchi valori
$stmt = $conn->prepare("SELECT max_floor, kills, coins FROM Users WHERE id = ?");
$stmt->bind_param("i", $_SESSION['id']);

if(!$stmt->execute()){
    http_response_code(500);
    exit(json_encode(["error" => "Errore DB (Select)"]));
}

$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

$coinsPrec = $row ? $row['coins'] : 0;
$floorPrec = $row ? $row['max_floor'] : 0;
$killsPrec = $row ? $row['kills'] : 0;

$coins = max($coinsSave, $coinsPrec);
$floor = max($floorSave, $floorPrec);
$kills = max($killsSave, $killsPrec);

$stmt = $conn->prepare("UPDATE Users SET game_state = NULL, max_floor = ?, kills = ?, coins = ? WHERE id = ?");
$stmt->bind_param("iiii", $floor, $kills, $coins, $_SESSION['id']);

if($stmt->execute()){
    echo json_encode(["status" => "success", "message" => "Reset e salvataggio completati"]);
} else {
    http_response_code(500);
    echo json_encode(["error" => "Errore DB (Update)"]);
}

$stmt->close();
$conn->close();
