/**
 * GameState.js - Central State Management
 * Holds all mutable game state. All mutations emit events via EventBus.
 */
window.FRT = window.FRT || {};

window.FRT.GameState = class GameState {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.player = { hp: 100, maxHp: 100, currentRoom: null, inventory: [], score: 0, flags: {}, turnCount: 0 };
        this.rooms = {};
        this.items = {};
        this.characters = {};
        this.gameOver = false;
    }

    init(roomDefs, itemDefs, charDefs) {
        this.gameOver = false;
        this.player = { hp: 100, maxHp: 100, currentRoom: null, inventory: [], score: 0, flags: {}, turnCount: 0 };

        // Deep copy room definitions into runtime state
        this.rooms = {};
        for (var id in roomDefs) {
            var r = roomDefs[id];
            this.rooms[id] = {
                id: id, name: r.name, description: r.description, art: r.art,
                exits: Object.assign({}, r.exits),
                items: (r.items || []).slice(),
                characters: (r.characters || []).slice(),
                blocked: r.blocked ? Object.assign({}, r.blocked) : {},
                hotspots: (r.hotspots || []).slice(),
                onEnter: r.onEnter || null,
                visited: false
            };
        }

        // Copy item definitions
        this.items = {};
        for (var id in itemDefs) {
            this.items[id] = Object.assign({}, itemDefs[id]);
        }

        // Copy character definitions with runtime state
        this.characters = {};
        for (var id in charDefs) {
            var c = charDefs[id];
            this.characters[id] = Object.assign({}, c, {
                currentHp: c.hp,
                alive: true,
                defeated: false
            });
        }
    }

    moveToRoom(roomId, direction) {
        var prevRoom = this.player.currentRoom;
        this.player.currentRoom = roomId;
        if (this.rooms[roomId]) this.rooms[roomId].visited = true;
        this.eventBus.emit('room:enter', { roomId: roomId, previousRoomId: prevRoom, direction: direction || 'instant' });
    }

    addToInventory(itemId) {
        if (this.player.inventory.indexOf(itemId) === -1) {
            this.player.inventory.push(itemId);
            // Remove from current room
            var room = this.rooms[this.player.currentRoom];
            if (room) room.items = room.items.filter(function(i) { return i !== itemId; });
        }
        this.eventBus.emit('inventory:update', { inventory: this.player.inventory });
    }

    removeFromInventory(itemId) {
        this.player.inventory = this.player.inventory.filter(function(i) { return i !== itemId; });
        this.eventBus.emit('inventory:update', { inventory: this.player.inventory });
    }

    dropItem(itemId) {
        this.removeFromInventory(itemId);
        var room = this.rooms[this.player.currentRoom];
        if (room) room.items.push(itemId);
    }

    addItemToRoom(itemId, roomId) {
        var room = this.rooms[roomId || this.player.currentRoom];
        if (room && room.items.indexOf(itemId) === -1) room.items.push(itemId);
    }

    setFlag(name, value) {
        this.player.flags[name] = value === undefined ? true : value;
        this.eventBus.emit('flag:set', { flag: name, value: this.player.flags[name] });
    }

    getFlag(name) { return this.player.flags[name]; }

    addScore(points) {
        this.player.score += points;
        this.eventBus.emit('score:change', { score: this.player.score, delta: points });
    }

    modifyHp(delta) {
        this.player.hp = Math.max(0, Math.min(this.player.maxHp, this.player.hp + delta));
        this.eventBus.emit('hp:change', { hp: this.player.hp, maxHp: this.player.maxHp, delta: delta });
    }

    damageCharacter(charId, damage) {
        var c = this.characters[charId];
        if (!c || !c.alive) return;
        c.currentHp -= damage;
        this.eventBus.emit('character:damaged', { charId: charId, damage: damage, hp: c.currentHp });
        if (c.currentHp <= 0) this.defeatCharacter(charId);
    }

    defeatCharacter(charId) {
        var c = this.characters[charId];
        if (!c) return;
        c.alive = false;
        c.defeated = true;
        // Remove from room
        var room = this.rooms[this.player.currentRoom];
        if (room) room.characters = room.characters.filter(function(id) { return id !== charId; });
        // Score
        if (c.defeatScore) this.addScore(c.defeatScore);
        // Loot
        if (c.loot) {
            this.addItemToRoom(c.loot);
            this.eventBus.emit('message:add', { text: c.name + ' dropped something!' });
        }
        this.eventBus.emit('character:defeat', { charId: charId });
    }

    spawnCharacter(charId, roomId) {
        var room = this.rooms[roomId || this.player.currentRoom];
        if (room && room.characters.indexOf(charId) === -1) {
            room.characters.push(charId);
            var c = this.characters[charId];
            if (c) { c.alive = true; c.defeated = false; c.currentHp = c.hp; }
        }
    }

    isItemInInventory(itemId) { return this.player.inventory.indexOf(itemId) >= 0; }

    isItemInRoom(itemId, roomId) {
        var room = this.rooms[roomId || this.player.currentRoom];
        return room ? room.items.indexOf(itemId) >= 0 : false;
    }

    getRoomItems(roomId) {
        var room = this.rooms[roomId || this.player.currentRoom];
        if (!room) return [];
        var self = this;
        return room.items.filter(function(id) {
            var item = self.items[id];
            return item && !item.hidden;
        });
    }

    getRoomCharacters(roomId) {
        var room = this.rooms[roomId || this.player.currentRoom];
        if (!room) return [];
        var self = this;
        return room.characters.filter(function(id) {
            var c = self.characters[id];
            return c && c.alive && !c.defeated;
        });
    }

    endGame(won, message) {
        this.gameOver = true;
        this.eventBus.emit('game:over', { won: won, message: message });
    }

    serialize() {
        return JSON.parse(JSON.stringify({
            player: this.player,
            roomStates: Object.keys(this.rooms).reduce((acc, id) => {
                acc[id] = { visited: this.rooms[id].visited, items: this.rooms[id].items, characters: this.rooms[id].characters, exits: this.rooms[id].exits };
                return acc;
            }, {}),
            charStates: Object.keys(this.characters).reduce((acc, id) => {
                var c = this.characters[id];
                acc[id] = { currentHp: c.currentHp, alive: c.alive, defeated: c.defeated };
                return acc;
            }, {}),
            itemStates: Object.keys(this.items).reduce((acc, id) => {
                acc[id] = { hidden: this.items[id].hidden };
                return acc;
            }, {})
        }));
    }

    deserialize(data) {
        this.player = data.player;
        for (var id in data.roomStates) {
            if (this.rooms[id]) Object.assign(this.rooms[id], data.roomStates[id]);
        }
        for (var id in data.charStates) {
            if (this.characters[id]) Object.assign(this.characters[id], data.charStates[id]);
        }
        for (var id in data.itemStates) {
            if (this.items[id]) Object.assign(this.items[id], data.itemStates[id]);
        }
        this.eventBus.emit('inventory:update', { inventory: this.player.inventory });
        this.eventBus.emit('hp:change', { hp: this.player.hp, maxHp: this.player.maxHp });
        this.eventBus.emit('score:change', { score: this.player.score });
    }
};
