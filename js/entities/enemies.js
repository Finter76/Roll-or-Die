class Enemies{
    constructor(x, y, map, level=1){
        this.map = map;

        this.width = ENTITY_WIDTH;
        this.height = ENTITY_HEIGHT;
        this.hitboxOffsetY = 12;

        this.x = x * TILE_SIZE + TILE_SIZE / 2;
        this.y = y * TILE_SIZE + TILE_SIZE; 

        this.level = level;
       
        this.diceValue = 0;
        this.diceVisibleUntil = 0;

        this.targetTileX = null;
        this.targetTileY = null;
        this.targetOffsetX = 0;
        this.targetOffsetY = 0;

        this.animTimer = 0;
        this.animInterval = 0.3;
        this.isRunFrame = false;

        this.imageIdle = new Image();
        this.imageRun = new Image();

        this.image = this.imageIdle;
    }

    scaleStats(level){
        this.maxHp = this.baseHp * Math.pow(1.25, level-1);
        this.hp = this.maxHp;
        
        this.attack = Math.floor(this.baseAttack * (1 + 0.2 * (level-1)) + Math.floor(Math.random()*2));
        this.defense = Math.floor(this.baseDefense * (1 + 0.2 * (level-1)));
        this.luck = Math.min(10, this.baseLuck + Math.floor(level/3)); // max Luck = 10
        
        let speedCalc = (this.baseSpeed * 60) + ((level - 1) * 15);
        this.speed = Math.min(250, speedCalc);

        this.xpReward = Math.floor(5 + level * 3 + Math.floor(Math.pow(level, 1.4)));        
    }

    update(map, game, deltaTime){
        if(this.diceVisibleUntil > 0){
            this.diceVisibleUntil -= deltaTime;
        }

        if(!map.flowField) return;

        const myCenterX = this.x + this.width / 2;
        const myCenterY = this.y + this.height / 2;
    
        const myGridX = Math.floor((myCenterX) / TILE_SIZE);
        const myGridY = Math.floor((myCenterY) / TILE_SIZE);
    
        let bestX = myGridX;
        let bestY = myGridY;
        let bestDist = (map.flowField[myGridY] && map.flowField[myGridY][myGridX] !== undefined) 
                   ? map.flowField[myGridY][myGridX] 
                   : 9999;

        const playerGridX = Math.floor(game.player.x / TILE_SIZE);
        const playerGridY = Math.floor(game.player.y / TILE_SIZE);

        // Se sono accanto al player, ignoro la penalità
        if (Math.abs(playerGridX - myGridX) + Math.abs(playerGridY - myGridY) === 1) {
            bestX = playerGridX;
            bestY = playerGridY;
        }
    
        const neighbors = [
            { x: myGridX + 1, y: myGridY },
            { x: myGridX - 1, y: myGridY },
            { x: myGridX,     y: myGridY + 1 },
            { x: myGridX,     y: myGridY - 1 }
        ];        
    
        for(let n of neighbors){
            if(n.x < 0 || n.x >= MAP_WIDTH) continue;
            if(n.y < 0 || n.y >= MAP_HEIGHT) continue;

            if(game.isChestAt(n.x, n.y)) continue;

            let d = map.flowField[n.y][n.x];

            if (this.isTileOccupied(n.x, n.y, game)) {
                d += 50; // Penalità alta per evitare il tile
            }

            if(d < bestDist){
                bestDist = d;
                bestX = n.x;
                bestY = n.y;
            }
        }

        if(this.targetTileX !== bestX || this.targetTileY !== bestY){
            this.targetTileX = bestX;
            this.targetTileY = bestY;
            this.targetOffsetX = Math.random()*4 -2;
            this.targetOffsetY = Math.random()*4 -2;
        }
    
        const targetAnchorX = bestX * TILE_SIZE + TILE_SIZE / 2 + this.targetOffsetX;
        const targetAnchorY = bestY * TILE_SIZE + TILE_SIZE / 2 + this.targetOffsetY;

        let hSpeed = 0;
        let vSpeed = 0;
    
        const deltaX = targetAnchorX - myCenterX;
        const deltaY = targetAnchorY - myCenterY;
    
        // Normalizza e moltiplica per speed
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const maxMoveThisFrame = this.speed * deltaTime;
        
        if (dist > 0.5) { // Se non sono già centrato
            hSpeed = (deltaX / dist) * this.speed;
            vSpeed = (deltaY / dist) * this.speed;
            
            // Se molto vicino, vado direttamente al centro
            if (dist < maxMoveThisFrame) {
                hSpeed = deltaX / deltaTime;
                vSpeed = deltaY / deltaTime;
            }
        }

        const isMoving = (Math.abs(hSpeed) > 0.1 || Math.abs(vSpeed) > 0.1);

        if(isMoving){
            this.animTimer += deltaTime; // Usa deltaTime
            if(this.animTimer >= this.animInterval){
                this.animTimer = 0;
                this.isRunFrame = !this.isRunFrame;
                this.image = this.isRunFrame ? this.imageRun : this.imageIdle;
            }
        } else {
            this.image = this.imageIdle; // Torna idle se fermo
        }

        const stepX = hSpeed * deltaTime;
        const stepY = vSpeed * deltaTime;
    
        // 1. Provo asse X
        if (game.checkCollision(this, stepX, 0)) {
            this.x += stepX;
        } 
        // Se bloccato su X, provo a scivolare su Y
        else if (Math.abs(hSpeed) > 0.1) { 
            // Se deltaY mi dice di spostarmi, seguo lui. 
            // ALTRIMENTI (se sono allineato ma bloccato), provo a caso verso il centro della tile corrente
            let slideDir = Math.sign(deltaY);
            
            if (slideDir === 0) {
                // Caso critico: sono perfettamente allineato ma sbatto.
                // Provo a spostarmi leggermente verso il centro "assoluto" della tile per sbloccarmi
                const localY = this.y % TILE_SIZE;
                slideDir = (localY > TILE_SIZE / 2) ? -1 : 1;
            }

            let slideStep = (slideDir * this.speed) * deltaTime;
            
            // Controllo se lo scivolamento è libero
            if (game.checkCollision(this, 0, slideStep)) {
                this.y += slideStep;
            }
        }

        // 2. Provo asse Y (stessa logica speculare)
        if (game.checkCollision(this, 0, stepY)) {
            this.y += stepY;
        } else if (Math.abs(vSpeed) > 0.1) {
            let slideDir = Math.sign(deltaX);

            if (slideDir === 0) {
                const localX = this.x % TILE_SIZE;
                slideDir = (localX > TILE_SIZE / 2) ? -1 : 1;
            }

            let slideStep = (slideDir * this.speed) * deltaTime;

            if (game.checkCollision(this, slideStep, 0)) {
                this.x += slideStep;
            }
        }
    }

    isTileOccupied(gridX, gridY, game) {
        const playerGridX = Math.floor(game.player.x / TILE_SIZE);
        const playerGridY = Math.floor(game.player.y / TILE_SIZE);

        if (gridX === playerGridX && gridY === playerGridY) {
            return false;
        }

        for (let enemy of game.enemies) {
            if (enemy === this) continue;
            
            const enemyGridX = Math.floor((enemy.x + enemy.width / 2) / TILE_SIZE);
            const enemyGridY = Math.floor((enemy.y + enemy.height / 2) / TILE_SIZE);

            if (enemyGridX === gridX && enemyGridY === gridY) {
                return true;
            }
        }
        return false;
    }

    draw(ctx){
        if (!this.image) return;
        
        const drawX = this.x - this.width / 2;
        const drawY = this.y - this.height;

        ctx.drawImage(this.image, drawX, drawY, TILE_SIZE, TILE_SIZE);
    }
}

