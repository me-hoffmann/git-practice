/**
 * inventory.js — Inventory Drawer UI + Drag-and-Drop
 * Fred Rogers, Terrorist v3
 *
 * Renders item cards in the pull-up drawer.
 * Supports dragging items onto scene hotspots and dialogue drop zones.
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.Inventory = class Inventory {
    constructor(drawerEl, handleEl, contentsEl, emptyEl, gameState, eventBus) {
        this.drawer = drawerEl;
        this.handle = handleEl;
        this.contents = contentsEl;
        this.emptyMsg = emptyEl;
        this.state = gameState;
        this.eventBus = eventBus;

        this.isOpen = false;
        this.dragState = null;  // { itemId, ghost, startX, startY }

        this._bindEvents();
    }

    // ========================================
    // Event binding
    // ========================================
    _bindEvents() {
        var self = this;

        // Toggle drawer
        this.handle.addEventListener('click', function() {
            self.toggle();
        });
        this.handle.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                self.toggle();
            }
        });

        // Listen for inventory changes
        this.eventBus.on('inventory:update', function() {
            self.render();
        });

        // Listen for game start
        this.eventBus.on('game:started', function() {
            self.render();
        });

        // Mouse/touch move and end for drag
        document.addEventListener('mousemove', function(e) {
            self._onDragMove(e);
        });
        document.addEventListener('mouseup', function(e) {
            self._onDragEnd(e);
        });

        // Touch events
        document.addEventListener('touchmove', function(e) {
            if (self.dragState) {
                e.preventDefault();
                var touch = e.touches[0];
                self._onDragMove(touch);
            }
        }, { passive: false });
        document.addEventListener('touchend', function(e) {
            if (self.dragState) {
                var touch = e.changedTouches[0];
                self._onDragEnd(touch);
            }
        });
    }

    // ========================================
    // Drawer toggle
    // ========================================
    toggle() {
        this.isOpen = !this.isOpen;
        if (this.isOpen) {
            this.drawer.classList.add('open');
        } else {
            this.drawer.classList.remove('open');
        }
    }

    open() {
        if (!this.isOpen) {
            this.isOpen = true;
            this.drawer.classList.add('open');
        }
    }

    close() {
        if (this.isOpen) {
            this.isOpen = false;
            this.drawer.classList.remove('open');
        }
    }

    // ========================================
    // Render inventory cards
    // ========================================
    render() {
        var inv = this.state.player.inventory;
        var self = this;

        // Clear existing cards (but not the empty message)
        var cards = this.contents.querySelectorAll('.inventory-card');
        for (var i = 0; i < cards.length; i++) {
            cards[i].remove();
        }

        // Update count badge on handle
        this._updateBadge(inv.length);

        if (inv.length === 0) {
            this.emptyMsg.style.display = '';
            return;
        }

        this.emptyMsg.style.display = 'none';

        for (var j = 0; j < inv.length; j++) {
            var itemId = inv[j];
            var item = this.state.items[itemId];
            if (!item) continue;

            var card = this._createCard(itemId, item);
            this.contents.appendChild(card);
        }
    }

    _updateBadge(count) {
        var label = this.handle.querySelector('.handle-label');
        if (!label) return;
        var badge = label.querySelector('.handle-count');
        if (count > 0) {
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'handle-count';
                label.appendChild(badge);
            }
            badge.textContent = count;
        } else if (badge) {
            badge.remove();
        }
    }

    _createCard(itemId, item) {
        var self = this;
        var card = document.createElement('div');
        card.className = 'inventory-card';
        card.setAttribute('data-item-id', itemId);
        card.setAttribute('draggable', 'false'); // We handle our own drag
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', item.name + ': ' + item.description);

        var icon = document.createElement('div');
        icon.className = 'item-icon';
        icon.textContent = item.icon || '?';

        var name = document.createElement('div');
        name.className = 'item-name';
        name.textContent = item.name;

        card.appendChild(icon);
        card.appendChild(name);

        // Click to show description
        card.addEventListener('click', function(e) {
            if (self.dragState) return; // Don't trigger during drag
            self.eventBus.emit('narration:show', {
                text: item.description,
                style: 'item'
            });
        });

        // Mouse drag start
        card.addEventListener('mousedown', function(e) {
            e.preventDefault();
            self._onDragStart(itemId, item, e.clientX, e.clientY);
        });

        // Touch drag start
        card.addEventListener('touchstart', function(e) {
            var touch = e.touches[0];
            self._onDragStart(itemId, item, touch.clientX, touch.clientY);
        }, { passive: true });

        return card;
    }

    // ========================================
    // Drag-and-drop
    // ========================================
    _onDragStart(itemId, item, x, y) {
        // Create ghost element
        var ghost = document.createElement('div');
        ghost.className = 'drag-ghost';
        var iconEl = document.createElement('div');
        iconEl.className = 'item-icon';
        iconEl.textContent = item.icon || '?';
        iconEl.style.width = '48px';
        iconEl.style.height = '48px';
        iconEl.style.fontSize = '1.6rem';
        iconEl.style.borderRadius = '10px';
        iconEl.style.background = 'var(--warm-white)';
        iconEl.style.border = '2px solid var(--dusty-rose)';
        iconEl.style.display = 'flex';
        iconEl.style.alignItems = 'center';
        iconEl.style.justifyContent = 'center';
        ghost.appendChild(iconEl);
        ghost.style.left = (x - 24) + 'px';
        ghost.style.top = (y - 24) + 'px';
        document.body.appendChild(ghost);

        // Mark the card as being dragged
        var card = this.contents.querySelector('[data-item-id="' + itemId + '"]');
        if (card) card.classList.add('dragging');

        this.dragState = {
            itemId: itemId,
            ghost: ghost,
            startX: x,
            startY: y
        };

        // Notify the scene to highlight drop targets
        this.eventBus.emit('drag:start', { itemId: itemId });
    }

    _onDragMove(e) {
        if (!this.dragState) return;
        var x = e.clientX;
        var y = e.clientY;
        this.dragState.ghost.style.left = (x - 24) + 'px';
        this.dragState.ghost.style.top = (y - 24) + 'px';

        // Check what we're hovering over
        this.dragState.ghost.style.pointerEvents = 'none';
        var elementBelow = document.elementFromPoint(x, y);
        this.dragState.ghost.style.pointerEvents = '';

        this.eventBus.emit('drag:move', {
            itemId: this.dragState.itemId,
            x: x,
            y: y,
            elementBelow: elementBelow
        });
    }

    _onDragEnd(e) {
        if (!this.dragState) return;

        var x = e.clientX;
        var y = e.clientY;
        var itemId = this.dragState.itemId;

        // Remove ghost
        if (this.dragState.ghost.parentNode) {
            this.dragState.ghost.parentNode.removeChild(this.dragState.ghost);
        }

        // Remove dragging class
        var card = this.contents.querySelector('[data-item-id="' + itemId + '"]');
        if (card) card.classList.remove('dragging');

        // Find what's under the drop point
        var elementBelow = document.elementFromPoint(x, y);

        this.dragState = null;

        // Emit drop event — main.js will handle the logic
        this.eventBus.emit('drag:drop', {
            itemId: itemId,
            x: x,
            y: y,
            target: elementBelow
        });

        // Clean up drop target highlights
        this.eventBus.emit('drag:end', { itemId: itemId });
    }
};
