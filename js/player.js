class Player{
    constructor(map, game, loadData = null){
        // Il player ha accesso alla mappa
        // Posso controllare facilmente il movimento
        this.map = map;
        this.game = game;

        this.width = PLAYER_WIDTH;
        this.height = PLAYER_HEIGHT;

        this.hitboxOffsetY = 12;
        
        this.hSpeed = 0;
        this.vSpeed = 0;

        this.invulnerabilityTimer = 0; //Gestisco gli i-frame   

        // Stat BASE (0–10)
        this.attack  = 0;
        this.defense = 0;
        this.hpStat  = 0;
        this.luck    = 0;
        this.maxSpeed = 0;

        // HP REALI (inizializzati dopo)
        this.maxHp = 0;
        this.hp = 0;

        const res = (loadData && loadData.player && loadData.player.resources) ? loadData.player.resources : null;

        this.levelPlayer = res ? res.level : 1;

        this.gold = res ? res.gold : 0;

        this.xp = res ? res.xp : 0;
        this.xpToNext = Math.floor(10* Math.pow(1.4, this.levelPlayer -1));

        this.potionCount = res ? res.potionCount : 0;

        this.animTimer = 0;
        this.animInterval = 0.3;
        this.isRunFrame = false;

        this.facingLeft = false;

        this.imageIdle = new Image();
        this.imageRun = new Image();

        this.diceValue = 0;
        this.diceVisibleUntil = 0;

        this.image = this.imageIdle;

        this.initPosition();

        this.setupLevelUpListeners();   
    }

    loadStats(data){
        if(data && data.player && data.player.stats){
            return data.player.stats;
        }
        return null;   
    }

    setupLevelUpListeners(){
        levelHpStat.addEventListener('click', () => this.chooseStat('hp'));
        levelDefStat.addEventListener('click', () => this.chooseStat('defense'));
        levelAtkStat.addEventListener('click', () => this.chooseStat('attack'));
        levelLuckStat.addEventListener('click', () => this.chooseStat('luck'));
        levelSpdStat.addEventListener('click', () => this.chooseStat('speed'));
    }

    chooseStat(stat){
        let upgraded = false;
        
        switch(stat){
            case 'attack': 
                if(this.attack < MAX_STAT_VALUES.attack) this.attack++; 
                upgraded = true;
                break;
            case 'defense': 
                if(this.defense < MAX_STAT_VALUES.defense) this.defense++;
                upgraded = true; 
                break;
            case 'hp': 
                if(this.hpStat < MAX_STAT_VALUES.hp) this.hpStat++; 
                upgraded = true;
                break;
            case 'luck': 
                if(this.luck < MAX_STAT_VALUES.luck) this.luck++; 
                upgraded = true;
                break;
            case 'speed': 
                const currentSpeedLevel = this.maxSpeed / 60;
                if(currentSpeedLevel <= MAX_STAT_VALUES.speed) {
                    this.maxSpeed += 60;
                    upgraded = true;
                }
                break;
        }

        if(!upgraded){
            alert("Questa statistica è già al massimo! Scegli un'altra opzione.");
            return; 
        }

        // Ad ogni livello restoro la vita
        this.initHp() 
        
        levelUp.style.display = "none";
        this.game.paused = false;

        if(this.xp >= this.xpToNext){
            this.addXp(0);
        }
    }

    initHp(currentHp = null){
        this.maxHp = this.hpStat * 6;
        if(currentHp !== null){
            this.hp = Math.min(currentHp, this.maxHp);
        } else {
            this.hp = this.maxHp;
        }  
    }

    initPosition(){
        const spawn = this.safeSpawn();
        this.x = spawn.x * TILE_SIZE + TILE_SIZE / 2;
        this.y = spawn.y * TILE_SIZE + TILE_SIZE;
    }
    
    safeSpawn(){
        let rooms = this.map.rooms;

        let randomRoomIndex = Math.floor(Math.random()*rooms.length);
        let spawnRoom = rooms[randomRoomIndex];

        let spawnCoord = this.map.getCenter(spawnRoom);

        if(this.game.isChestAt(spawnCoord.x, spawnCoord.y)) return this.safeSpawn();

        return {x : spawnCoord.x, y : spawnCoord.y};
    }

    addXp(xpReward){
        this.xp += Math.floor(xpReward * (1 + this.levelPlayer * 0.2));

        if(this.xp >= this.xpToNext){// Nuovo livello del giocatore
            this.xp -= this.xpToNext;
            this.levelPlayer++;
            
            levelUp.style.display = "block";
            this.game.paused = true;

            console.log(this.game.enemies);

            this.xpToNext = Math.floor(10 * Math.pow(1.4, this.levelPlayer - 1));
        }
    }

    update(input, game, deltaTime){
        if(game.paused) return;
        
        const map = this.map;

        if(this.invulnerabilityTimer > 0){
            this.invulnerabilityTimer -= deltaTime;
        }

        if(this.diceVisibleUntil > 0){
            this.diceVisibleUntil -= deltaTime; 
        }        

        let moveX = 0;
        let moveY = 0;

        if(input.includes('a')) moveX -= 1;
        if(input.includes('d')) moveX += 1;

        if(input.includes('w')) moveY -= 1;
        if(input.includes('s')) moveY += 1;

        const gridX = Math.floor((this.x + this.width  / 2) / TILE_SIZE);
        const gridY = Math.floor((this.y + this.height / 2) / TILE_SIZE);

        if(map.tiles[gridY][gridX].type === 'stairs'){
            // Nuovo livello
            game.nextLevel();
        }

        // Se mi muovo in diagonale, normalmente sommerei le velocità vettorialmente: v = \sqrt(x^2+x^2) = x*\sqrt 2
        // Quindi faccio la norma (moltiplico per 1 / \sqrt 2 = 0.707 entrambi i membri)
        if(moveX !== 0 && moveY !== 0){
            this.hSpeed = moveX * this.maxSpeed * 0.707;
            this.vSpeed = moveY * this.maxSpeed * 0.707;
        }
        else{
            this.hSpeed = moveX * this.maxSpeed;
            this.vSpeed = moveY * this.maxSpeed;
        }

        const isMoving = (this.hSpeed !==0 || this.vSpeed !== 0);

        if(this.hSpeed < 0){
            this.facingLeft = true;
        } else if(this.hSpeed > 0){
            this.facingLeft = false;
        }

        if(isMoving){
            this.animTimer += deltaTime;

            if(this.animTimer >= this.animInterval){
                this.animTimer = 0; // Resetta il timer
                this.isRunFrame = !this.isRunFrame;
                this.image = this.isRunFrame ? this.imageRun : this.imageIdle;
            }
        } else {
            this.image = this.imageIdle;
            this.isRunFrame = false;
            this.animTimer = 0;
        }

        const moveStepX = this.hSpeed * deltaTime;
        const moveStepY = this.vSpeed * deltaTime;

        if(game.checkCollision(this, moveStepX, 0)){
            this.x += moveStepX;
        }

        if(game.checkCollision(this, 0, moveStepY)){
            this.y += moveStepY;   
        }
    }

    usePotion(){
        if(this.potionCount <= 0) return false;

        const healAmount = Math.floor(this.maxHp * 0.35);

        if(this.hp === this.maxHp) return false; //se ho il maxHp evito di sprecare

        this.hp = Math.min(this.maxHp, this.hp + healAmount);
        this.potionCount--;

        return true; 
    }


    draw(ctx){
        const isInvulnerable = (this.invulnerabilityTimer > 0);

        ctx.save();

        if(isInvulnerable){
            ctx.globalAlpha = 0.5;
        }

        const drawOffsetX = (TILE_SIZE - this.width) / 2;
        const drawOffsetY = (TILE_SIZE - this.height) / 2;

        if(this.facingLeft){
            ctx.translate(this.x, this.y + TILE_SIZE / 2 - this.hitboxOffsetY);
            ctx.scale(-1, 1);
            ctx.drawImage(this.image, -TILE_SIZE/2 - drawOffsetX, -TILE_SIZE/2 - drawOffsetY, TILE_SIZE, TILE_SIZE);
        } else {
            ctx.drawImage(this.image, this.x - drawOffsetX, this.y - drawOffsetY - this.hitboxOffsetY, TILE_SIZE, TILE_SIZE);
        }

        ctx.restore();
    }
}

