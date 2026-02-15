<?php
// Avvia la sessione, permette l'uso di $_SESSION per salvare i dati 

// Database: musio_690830
// Configurazione connessione MySQL
$host = "localhost";
$user = "root";
$password = "";
$db_name = "musio_690830";

// Configura sessione per scadere alla chiusura del browser
ini_set('session.cookie_lifetime', 0); // 0 = scade quando chiudi browser
ini_set('session.gc_maxlifetime', 1440); // 24 minuti server-side

session_start();

$conn = new mysqli($host, $user, $password, $db_name);

if($conn->connect_error){
    die("Connesione fallita: " . $conn->connect_error);
}
