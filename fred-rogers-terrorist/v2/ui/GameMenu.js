/**
 * GameMenu.js - Pause, Save/Load, Settings
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.GameMenu = class GameMenu {
    constructor(container, saveManager, eventBus) {
        this.container = container;
        this.saveManager = saveManager;
        this.eventBus = eventBus;
        this.container.className = 'game-menu';
        this.container.style.display = 'none';
        this.build();
    }

    build() {
        var self = this;

        this.overlay = document.createElement('div');
        this.overlay.className = 'menu-overlay';

        this.panel = document.createElement('div');
        this.panel.className = 'menu-panel';

        var title = document.createElement('h2');
        title.textContent = 'Game Menu';
        title.className = 'menu-title';

        var saveBtn = document.createElement('button');
        saveBtn.className = 'menu-btn';
        saveBtn.textContent = 'Save Game';
        saveBtn.addEventListener('click', function() { self.saveGame(); });

        var loadBtn = document.createElement('button');
        loadBtn.className = 'menu-btn';
        loadBtn.textContent = 'Load Game';
        loadBtn.addEventListener('click', function() { self.showLoadMenu(); });

        var restartBtn = document.createElement('button');
        restartBtn.className = 'menu-btn menu-btn-danger';
        restartBtn.textContent = 'Restart Game';
        restartBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to restart?')) {
                self.hide();
                self.eventBus.emit('game:restart', {});
            }
        });

        var closeBtn = document.createElement('button');
        closeBtn.className = 'menu-btn';
        closeBtn.textContent = 'Resume';
        closeBtn.addEventListener('click', function() { self.hide(); });

        this.slotList = document.createElement('div');
        this.slotList.className = 'menu-slot-list';
        this.slotList.style.display = 'none';

        this.panel.appendChild(title);
        this.panel.appendChild(saveBtn);
        this.panel.appendChild(loadBtn);
        this.panel.appendChild(this.slotList);
        this.panel.appendChild(restartBtn);
        this.panel.appendChild(closeBtn);

        this.overlay.appendChild(this.panel);
        this.container.appendChild(this.overlay);
    }

    show() {
        this.container.style.display = 'flex';
        this.slotList.style.display = 'none';
    }

    hide() {
        this.container.style.display = 'none';
    }

    toggle() {
        if (this.container.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }

    saveGame() {
        var slot = 'slot_' + Date.now();
        if (this.saveManager.save(slot)) {
            this.eventBus.emit('message:add', { text: 'Game saved!' });
            this.hide();
        } else {
            this.eventBus.emit('message:add', { text: 'Save failed!' });
        }
    }

    showLoadMenu() {
        var slots = this.saveManager.listSlots();
        this.slotList.innerHTML = '';
        this.slotList.style.display = 'block';

        if (slots.length === 0) {
            var none = document.createElement('div');
            none.className = 'menu-no-saves';
            none.textContent = 'No saved games found.';
            this.slotList.appendChild(none);
            return;
        }

        var self = this;
        for (var i = 0; i < slots.length; i++) {
            var s = slots[i];
            var row = document.createElement('div');
            row.className = 'menu-save-row';

            var info = document.createElement('span');
            info.className = 'menu-save-info';
            var date = new Date(s.timestamp);
            info.textContent = s.roomName + ' (Score: ' + s.score + ') - ' + date.toLocaleString();

            var loadBtn = document.createElement('button');
            loadBtn.className = 'menu-btn-small';
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', (function(slotName) {
                return function() {
                    if (self.saveManager.load(slotName)) {
                        self.eventBus.emit('message:add', { text: 'Game loaded!' });
                        self.eventBus.emit('game:loaded', {});
                        self.hide();
                    }
                };
            })(s.slot));

            var delBtn = document.createElement('button');
            delBtn.className = 'menu-btn-small menu-btn-danger';
            delBtn.textContent = 'Delete';
            delBtn.addEventListener('click', (function(slotName) {
                return function() {
                    self.saveManager.deleteSave(slotName);
                    self.showLoadMenu();
                };
            })(s.slot));

            row.appendChild(info);
            row.appendChild(loadBtn);
            row.appendChild(delBtn);
            this.slotList.appendChild(row);
        }
    }
};
