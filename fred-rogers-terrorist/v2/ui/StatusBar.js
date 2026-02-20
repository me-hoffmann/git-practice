/**
 * StatusBar.js - HP Bar, Score, and Status Line
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.StatusBar = class StatusBar {
    constructor(container, gameState, eventBus, verbSystem) {
        this.container = container;
        this.state = gameState;
        this.eventBus = eventBus;
        this.verbSystem = verbSystem;
        this.container.className = 'status-bar';
        this.build();
        this.listen();
    }

    build() {
        this.statusLabel = document.createElement('div');
        this.statusLabel.className = 'status-label';
        this.statusLabel.textContent = '';

        this.hpContainer = document.createElement('div');
        this.hpContainer.className = 'hp-container';

        this.hpLabel = document.createElement('span');
        this.hpLabel.className = 'hp-label';
        this.hpLabel.textContent = 'HP:';

        this.hpBar = document.createElement('div');
        this.hpBar.className = 'hp-bar';
        this.hpFill = document.createElement('div');
        this.hpFill.className = 'hp-fill';
        this.hpBar.appendChild(this.hpFill);

        this.hpContainer.appendChild(this.hpLabel);
        this.hpContainer.appendChild(this.hpBar);

        this.scoreLabel = document.createElement('div');
        this.scoreLabel.className = 'score-label';
        this.scoreLabel.textContent = 'Score: 0';

        this.container.appendChild(this.statusLabel);
        this.container.appendChild(this.hpContainer);
        this.container.appendChild(this.scoreLabel);
    }

    listen() {
        var self = this;
        this.eventBus.on('hp:change', function(data) {
            self.updateHp(data.hp, data.maxHp);
        });
        this.eventBus.on('score:change', function(data) {
            self.updateScore(data.score);
        });
        this.eventBus.on('verb:select', function(data) {
            self.updateStatus(data.verb);
        });
        this.eventBus.on('verb:cancel', function() {
            self.updateStatus('');
        });
        this.eventBus.on('verb:pendingItem', function(data) {
            var item = self.state.items[data.itemId];
            var verb = self.verbSystem.currentVerb;
            if (item && verb) {
                if (verb === 'Use') {
                    self.statusLabel.textContent = 'Use ' + item.name + ' on...';
                } else if (verb === 'Give') {
                    self.statusLabel.textContent = 'Give ' + item.name + ' to...';
                }
            }
        });
        this.eventBus.on('hotspot:hover', function(data) {
            if (data.hotspot && self.verbSystem.currentVerb) {
                var label = data.hotspot.label || '???';
                var verb = self.verbSystem.currentVerb;
                if (self.verbSystem.pendingItem) {
                    var pItem = self.state.items[self.verbSystem.pendingItem];
                    if (pItem) {
                        self.statusLabel.textContent = verb + ' ' + pItem.name + ' on ' + label;
                    }
                } else {
                    self.statusLabel.textContent = verb + ' ' + label;
                }
            } else if (data.hotspot) {
                self.statusLabel.textContent = data.hotspot.label || '';
            } else {
                self.statusLabel.textContent = self.verbSystem.currentVerb || '';
            }
        });
    }

    updateHp(hp, maxHp) {
        var pct = Math.round((hp / maxHp) * 100);
        this.hpFill.style.width = pct + '%';
        if (pct > 60) {
            this.hpFill.className = 'hp-fill hp-high';
        } else if (pct > 30) {
            this.hpFill.className = 'hp-fill hp-mid';
        } else {
            this.hpFill.className = 'hp-fill hp-low';
        }
    }

    updateScore(score) {
        this.scoreLabel.textContent = 'Score: ' + score;
    }

    updateStatus(verb) {
        this.statusLabel.textContent = verb || '';
    }
};
