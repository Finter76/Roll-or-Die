<?php
require_once('php/config.php');

$is_logged_in = false;
if(isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true){
    $is_logged_in = true;
}
?>

<!DOCTYPE html>
<html lang="it">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Roll or Die</title>
        <link rel="stylesheet" href="./css/index.css">
        <link rel="icon" type="image/png" href="./images/dice_6.png">
    </head>
    <body>
        <?php
        // Se c'è un errore salvato in sessione (da login.php)
        if(isset($_SESSION['login_error'])){
            // Stampo l'alert
            echo "<script>alert('" . addslashes($_SESSION['login_error']) . "');</script>";
            // Cancello l'errore per non mostrarlo di nuovo al prossimo refresh
            unset($_SESSION['login_error']);
        }
        ?>
        
        <script>
            const USER_LOGGED_IN = <?php echo json_encode($is_logged_in); ?>;
        </script>
        
        <div id="loginContainer">
            <h1>Roll or Die</h1>
            <p>Effettua il login o registrati:</p>

            <div id="login">
                <form id="loginForm" action="./php/login.php" method="post">
                    <h2>Login</h2>
                    <input type="text" name="username" placeholder="Nome Utente" required>
                    <input type="password" name="password" placeholder="Password" required>
                    <input type="submit" name="submit" value="Accedi">
                </form>
                
                <form id="registerForm" action="./php/register.php" method="post">
                    <h2>Registrati</h2>
                    <input type="text" name="username" placeholder="Nome Utente" required minlength="3">
                    <input type="password" name="password" placeholder="Password" required minlength="4">
                    <input type="password" name="confirmPassword" placeholder="Conferma Password" required>
                    <input type="submit" name="submit" value="Crea Account">
                </form>
            </div>
        </div>

        <div id="mainMenu">
            <h1>MENU PRINCIPALE</h1>
            
            <div class="menuButtons">
                <button id="continueBtn">Continua Partita</button>
                <button id="newGameBtn">Nuova Partita</button>
                <button id="ladderBtn">Classifica</button>
                <button id="docsBtn">Documentazione</button>
                
                <form action="./php/logout.php" method="post" id="logoutForm">
                    <button type="submit" id="logoutBtn">Logout</button>
                </form>
            </div>
        </div>

        <div id="ladderScreen">
            <h2>Classifica</h2>
            <div id="ladderContainer"></div>
            <button id="closeLadder">Indietro</button>
        </div>

        <div id="docsScreen">
            <h2>Documentazione di Gioco</h2>
            <p>
                <strong>Roll or Die</strong> è un gioco roguelike a turni dove il combattimento 
                è basato sul lancio di dadi. Esplora dungeon procedurali, sconfiggi nemici e 
                raggiungi il piano più alto possibile!
            </p>

            <h3>Controlli di Gioco</h3>
            <ul>
                <li><strong>W, A, S, D</strong> - Movimento del personaggio</li>
                <li><strong>E</strong> - Apri le casse del tesoro</li>
                <li><strong>Q</strong> - Usa una pozione curativa</li>
                <li><strong>P</strong> - Metti in pausa e visualizza le statistiche</li>
            </ul>

            <p>Immagini di: <a href="https://chr15m.itch.io/doodle-rogue-tileset">chr15m</a></p>
            
            <button id="closeDocs">Indietro</button>
        </div>

        <div id="characterSelectionContainer">
            <h2>Seleziona il tuo personaggio</h2>
            <div id="characterSelection"></div>
            <button id="startGame">Inizia Partita</button>
            <button id="backToMenuFromChar">Indietro</button>
        </div>

        <div id="contenitore">
            <canvas id="canvas"></canvas>
            <div id="UI">
                <div id="playerData">
                    <h3>Statistiche</h3>
                    <p id="levelPlayer">Livello: </p>
                    <p id="floor">Piano: </p>
                    <p id="xp">XP: </p>
                    <p id="kills">Uccisioni: </p>

                    <div id="stats">
                        <p id="hpStat">Hp: </p>
                        <p id="defStat">Difesa: </p>
                        <p id="atkStat">Attacco: </p>
                        <p id="luckStat">Fortuna: </p>
                        <p id="spdStat">Velocità: </p>
                    </div>
                </div>

                <p id="coins">Saldo: </p>

                <div id="levelUp">
                    <h2>Level Up! Scegli una statistica da potenziare:</h2>
                    <button id="levelHpStat">HP</button>
                    <button id="levelDefStat">Difesa</button>
                    <button id="levelAtkStat">Attacco</button>
                    <button id="levelLuckStat">Fortuna</button>
                    <button id="levelSpdStat">Velocità</button>
                </div>
            </div>
        </div>

        <div id="end">
            <h1>GAME OVER</h1>
            <div id="statsSummary">
                <table id="endStats"></table>
            </div>
            <button id="restartGame">Torna al Menu</button>
        </div>

        <footer id="gameFooter">
            <p>
                Progetto di Progettazione Web - A.A. 2025/2026 | 
                <strong>Musio Luca</strong> | Matricola: <strong>690830</strong> | 
                Licenza: <a href="LICENSE.txt" target="_blank">MIT License</a>
            </p>
        </footer>

        <script src="./js/core/config.js"></script>
        <script src="./js/world/tile.js"></script>
        <script src="./js/world/map.js"></script>
        <script src="./js/entities/items.js"></script>
        <script src="./js/entities/chest.js"></script>
        <script src="./js/entities/player.js"></script>
        <script src="./js/entities/enemies.js"></script>
        <script src="./js/core/camera.js"></script>
        <script src="./js/systems/input.js"></script>
        <script src="./js/ui/HUD.js"></script>
        <script src="./js/ui/UI.js"></script>
        <script src="./js/ui/menu.js"></script>
        <script src="./js/systems/collision.js"></script>
        <script src="./js/systems/combat.js"></script>
        <script src="./js/systems/spawner.js"></script>
        <script src="./js/core/renderer.js"></script>
        <script src="./js/core/canvas.js"></script>
    </body>
</html>