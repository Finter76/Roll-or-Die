class Game {
    constructor(type, loadData = null, menuInstance = null) {
        // Setup canvas
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = CANVAS_WIDTH;
        this.canvas.height = CANVAS_HEIGHT;

        // Input
        this.input = new InputHandler(this);

        // Stato gioco
        this.paused = false;
        this.isGameOver = false;
        this.changingLevel = false;

        // Riferimenti esterni
        this.menu = menuInstance;

        // Inizializza mondo
        this.levelMap = (loadData && loadData.world) ? loadData.world.levelMap : 1;
        this.map = new Map(this.levelMap);

        // UI e HUD
        this.UI = new UI();
        this.HUD = new HUD(this);

        // Sistemi di gioco
        this.collision = new CollisionSystem(this);
        this.combat = new CombatSystem(this);
        this.spawner = new EnemySpawner(this);
        this.renderer = new Renderer(this);

        // Carica inventario salvato
        this.loadInventory(loadData);

        // Inizializza player
        this.player = this.createPlayer(type, loadData);
        this.camera = new Camera(this.player);

        // Nemici
        this.enemies = [];
        this.enemyCounter = 0;
        this.kills = (loadData && loadData.world && loadData.world.kills) ? loadData.world.kills : 0;

        // Timer
        this.lastTime = 0;

        // Avvia gioco
        this.gameLoop(0);
    }

    gameLoop(timestamp) {
        if (this.isGameOver) return;

        if (!this.lastTime) this.lastTime = timestamp;
        let deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 20fps minimi
        if (deltaTime > 0.05) deltaTime = 0.05;

        if (!this.paused) {
            this.update(timestamp, deltaTime);
        }
        this.renderer.draw(timestamp);

        requestAnimationFrame((ts) => this.gameLoop(ts));
    }

    update(timestamp, deltaTime) {
        this.camera.update(this.player, this.canvas);
        this.spawner.update(timestamp);
        this.updateFlowField(timestamp);

        this.player.update(this.input.keys, this, deltaTime);
        this.updatePlayerUI();
        
        this.updateEnemies(deltaTime);
        this.enemies = this.enemies.filter(enemy => enemy.hp > 0);

        this.updateChestItems(deltaTime);

        this.map.updateVisibility(this.player.x, this.player.y);
    }

    updateFlowField(timestamp) {
        if (timestamp - this.map.lastFlowUpdate >= FLOWFIELD_INTERVAL) {
            const px = Math.floor(this.player.x / TILE_SIZE);
            const py = Math.floor(this.player.y / TILE_SIZE);

            if (!this.map.flowField ||
                !this.map.flowTarget ||
                this.map.flowTarget.x !== px ||
                this.map.flowTarget.y !== py) {
                this.map.buildFlowField(this.player.x, this.player.y, this);
                this.map.lastFlowUpdate = timestamp;
            }
        }
    }

    updateEnemies(deltaTime) {
        for (let enemy of this.enemies) {
            enemy.update(this.map, this, deltaTime);

            if (this.collision.checkPlayerHit(enemy)) {
                this.combat.handleCombat(enemy);
            }
        }
    }

    updateChestItems(deltaTime) {
        for (let chest of this.map.chests) {
            if (chest.open && chest.item && chest.itemTimer > 0) {
                chest.itemTimer -= deltaTime;

                if (chest.itemTimer <= 0) {
                    chest.item = null;
                }
            }
        }
    }

    updatePlayerUI() {
        const playerInfo = {
            levelPlayer: this.player.levelPlayer,
            hp: this.player.hp,
            xp: this.player.xp,
            xpToNext: this.player.xpToNext,
            floor: this.levelMap,
            maxHp: this.player.maxHp,
            kills: this.kills,
            hpStat: this.player.hpStat,
            defStat: this.player.defense,
            atkStat: this.player.attack,
            luckStat: this.player.luck,
            spdStat: this.player.maxSpeed / 60,
            coins: this.player.gold
        };

        this.UI.updatePlayer(playerInfo);
    }

    togglePause() {
        this.paused = !this.paused;

        if (this.paused) {
            this.UI.showPlayerData();
        } else {
            this.UI.hidePlayerData();
        }
    }

    createPlayer(type, loadData) {
        const playerClasses = {
            'Knight': Knight,
            'Barbarian': Barbarian,
            'Rogue': Rogue,
            'Mage': Mage,
            'Trickster': Trickster
        };

        const PlayerClass = playerClasses[type] || Knight;
        return new PlayerClass(this.map, this, loadData);
    }

    loadInventory(loadData) {
        if (!loadData || !loadData.player || !loadData.player.inventory) return;

        const inv = loadData.player.inventory;

        if (inv.weapon && inv.weapon.name) {
            const weapon = this.getItem(inv.weapon);
            if (weapon) {
                weapon.type = "weapon";
                this.HUD.addItem(weapon);
            }
        }

        if (inv.armor && inv.armor.name) {
            const armor = this.getItem(inv.armor);
            if (armor) {
                armor.type = "armor";
                this.HUD.addItem(armor);
            }
        }
    }

    getItem(itemData) {
        switch (itemData.type) {
            case "weapon": return new Weapon();
            case "armor": return new Armor();
            default: return null;
        }
    }

    nextLevel() {
        if (this.changingLevel) return;
        this.changingLevel = true;
        this.levelMap++;

        // Salva stato
        const state = this.getGameState();
        fetch("./php/save_game.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(state)
        })
        .then(() => {
            // Genera nuova mappa
            this.map = new Map(this.levelMap);
            this.player.map = this.map;
            this.player.initPosition();

            // Resetta nemici
            this.spawner.reset();

            setTimeout(() => {
                this.changingLevel = false;
            }, 500);
        })
        .catch(err => {
            console.error("Errore salvataggio:", err);
            this.changingLevel = false;
        });
    }

    gameOver() {
        if (this.isGameOver) return;

        this.isGameOver = true;
        this.paused = true;

        const finalStats = {
            levelPlayer: this.player.levelPlayer,
            floor: this.levelMap,
            kills: this.kills,
            coins: this.player.gold
        };

        this.menu.showGameOverScreen(finalStats);

        // Salva statistiche finali
        fetch("./php/reset_game.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                floor: finalStats.floor,
                kills: finalStats.kills,
                coins: finalStats.coins
            })
        })
        .then(response => {
            if (!response.ok) {
                console.warn("Salvataggio Game Over fallito (HTTP " + response.status + ")");
            }
            return response.json();
        })
        .catch(err => {
            console.error("Errore salvataggio Game Over:", err);
        });
    }

    openChest() {
        this.collision.openChest();
    }

    checkCollision(entity, hSpeed, vSpeed) {
        return this.collision.checkCollision(entity, hSpeed, vSpeed);
    }

    isChestAt(gridX, gridY) {
        return this.collision.isChestAt(gridX, gridY);
    }

    getGameState() {
        return {
            player: {
                type: this.player.constructor.name,
                hp: this.player.hp,
                maxHp: this.player.maxHp,
                stats: {
                    attack: this.player.attack,
                    defense: this.player.defense,
                    hpStat: this.player.hpStat,
                    luck: this.player.luck,
                    maxSpeed: this.player.maxSpeed
                },
                resources: {
                    gold: this.player.gold,
                    xp: this.player.xp,
                    level: this.player.levelPlayer,
                    potionCount: this.player.potionCount
                },
                inventory: {
                    weapon: this.HUD.collectedItems[0] ? { name: this.HUD.collectedItems[0].name, type: this.HUD.collectedItems[0].type } : null,
                    armor: this.HUD.collectedItems[1] ? { name: this.HUD.collectedItems[1].name, type: this.HUD.collectedItems[1].type } : null,
                }
            },
            world: {
                levelMap: this.levelMap,
                kills: this.kills
            }
        };
    }
}