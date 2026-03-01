/**
 * engine.js — Core Game State + Event System
 * Fred Rogers, Terrorist v3
 *
 * Simplified from v2: no HP, no combat, no weapon damage.
 * Characters are resolved via puzzle encounters (give correct item).
 */
window.FRT3 = window.FRT3 || {};

// ============================================
// EventBus — Pub/sub event system
// ============================================
window.FRT3.EventBus = class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) {
            this._listeners[event] = [];
        }
        this._listeners[event].push(callback);
        // Return unsubscribe function
        return function() {
            this.off(event, callback);
        }.bind(this);
    }

    off(event, callback) {
        var list = this._listeners[event];
        if (!list) return;
        this._listeners[event] = list.filter(function(fn) {
            return fn !== callback;
        });
    }

    emit(event, data) {
        var list = this._listeners[event];
        if (!list) return;
        for (var i = 0; i < list.length; i++) {
            list[i](data || {});
        }
    }
};

// ============================================
// GameState — Central mutable state
// ============================================
window.FRT3.GameState = class GameState {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.player = {
            currentRoom: null,
            previousRoom: null,
            inventory: [],
            score: 0,
            flags: {}
        };
        this.rooms = {};
        this.items = {};
        this.characters = {};
        this.gameStarted = false;
    }

    // Initialize / reset the game state from definitions
    init(roomDefs, itemDefs, charDefs) {
        this.player = {
            currentRoom: null,
            previousRoom: null,
            inventory: [],
            score: 0,
            flags: {}
        };

        // Deep copy rooms
        this.rooms = {};
        for (var rid in roomDefs) {
            var rd = roomDefs[rid];
            this.rooms[rid] = {
                id: rid,
                name: rd.name,
                description: rd.description,
                exits: Object.assign({}, rd.exits || {}),
                items: (rd.items || []).slice(),
                characters: (rd.characters || []).slice(),
                hotspots: rd.hotspots || [],
                art: rd.art || null,
                onEnter: rd.onEnter || null,
                visited: false
            };
        }

        // Deep copy items
        this.items = {};
        for (var iid in itemDefs) {
            var id = itemDefs[iid];
            this.items[iid] = {
                id: iid,
                name: id.name,
                description: id.description,
                icon: id.icon || null,
                iconClass: id.iconClass || '',
                takeable: id.takeable !== false,
                hidden: id.hidden || false
            };
        }

        // Deep copy characters
        this.characters = {};
        for (var cid in charDefs) {
            var cd = charDefs[cid];
            this.characters[cid] = {
                id: cid,
                name: cd.name,
                description: cd.description,
                portrait: cd.portrait || null,
                alive: true,
                defeated: false,
                puzzle: cd.puzzle || null,
                dialogueId: cd.dialogueId || null
            };
        }

        this.gameStarted = true;
    }

    // Move player to a new room
    moveToRoom(roomId, direction) {
        if (!this.rooms[roomId]) {
            console.warn('Room not found:', roomId);
            return;
        }
        var prevRoom = this.player.currentRoom;
        this.player.previousRoom = prevRoom;
        this.player.currentRoom = roomId;

        var room = this.rooms[roomId];
        var firstVisit = !room.visited;
        room.visited = true;

        this.eventBus.emit('room:enter', {
            roomId: roomId,
            previousRoomId: prevRoom,
            direction: direction || 'instant',
            firstVisit: firstVisit
        });
    }

    // Inventory management
    addToInventory(itemId) {
        if (this.player.inventory.indexOf(itemId) === -1) {
            this.player.inventory.push(itemId);
            this.eventBus.emit('inventory:update', {
                inventory: this.player.inventory.slice(),
                added: itemId
            });
        }
    }

    removeFromInventory(itemId) {
        var idx = this.player.inventory.indexOf(itemId);
        if (idx !== -1) {
            this.player.inventory.splice(idx, 1);
            this.eventBus.emit('inventory:update', {
                inventory: this.player.inventory.slice(),
                removed: itemId
            });
        }
    }

    isItemInInventory(itemId) {
        return this.player.inventory.indexOf(itemId) !== -1;
    }

    // Room item management
    addItemToRoom(itemId, roomId) {
        roomId = roomId || this.player.currentRoom;
        var room = this.rooms[roomId];
        if (room && room.items.indexOf(itemId) === -1) {
            room.items.push(itemId);
        }
    }

    removeItemFromRoom(itemId, roomId) {
        roomId = roomId || this.player.currentRoom;
        var room = this.rooms[roomId];
        if (!room) return;
        var idx = room.items.indexOf(itemId);
        if (idx !== -1) {
            room.items.splice(idx, 1);
        }
    }

    // Get visible items in current room
    getRoomItems(roomId) {
        roomId = roomId || this.player.currentRoom;
        var room = this.rooms[roomId];
        if (!room) return [];
        var self = this;
        return room.items.filter(function(id) {
            var item = self.items[id];
            return item && !item.hidden;
        });
    }

    // Character management
    getRoomCharacters(roomId) {
        roomId = roomId || this.player.currentRoom;
        var room = this.rooms[roomId];
        if (!room) return [];
        var self = this;
        return room.characters.filter(function(id) {
            var ch = self.characters[id];
            return ch && ch.alive && !ch.defeated;
        });
    }

    removeCharacterFromRoom(charId, roomId) {
        roomId = roomId || this.player.currentRoom;
        var room = this.rooms[roomId];
        if (!room) return;
        var idx = room.characters.indexOf(charId);
        if (idx !== -1) {
            room.characters.splice(idx, 1);
        }
        var ch = this.characters[charId];
        if (ch) {
            ch.defeated = true;
        }
        this.eventBus.emit('character:removed', { characterId: charId, roomId: roomId });
    }

    // Flags
    setFlag(name, value) {
        this.player.flags[name] = value === undefined ? true : value;
        this.eventBus.emit('flag:set', { flag: name, value: this.player.flags[name] });
    }

    getFlag(name) {
        return this.player.flags[name];
    }

    // Score
    addScore(points) {
        this.player.score += points;
        this.eventBus.emit('score:change', {
            score: this.player.score,
            delta: points
        });
    }

    // Reveal a hidden item in a room
    revealItem(itemId) {
        var item = this.items[itemId];
        if (item) {
            item.hidden = false;
        }
    }

    // Save / Load
    serialize() {
        return JSON.stringify({
            player: this.player,
            roomStates: this._serializeRoomStates(),
            itemStates: this._serializeItemStates(),
            charStates: this._serializeCharStates()
        });
    }

    _serializeRoomStates() {
        var states = {};
        for (var rid in this.rooms) {
            var r = this.rooms[rid];
            states[rid] = {
                items: r.items.slice(),
                characters: r.characters.slice(),
                visited: r.visited,
                exits: Object.assign({}, r.exits)
            };
        }
        return states;
    }

    _serializeItemStates() {
        var states = {};
        for (var iid in this.items) {
            states[iid] = { hidden: this.items[iid].hidden };
        }
        return states;
    }

    _serializeCharStates() {
        var states = {};
        for (var cid in this.characters) {
            var c = this.characters[cid];
            states[cid] = { alive: c.alive, defeated: c.defeated };
        }
        return states;
    }

    deserialize(json) {
        var data = typeof json === 'string' ? JSON.parse(json) : json;
        this.player = data.player;

        // Restore room states
        if (data.roomStates) {
            for (var rid in data.roomStates) {
                if (this.rooms[rid]) {
                    var rs = data.roomStates[rid];
                    this.rooms[rid].items = rs.items || [];
                    this.rooms[rid].characters = rs.characters || [];
                    this.rooms[rid].visited = rs.visited || false;
                    if (rs.exits) {
                        this.rooms[rid].exits = Object.assign({}, rs.exits);
                    }
                }
            }
        }

        // Restore item states
        if (data.itemStates) {
            for (var iid in data.itemStates) {
                if (this.items[iid]) {
                    this.items[iid].hidden = data.itemStates[iid].hidden;
                }
            }
        }

        // Restore character states
        if (data.charStates) {
            for (var cid in data.charStates) {
                if (this.characters[cid]) {
                    this.characters[cid].alive = data.charStates[cid].alive;
                    this.characters[cid].defeated = data.charStates[cid].defeated;
                }
            }
        }

        this.eventBus.emit('game:loaded');
    }
};
