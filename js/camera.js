class Camera{
    constructor(player){
        this.cameraX = player.x;
        this.cameraY = player.y;
    }
    update(player, canvas){
        const mapWidthPixel = MAP_WIDTH * TILE_SIZE;
        const mapHeightPixel = MAP_HEIGHT * TILE_SIZE;

        const minX = 0;
        const maxX = mapWidthPixel - canvas.width;
        const posX = player.x - canvas.width / 2;

        const minY = 0;
        const maxY = mapHeightPixel - canvas.height
        const posY = player.y - canvas.height / 2

        this.cameraX = Math.min(maxX, Math.max(minX, posX));
        this.cameraY = Math.min(maxY, Math.max(minY, posY));
    }
}