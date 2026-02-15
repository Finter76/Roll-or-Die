class CollisionSystem {
    constructor(game) {
        this.game = game;
    }

    checkCollision(entity, hSpeed, vSpeed) {
        const nextX = entity.x + hSpeed;
        const nextY = entity.y + vSpeed;

        const corners = [
            { x: Math.floor(nextX / TILE_SIZE), y: Math.floor(nextY / TILE_SIZE) },
            { x: Math.floor((nextX + entity.width - 1) / TILE_SIZE), y: Math.floor(nextY / TILE_SIZE) },
            { x: Math.floor(nextX / TILE_SIZE), y: Math.floor((nextY + entity.height - 1) / TILE_SIZE) },
            { x: Math.floor((nextX + entity.width - 1) / TILE_SIZE), y: Math.floor((nextY + entity.height - 1) / TILE_SIZE) }
        ];

        for (let corner of corners) {
            if (corner.x < 0 || corner.x >= MAP_WIDTH || corner.y < 0 || corner.y >= MAP_HEIGHT) {
                return false;
            }
            
            if (this.game.map.tiles[corner.y][corner.x].type === 'wall' || this.isChestAt(corner.x, corner.y)) {
                return false;
            }
        }

        return true;
    }

    isChestAt(gridX, gridY) {
        return this.game.map.chests.find(chest =>
            chest.x === gridX * TILE_SIZE && chest.y === gridY * TILE_SIZE
        );
    }

    // Collision AABB
    checkPlayerHit(enemy) {
        return (
            this.game.player.x <= enemy.x + enemy.width &&
            this.game.player.x + this.game.player.width >= enemy.x &&
            this.game.player.y <= enemy.y + enemy.height &&
            this.game.player.y + this.game.player.height >= enemy.y
        );
    }

    openChest() {
        const gridX = Math.floor(this.game.player.x / TILE_SIZE);
        const gridY = Math.floor(this.game.player.y / TILE_SIZE);

        const adjacent = [
            { x: gridX + 1, y: gridY },  // Destra
            { x: gridX - 1, y: gridY },  // Sinistra
            { x: gridX, y: gridY + 1 },  // Sotto
            { x: gridX, y: gridY - 1 }   // Sopra
        ];

        for (let pos of adjacent) {
            const chest = this.isChestAt(pos.x, pos.y);
            
            if (chest && !chest.open) {
                chest.open = true;

                if (chest.item) {
                    if (chest.item.type === "potion") {
                        this.game.player.potionCount++;
                    } else {
                        chest.item.apply(this.game.player, this.game.map);
                    }
                    this.game.HUD.addItem(chest.item);
                    chest.itemTimer = 1.5;
                }
                
                return true;
            }
        }

        return false;
    }
}