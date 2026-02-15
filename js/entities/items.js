class Item{
    constructor(name, imageSrc, map){
        this.name = name;
        this.image = new Image();
        this.image.src = imageSrc;

        this.type = null;

        this.map = map;
    }
    apply(){
        console.log("Hai raccolto: ",this.name);
    }
    draw(ctx, x, y){
        ctx.drawImage(this.image, x, y, TILE_SIZE, TILE_SIZE);
    }
}

class Potion extends Item {
    constructor(){
        super("Pozione Curativa", "./images/potion.png");
        this.healAmount = 20;
        this.type = "potion";
    }
    apply(player){
        player.hp = Math.min(player.maxHp, player.hp + this.healAmount);
        super.apply(player);
    }
}

class Gold extends Item {
    constructor(){
        super("Monete d'Oro", "./images/coin.png");
        this.amount = Math.floor(Math.random() * 50) + 10;
        this.type = "gold";
    }
    apply(player){
        if(!player.gold) player.gold = 0;
        player.gold += this.amount;
        super.apply(player);
    }
}

class Weapon extends Item {
    constructor(){
        super("Spada di Ferro", "./images/sword.png");
        this.atkBonus = 2;
        this.type = "weapon";
    }
    apply(player){
        player.attack += this.atkBonus;
        super.apply(player);
    }
}

class Armor extends Item {
    constructor(){
        super("Cotta di Maglia", "./images/armor.png")
        this.defBonus = 2;
        this.type = "armor";
    }
    apply(player){
        player.defense += this.defBonus;
        super.apply(player);
    }
}

