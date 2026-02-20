/**
 * CombatOverlay.js - Visual Combat UI
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.CombatOverlay = class CombatOverlay {
    constructor(container, combatManager, eventBus, gameState) {
        this.container = container;
        this.combatManager = combatManager;
        this.eventBus = eventBus;
        this.state = gameState;
        this.container.className = 'combat-overlay';
        this.container.style.display = 'none';
        this.build();
        this.listen();
    }

    build() {
        // Enemy info
        this.enemyPanel = document.createElement('div');
        this.enemyPanel.className = 'combat-enemy';

        this.enemyName = document.createElement('div');
        this.enemyName.className = 'combat-enemy-name';

        this.enemyHpBar = document.createElement('div');
        this.enemyHpBar.className = 'combat-hp-bar';
        this.enemyHpFill = document.createElement('div');
        this.enemyHpFill.className = 'combat-hp-fill';
        this.enemyHpBar.appendChild(this.enemyHpFill);

        this.enemyPanel.appendChild(this.enemyName);
        this.enemyPanel.appendChild(this.enemyHpBar);

        // Combat log
        this.combatLog = document.createElement('div');
        this.combatLog.className = 'combat-log';

        // Actions
        this.actions = document.createElement('div');
        this.actions.className = 'combat-actions';

        this.container.appendChild(this.enemyPanel);
        this.container.appendChild(this.combatLog);
        this.container.appendChild(this.actions);
    }

    listen() {
        var self = this;
        this.eventBus.on('combat:start', function(data) {
            self.show(data.characterId);
        });
        this.eventBus.on('combat:update', function(data) {
            self.update(data);
        });
        this.eventBus.on('combat:message', function(data) {
            self.addCombatMessage(data.text);
        });
        this.eventBus.on('combat:end', function(data) {
            self.addCombatMessage(data.message);
            setTimeout(function() { self.hide(); }, 1500);
        });
        this.eventBus.on('character:damaged', function(data) {
            self.updateEnemyHp(data.charId);
        });
    }

    show(characterId) {
        var c = this.state.characters[characterId];
        if (!c) return;

        this.currentEnemy = characterId;
        this.container.style.display = 'flex';
        this.enemyName.textContent = c.name;
        this.updateEnemyHp(characterId);
        this.combatLog.innerHTML = '';

        // Show ambush message if hostile
        if (c.combatMessages && c.combatMessages.ambush) {
            this.addCombatMessage(c.combatMessages.ambush);
        }

        this.buildActions();
    }

    buildActions() {
        this.actions.innerHTML = '';
        var self = this;

        var attackBtn = document.createElement('button');
        attackBtn.className = 'combat-btn combat-attack';
        attackBtn.textContent = 'Attack';
        attackBtn.addEventListener('click', function() {
            self.combatManager.playerAttack();
        });

        var fleeBtn = document.createElement('button');
        fleeBtn.className = 'combat-btn combat-flee';
        fleeBtn.textContent = 'Flee';
        fleeBtn.addEventListener('click', function() {
            self.combatManager.playerFlee();
        });

        this.actions.appendChild(attackBtn);

        // Grenade button if player has grenades
        if (this.state.isItemInInventory('hand_grenades')) {
            var grenadeBtn = document.createElement('button');
            grenadeBtn.className = 'combat-btn combat-grenade';
            grenadeBtn.textContent = 'Grenade';
            grenadeBtn.addEventListener('click', function() {
                self.combatManager.useGrenade();
            });
            this.actions.appendChild(grenadeBtn);
        }

        // Insult button if player has cuss words
        if (this.state.isItemInInventory('cuss_words')) {
            var insultBtn = document.createElement('button');
            insultBtn.className = 'combat-btn combat-insult';
            insultBtn.textContent = 'Insult';
            insultBtn.addEventListener('click', function() {
                // Use cuss words as attack
                var script = window.FRT.Scripts.cussWordsUse;
                if (script) script(self.state, self.eventBus);
            });
            this.actions.appendChild(insultBtn);
        }

        this.actions.appendChild(fleeBtn);
    }

    updateEnemyHp(charId) {
        if (charId !== this.currentEnemy) return;
        var c = this.state.characters[charId];
        if (!c) return;
        var maxHp = c.hp; // original hp from definition
        var pct = Math.max(0, Math.round((c.currentHp / maxHp) * 100));
        this.enemyHpFill.style.width = pct + '%';
    }

    update(data) {
        if (data.enemyHp !== undefined) {
            this.enemyHpFill.style.width = Math.max(0, data.enemyHp) + '%';
        }
    }

    addCombatMessage(text) {
        var el = document.createElement('div');
        el.className = 'combat-log-msg';
        el.textContent = text;
        this.combatLog.appendChild(el);
        this.combatLog.scrollTop = this.combatLog.scrollHeight;
    }

    hide() {
        this.container.style.display = 'none';
        this.currentEnemy = null;
    }
};
