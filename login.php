<?php
require_once('config.php');

//Se il form è stato inviato
if (isset($_POST['submit'])) {
    $username = trim($_POST['username']);
    $password = trim($_POST['password']);

    $sql = "SELECT id, username, password, game_state FROM Users WHERE username = ?";
    
    if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("s", $username);
        
        // Eseguo la query
        if ($stmt->execute()) {
            $stmt->store_result();
            
            if ($stmt->num_rows == 1) {
                $stmt->bind_result($id, $db_username, $db_password_hash, $db_game_state);
                $stmt->fetch();

                // VERIFICA PASSWORD CRITTOGRAFATA
                // password_verify controlla se la password scritta corrisponde all'hash nel DB
                if (password_verify($password, $db_password_hash)) {
                    session_regenerate_id(true); //Rigenero id casuale

                    // Salvo i dati nella sessione
                    $_SESSION['loggedin'] = true;
                    $_SESSION['id'] = $id;
                    $_SESSION['username'] = $db_username;
                    
                    // Se c'è un salvataggio precedente, lo metto in sessione (opzionale, o lo carichi via AJAX dopo)
                    $_SESSION['game_state'] = $db_game_state;

                    header("location: /index.php"); 
                    exit;

                } else {
                    $_SESSION['login_error'] = "La password non è corretta.";
                    header("location: ../index.php");
                    exit;
                }
            } else {
                $_SESSION['login_error'] = "Non esiste nessun account con questo username.";
                header("location: ../index.php");
                exit;
            }
        } else {
            $_SESSION['login_error'] = "Errore di sistema. Riprova più tardi.";
            header("location: ../index.php");
            exit;
        }
        $stmt->close();
    }
}
$conn->close();