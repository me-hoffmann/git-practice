/**
 * scene-renderer.js — Scene Building & Hotspot Management
 * Fred Rogers, Terrorist v4
 *
 * Builds CSS art scenes from room definitions and creates
 * interactive hotspot elements for point-and-click interaction.
 */
window.FRT = window.FRT || {};

window.FRT.SceneRenderer = class SceneRenderer {
    constructor(sceneLayer, gameState, eventBus) {
        this.sceneLayer = sceneLayer;
        this.state = gameState;
        this.eventBus = eventBus;
    }

    /**
     * Build a scene from a room's scene definition.
     * Creates CSS art layers and hotspot divs.
     */
    buildScene(roomId) {
        var roomDef = FRT.RoomDefs[roomId];
        if (!roomDef) return;

        // Clear existing scene
        this.sceneLayer.innerHTML = '';

        // Set background
        if (roomDef.art && roomDef.art.background) {
            this.sceneLayer.style.background = roomDef.art.background;
        } else {
            this.sceneLayer.style.background = 'var(--cream)';
        }

        // Apply zone class for Make-Believe tilt effect
        this.sceneLayer.classList.remove('zone-makebelieve', 'zone-realworld');
        if (roomDef.zone === 'makebelieve') {
            this.sceneLayer.classList.add('zone-makebelieve');
        } else {
            this.sceneLayer.classList.add('zone-realworld');
        }

        // Create art layers
        if (roomDef.art && roomDef.art.layers) {
            for (var i = 0; i < roomDef.art.layers.length; i++) {
                var layer = roomDef.art.layers[i];
                var el = document.createElement('div');
                el.className = 'scene-el';
                if (layer.classes) {
                    el.className += ' ' + layer.classes;
                }
                if (layer.style) {
                    el.style.cssText += ';' + layer.style;
                }
                if (layer.content) {
                    el.textContent = layer.content;
                }
                if (layer.html) {
                    el.innerHTML = layer.html;
                }
                if (layer.id) {
                    el.setAttribute('data-layer-id', layer.id);
                }
                this.sceneLayer.appendChild(el);
            }
        }

        // Create hotspots (filtered by current state)
        var hotspots = this.getActiveHotspots(roomId);
        for (var j = 0; j < hotspots.length; j++) {
            var hsEl = this.createHotspot(hotspots[j], roomId);
            this.sceneLayer.appendChild(hsEl);
        }
    }

    /**
     * Get active hotspots for a room, filtering out taken items
     * and defeated characters.
     */
    getActiveHotspots(roomId) {
        var roomDef = FRT.RoomDefs[roomId];
        if (!roomDef || !roomDef.hotspots) return [];

        var room = this.state.rooms[roomId];
        if (!room) return [];

        var self = this;
        return roomDef.hotspots.filter(function(hs) {
            // Filter by visibility condition
            if (hs.visible && !hs.visible(self.state)) return false;

            // Filter out items already taken
            if (hs.type === 'item' && hs.itemId) {
                if (self.state.isItemInInventory(hs.itemId)) return false;
                if (room.items.indexOf(hs.itemId) === -1) return false;
                // Filter out hidden items
                var item = self.state.items[hs.itemId];
                if (item && item.hidden) return false;
            }

            // Filter out characters not present
            if (hs.type === 'character' && hs.characterId) {
                if (room.characters.indexOf(hs.characterId) === -1) return false;
                var ch = self.state.characters[hs.characterId];
                if (ch && ch.defeated) return false;
            }

            return true;
        });
    }

    /**
     * Create a hotspot DOM element.
     */
    createHotspot(hs, roomId) {
        var el = document.createElement('div');
        el.className = 'hotspot';
        el.setAttribute('data-hotspot-id', hs.id);
        el.setAttribute('data-type', hs.type);
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', hs.label || hs.id);

        // Position
        if (hs.position) {
            for (var prop in hs.position) {
                el.style[prop] = hs.position[prop];
            }
        }

        // Store data attributes
        if (hs.exitDir) el.setAttribute('data-exit-dir', hs.exitDir);
        if (hs.characterId) el.setAttribute('data-character-id', hs.characterId);
        if (hs.itemId) el.setAttribute('data-item-id', hs.itemId);

        // Tooltip label
        var label = document.createElement('span');
        label.className = 'hotspot-label';
        label.textContent = hs.label || '';
        el.appendChild(label);

        // Character portrait indicator
        if (hs.type === 'character' && hs.characterId) {
            var charDef = FRT.CharacterDefs[hs.characterId];
            if (charDef) {
                var indicator = document.createElement('div');
                indicator.className = 'character-indicator';
                if (charDef.portraitHTML) {
                    indicator.innerHTML = charDef.portraitHTML;
                } else if (charDef.portrait) {
                    indicator.textContent = charDef.portrait;
                }
                el.appendChild(indicator);
            }
        }

        // Item emoji indicator
        if (hs.type === 'item' && hs.itemId) {
            var itemDef = this.state.items[hs.itemId];
            if (itemDef && itemDef.icon) {
                var itemIndicator = document.createElement('div');
                itemIndicator.className = 'item-indicator';
                itemIndicator.textContent = itemDef.icon;
                el.appendChild(itemIndicator);
            }
        }

        // Exit arrow indicator
        if (hs.type === 'exit' && hs.exitDir) {
            var arrowMap = {
                east: '\u2192', west: '\u2190',
                north: '\u2191', south: '\u2193',
                up: '\u2191', down: '\u2193'
            };
            var arrow = document.createElement('div');
            arrow.className = 'exit-arrow';
            arrow.textContent = arrowMap[hs.exitDir] || '\u2192';
            el.appendChild(arrow);
        }

        // Store reference to hotspot definition for event handling
        el._hotspotDef = hs;
        el._roomId = roomId;

        // Click handler
        var self = this;
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            self.eventBus.emit('hotspot:click', {
                hotspot: hs,
                roomId: roomId,
                event: e
            });
        });

        // Keyboard handler
        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                self.eventBus.emit('hotspot:click', {
                    hotspot: hs,
                    roomId: roomId,
                    event: e
                });
            }
        });

        return el;
    }
};
