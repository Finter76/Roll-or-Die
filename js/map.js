class Map{
    constructor(level){
        this.width = MAP_WIDTH;
        this.height = MAP_HEIGHT;
        this.tiles = [];
        this.rooms = [];
        this.chests = [];

        // Campo dei flussi, ogni volta che lo aggiorno inserisco
        // in una matrice MAP_HEIGHT X MAP_WIDTH la distanza di quel tile dal giocatore 
        this.flowField = null;
        this.flowTarget = null;
        this.lastFlowUpdate = 0;

        this.generate_Map();
    }
    
    //Inizializzo la mappa con pavimenti di pietra, poi andrò a modificarla dinamicamente
    generate_Map(){
        for(let i = 0; i < MAP_HEIGHT; i++){
            let row = [];
            for(let j = 0; j < MAP_WIDTH; j++){
                let tile = new Tile('STONE_TILE');
                tile.explored = false;
                tile.visible = false;
                row.push(tile);
            }    
            this.tiles.push(row);
        }

        //Genero le stanze
        let tries = 50;
        for(let i = 0; i < tries; i++){
            //Genero coordinata a caso e tento di inserire una stanza in mappa
            const innerH = Math.floor(Math.random()*4) + 3; 
            const innerW = Math.floor(Math.random()*4) + 3;
            
            const sizeX = innerW + 2;
            const sizeY = innerH + 2;

            const randX = Math.floor(Math.random()*(MAP_WIDTH - sizeX - 2)) + 1;
            const randY = Math.floor(Math.random()*(MAP_HEIGHT - sizeY - 2)) + 1;

            const roomData = {
                x: randX, y: randY, w: sizeX, h: sizeY
            };

            if(!this.checkRoomCollisions(roomData)){
                this.rooms.push(roomData);
                this.digRoom(roomData);
            }
        } 

        //Genero i corridoi
        //Prendo il corridoio attuale e precedente e li collego
        for(let i = 1; i < this.rooms.length; i++){
            const currRoom = this.rooms[i];
            const precRoom = this.rooms[i-1];

            const currCenter = this.getCenter(currRoom);
            const precCenter = this.getCenter(precRoom);

            // In metà dei casi faccio una L
            if(Math.random() < 0.5){
                this.createH_Tunnel(precCenter.x, currCenter.x, precCenter.y);
                this.createV_Tunnel(precCenter.y, currCenter.y, currCenter.x);
            } else { // Nell'altra metà faccio una L rovesciata 
                this.createV_Tunnel(precCenter.y, currCenter.y, precCenter.x);
                this.createH_Tunnel(precCenter.x, currCenter.x, currCenter.y);
            }
        }     
        
        this.generateChest();

        //Genero la scala per il prossimo livello
        //Viene piazzata sembra in basso a sinistra
        this.placeStairs()
    }

    placeStairs(){
        const nextLevelRoomIndex = Math.floor(Math.random()*this.rooms.length);
        const nextLevelRoom = this.rooms[nextLevelRoomIndex];
        
        const nextLevelRoomX = nextLevelRoom.x + 1;
        const nextLevelRoomY = nextLevelRoom.y + nextLevelRoom.h - 2;

        this.stairsX = nextLevelRoomX;
        this.stairsY = nextLevelRoomY;

        this.tiles[nextLevelRoomY][nextLevelRoomX] = new Tile('STAIRS');
    }

    generateChest(){
        // Prevedo che se aumento le casse massime potrebbe capitare di averne tante e potrebbe finire in un loop infinito 
        let tries = 0;
        for(let i = 0; i < MAX_CHESTS && tries < this.rooms.length; i++){
            const randomRoomIndex = Math.floor(Math.random()*this.rooms.length);
            const randomRoom = this.rooms[randomRoomIndex];

            //Posiziono le chest al centro della stanza
            const pos = this.getCenter(randomRoom);

            const pixelX = pos.x * TILE_SIZE;
            const pixelY = pos.y * TILE_SIZE;

            const alreadyExists = this.chests.some(chest => chest.x === pixelX && chest.y === pixelY);
            if(!alreadyExists){
                const newChest = new Chest(pos.x, pos.y)
                this.chests.push(newChest);
            } else {
                i--;
            }
            tries++;
        }
    }

    createH_Tunnel(x1,x2,y){
        if(x2 < x1){
            [x2, x1] = [x1, x2];
        }

        for(let j = x1; j <= x2; j++){
            this.tiles[y][j] = new Tile('GRASS_FLOOR');

            if(this.tiles[y-1][j].id === 'STONE_TILE'){
                this.tiles[y-1][j] = new Tile('STONE_WALL');
            }
            if(this.tiles[y+1][j].id === 'STONE_TILE'){
                this.tiles[y+1][j] = new Tile('STONE_WALL');
            }
        }
    }

    createV_Tunnel(y1, y2, x){
        if(y2 < y1){
            [y2, y1] = [y1, y2];
        }

        for(let i = y1; i <= y2; i++){
            this.tiles[i][x] = new Tile('GRASS_FLOOR');

            if(this.tiles[i][x+1].id === 'STONE_TILE'){
                this.tiles[i][x+1] = new Tile('STONE_WALL');
            }
            if(this.tiles[i][x-1].id === 'STONE_TILE'){
                this.tiles[i][x-1] = new Tile('STONE_WALL');
            }
        }
    }

    getCenter(room){
        let centerX = Math.floor(room.x + room.w/2);
        let centerY = Math.floor(room.y + room.h/2);

        let center = {
            x : centerX, y : centerY
        }

        return center;
    }

    checkRoomCollisions(currentRoom){
        for(let room of this.rooms){
            if(
                currentRoom.x <= room.x + room.w &&
                currentRoom.x + currentRoom.w >= room.x &&
                currentRoom.y <= room.y + room.h &&
                currentRoom.y + currentRoom.h >= room.y
            )
                return true;
        }
        
        return false;
    }

    digRoom(room){
        for(let i = room.y; i < room.y + room.h; i++){
            for(let j = room.x; j < room.x + room.w; j++){
                if(i >= 0 && i < this.height && j >= 0 && j < this.width){
                    if(i < 0 || i >= this.height || j < 0 || j >= this.width) continue;

                    if(i == room.y || i == room.y + room.h - 1 || j == room.x || j == room.x + room.w - 1){
                        this.tiles[i][j] = new Tile('STONE_WALL');
                    } else this.tiles[i][j] = new Tile('GRASS_FLOOR');
                }
            }    
        }   
    }

    draw(ctx){
        for(let i = 0; i < MAP_HEIGHT; i++){
            for(let j = 0; j < MAP_WIDTH; j++){
                //Posizione_Pixel = Index * Size_Tile
                let tile = this.tiles[i][j];
                let pixelX = j*TILE_SIZE;
                let pixelY = i*TILE_SIZE;

                if(!tile.explored){
                    ctx.fillStyle = "black";
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                } else if(!tile.visible){
                    ctx.drawImage(tile.image, pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                    ctx.fillRect(pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                } else {
                    ctx.drawImage(tile.image, pixelX, pixelY, TILE_SIZE, TILE_SIZE);
                }
            }    
        }
    }

    buildFlowField(playerX, playerY, game){
        const distances = [];
        for(let i = 0; i < MAP_HEIGHT; i++){
            distances[i] = [];
            for(let j = 0; j < MAP_WIDTH; j++){
                distances[i][j] = 1000; //Metto un valore molto alto di default
            }
        }

        let gridX = Math.floor(playerX / TILE_SIZE);
        let gridY = Math.floor(playerY / TILE_SIZE);

        distances[gridY][gridX] = 0;

        const queue = [];

        queue.push({
            x: gridX,
            y: gridY,
            dist: 0
        });

        while(queue.length > 0){
            // Devo usare SHIFT perchè la queue è FIFO (implementerei DFS e non BFS)
            const current = queue.shift();

            // Esplora i 4 vicini
            const neighbors = [
                { x: current.x + 1, y: current.y },  // destra
                { x: current.x - 1, y: current.y },  // sinistra
                { x: current.x, y: current.y + 1 },  // giù
                { x: current.x, y: current.y - 1 }   // su
            ];

            for(let n of neighbors){
                if(n.x < 0 || n.x >= MAP_WIDTH) continue;
                if(n.y < 0 || n.y >= MAP_HEIGHT) continue;

                if(this.tiles[n.y][n.x].type === 'wall' || game.isChestAt(n.x, n.y)) continue;

                const newDistance = current.dist + 1;

                if(newDistance < distances[n.y][n.x]){
                    distances[n.y][n.x] = newDistance;

                    queue.push({
                        x: n.x,
                        y: n.y,
                        dist: newDistance
                    });
                }
            }
        }
        this.flowField = distances;
        this.flowTarget = { x: gridX, y: gridY };
    }

    // https://stackoverflow.com/questions/4672279/bresenham-algorithm-in-javascript
    // Algoritmo di Bresenham. Verifica se esiste una linea visiva libera tra due punti
    hasLineOfSight(x0, y0, x1, y1) {
        let dx = Math.abs(x1 - x0);
        let dy = Math.abs(y1 - y0);

        let sx = (x0 < x1) ? 1 : -1;
        let sy = (y0 < y1) ? 1 : -1;

        let err = dx - dy;

        while (true) {
            // NON controlliamo il tile finale (quella che vogliamo vedere)
            if (!(x0 === x1 && y0 === y1)) {
                if (this.tiles[y0][x0].type === 'wall') {
                    return false;
                }
            }

            if (x0 === x1 && y0 === y1) break;

            let e2 = 2 * err;

            if (e2 > -dy) { err -= dy; x0 += sx; }
            if (e2 < dx)  { err += dx; y0 += sy; }
        }

        return true;
    }


    updateVisibility(playerX, playerY){
        const gridX = Math.floor(playerX / TILE_SIZE);
        const gridY = Math.floor(playerY / TILE_SIZE);

        // Resetto tutti i tile e li metto non visibili
        for(let i = 0; i < MAP_HEIGHT; i++){
            for(let j = 0; j < MAP_WIDTH; j++){
                this.tiles[i][j].visible = false;
            }
        }

        for(let i = gridY - VISION_RADIUS; i <= gridY + VISION_RADIUS; i++){
            for(let j = gridX - VISION_RADIUS; j <= gridX + VISION_RADIUS; j++){
                if(i < 0 || i >= MAP_HEIGHT || j < 0 || j >= MAP_WIDTH) continue;
                const dx = j - gridX; 
                const dy = i - gridY; 

                if(dx*dx + dy*dy > VISION_RADIUS*VISION_RADIUS) continue;

                if(this.hasLineOfSight(gridX, gridY, j, i)){
                    this.tiles[i][j].visible = true;
                    this.tiles[i][j].explored = true;
                }
            }
        }
    }
}