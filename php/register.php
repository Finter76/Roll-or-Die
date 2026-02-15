<?php
require_once('config.php');

// Se il form è stato inviato
if(isset($_POST['submit'])){
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    if(strlen($username) < 3){
        echo "Username troppo corto (minimo 3 caratteri)";
        exit;
    }
    if(strlen($password) < 4){
        echo "Password troppo corta (minimo 4 caratteri)";
        exit;
    }

    if(strlen($username) > 11){
        echo "Username troppo lungo (massimo 11 caratteri)";
        exit;
    }
    if(strlen($password) > 50){
        echo "Password troppo lungo (massimo 50 caratteri)";
        exit;
    }

    // Faccio l'hashing della password usando l'algoritmo default (dovrebbe essere Bcrypt), 
    // ritorna una stringa da 60 caratteri
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    //Invio al DB la sola struttura della query, che compilo con user e pass in formato stringa
    $sql = "INSERT INTO Users (username, password) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);

    //Riempio la query
    $stmt->bind_param("ss", $username, $password_hash);

    //Eseguo la query
    if($stmt->execute()){
        header("location: /index.php"); 
        exit();
    } else {
        if($stmt->errno === 1062){
            echo "Username già usato";
        }
        else {
            echo "Errore generico del sistema. Riprova più tardi.";
            echo " (Debug: " . $stmt->error . ")";
        }
        $stmt->close();
    }
}
