/**
 * Fred Rogers, Terrorist - Game Engine
 * A classic text adventure engine inspired by World Builder (1986)
 */

class GameEngine {
    constructor() {
        this.rooms = {};
        this.items = {};
        this.characters = {};
        this.player = {
            hp: 100,
            maxHp: 100,
            currentRoom: null,
            inventory: [],
            score: 0,
            flags: {},
            turnCount: 0
        };
        this.gameOver = false;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.outputBuffer = [];
    }

    // Room management
    addRoom(id, room) {
        this.rooms[id] = {
            id,
            name: room.name || id,
            description: room.description || '',
            exits: room.exits || {},
            items: room.items || [],
            characters: room.characters || [],
            onEnter: room.onEnter || null,
            onSearch: room.onSearch || null,
            visited: false,
            blocked: room.blocked || null,
            art: room.art || null
        };
    }

    // Item management
    addItem(id, item) {
        this.items[id] = {
            id,
            name: item.name || id,
            description: item.description || '',
            takeable: item.takeable !== false,
            usable: item.usable || null,
            onTake: item.onTake || null,
            onUse: item.onUse || null,
            onGive: item.onGive || null,
            weight: item.weight || 1,
            hidden: item.hidden || false,
            aliases: item.aliases || []
        };
    }

    // Character management
    addCharacter(id, char) {
        this.characters[id] = {
            id,
            name: char.name || id,
            description: char.description || '',
            hp: char.hp || 50,
            maxHp: char.maxHp || char.hp || 50,
            attack: char.attack || 10,
            hostile: char.hostile || false,
            alive: true,
            defeated: false,
            dialogue: char.dialogue || {},
            combatMessages: char.combatMessages || {},
            onTalk: char.onTalk || null,
            onDefeat: char.onDefeat || null,
            onGive: char.onGive || null,
            loot: char.loot || null
        };
    }

    // Output — now supports making items/characters clickable
    print(text, className) {
        this.outputBuffer.push({ text, className: className || '' });
    }

    flushOutput() {
        const textArea = document.getElementById('game-text');
        this.outputBuffer.forEach(({ text, className }) => {
            const p = document.createElement('p');
            p.innerHTML = this.makeInteractive(text);
            if (className) p.className = className;
            textArea.appendChild(p);
        });
        this.outputBuffer = [];
        textArea.scrollTop = textArea.scrollHeight;
        this.updateExitsBar();
        this.updateCompass();
    }

    // Make item names and character names clickable in output text
    makeInteractive(text) {
        let result = text;
        const room = this.rooms[this.player.currentRoom];
        if (!room) return result;

        // Make character names clickable
        for (const charId of room.characters) {
            const char = this.characters[charId];
            if (!char || !char.alive || char.defeated) continue;
            const name = char.name;
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`\\b${escapedName}\\b`, 'g');
            result = result.replace(regex, `<span class="clickable-char" data-char-id="${charId}" onclick="showCharacterMenu(event, '${charId}')">${name}</span>`);
        }

        // Make visible item names clickable (room items)
        for (const itemId of room.items) {
            const item = this.items[itemId];
            if (!item || item.hidden) continue;
            const name = item.name;
            const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(escapedName, 'gi');
            result = result.replace(regex, `<span class="clickable-item" data-item-id="${itemId}" data-item-location="room" onclick="showItemMenu(event, '${itemId}', 'room')">${name}</span>`);
        }

