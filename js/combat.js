class CombatSystem {
    constructor(game) {
        this.game = game;
    }

    handleCombat(enemy) {
        // Controlla invulnerabilità
        if (this.game.player.invulnerabilityTimer > 0) return;
        this.game.player.invulnerabilityTimer = 1.0;

        let playerRoll = this.rollWithLuck(this.game.player.luck);
        let enemyRoll = this.rollWithLuck(enemy.luck);

        // Determina attaccante e difensore
        let attacker = null;
        let defender = null;

        if (playerRoll > enemyRoll) {
            attacker = this.game.player;
            defender = enemy;
        } else if (playerRoll < enemyRoll) {
            attacker = enemy;
            defender = this.game.player;
        }

        // Normalizza i tiri a valori 1-6
        playerRoll = this.normalizeDiceRoll(playerRoll);
        enemyRoll = this.normalizeDiceRoll(enemyRoll);

        // Mostra i dadi
        this.showDice(this.game.player, playerRoll);
        this.showDice(enemy, enemyRoll);

        // Pareggio = nessun danno
        if (playerRoll === enemyRoll) return;

        const damage = this.calculateDamage(attacker, defender, playerRoll, enemyRoll);
        defender.hp -= damage;

        if (defender === enemy && enemy.hp <= 0) {
            this.onEnemyKilled(enemy);
        }

        if (this.game.player.hp <= 0) {
            this.game.gameOver();
        }
    }

    rollWithLuck(luck) {
        const rolls = 1 + Math.floor(luck / 3); // Luck 0-10 -> 1-4 tiri
        let best = 0;

        for (let i = 0; i < rolls; i++) {
            const roll = Math.floor(Math.random() * 60 + 1);
            if (roll > best) best = roll;
        }

        return best;
    }

    normalizeDiceRoll(roll) {
        const normalized = Math.ceil(roll / 10);
        return Math.max(1, Math.min(6, normalized));
    }

    calculateDamage(attacker, defender, attackerRoll, defenderRoll) {
        const baseDamage = attacker.attack * 2 + Math.floor(Math.random() * 4);
        const reduction = Math.floor(defender.defense * 0.7);
        let damage = Math.max(1, baseDamage - reduction);

        // Colpo critico se differenza >= 3
        if (Math.abs(attackerRoll - defenderRoll) >= 3) {
            damage = Math.floor(damage * 1.5);
        }

        return damage;
    }

    showDice(entity, value) {
        entity.diceValue = value;
        entity.diceVisibleUntil = 1.0;
    }

    onEnemyKilled(enemy) {
        this.game.kills++;
        this.game.enemyCounter--;
        
        const goldDrop = Math.floor(Math.random() * 10) + 1;
        this.game.player.gold += goldDrop;
        
        this.game.player.addXp(enemy.xpReward);
    }
}