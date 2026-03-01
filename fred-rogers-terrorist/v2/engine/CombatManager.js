/**
 * CombatManager.js - Turn-Based Combat System
 */
window.FRT = window.FRT || {};

window.FRT.CombatManager = class CombatManager {
    constructor(gameState, eventBus) {
        this.state = gameState;
        this.eventBus = eventBus;
        this.active = false;
        this.currentEnemy = null;
    }

    startCombat(charId) {
        var c = this.state.characters[charId];
        if (!c || !c.alive || c.defeated) {
            this.eventBus.emit('message:add', { text: "There's no one to fight." });
            return;
        }
        this.active = true;
        this.currentEnemy = charId;
        this.eventBus.emit('combat:start', { characterId: charId, enemy: c });
    }

    playerAttack() {
        if (!this.active || !this.currentEnemy) return;
        var c = this.state.characters[this.currentEnemy];
        if (!c) return;
        var Constants = window.FRT.Constants;

        // Calculate player damage
        var weapon = this.getBestWeapon();
        var damage = weapon ? (Constants.WEAPON_DAMAGE[weapon] || Constants.FIST_DAMAGE) : Constants.FIST_DAMAGE;
        var weaponName = weapon ? (this.state.items[weapon] ? this.state.items[weapon].name : weapon) : 'fists';

        this.eventBus.emit('combat:message', { text: 'You attack ' + c.name + ' with your ' + weaponName + '!' });
        if (c.combatMessages && c.combatMessages.playerHit) {
            this.eventBus.emit('combat:message', { text: c.combatMessages.playerHit });
        }

        this.state.damageCharacter(this.currentEnemy, damage);

        // Check defeat
        if (!c.alive || c.defeated) {
            if (c.combatMessages && c.combatMessages.defeat) {
                this.eventBus.emit('combat:message', { text: c.combatMessages.defeat });
            }
            this.runDefeatScript(this.currentEnemy);
            this.endCombat('victory', c.name + ' has been defeated!');
            return;
        }

        // Enemy counterattack
        this.enemyTurn();
    }

    enemyTurn() {
        if (!this.active || !this.currentEnemy) return;
        var c = this.state.characters[this.currentEnemy];
        if (!c || !c.alive) return;

        var damage = c.attack + Math.floor(Math.random() * 5);
        this.state.modifyHp(-damage);

        if (c.combatMessages && c.combatMessages.enemyHit) {
            this.eventBus.emit('combat:message', { text: c.combatMessages.enemyHit });
        } else {
            this.eventBus.emit('combat:message', { text: c.name + ' hits you for ' + damage + ' damage!' });
        }

        if (this.state.player.hp <= 0) {
            this.eventBus.emit('combat:message', { text: 'You have been killed!' });
            this.endCombat('death', 'You died!');
            this.state.endGame(false, 'You died. Better luck next time!');
        }
    }

    playerFlee() {
        if (!this.active) return;
        if (Math.random() < 0.4) {
            this.eventBus.emit('combat:message', { text: 'You manage to disengage!' });
            this.endCombat('fled', 'You got away.');
        } else {
            this.eventBus.emit('combat:message', { text: "You can't get away!" });
            this.enemyTurn();
        }
    }

    useGrenade() {
        if (!this.active || !this.currentEnemy) return;
        if (!this.state.isItemInInventory('hand_grenades')) {
            this.eventBus.emit('combat:message', { text: "You don't have any grenades!" });
            return;
        }
        var Constants = window.FRT.Constants;
        var c = this.state.characters[this.currentEnemy];

        this.state.removeFromInventory('hand_grenades');
        this.eventBus.emit('combat:message', { text: 'You throw a grenade at ' + c.name + '!' });

        if (Math.random() < Constants.GRENADE_HIT_CHANCE) {
            this.eventBus.emit('combat:message', { text: 'BOOM! Direct hit!' });
            this.state.damageCharacter(this.currentEnemy, Constants.GRENADE_DAMAGE);
            if (!c.alive || c.defeated) {
                if (c.combatMessages && c.combatMessages.defeat) {
                    this.eventBus.emit('combat:message', { text: c.combatMessages.defeat });
                }
                this.runDefeatScript(this.currentEnemy);
                this.endCombat('victory', c.name + ' has been obliterated!');
                return;
            }
        } else {
            this.eventBus.emit('combat:message', { text: 'The grenade misses! It was a dud!' });
        }
        this.enemyTurn();
    }

    runDefeatScript(charId) {
        var charDef = window.FRT.CharacterDefs[charId];
        if (charDef && charDef.onDefeat) {
            var ref = charDef.onDefeat;
            if (typeof ref === 'string' && ref.indexOf('$script:') === 0) {
                var name = ref.substring(8);
                var fn = window.FRT.Scripts[name];
                if (fn) fn(this.state, this.eventBus);
            }
        }
    }

    endCombat(result, message) {
        this.active = false;
        var charId = this.currentEnemy;
        this.currentEnemy = null;
        this.eventBus.emit('combat:end', { charId: charId, result: result, message: message || '' });
    }

    getBestWeapon() {
        var Constants = window.FRT.Constants;
        var weaponDamage = Constants.WEAPON_DAMAGE;
        var best = null;
        var bestDmg = 0;
        for (var weapon in weaponDamage) {
            if (weapon === 'hand_grenades' || weapon === 'cuss_words') continue;
            if (this.state.isItemInInventory(weapon)) {
                if (weaponDamage[weapon] > bestDmg) {
                    best = weapon;
                    bestDmg = weaponDamage[weapon];
                }
            }
        }
        return best;
    }
};
