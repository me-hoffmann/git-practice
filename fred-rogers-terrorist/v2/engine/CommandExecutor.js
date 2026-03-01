/**
 * CommandExecutor.js - Verb+Target Action Dispatch
 * Receives action:perform events from InputManager and executes game logic.
 */
window.FRT = window.FRT || {};

window.FRT.CommandExecutor = class CommandExecutor {
    constructor(gameState, eventBus, verbSystem, dialogueManager, combatManager) {
        this.state = gameState;
        this.eventBus = eventBus;
        this.verbSystem = verbSystem;
        this.dialogueManager = dialogueManager;
        this.combatManager = combatManager;

        var self = this;
        eventBus.on('action:perform', function(data) { self.handleAction(data); });
        eventBus.on('action:execute', function(data) { self.handleAction(data); });
    }

    msg(text) {
        this.eventBus.emit('message:add', { text: text });
    }

    /**
     * Run a $script: reference, passing (gameState, eventBus, ...extraArgs)
     */
    runScript(ref) {
        if (!ref) return undefined;
        var extraArgs = Array.prototype.slice.call(arguments, 1);
        if (typeof ref === 'string' && ref.indexOf('$script:') === 0) {
            var name = ref.substring(8);
            var fn = window.FRT.Scripts[name];
            if (fn) {
                return fn.apply(null, [this.state, this.eventBus].concat(extraArgs));
            }
        }
        if (typeof ref === 'function') {
            return ref.apply(null, [this.state, this.eventBus].concat(extraArgs));
        }
        return undefined;
    }

    handleAction(data) {
        if (this.state.gameOver) return;
        if (this.combatManager && this.combatManager.active) return;
        if (this.dialogueManager && this.dialogueManager.active) return;

        var verb = data.verb;
        var hs = data.hotspot || data.target;
        var pending = data.pendingItem || data.item || this.verbSystem.pendingItem;

        if (!hs) return;

        // Clicking on exits always walks, regardless of verb (LucasArts convention)
        if (hs.type === 'exit' && verb !== 'Look at') {
            this.walkTo(hs);
            this.verbSystem.cancel();
            return;
        }

        switch (verb) {
            case 'Walk to':  this.walkTo(hs); break;
            case 'Look at':  this.lookAt(hs); break;
            case 'Pick up':  this.pickUp(hs); break;
            case 'Use':      this.use(hs, pending); break;
            case 'Talk to':  this.talkTo(hs); break;
            case 'Give':     this.give(hs, pending); break;
            case 'Open':     this.open(hs); break;
            case 'Pull':     this.pull(hs); break;
            case 'Attack':   this.attack(hs); break;
            default:
                // No verb selected: smart default
                if (hs.type === 'exit') this.walkTo(hs);
                else this.lookAt(hs);
                break;
        }

        // Auto-clear verb after action (LucasArts style)
        // Exception: two-step verbs (Use/Give) that set a pending item
        if (!this.verbSystem.pendingItem) {
            this.verbSystem.cancel();
        }
    }

    walkTo(hs) {
        if (hs.type !== 'exit') { this.msg("You can't walk there."); return; }
        var dir = hs.exitDir;
        var room = this.state.rooms[this.state.player.currentRoom];
        if (!room || !room.exits[dir]) { this.msg("You can't go that way."); return; }

        // Check blocked
        if (room.blocked && room.blocked[dir]) {
            var result = this.runScript(room.blocked[dir]);
            if (result === false) return; // blocked
        }

        var targetRoom = room.exits[dir];
        this.state.moveToRoom(targetRoom, dir);
    }

    lookAt(hs) {
        if (hs.lookText) {
            this.msg(hs.lookText);
        } else if (hs.type === 'item' && hs.itemId) {
            var item = this.state.items[hs.itemId];
            this.msg(item ? item.description : "Nothing special.");
        } else if (hs.type === 'character' && hs.characterId) {
            var c = this.state.characters[hs.characterId];
            this.msg(c ? c.description : "Nothing special.");
        } else if (hs.type === 'exit') {
            this.msg("An exit leading " + (hs.exitDir || "somewhere") + ".");
        } else if (hs.type === 'searchable') {
            this.search(hs);
        } else {
            this.msg(hs.label || "Nothing special.");
        }
    }

    pickUp(hs) {
        if (hs.type !== 'item' || !hs.itemId) { this.msg("You can't pick that up."); return; }
        var item = this.state.items[hs.itemId];
        if (!item) { this.msg("You can't pick that up."); return; }
        if (item.takeable === false) { this.msg("You can't take that."); return; }

        this.state.addToInventory(hs.itemId);

        // Run onTake script
        if (item.onTake) {
            this.runScript(item.onTake);
        } else {
            this.msg("You picked up the " + item.name + ".");
        }
    }

    use(hs, pendingItem) {
        if (pendingItem) {
            this.useItemOn(pendingItem, hs);
            this.verbSystem.clearPending();
            return;
        }

        // If clicking an item in scene that has onUse
        if (hs.type === 'item' && hs.itemId) {
            var item = this.state.items[hs.itemId];
            if (item && item.onUse && this.state.isItemInInventory(hs.itemId)) {
                this.runScript(item.onUse);
                return;
            }
            if (this.state.isItemInInventory(hs.itemId)) {
                this.verbSystem.setPendingItem(hs.itemId);
                this.msg("Use " + (item ? item.name : hs.itemId) + " on what?");
                return;
            }
        }

        if (hs.type === 'searchable' || hs.type === 'scenery') {
            this.search(hs);
            return;
        }
        this.msg("You can't use that.");
    }

    useItemOn(itemId, targetHs) {
        var item = this.state.items[itemId];
        var roomId = this.state.player.currentRoom;

        // Airport ticket puzzle
        if (roomId === 'airport' && item && item.onUse) {
            this.runScript(item.onUse);
            return;
        }

        // Dig with spade at clock
        if (itemId === 'spade' && roomId === 'daniel_tigers_clock') {
            var fn = window.FRT.Scripts.digAtClock;
            if (fn) { fn(this.state, this.eventBus); return; }
        }

        // Give item to character target
        if (targetHs.type === 'character' && targetHs.characterId) {
            this.giveItemToCharacter(itemId, targetHs.characterId);
            return;
        }

        this.msg("That doesn't work.");
    }

    talkTo(hs) {
        if (hs.type !== 'character' || !hs.characterId) { this.msg("You can't talk to that."); return; }
        var c = this.state.characters[hs.characterId];
        if (!c || !c.alive || c.defeated) { this.msg("Nobody there to talk to."); return; }

        if (this.dialogueManager) {
            this.dialogueManager.startDialogue(hs.characterId);
        } else {
            this.msg(c.name + " doesn't respond.");
        }
    }

    give(hs, pendingItem) {
        if (!pendingItem) {
            this.msg("Give what? Select an item from your inventory first.");
            return;
        }
        if (hs.type !== 'character' || !hs.characterId) {
            this.msg("You can't give that to... that.");
            this.verbSystem.clearPending();
            return;
        }
        this.giveItemToCharacter(pendingItem, hs.characterId);
        this.verbSystem.clearPending();
    }

    giveItemToCharacter(itemId, charId) {
        var c = this.state.characters[charId];
        if (!c || !c.alive || c.defeated) { this.msg("They're not here."); return; }

        // Look up onGive script from CharacterDefs
        var charDef = window.FRT.CharacterDefs[charId];
        if (charDef && charDef.onGive) {
            this.runScript(charDef.onGive, itemId);
        } else {
            this.msg(c.name + " doesn't want that.");
        }
    }

    open(hs) {
        if (hs.onOpen) {
            this.runScript(hs.onOpen);
            return;
        }
        if (hs.type === 'searchable') {
            this.search(hs);
            return;
        }
        this.msg("It doesn't open.");
    }

    pull(hs) {
        if (hs.onPull) {
            this.runScript(hs.onPull);
            return;
        }
        this.msg("Nothing happens.");
    }

    attack(hs) {
        if (hs.type !== 'character' || !hs.characterId) { this.msg("You can't attack that."); return; }
        var c = this.state.characters[hs.characterId];
        if (!c || !c.alive || c.defeated) { this.msg("They're already defeated."); return; }

        if (this.combatManager) {
            this.combatManager.startCombat(hs.characterId);
        } else {
            this.msg("You can't fight right now.");
        }
    }

    search(hs) {
        if (hs.onSearch) {
            this.runScript(hs.onSearch);
            return;
        }
        this.msg("You search but find nothing special.");
    }
};