        return result;
    }

    clearOutput() {
        document.getElementById('game-text').innerHTML = '';
    }

    // Navigation
    movePlayer(direction) {
        const room = this.rooms[this.player.currentRoom];
        if (!room) return;

        const exit = room.exits[direction];
        if (!exit) {
            this.print("You can't go that way.");
            return;
        }

        // Check for blocked exits
        if (room.blocked && room.blocked[direction]) {
            const blockResult = room.blocked[direction](this);
            if (blockResult !== true) {
                this.print(blockResult || "Something prevents you from going that way.");
                return;
            }
        }

        this.enterRoom(exit);
    }

    enterRoom(roomId) {
        const room = this.rooms[roomId];
        if (!room) {
            this.print("Error: Room not found.");
            return;
        }

        this.player.currentRoom = roomId;

        this.print(room.name, 'room-name');
        this.print(room.description);

        // Show items in room
        const visibleItems = room.items
            .map(id => this.items[id])
            .filter(item => item && !item.hidden);

        visibleItems.forEach(item => {
            this.print(`You see: ${item.name}`, 'item-msg');
        });

        // Show characters in room
        room.characters.forEach(charId => {
            const char = this.characters[charId];
            if (char && char.alive && !char.defeated) {
                this.print(`${char.name} is here.`, 'system-msg');
            }
        });

        // Fire onEnter callback
        if (room.onEnter) {
            room.onEnter(this, room.visited);
        }

        room.visited = true;
        this.drawScene(room);
        this.updateStatus();
    }

    // Update the exits bar with clickable direction links
    updateExitsBar() {
        const exitsList = document.getElementById('exits-list');
        exitsList.innerHTML = '';
        const room = this.rooms[this.player.currentRoom];
        if (!room) return;

        const dirLabels = {
            north: 'North', south: 'South', east: 'East', west: 'West',
            up: 'Up', down: 'Down'
        };

        const exits = Object.keys(room.exits);
        if (exits.length === 0) {
            const span = document.createElement('span');
            span.style.fontStyle = 'italic';
            span.style.fontSize = '10px';
            span.style.color = '#888';
            span.textContent = 'None';
            exitsList.appendChild(span);
            return;
        }

        exits.forEach(dir => {
            const btn = document.createElement('button');
            btn.className = 'exit-link';
            btn.textContent = dirLabels[dir] || dir;
            btn.onclick = () => runCommand(dir);
            exitsList.appendChild(btn);
        });
    }

    // Update compass rose to highlight available directions
    updateCompass() {
        const room = this.rooms[this.player.currentRoom];
        if (!room) return;

        const dirMap = {
            north: 'compass-n',
            south: 'compass-s',
            east: 'compass-e',
            west: 'compass-w'
        };

        // Reset all direction buttons
        Object.values(dirMap).forEach(id => {
            const btn = document.getElementById(id);
            btn.classList.remove('available', 'unavailable');
            btn.classList.add(room.exits[Object.keys(dirMap).find(k => dirMap[k] === id)] ? 'available' : 'unavailable');
            btn.disabled = !room.exits[Object.keys(dirMap).find(k => dirMap[k] === id)];
        });

        // Up/Down
        const upBtn = document.getElementById('compass-up');
        const downBtn = document.getElementById('compass-down');
        if (room.exits.up) {
            upBtn.classList.remove('hidden');
        } else {
            upBtn.classList.add('hidden');
        }
        if (room.exits.down) {
            downBtn.classList.remove('hidden');
        } else {
            downBtn.classList.add('hidden');
        }
    }

    // Combat
    attackCharacter(charId) {
        const char = this.characters[charId];
        if (!char || !char.alive || char.defeated) {
            this.print("There's no one here to fight.");
            return;
        }

        // Player attacks
        let playerDamage = 10;
        const weapon = this.getEquippedWeapon();
        if (weapon) {
            playerDamage = this.getWeaponDamage(weapon);
            this.print(`You attack ${char.name} with your ${this.items[weapon].name}!`, 'combat-msg');
        } else {
            this.print(`You swing at ${char.name}!`, 'combat-msg');
        }

        char.hp -= playerDamage;
        if (char.combatMessages.playerHit) {
            this.print(char.combatMessages.playerHit);
        }

        // Check if defeated
        if (char.hp <= 0) {
            char.alive = false;
            char.defeated = true;
            if (char.combatMessages.defeat) {
                this.print(char.combatMessages.defeat, 'combat-msg');
            } else {
                this.print(`${char.name} has been defeated!`, 'combat-msg');
            }
            if (char.onDefeat) {
                char.onDefeat(this);
            }
            if (char.loot) {
                const room = this.rooms[this.player.currentRoom];
                room.items.push(char.loot);
                this.print(`${char.name} dropped something!`, 'item-msg');
            }
            // Remove from room
            const room = this.rooms[this.player.currentRoom];
            room.characters = room.characters.filter(id => id !== charId);
            return;
        }

        // Enemy attacks back
        const enemyDamage = char.attack + Math.floor(Math.random() * 5);
        this.player.hp -= enemyDamage;

        if (char.combatMessages.enemyHit) {
            this.print(char.combatMessages.enemyHit);
        } else {
            this.print(`${char.name} hits you for ${enemyDamage} damage!`);
        }

        if (this.player.hp <= 0) {
            this.player.hp = 0;
            this.print("You have been killed!", 'lose-msg');
            this.endGame(false, "You died. Better luck next time!");
        }

        this.updateStatus();
    }

    getEquippedWeapon() {
        const weapons = ['machine_gun', 'switchblade', 'butcher_knife', 'hand_grenades'];
        for (const w of weapons) {
            if (this.player.inventory.includes(w)) return w;
        }
        return null;
    }

    getWeaponDamage(weaponId) {
        const damages = {
            machine_gun: 30,
            switchblade: 15,
            butcher_knife: 20,
            hand_grenades: 35
        };
        return damages[weaponId] || 10;
    }

    // Inventory
    takeItem(itemId) {
        const room = this.rooms[this.player.currentRoom];
        const resolvedId = this.resolveItemId(itemId, room.items);

        if (!resolvedId || !room.items.includes(resolvedId)) {
            this.print("You don't see that here.");
            return;
        }

        const item = this.items[resolvedId];
        if (!item) {
            this.print("You don't see that here.");
            return;
        }

        if (!item.takeable) {
            this.print("You can't take that.");
            return;
        }

        room.items = room.items.filter(id => id !== resolvedId);
        this.player.inventory.push(resolvedId);

        if (item.onTake) {
            item.onTake(this);
        } else {
            this.print(`You picked up the ${item.name}.`);
        }

        this.updateInventory();
    }

    dropItem(itemId) {
        const resolvedId = this.resolveItemId(itemId, this.player.inventory);
        if (!resolvedId || !this.player.inventory.includes(resolvedId)) {
            this.print("You don't have that.");
            return;
        }

        this.player.inventory = this.player.inventory.filter(id => id !== resolvedId);
        const room = this.rooms[this.player.currentRoom];
        room.items.push(resolvedId);
        this.print(`You dropped the ${this.items[resolvedId].name}.`);
        this.updateInventory();
    }

    // Item resolution — match user input to item IDs
    resolveItemId(input, searchList) {
        const normalized = input.toLowerCase().trim();

        // Direct match
        if (searchList.includes(normalized)) return normalized;

        // Match by item name
        for (const id of searchList) {
            const item = this.items[id];
            if (!item) continue;
            if (item.name.toLowerCase() === normalized) return id;
            if (item.aliases && item.aliases.some(a => a.toLowerCase() === normalized)) return id;
            // Partial match
            if (item.name.toLowerCase().includes(normalized)) return id;
            if (id.replace(/_/g, ' ').includes(normalized)) return id;
        }

        return null;
    }

    // Resolve character name
    resolveCharacterId(input) {
        const normalized = input.toLowerCase().trim();
        const room = this.rooms[this.player.currentRoom];

        for (const charId of room.characters) {
            const char = this.characters[charId];
            if (!char || !char.alive) continue;
            if (charId.toLowerCase() === normalized) return charId;
            if (char.name.toLowerCase() === normalized) return charId;
            if (char.name.toLowerCase().includes(normalized)) return charId;
        }

        return null;
    }

    // Give item to character
    giveItem(itemId, charId) {
        const resolvedItem = this.resolveItemId(itemId, this.player.inventory);
        if (!resolvedItem || !this.player.inventory.includes(resolvedItem)) {
            this.print("You don't have that.");
            return;
        }

        const resolvedChar = this.resolveCharacterId(charId);
        if (!resolvedChar) {
            this.print("They're not here.");
            return;
        }

        const char = this.characters[resolvedChar];
        if (char.onGive) {
            char.onGive(this, resolvedItem);
        } else {
            this.print(`${char.name} doesn't want that.`);
        }
    }

    // Command parser
    parseCommand(input) {
        if (this.gameOver) {
            this.print("The game is over. Type RESTART to play again.", 'system-msg');
            return;
        }

        const raw = input.trim();
        if (!raw) return;

        this.player.turnCount++;
        this.commandHistory.unshift(raw);
        this.historyIndex = -1;

        const parts = raw.toLowerCase().split(/\s+/);
        const verb = parts[0];
        const rest = parts.slice(1).join(' ');

        // Direction shortcuts
        const directions = {
            'n': 'north', 'north': 'north',
            's': 'south', 'south': 'south',
            'e': 'east', 'east': 'east',
            'w': 'west', 'west': 'west',
            'u': 'up', 'up': 'up',
            'd': 'down', 'down': 'down'
        };

        if (directions[verb]) {
            this.movePlayer(directions[verb]);
            this.flushOutput();
            return;
        }

        // Movement with "go"
        if (verb === 'go' && directions[rest]) {
            this.movePlayer(directions[rest]);
            this.flushOutput();
            return;
        }

        switch (verb) {
            case 'look':
            case 'l':
                this.lookAround();
                break;

            case 'get':
            case 'take':
            case 'pick':
                const takeTarget = (verb === 'pick' && parts[1] === 'up') ? parts.slice(2).join(' ') : rest;
                if (!takeTarget) {
                    this.print("Take what?");
                } else {
                    this.takeItem(takeTarget);
                }
                break;

            case 'drop':
                if (!rest) {
                    this.print("Drop what?");
                } else {
                    this.dropItem(rest);
                }
                break;

            case 'use':
                if (!rest) {
                    this.print("Use what?");
                } else {
                    this.useItem(rest);
                }
                break;

            case 'give':
            case 'offer': {
                // Parse "give X to Y"
                const toIndex = rest.indexOf(' to ');
                if (toIndex === -1) {
                    this.print("Give what to whom? (e.g., GIVE MONEY TO LANDLORD)");
                } else {
                    const giveItem = rest.substring(0, toIndex);
                    const giveTarget = rest.substring(toIndex + 4);
                    this.giveItem(giveItem, giveTarget);
                }
                break;
            }

            case 'inventory':
            case 'i':
                this.showInventory();
                break;

            case 'attack':
            case 'kill':
            case 'fight':
            case 'hit':
            case 'punch': {
                const combatTarget = rest || this.getFirstHostile();
                if (!combatTarget) {
                    this.print("There's no one here to fight.");
                } else {
                    const charId = this.resolveCharacterId(combatTarget);
                    if (charId) {
                        this.attackCharacter(charId);
                    } else {
                        this.print("They're not here.");
                    }
                }
                break;
            }

            case 'talk':
            case 'speak':
            case 'say': {
                const talkParts = rest.replace(/^to\s+/, '');
                if (!talkParts) {
                    this.print("Talk to whom?");
                } else {
                    this.talkTo(talkParts);
                }
                break;
            }

            case 'search':
            case 'f':
            case 'examine':
                this.searchRoom(rest);
                break;

            case 'open':
                this.openThing(rest);
                break;

            case 'close':
                this.print("You close it.");
                break;

            case 'pull':
                this.pullThing(rest);
                break;

            case 'dig':
                this.digThing(rest);
                break;

            case 'wear':
            case 'put':
                if (verb === 'put' && parts[1] === 'on') {
                    this.wearItem(parts.slice(2).join(' '));
                } else {
                    this.wearItem(rest);
                }
                break;

            case 'read':
                this.readItem(rest);
                break;

            case 'rest':
            case 'r':
            case 'wait':
                this.rest();
                break;

            case 'status':
            case 't':
                this.showStatus();
                break;

            case 'help':
            case '?':
                this.showHelp();
                break;

            case 'restart':
                this.restart();
                break;

            case 'score':
                this.print(`Your score is ${this.player.score}.`);
                break;

            case 'cuss':
            case 'swear':
            case 'curse':
                this.useCussWords();
                break;

            default:
                this.print(`I don't understand "${raw}". Type HELP for commands, or use the buttons below.`, 'error-msg');
                break;
        }

        // Check for hostile characters attacking
        this.checkHostileAttacks();

        this.flushOutput();
    }

    lookAround() {
        const room = this.rooms[this.player.currentRoom];
        this.print(room.name, 'room-name');
        this.print(room.description);

        const visibleItems = room.items
            .map(id => this.items[id])
            .filter(item => item && !item.hidden);
        visibleItems.forEach(item => {
            this.print(`You see: ${item.name}`, 'item-msg');
        });

        room.characters.forEach(charId => {
            const char = this.characters[charId];
            if (char && char.alive && !char.defeated) {
                this.print(`${char.name} is here.`, 'system-msg');
            }
        });

        // Show exits
        const exitNames = Object.keys(room.exits);
        if (exitNames.length > 0) {
            this.print(`Exits: ${exitNames.join(', ')}`, 'system-msg');
        }
    }

    searchRoom(target) {
        const room = this.rooms[this.player.currentRoom];
        if (room.onSearch) {
            room.onSearch(this, target);
        } else {
            // Reveal hidden items
            let found = false;
            room.items.forEach(id => {
                const item = this.items[id];
                if (item && item.hidden) {
                    item.hidden = false;
                    this.print(`You found: ${item.name}!`, 'item-msg');
                    found = true;
                }
            });
            if (!found) {
                this.print("You search but find nothing special.");
            }
        }
    }

    useItem(itemName) {
        const resolvedId = this.resolveItemId(itemName, this.player.inventory);
        if (!resolvedId) {
            this.print("You don't have that.");
            return;
        }
        const item = this.items[resolvedId];
        if (item.onUse) {
            item.onUse(this);
        } else {
            this.print(`You're not sure how to use the ${item.name} right now.`);
        }
    }

    openThing(target) {
        this.print("It doesn't open.");
    }

    pullThing(target) {
        this.print("Nothing happens.");
    }

    digThing(target) {
        this.print("You can't dig here.");
    }

    wearItem(itemName) {
        if (!itemName) {
            this.print("Wear what?");
            return;
        }
        const resolvedId = this.resolveItemId(itemName, this.player.inventory);
        if (!resolvedId) {
            this.print("You don't have that.");
            return;
        }
        this.print(`You put on the ${this.items[resolvedId].name}.`);
    }

    readItem(target) {
        this.print("There's nothing to read.");
    }

    rest() {
        const healAmount = 5;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
        this.print(`You rest for a moment and recover ${healAmount} HP.`);
        this.updateStatus();
    }

    talkTo(charName) {
        const charId = this.resolveCharacterId(charName);
        if (!charId) {
            this.print("They're not here.");
            return;
        }
        const char = this.characters[charId];
        if (char.onTalk) {
            char.onTalk(this);
        } else if (char.dialogue.greeting) {
            this.print(`${char.name}: "${char.dialogue.greeting}"`);
        } else {
            this.print(`${char.name} doesn't seem interested in talking.`);
        }
    }

    useCussWords() {
        if (this.player.inventory.includes('cuss_words')) {
            const room = this.rooms[this.player.currentRoom];
            if (room.characters.length > 0) {
                const charId = room.characters[0];
                const char = this.characters[charId];
                if (char && char.alive) {
                    this.print(`You unleash a string of profanity at ${char.name}!`);
                    if (char.combatMessages.insult) {
                        this.print(`${char.name}: "${char.combatMessages.insult}"`);
                    }
                    return;
                }
            }
            this.print("You let loose a string of expletives. Feel better?");
        } else {
            this.print("You mutter something under your breath.");
        }
    }

    getFirstHostile() {
        const room = this.rooms[this.player.currentRoom];
        for (const charId of room.characters) {
            const char = this.characters[charId];
            if (char && char.alive && char.hostile) {
                return charId;
            }
        }
        return null;
    }

    checkHostileAttacks() {
        const room = this.rooms[this.player.currentRoom];
        for (const charId of room.characters) {
            const char = this.characters[charId];
            if (char && char.alive && char.hostile && !char.defeated && Math.random() < 0.3) {
                const damage = char.attack + Math.floor(Math.random() * 3);
                this.player.hp -= damage;
                if (char.combatMessages.ambush) {
                    this.print(char.combatMessages.ambush, 'combat-msg');
                } else {
                    this.print(`${char.name} attacks you for ${damage} damage!`, 'combat-msg');
                }
                if (this.player.hp <= 0) {
                    this.player.hp = 0;
                    this.endGame(false, "You have been killed!");
                }
                this.updateStatus();
            }
        }
    }

    showInventory() {
        if (this.player.inventory.length === 0) {
            this.print("You're not carrying anything.");
        } else {
            this.print("You are carrying:", 'system-msg');
            this.player.inventory.forEach(id => {
                const item = this.items[id];
                this.print(`  - ${item ? item.name : id}`);
            });
        }
        this.toggleInventoryWindow(true);
    }

    showStatus() {
        this.print(`HP: ${this.player.hp}/${this.player.maxHp}`, 'system-msg');
        this.print(`Score: ${this.player.score}`, 'system-msg');
        this.print(`Turns: ${this.player.turnCount}`, 'system-msg');
        this.print(`Location: ${this.rooms[this.player.currentRoom]?.name}`, 'system-msg');
    }

    showHelp() {
        this.print("=== COMMANDS ===", 'system-msg');
        this.print("Movement: Arrow keys, compass buttons, or type N/S/E/W/U/D");
        this.print("LOOK (L) - Look around the room");
        this.print("GET/TAKE [item] - Pick up an item (or click the item)");
        this.print("DROP [item] - Drop an item");
        this.print("USE [item] - Use an item (or click it in inventory)");
        this.print("GIVE [item] TO [person] - Give an item");
        this.print("INVENTORY (I) - Check your inventory");
        this.print("ATTACK/FIGHT [target] - Fight someone (or click them)");
        this.print("TALK TO [person] - Talk to someone (or click them)");
        this.print("SEARCH/EXAMINE - Search the area");
        this.print("OPEN/PULL/DIG - Interact with objects");
        this.print("READ [item] - Read something");
        this.print("REST (R) - Rest and recover HP");
        this.print("STATUS (T) - Check your status");
        this.print("HELP (?) - Show this help");
        this.print("RESTART - Start over");
    }

    // Game state
    setFlag(name, value) {
        this.player.flags[name] = value === undefined ? true : value;
    }

    getFlag(name) {
        return this.player.flags[name];
    }

    addScore(points) {
        this.player.score += points;
        this.updateStatus();
    }

    endGame(won, message) {
        this.gameOver = true;
        const className = won ? 'win-msg' : 'lose-msg';
        this.print(message, className);

        // Show dialog
        setTimeout(() => {
            const overlay = document.createElement('div');
            overlay.className = 'dialog-overlay';
            overlay.innerHTML = `
                <div class="dialog-box">
                    <p>${won ? 'Congratulations!' : 'Game Over'}</p>
                    <p>${message}</p>
                    <button class="primary" onclick="game.restart(); this.closest('.dialog-overlay').remove();">Play Again</button>
                </div>
            `;
            document.body.appendChild(overlay);
        }, 500);
    }

    restart() {
        // Remove any dialogs
        document.querySelectorAll('.dialog-overlay').forEach(el => el.remove());
        // Re-initialize
        this.gameOver = false;
        this.player = {
            hp: 100,
            maxHp: 100,
            currentRoom: null,
            inventory: [],
            score: 0,
            flags: {},
            turnCount: 0
        };
        this.rooms = {};
        this.items = {};
        this.characters = {};
        this.clearOutput();
        initializeGame();
    }

    // UI updates
    updateStatus() {
        document.getElementById('status-hp').textContent = `HP: ${this.player.hp}/${this.player.maxHp}`;
        document.getElementById('status-location').textContent = `Location: ${this.rooms[this.player.currentRoom]?.name || '???'}`;
        document.getElementById('status-score').textContent = `Score: ${this.player.score}`;
    }

    updateInventory() {
        this.toggleInventoryWindow(true);
    }

    toggleInventoryWindow(show) {
        const win = document.getElementById('inventory-window');
        const list = document.getElementById('inventory-list');
        list.innerHTML = '';

        if (this.player.inventory.length === 0) {
            const div = document.createElement('div');
            div.className = 'inv-empty';
            div.textContent = 'Empty';
            list.appendChild(div);
        } else {
            this.player.inventory.forEach(id => {
                const item = this.items[id];
                const div = document.createElement('div');
                div.className = 'inv-item';
                div.textContent = item ? item.name : id;
                // Click on inventory item to show context menu
                div.onclick = (e) => showItemMenu(e, id, 'inventory');
                list.appendChild(div);
            });
        }

        if (show) win.classList.remove('hidden');
    }

    // Scene drawing (simple pixel art on canvas)
    drawScene(room) {
        const canvas = document.getElementById('scene-canvas');
        const ctx = canvas.getContext('2d');

        // Clear
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (room.art) {
            room.art(ctx, canvas.width, canvas.height);
        } else {
            this.drawDefaultScene(ctx, canvas.width, canvas.height, room.id);
        }

        // Border
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);
    }

    drawDefaultScene(ctx, w, h, roomId) {
        ctx.fillStyle = '#000';
        ctx.font = '14px Monaco, monospace';
        ctx.textAlign = 'center';

        if (roomId.includes('house') || roomId.includes('porch') || roomId.includes('kitchen') || roomId.includes('bathroom')) {
            this.drawInterior(ctx, w, h);
        } else if (roomId.includes('street') || roomId.includes('road') || roomId.includes('alley')) {
            this.drawStreet(ctx, w, h);
        } else if (roomId.includes('make_believe') || roomId.includes('warp')) {
            this.drawMakeBelieve(ctx, w, h);
        } else if (roomId.includes('sewer') || roomId.includes('dark')) {
            this.drawDark(ctx, w, h);
        } else if (roomId.includes('airport') || roomId.includes('airplane') || roomId.includes('chute')) {
            this.drawAirport(ctx, w, h);
        } else {
            this.drawOutdoors(ctx, w, h);
        }
    }

    drawInterior(ctx, w, h) {
        ctx.fillStyle = '#ddd';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, w, h * 0.6);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, h * 0.6);
        ctx.lineTo(w, h * 0.6);
        ctx.stroke();
        ctx.fillStyle = '#aaa';
        ctx.fillRect(w * 0.4, h * 0.2, w * 0.2, h * 0.4);
        ctx.strokeRect(w * 0.4, h * 0.2, w * 0.2, h * 0.4);
        ctx.fillStyle = '#666';
        ctx.beginPath();
        ctx.arc(w * 0.56, h * 0.42, 3, 0, Math.PI * 2);
        ctx.fill();
        for (let x = 0; x < w; x += 30) {
            ctx.beginPath();
            ctx.moveTo(x, h * 0.6);
            ctx.lineTo(x + 15, h);
            ctx.strokeStyle = '#bbb';
            ctx.stroke();
        }
    }

    drawStreet(ctx, w, h) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, w, h * 0.5);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, h * 0.5, w, h * 0.5);
        ctx.fillStyle = '#999';
        ctx.fillRect(w * 0.2, h * 0.5, w * 0.6, h * 0.5);
        ctx.strokeStyle = '#fff';
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(w * 0.5, h * 0.55);
        ctx.lineTo(w * 0.5, h);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < 3; i++) {
            const hx = w * 0.1 + i * w * 0.3;
            ctx.fillStyle = '#ddd';
            ctx.fillRect(hx, h * 0.25, w * 0.15, h * 0.25);
            ctx.strokeStyle = '#000';
            ctx.strokeRect(hx, h * 0.25, w * 0.15, h * 0.25);
            ctx.beginPath();
            ctx.moveTo(hx - 5, h * 0.25);
            ctx.lineTo(hx + w * 0.075, h * 0.12);
            ctx.lineTo(hx + w * 0.15 + 5, h * 0.25);
            ctx.closePath();
            ctx.fillStyle = '#aaa';
            ctx.fill();
            ctx.stroke();
        }
    }

    drawMakeBelieve(ctx, w, h) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        for (let i = 0; i < 8; i++) {
            ctx.beginPath();
            const cx = w * 0.5;
            const cy = h * 0.5;
            for (let a = 0; a < Math.PI * 6; a += 0.1) {
                const r = a * 8 + i * 15;
                const x = cx + Math.cos(a + i * 0.8) * r;
                const y = cy + Math.sin(a + i * 0.8) * r;
                if (a === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        for (let i = 0; i < 20; i++) {
            const sx = Math.random() * w;
            const sy = Math.random() * h;
            ctx.fillStyle = '#000';
            ctx.fillText('*', sx, sy);
        }
    }

    drawDark(ctx, w, h) {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, w, h);
        const grd = ctx.createRadialGradient(w * 0.5, h * 0.5, 10, w * 0.5, h * 0.5, 150);
        grd.addColorStop(0, '#666');
        grd.addColorStop(1, '#333');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#555';
        for (let i = 0; i < 10; i++) {
            ctx.beginPath();
            ctx.moveTo(Math.random() * w, 0);
            ctx.lineTo(Math.random() * w, h);
            ctx.stroke();
        }
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(w * 0.3, h * 0.4, 4, 0, Math.PI * 2);
        ctx.arc(w * 0.35, h * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawAirport(ctx, w, h) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, w, h * 0.6);
        ctx.fillStyle = '#aaa';
        ctx.fillRect(0, h * 0.6, w, h * 0.4);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.setLineDash([20, 10]);
        ctx.beginPath();
        ctx.moveTo(0, h * 0.8);
        ctx.lineTo(w, h * 0.8);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#ddd';
        ctx.beginPath();
        ctx.ellipse(w * 0.5, h * 0.45, 100, 20, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h * 0.45);
        ctx.lineTo(w * 0.3, h * 0.55);
        ctx.lineTo(w * 0.5, h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.6, h * 0.45);
        ctx.lineTo(w * 0.7, h * 0.55);
        ctx.lineTo(w * 0.5, h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w * 0.35, h * 0.45);
        ctx.lineTo(w * 0.32, h * 0.3);
        ctx.lineTo(w * 0.4, h * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    drawOutdoors(ctx, w, h) {
        ctx.fillStyle = '#eee';
        ctx.fillRect(0, 0, w, h * 0.5);
        ctx.fillStyle = '#ccc';
        ctx.fillRect(0, h * 0.5, w, h * 0.5);
        for (let i = 0; i < 4; i++) {
            const tx = w * 0.15 + i * w * 0.22;
            ctx.fillStyle = '#888';
            ctx.fillRect(tx - 4, h * 0.3, 8, h * 0.2);
            ctx.fillStyle = '#aaa';
            ctx.beginPath();
            ctx.arc(tx, h * 0.25, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#000';
            ctx.stroke();
        }
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.moveTo(w * 0.4, h);
        ctx.lineTo(w * 0.45, h * 0.5);
        ctx.lineTo(w * 0.55, h * 0.5);
        ctx.lineTo(w * 0.6, h);
        ctx.closePath();
        ctx.fill();
    }
}

// Toggle inventory window
function toggleInventory() {
    const win = document.getElementById('inventory-window');
    win.classList.toggle('hidden');
}
