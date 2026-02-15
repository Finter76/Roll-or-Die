class EnemySpawner {
    constructor(game) {
        this.game = game;
        this.lastSpawnTime = 0;
        this.spawnInterval = 5000; // 5 secondi
    }

    update(timestamp) {
        if (timestamp - this.lastSpawnTime >= this.spawnInterval) {
            if (this.game.enemyCounter < MAX_ENTITIES) {
                this.spawnEnemy();
                this.game.enemyCounter++;
            }
            this.lastSpawnTime = timestamp;
        }
    }

    spawnEnemy() {
        const pos = this.findValidSpawnPosition();
        if(!pos) return;

        const enemyType = this.selectRandomEnemyType();
        const newEnemy = this.createEnemy(enemyType, pos);
        this.game.enemies.push(newEnemy);
    }

    findValidSpawnPosition() {
        const player = this.game.player;
        const playerGridX = Math.floor((player.x + player.width / 2) / TILE_SIZE);
        const playerGridY = Math.floor((player.y + player.height / 2) / TILE_SIZE);

        // Area di spawn: 20 tile dal player
        const minX = Math.max(0, playerGridX - 20);
        const maxX = Math.min(MAP_WIDTH - 1, playerGridX + 20);
        const minY = Math.max(0, playerGridY - 20);
        const maxY = Math.min(MAP_HEIGHT - 1, playerGridY + 20);

        // Cerca posizione valida
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            const randX = Math.floor(Math.random() * (maxX - minX + 1) + minX);
            const randY = Math.floor(Math.random() * (maxY - minY + 1) + minY);

            if (this.isValidSpawnPosition(randX, randY)) {
                return { x: randX, y: randY };
            }
            attempts++;
        }

        // Se non è possibile spawnare, non tornare nulla
        return null;    
    }

    isValidSpawnPosition(x, y) {
        const map = this.game.map;
        const player = this.game.player;

        if (y < 0 || y >= map.tiles.length || 
            x < 0 || x >= map.tiles[0].length) {
            return false;
        }

        const tile = map.tiles[y][x];
        if (!tile || tile.type !== 'floor') return false;

        if (this.game.isChestAt(x, y)) return false;

        const dummyEntity = {
            x: x * TILE_SIZE + TILE_SIZE / 2,
            y: y * TILE_SIZE + TILE_SIZE,
            width: ENTITY_WIDTH,
            height: ENTITY_HEIGHT
        };

        if (!this.game.checkCollision(dummyEntity, 0, 0)) {
            return false;
        }

        const playerGridX = Math.floor((player.x + player.width / 2) / TILE_SIZE);
        const playerGridY = Math.floor((player.y + player.height / 2) / TILE_SIZE);

        if (Math.abs(playerGridX - x) <= 2 && 
            Math.abs(playerGridY - y) <= 2) {
            return false;
        }

        if (playerGridX === x && playerGridY === y) return false;

        for (let enemy of this.game.enemies) {
            if (!enemy.x || !enemy.y) continue;

            const eGridX = Math.floor((enemy.x + enemy.width / 2) / TILE_SIZE);
            const eGridY = Math.floor((enemy.y + enemy.height / 2) / TILE_SIZE);

            if (eGridX === x && eGridY === y) return false;
        }

        return true;
    }

    selectRandomEnemyType() {
        const rand = Math.random();
        
        if (rand < 0.3) return 'skeleton'; // 30%
        if (rand < 0.7) return 'spooky'; // 40%
        return 'flying'; // 30%
    }

    createEnemy(type, pos) {
        const level = this.game.levelMap;
        
        switch (type) {
            case 'skeleton':
                return new Skeleton(pos.x, pos.y, this.game.map, level);
            case 'spooky':
                return new Spooky(pos.x, pos.y, this.game.map, level);
            case 'flying':
                return new FlyingEnemy(pos.x, pos.y, this.game.map, level);
            default:
                return new Skeleton(pos.x, pos.y, this.game.map, level);
        }
    }

    reset() {
        this.game.enemies = [];
        this.game.enemyCounter = 0;
        this.lastSpawnTime = 0;
    }
}