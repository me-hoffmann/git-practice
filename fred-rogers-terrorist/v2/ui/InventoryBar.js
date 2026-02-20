/**
 * InventoryBar.js - Visual Inventory Strip
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.InventoryBar = class InventoryBar {
    constructor(container, gameState, eventBus, verbSystem) {
        this.container = container;
        this.state = gameState;
        this.eventBus = eventBus;
        this.verbSystem = verbSystem;
        this.selectedItem = null;
        this.container.className = 'inventory-bar';
        this.listen();
    }

    listen() {
        var self = this;
        this.eventBus.on('inventory:update', function() {
            self.render();
        });
        this.eventBus.on('verb:cancel', function() {
            self.selectedItem = null;
            self.render();
        });
    }

    render() {
        this.container.innerHTML = '';
        var inv = this.state.player.inventory;
        var self = this;

        if (inv.length === 0) {
            var empty = document.createElement('div');
            empty.className = 'inventory-empty';
            empty.textContent = 'Inventory empty';
            this.container.appendChild(empty);
            return;
        }

        for (var i = 0; i < inv.length; i++) {
            var itemId = inv[i];
            var item = this.state.items[itemId];
            if (!item) continue;

            var slot = document.createElement('div');
            slot.className = 'inventory-slot';
            if (this.selectedItem === itemId) {
                slot.classList.add('selected');
            }
            slot.dataset.itemId = itemId;
            slot.title = item.name;

            // Try to load icon, fall back to text
            var icon = document.createElement('div');
            icon.className = 'inventory-icon';

            var img = document.createElement('img');
            img.src = item.icon || 'assets/items/default.png';
            img.alt = item.name;
            img.onerror = (function(iconEl, itemName) {
                return function() {
                    // Fall back to text abbreviation
                    this.style.display = 'none';
                    iconEl.textContent = itemName.substring(0, 3).toUpperCase();
                    iconEl.classList.add('inventory-icon-text');
                };
            })(icon, item.name);
            icon.appendChild(img);

            var label = document.createElement('div');
            label.className = 'inventory-label';
            label.textContent = item.name;

            slot.appendChild(icon);
            slot.appendChild(label);

            slot.addEventListener('click', (function(id) {
                return function() { self.onItemClick(id); };
            })(itemId));

            slot.addEventListener('contextmenu', (function(id) {
                return function(e) {
                    e.preventDefault();
                    self.onItemRightClick(id);
                };
            })(itemId));

            this.container.appendChild(slot);
        }
    }

    onItemClick(itemId) {
        var currentVerb = this.verbSystem.currentVerb;

        // If we're in a two-step verb waiting for target
        if (this.verbSystem.pendingItem) {
            // "Use X on [inventory item]" or "Give X to [character]" — not applicable for inventory targets usually
            // But "Use [item] on [another item]" could work
            this.eventBus.emit('action:execute', {
                verb: currentVerb,
                item: this.verbSystem.pendingItem,
                target: { type: 'item', itemId: itemId }
            });
            this.verbSystem.cancel();
            return;
        }

        if (currentVerb === 'Use') {
            // Start two-step: "Use [this item] on..."
            this.verbSystem.setPendingItem(itemId);
            this.selectedItem = itemId;
            this.render();
            return;
        }

        if (currentVerb === 'Give') {
            // Start two-step: "Give [this item] to..."
            this.verbSystem.setPendingItem(itemId);
            this.selectedItem = itemId;
            this.render();
            return;
        }

        if (currentVerb === 'Look at') {
            // Look at inventory item
            var item = this.state.items[itemId];
            if (item) {
                this.eventBus.emit('message:add', { text: item.description });
            }
            return;
        }

        // Default: select the item for use
        if (!currentVerb) {
            this.verbSystem.selectVerb('Use');
            this.verbSystem.setPendingItem(itemId);
            this.selectedItem = itemId;
            this.render();
        }
    }

    onItemRightClick(itemId) {
        // Right-click on inventory: look at item
        var item = this.state.items[itemId];
        if (item) {
            this.eventBus.emit('message:add', { text: item.description });
        }
    }
};
