class UI{
    constructor(){
        this.playerDataBox = playerData;
        this.levelPlayer = levelPlayer;
        this.xp = xp;
        this.floor = floor;
        this.kills = kills;
        this.stats = stats;
        this.hpStat = hpStat;
        this.defStat = defStat;
        this.atkStat = atkStat;
        this.luckStat = luckStat;
        this.spdStat = spdStat;
        this.coins = coins;
        this.diceRolls = this.initDice();
    }

    initDice(){
        let dices = [];
        for(let i = 1; i <= 6; i++){
            const dice = new Image();
            dice.src = `./images/dice_${i}.png`;
            dices.push(dice);
        }
        return dices;
    }

    updatePlayer(info) {
        if(levelPlayer) levelPlayer.textContent = "Livello: " + info.levelPlayer;
        if(floor) floor.textContent = "Piano: " + info.floor;
        if(xp) xp.textContent = "XP: " + info.xp + " / " + info.xpToNext;
        if(kills) kills.textContent = "Uccisioni: " + info.kills;
        if(coins) coins.textContent = "Saldo: " + info.coins;

        if(hpStat) hpStat.textContent = "Hp: " + info.hpStat;
        if(defStat) defStat.textContent = "Difesa: " + info.defStat;
        if(atkStat) atkStat.textContent = "Attacco: " + info.atkStat;
        if(luckStat) luckStat.textContent = "Fortuna: " + info.luckStat;
        
        if(spdStat) spdStat.textContent = "Velocità: " + info.spdStat;
    }

    showPlayerData(){
        if(playerData) this.playerDataBox.style.display = "block";
    }
    
    hidePlayerData(){
        if(playerData) this.playerDataBox.style.display = "none";
    }    

    updateEnemy(enemyData){
        this.enemyHpBar.style.width = ((enemyData.hp / enemyData.maxHp)*100).toString() + "%";

        this.enemyHp.style.left = enemyData.enemyX.toString() + "px"
        this.enemyHp.style.top = enemyData.enemyY.toString() + "px"
    }

    drawDice(ctx, rollDice, entity){
        if (!rollDice || rollDice < 1 || rollDice > 6) return; 

        const image = this.diceRolls[rollDice-1];

        ctx.drawImage(image, entity.x , entity.y - TILE_SIZE - 10, DICE_SIZE, DICE_SIZE);
    }

    showGameOver(stats) {
        const endScreen = document.getElementById("end");
        const statsTable = document.getElementById("endStats");
        
        statsTable.innerHTML = "";

        const rows = [
            { label: "Piani Esplorati", value: stats.floor },
            { label: "Livello Raggiunto", value: stats.levelPlayer },
            { label: "Nemici Sconfitti", value: stats.kills },
            { label: "Oro Accumulato", value: stats.coins }
        ];

        rows.forEach(rowData => {
            const row = statsTable.insertRow();
            row.insertCell(0).innerText = rowData.label;
            row.insertCell(1).innerText = rowData.value;
        });

        endScreen.style.display = "flex";
    }
}