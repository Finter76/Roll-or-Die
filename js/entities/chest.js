class Chest{
    constructor(x, y){
        this.x = x * TILE_SIZE;
        this.y = y * TILE_SIZE;
        this.width = TILE_SIZE;
        this.height = TILE_SIZE;
        this.open = false;
        this.imageClosed = new Image();
        this.imageClosed.src = "./images/chestClosed.png";

        this.imageOpen = new Image();
        this.imageOpen.src = "./images/chestOpen.png";

        this.item = this.generateItem(); 
    }
    draw(ctx){
        if(this.open){
            ctx.drawImage(this.imageOpen, this.x, this.y, TILE_SIZE, TILE_SIZE)
        } else {
            ctx.drawImage(this.imageClosed, this.x, this.y, TILE_SIZE, TILE_SIZE)
        }
        if (this.open && this.item){
            ctx.drawImage(this.item.image, this.x + 16, this.y - 20, TILE_SIZE/2, TILE_SIZE/2);
        }
    }

    generateItem(){
        const rand = Math.random();

        if (rand < 0.4) return new Gold();      // 40% Monete
        if (rand < 0.7) return new Potion();    // 30% Cura
        if (rand < 0.9) return new Weapon();    // 20% Arma
        return new Armor();                     // 10% Armatura
    }
}