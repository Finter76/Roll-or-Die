class Tile{
    constructor(key){
        this.size = TILE_SIZE;
        this.visible = false;
        
        const data = TILE_MAPPING[key];

        this.id = key;
        this.type = data.type;

        this.image = new Image();
        this.image.src = data.src;
    }
}





