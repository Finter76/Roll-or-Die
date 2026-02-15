class HUD{
    constructor(game){
        this.game = game;

        this.size = 70; 
        this.padding = 10;

        this.collectedItems = [null, null, null];
        
        this.potionIcon = new Image();
        this.potionIcon.src = "./images/potion.png";

        const totalWidth = (HUD_ITEMS * this.size) + ((HUD_ITEMS - 1) * this.padding);

        this.x = (CANVAS_WIDTH - totalWidth) / 2;
        this.y = CANVAS_HEIGHT - this.size - 20;
    }

    addItem(item){
        if(item.type === "weapon"){
            this.collectedItems[0] = item;
            return true;
        } else if(item.type === "armor"){
            this.collectedItems[1] = item;
            return true;
        } 
        return false;
    }
    
    draw(ctx){
        ctx.save();

        for(let i = 0; i < HUD_ITEMS; i++){
            const currentX = this.x + i * (this.size + this.padding);

            ctx.fillStyle = 'rgba(20, 20, 25, 0.8)';
            ctx.fillRect(currentX, this.y, this.size, this.size);

            ctx.strokeStyle = '#c09f68';
            ctx.lineWidth = 4;
            ctx.strokeRect(currentX, this.y, this.size, this.size);

            const padding = 5;
            const imgSize = this.size - (padding * 2);

            // Arma e Armatura
            if(i < 2){
                const item = this.collectedItems[i];
                if(item && item.image){
                    ctx.drawImage(item.image, currentX + padding, this.y + padding, imgSize, imgSize);
                }
            }

            // Counter pozioni
            if(i === 2 && this.game.player){
                const count = this.game.player.potionCount;

                if(count > 0){
                    ctx.drawImage(this.potionIcon, currentX + padding, this.y + padding, imgSize, imgSize);

                    const cx = currentX + this.size - 16;
                    const cy = this.y + this.size - 16;

                    ctx.fillStyle = "rgba(0,0,0,0.9)";
                    ctx.beginPath();
                    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.strokeStyle = "#c09f68";
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    ctx.fillStyle = "white";
                    ctx.font = "bold 16px Arial";
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";

                    ctx.shadowColor = "black";
                    ctx.shadowBlur = 4;

                    ctx.fillText(count.toString(), cx, cy);

                    ctx.shadowBlur = 0;
                }
            }
        }
        ctx.restore();
    }
}