class Spooky extends Enemies{
    constructor(x, y, map, game){
        super(x, y, map, game)
        
        this.baseHp = 10;
        this.baseAttack = 5;
        this.baseDefense = 7;
        this.baseLuck = 5;
        this.baseSpeed = 1;

        this.scaleStats(this.level);

        //Flutta e non corre
        this.imageIdle.src = "./images/spooky.png";     
        this.imageRun.src = "./images/spooky.png";     
    }
}

class FlyingEnemy extends Enemies{
    constructor(x, y, map, game){
        super(x, y, map, game)
        
        this.baseHp = 5;
        this.baseAttack = 6;
        this.baseDefense = 2;
        this.baseLuck = 2;
        this.baseSpeed = 1;

        this.scaleStats(this.level);

        this.imageIdle.src = "./images/flying_enemy.png";     
        this.imageRun.src = "./images/flying_enemy_run.png";             
    }
}

class Skeleton extends Enemies{
    constructor(x, y, map, game){
        super(x, y, map, game)
        
        this.baseHp = 6;
        this.baseAttack = 7;
        this.baseDefense = 4;
        this.baseLuck = 3;
        this.baseSpeed = 1;

        this.scaleStats(this.level);

        this.imageIdle.src = "./images/skeleton.png";     
        this.imageRun.src = "./images/skeleton_run.png";    
    }
}