// Gestione statistiche e caricamento immagini
// DEF, HP, ATK, LUCK da 0-10
// SPD da 0-5

class Knight extends Player{
    constructor(map, game, loadData){
        super(map, game, loadData)
        // DEF: alta, HP: buono, ATT: medi, LUCK, SPEED: bassi
        const savedStats = this.loadStats(loadData);

        this.defense = savedStats ? savedStats.defense :  8;
        this.hpStat = savedStats ? savedStats.hpStat :    7;
        this.attack = savedStats ? savedStats.attack :    5;
        this.luck = savedStats ? savedStats.luck :        3;
        this.maxSpeed = savedStats ? savedStats.maxSpeed : 120;

        const savedHp = (loadData && loadData.player) ? loadData.player.hp : null;
        this.initHp(savedHp);

        this.imageIdle.src = "./images/knight.png";     
        this.imageRun.src = "./images/knight_run.png";   
        
        this.image = this.imageIdle;
    }
}

class Rogue extends Player{
    constructor(map, game, loadData){
        super(map, game, loadData)
        // DEF: molto basso, HP: molto basso, ATT: buono, LUCK, SPEED: alti
        const savedStats = this.loadStats(loadData);

        this.defense = savedStats ? savedStats.defense :  2;
        this.hpStat = savedStats ? savedStats.hpStat :   2;
        this.attack = savedStats ? savedStats.attack :   7;
        this.luck = savedStats ? savedStats.luck :     8;
        this.maxSpeed = savedStats ? savedStats.maxSpeed : 240;

        const savedHp = (loadData && loadData.player) ? loadData.player.hp : null;
        this.initHp(savedHp);

        this.imageIdle.src = "./images/rogue.png";     
        this.imageRun.src = "./images/rogue_run.png";   
        
       
        this.image = this.imageIdle;
    }
}

