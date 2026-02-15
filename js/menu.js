class Menu {
    constructor() {
        this.selectedCharacter = null;
        this.ladderData = null;

        this.screens = {
            login: document.getElementById("loginContainer"),
            menu: document.getElementById("mainMenu"),
            select: document.getElementById("characterSelectionContainer"),
            game: document.getElementById("contenitore"),
            ladder: document.getElementById("ladderScreen"),
            docs: document.getElementById("docsScreen"),
            end: document.getElementById("end"),
        };

        this.init();
    }

    init() {
        this.setupButtons();

        //Solo se USER_LOGGED_IN esiste, controlla se è loggato (altrimenti crasha)
        if (typeof USER_LOGGED_IN !== 'undefined' && USER_LOGGED_IN === true) {
            console.log("Utente loggato: Mostro Main Menu");
            this.showScreen("menu");
        } else {
            console.log("Utente non loggato: Mostro Login");
            this.showScreen("login");
        }
    }

    destroyCurrentGame() {
        if (window.currentGame) {
            window.currentGame.isGameOver = true;
            window.currentGame.paused = true;
            
            window.currentGame = null;
            
            console.log("Game distrutto correttamente");
        }
    }

    startNewGame(characterType, loadData = null) {
        this.destroyCurrentGame();

        this.showScreen("game");
        
        window.currentGame = new Game(characterType, loadData, this);
        
        if (!loadData) {
            const jsonString = JSON.stringify(window.currentGame.getGameState());
            fetch("./php/save_game.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: jsonString
            }).catch(err => console.error("Errore salvataggio iniziale:", err));
        }
        console.log("Nuovo gioco avviato:", characterType);
    }

    // Gestione visibilità schermate
    showScreen(name) {
        for (const key in this.screens) {
            if (this.screens[key]) {
                this.screens[key].style.display = "none";
                this.screens[key].classList.remove("hidden"); 
            }
        }
        
        if (this.screens[name]) {
            this.screens[name].style.display = "block";
        }

        const footer = document.getElementById("gameFooter");
        if (footer) {
            // Mostra il footer solo nei menu, nascondilo durante il gioco
            if (name === "game") {
                footer.style.display = "none";
            } else {
                footer.style.display = "flex";
            }
        }
    }

    setupButtons() {
        const ladderBtn = document.getElementById("ladderBtn");
        if (ladderBtn) {
            ladderBtn.onclick = () => {
                this.loadLadder();
                this.showScreen("ladder");
            };
        }

        const newGameBtn = document.getElementById("newGameBtn");
        if (newGameBtn) {
            newGameBtn.onclick = () => {
                this.generateCharacterCards();
                this.showScreen("select");
            };
        }

        const continueBtn = document.getElementById("continueBtn");
        if (continueBtn) {
            continueBtn.onclick = () => {
                this.continueGame();
            };
        }

        const docsBtn = document.getElementById("docsBtn");
        if (docsBtn) {
            docsBtn.onclick = () => {
                this.showScreen("docs");
            };
        }

        const closeLadderBtn = document.getElementById("closeLadder");
        if (closeLadderBtn) {
            closeLadderBtn.onclick = () => this.showScreen("menu");
        }

        const closeDocsBtn = document.getElementById("closeDocs");
        if (closeDocsBtn) {
            closeDocsBtn.onclick = () => this.showScreen("menu");
        }

        const backToMenuBtn = document.getElementById("backToMenuFromChar");
        if (backToMenuBtn) {
            backToMenuBtn.onclick = () => this.showScreen("menu");
        }

        const restartGameBtn = document.getElementById("restartGame");
        if (restartGameBtn) {
            restartGameBtn.onclick = () => {
                this.destroyCurrentGame();
                this.showScreen("menu");
            };
        }
    }

    continueGame() {
        fetch("./php/load_game.php")
            .then(r => r.json())
            .then(data => {
                if (data && data.player) {
                    this.startNewGame(data.player.type, data);
                } else {
                    alert("Nessun salvataggio trovato");
                }
            })
            .catch(err => {
                console.error("Errore continueGame:", err);
                alert("Errore nel caricamento del salvataggio");
            });
    }

    generateCharacterCards() {
        const container = document.getElementById("characterSelection");
        if(!container) return;

        container.innerHTML = "";

        classes.forEach(char => {
            const card = document.createElement("div");
            card.className = "charCard";

            const title = document.createElement("h3");
            title.textContent = char.name;

            const image = document.createElement("img");
            image.src = char.image;

            const descr = document.createElement("p");
            descr.textContent = char.description;

            const stats = document.createElement("p");
            stats.textContent = char.stats;

            card.appendChild(title);
            card.appendChild(image);
            card.appendChild(descr);
            card.appendChild(stats);

            card.addEventListener("click", () => {
                this.selectedCharacter = title.textContent;

                let selected = container.querySelector(".selectedCard");
                if (selected) {
                    selected.classList.remove("selectedCard");
                }
                card.classList.add("selectedCard");
            });

            container.appendChild(card);
        });

        const start = document.getElementById("startGame");
        if (start) {
            start.onclick = () => {
                if (!this.selectedCharacter) {
                    alert("Seleziona un personaggio");
                    return;
                }
                // null = nuova partita
                this.startNewGame(this.selectedCharacter, null);
            };
        }
    }

    showGameOverScreen(stats) {
        this.showScreen("end");

        const table = document.getElementById("endStats");
        if (table) {
            table.innerHTML = `
                <tr><td>Livello Raggiunto:</td><td>${stats.levelPlayer}</td></tr>
                <tr><td>Piano:</td><td>${stats.floor}</td></tr>
                <tr><td>Nemici Uccisi:</td><td>${stats.kills}</td></tr>
                <tr><td>Monete:</td><td>${stats.coins}</td></tr>
            `;
        }
    }

    loadLadder() {
        const container = document.getElementById("ladderContainer");
        if(container) container.innerHTML = "Caricamento...";

        fetch("./php/get_ladder.php")
            .then(r => r.json())
            .then(data => {
                this.ladderData = data;
                this.buildLadderTable(data);
            })
            .catch(err => {
                console.error(err);
                if(container) container.innerHTML = "Errore caricamento.";
            });
    }

    buildLadderTable(data) {
        const ladderContainer = document.getElementById("ladderContainer");
        if(!ladderContainer) return;

        ladderContainer.innerHTML = ""; 
        const table = document.createElement("table");
        table.id = "ladder";

        // Header Tabella
        const header = document.createElement("thead");
        const rowH = document.createElement("tr");

        const headers = [
            { text: "Nome Utente", sortKey: null }, // Non ordinabile
            { text: "Piano", sortKey: "max_floor" },
            { text: "Nemici", sortKey: "kills" },
            { text: "Monete", sortKey: "coins" }
        ];

        headers.forEach(h => {
            const th = document.createElement("th");
            th.textContent = h.text;
            
            // Se ha una chiave di ordinamento, rendilo cliccabile
            if (h.sortKey) {
                th.style.cursor = "pointer";

                if (this.currentSortKey === h.sortKey) {
                    th.classList.add("activeSort");
                }

                th.addEventListener("click", () => {
                    this.sortLadder(h.sortKey);
                });
            }
            
            rowH.appendChild(th);
        });

        header.appendChild(rowH);
        table.appendChild(header);

        // Body Tabella
        const body = document.createElement("tbody");
        
        if(data && data.length > 0){
            for (let i = 0; i < data.length; i++) {
                const row = document.createElement("tr");

                const addCell = (text, key) => {
                    const td = document.createElement("td");
                    td.textContent = text;

                    if(key && key === this.currentSortKey){
                        td.classList.add("activeSort")
                    }

                    row.appendChild(td);
                };

                addCell(data[i].username, null);
                addCell(data[i].max_floor ? data[i].max_floor : 1, "max_floor");
                addCell(data[i].kills ? data[i].kills : 0, "kills");
                addCell(data[i].coins ? data[i].coins : 0, "coins");

                body.appendChild(row);
            }
        } else {
            const row = document.createElement("tr");
            const td = document.createElement("td");
            td.colSpan = 4;
            td.textContent = "Nessun record in classifica.";
            td.style.textAlign = "center";
            row.appendChild(td);
            body.appendChild(row);
        }

        table.appendChild(body);
        ladderContainer.appendChild(table);
    }

    sortLadder(sortKey) {
        if (!this.ladderData || this.ladderData.length === 0) return;
        
        if (this.currentSortKey === sortKey) {
            this.sortAscending = !this.sortAscending;
        } else {
            this.currentSortKey = sortKey;
            this.sortAscending = false;
        }
        
        this.ladderData.sort((a, b) => {
            let valueA = a[sortKey] || 0;
            let valueB = b[sortKey] || 0;
            
            if (this.sortAscending) {
                return valueA - valueB; // Crescente
            } else {
                return valueB - valueA; // Decrescente
            }
        });
        
        this.buildLadderTable(this.ladderData);
    }
}

// Inizializzazione globale
document.addEventListener("DOMContentLoaded", () => {
    window.gameMenu = new Menu();
});