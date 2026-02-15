class Renderer {
    constructor(game) {
        this.game = game;
        this.ctx = game.ctx;
    }

    draw(timestamp) {
        // Pulisce il canvas
        this.ctx.clearRect(0, 0, this.game.canvas.width, this.game.canvas.height);

        this.ctx.save();
        
        // Applica la trasformazione della camera (arrotonda per evitare sub-pixel bleeding)
        this.ctx.translate(
            -Math.floor(this.game.camera.cameraX), 
            -Math.floor(this.game.camera.cameraY)
        );

        // Rendering del mondo
        this.drawWorld();
        this.drawChests();
        this.drawEnemies(timestamp);
        this.drawPlayer(timestamp);
        this.drawDice();

        this.ctx.restore();

        // HUD (sopra la camera)
        this.game.HUD.draw(this.ctx);
    }

    drawWorld() {
        this.game.map.draw(this.ctx);
    }

    drawChests() {
        for (let chest of this.game.map.chests) {
            const chestX = Math.floor(chest.x / TILE_SIZE);
            const chestY = Math.floor(chest.y / TILE_SIZE);

            if (this.game.map.tiles[chestY][chestX].visible) {
                chest.draw(this.ctx);
                
                // Disegna item se la cassa è aperta
                if (chest.open && chest.item) {
                    chest.item.draw(this.ctx, chestX, chestY - (TILE_SIZE / 2));
                }
            }
        }
    }

    drawEnemies(timestamp) {
        for (let enemy of this.game.enemies) {
            const enemyX = Math.floor(enemy.x / TILE_SIZE);
            const enemyY = Math.floor(enemy.y / TILE_SIZE);

            if (this.game.map.tiles[enemyY][enemyX].visible) {
                enemy.draw(this.ctx, timestamp);

                // Barra HP solo se danneggiato
                if (enemy.hp < enemy.maxHp && enemy.hp > 0) {
                    this.drawHpBar(enemy);
                }
            }
        }
    }

    drawPlayer(timestamp) {
        this.game.player.draw(this.ctx, timestamp);
        this.drawHpBar(this.game.player);
    }

    drawDice() {
        // Dado del player
        if (this.game.player.diceVisibleUntil > 0) {
            this.game.UI.drawDice(this.ctx, this.game.player.diceValue, this.game.player);
        }

        // Dadi dei nemici
        for (let enemy of this.game.enemies) {
            if (enemy.hp > 0 && enemy.diceVisibleUntil > 0) {
                this.game.UI.drawDice(this.ctx, enemy.diceValue, enemy);
            }
        }
    }

    drawHpBar(entity) {
        if (entity.hp <= 0) return;

        // Non mostrare barra piena per i nemici
        if (entity !== this.game.player && entity.hp >= entity.maxHp) return;

        const barWidth = 30;
        const barHeight = 4;
        const yOffset = 30;

        const x = entity.x + (entity.width / 2) - (barWidth / 2);
        const y = entity.y - yOffset;

        // Background scuro
        this.ctx.fillStyle = "#222";
        this.ctx.fillRect(x, y, barWidth, barHeight);

        // Barra HP
        const hpPercent = entity.hp / entity.maxHp;
        this.ctx.fillStyle = "#ff0000";
        this.ctx.fillRect(x, y, barWidth * hpPercent, barHeight);

        // Bordo
        this.ctx.strokeStyle = "rgba(255,255,255,0.5)";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, barWidth, barHeight);
    }
}