class Barbarian extends Player{
    constructor(map, game, loadData){
        super(map, game, loadData)
        // DEF: nulla , HP: molto alto, ATT: molto alto, LUCK, SPEED: basse
        const savedStats = this.loadStats(loadData);

        this.defense = savedStats ? savedStats.defense :  0;
        this.hpStat = savedStats ? savedStats.hpStat :   9;
        this.attack = savedStats ? savedStats.attack :   9;    
        this.luck = savedStats ? savedStats.luck :     3;      
        this.maxSpeed = savedStats ? savedStats.maxSpeed : 120;

        const savedHp = (loadData && loadData.player) ? loadData.player.hp : null;
        this.initHp(savedHp);

        this.imageIdle.src = "./images/barbarian.png";     
        this.imageRun.src = "./images/barbarian_run.png";   
        
       
        this.image = this.imageIdle;
    }
}

class Mage extends Player{
    constructor(map, game, loadData){
        super(map, game, loadData)
        // DEF: molto basso, HP: molto basso, ATT: massimo, LUCK, SPEED: media
        const savedStats = this.loadStats(loadData);

        this.defense = savedStats ? savedStats.defense :  2;
        this.hpStat = savedStats ? savedStats.hpStat :   2;
        this.attack = savedStats ? savedStats.attack :   10;
        this.luck = savedStats ? savedStats.luck :     5;
        this.maxSpeed = savedStats ? savedStats.maxSpeed : 180;

        const savedHp = (loadData && loadData.player) ? loadData.player.hp : null;
        this.initHp(savedHp);

        this.imageIdle.src = "./images/mage.png";     
        this.imageRun.src = "./images/mage_run.png";     
       
        this.image = this.imageIdle;
    }
}

class Trickster extends Player{
    constructor(map, game, loadData){
        super(map, game, loadData)
        // DEF: discreto, HP: discreto, ATT: discreto, SPEED: medio, LUCK: massimo
        const savedStats = this.loadStats(loadData);

        this.defense = savedStats ? savedStats.defense :  4;
        this.hpStat = savedStats ? savedStats.hpStat :   4;
        this.attack = savedStats ? savedStats.attack :   4;
        this.luck = savedStats ? savedStats.luck :     10;
        this.maxSpeed = savedStats ? savedStats.maxSpeed : 180;

        const savedHp = (loadData && loadData.player) ? loadData.player.hp : null;
        this.initHp(savedHp);

        this.imageIdle.src = "./images/trickster.png"; 
        this.imageRun.src = "./images/trickster_run.png";    
       
        this.image = this.imageIdle;
    }
}