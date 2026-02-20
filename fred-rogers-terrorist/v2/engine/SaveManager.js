/**
 * SaveManager.js - LocalStorage Save/Load
 */
window.FRT = window.FRT || {};

window.FRT.SaveManager = class SaveManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.prefix = 'frt_save_';
    }

    save(slot) {
        slot = slot || 'auto';
        var data = {
            version: 2,
            timestamp: Date.now(),
            roomName: this.gameState.rooms[this.gameState.player.currentRoom]?.name || '???',
            score: this.gameState.player.score,
            state: this.gameState.serialize()
        };
        try {
            localStorage.setItem(this.prefix + slot, JSON.stringify(data));
            return true;
        } catch (e) { console.error('Save failed:', e); return false; }
    }

    load(slot) {
        slot = slot || 'auto';
        try {
            var raw = localStorage.getItem(this.prefix + slot);
            if (!raw) return false;
            var data = JSON.parse(raw);
            this.gameState.deserialize(data.state);
            return true;
        } catch (e) { console.error('Load failed:', e); return false; }
    }

    listSlots() {
        var slots = [];
        for (var i = 0; i < localStorage.length; i++) {
            var key = localStorage.key(i);
            if (key && key.startsWith(this.prefix)) {
                try {
                    var data = JSON.parse(localStorage.getItem(key));
                    slots.push({
                        slot: key.substring(this.prefix.length),
                        timestamp: data.timestamp,
                        roomName: data.roomName,
                        score: data.score
                    });
                } catch (e) {}
            }
        }
        return slots.sort(function(a, b) { return b.timestamp - a.timestamp; });
    }

    deleteSave(slot) {
        localStorage.removeItem(this.prefix + slot);
    }
};
