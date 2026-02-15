<?php
require_once('config.php');
// Svuoto tutte le variabili di sessione
$_SESSION = array();
// Distruggo la sessione
session_destroy();

header("location: ../index.php");
exit;
?>