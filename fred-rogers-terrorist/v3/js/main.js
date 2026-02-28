/**
 * main.js — Game Entry Point & Wiring
 * Fred Rogers, Terrorist v3
 *
 * Wires together engine, scenes, items, characters, dialogues,
 * narrator, inventory, and all UI interactions.
 */
(function() {
    'use strict';

    var FRT3 = window.FRT3;

    // ========================================
    // DOM references
    // ========================================
    var titleScreen    = document.getElementById('title-screen');
    var beginBtn       = document.getElementById('begin-btn');
    var gameContainer  = document.getElementById('game-container');
    var roomHeader     = document.getElementById('room-name');
    var sceneViewport  = document.getElementById('scene-viewport');
    var sceneLayer     = document.getElementById('scene-layer');
    var transitionOvl  = document.getElementById('transition-overlay');
    var narrationArea  = document.getElementById('narration-area');
    var narrationText  = document.getElementById('narration-text');
    var contextMenu    = document.getElementById('context-menu');
    var dialogueOvl    = document.getElementById('dialogue-overlay');
    var dialoguePort   = document.getElementById('dialogue-portrait');
    var dialogueSpeaker = document.getElementById('dialogue-speaker');
    var dialogueText   = document.getElementById('dialogue-text');
    var dialogueOpts   = document.getElementById('dialogue-options');
    var dialogueDrop   = document.getElementById('dialogue-drop-zone');
    var inventoryDrawer = document.getElementById('inventory-drawer');
    var drawerHandle   = document.getElementById('drawer-handle');
    var drawerContents = document.getElementById('drawer-contents');
    var inventoryEmpty = document.getElementById('inventory-empty');
    var menuOverlay    = document.getElementById('menu-overlay');
    var menuBtn        = document.getElementById('menu-btn');
    var scoreDisplay   = document.getElementById('score-display');

    // ========================================
    // Core systems
    // ========================================
    var eventBus  = new FRT3.EventBus();
    var gameState = new FRT3.GameState(eventBus);
    var narrator  = new FRT3.Narrator(narrationText, eventBus);
    var inventory = new FRT3.Inventory(
        inventoryDrawer, drawerHandle, drawerContents, inventoryEmpty,
        gameState, eventBus
    );

    // ========================================
    // Scene rendering
    // ========================================

    /**
     * Build a scene from a room definition.
     * Creates CSS art layers and hotspot divs.
     */
    function buildScene(roomId) {
        var sceneDef = FRT3.SceneDefs[roomId];
        if (!sceneDef) return;

        // Clear existing scene
        sceneLayer.innerHTML = '';

        // Set background
        if (sceneDef.art && sceneDef.art.background) {
            sceneLayer.style.background = sceneDef.art.background;
        } else {
            sceneLayer.style.background = 'var(--cream)';
        }

        // Create art layers
        if (sceneDef.art && sceneDef.art.layers) {
            for (var i = 0; i < sceneDef.art.layers.length; i++) {
                var layer = sceneDef.art.layers[i];
                var el = document.createElement('div');
                el.className = 'scene-el';
                if (layer.classes) {
                    el.className += ' ' + layer.classes;
                }
                if (layer.style) {
                    el.style.cssText += ';' + layer.style;
                }
                if (layer.html) {
                    el.innerHTML = layer.html;
                }
                sceneLayer.appendChild(el);
            }
        }

        // Create hotspots
        var hotspots = getActiveHotspots(roomId);
        for (var j = 0; j < hotspots.length; j++) {
            var hs = hotspots[j];
            var hsEl = createHotspot(hs, roomId);
            sceneLayer.appendChild(hsEl);
        }

        // Add dynamic sewer exit if discovered
        if (roomId === 'bathroom' && gameState.getFlag('sewer_discovered') && gameState.rooms['bathroom'].exits['down']) {
            var hasSewer = false;
            var existingHotspots = sceneLayer.querySelectorAll('.hotspot');
            for (var k = 0; k < existingHotspots.length; k++) {
                if (existingHotspots[k].getAttribute('data-exit-dir') === 'down') {
                    hasSewer = true;
                    break;
                }
            }
            if (!hasSewer) {
                var sewerHs = createHotspot({
                    id: 'exit_down', type: 'exit', exitDir: 'down', label: '\u2193 Sewer',
                    position: { bottom: '20%', left: '35%', width: '16%', height: '12%' }
                }, roomId);
                sceneLayer.appendChild(sewerHs);
            }
        }
    }

    /**
     * Get active hotspots for a room, filtering out taken items and defeated characters.
     */
    function getActiveHotspots(roomId) {
        var sceneDef = FRT3.SceneDefs[roomId];
        if (!sceneDef || !sceneDef.hotspots) return [];

        var room = gameState.rooms[roomId];
        if (!room) return [];

        return sceneDef.hotspots.filter(function(hs) {
            // Filter out items already taken
            if (hs.type === 'item' && hs.itemId) {
                if (gameState.isItemInInventory(hs.itemId)) return false;
                if (room.items.indexOf(hs.itemId) === -1) return false;
            }
            // Filter out characters not present in this room
            if (hs.type === 'character' && hs.characterId) {
                if (room.characters.indexOf(hs.characterId) === -1) return false;
            }
            return true;
        });
    }

    /**
     * Create a hotspot DOM element.
     */
    function createHotspot(hs, roomId) {
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

        // Store data for event handling
        if (hs.exitDir) el.setAttribute('data-exit-dir', hs.exitDir);
        if (hs.characterId) el.setAttribute('data-character-id', hs.characterId);
        if (hs.itemId) el.setAttribute('data-item-id', hs.itemId);

        // Tooltip label
        var label = document.createElement('span');
        label.className = 'hotspot-label';
        label.textContent = hs.label || '';
        el.appendChild(label);

        // Character portrait emoji indicator (visible in scene)
        if (hs.type === 'character' && hs.characterId) {
            var charDef = FRT3.CharacterDefs[hs.characterId];
            if (charDef && charDef.portrait) {
                var indicator = document.createElement('div');
                indicator.className = 'character-indicator';
                indicator.textContent = charDef.portrait;
                el.appendChild(indicator);
            }
        }

        // Item emoji indicator (visible in scene)
        if (hs.type === 'item' && hs.itemId) {
            var itemDef = gameState.items[hs.itemId];
            if (itemDef && itemDef.icon) {
                var itemIndicator = document.createElement('div');
                itemIndicator.className = 'item-indicator';
                itemIndicator.textContent = itemDef.icon;
                el.appendChild(itemIndicator);
            }
        }

        // Exit arrow indicator (visible in scene)
        if (hs.type === 'exit' && hs.exitDir) {
            var arrowMap = { east: '\u2192', west: '\u2190', north: '\u2191', south: '\u2193', up: '\u2191', down: '\u2193' };
            var arrow = document.createElement('div');
            arrow.className = 'exit-arrow';
            arrow.textContent = arrowMap[hs.exitDir] || '\u2192';
            el.appendChild(arrow);
        }

        // Event handlers
        el.addEventListener('click', function(e) {
            e.stopPropagation();
            handleHotspotClick(hs, roomId, e);
        });

        el.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleHotspotClick(hs, roomId, e);
            }
        });

        return el;
    }

    // ========================================
    // Hotspot interaction
    // ========================================

    function handleHotspotClick(hs, roomId, e) {
        // Close any open context menu first
        hideContextMenu();

        switch (hs.type) {
            case 'exit':
                handleExitClick(hs, roomId);
                break;
            case 'item':
            case 'scenery':
            case 'searchable':
            case 'character':
                showContextMenu(hs, roomId, e);
                break;
        }
    }

    function handleExitClick(hs, roomId) {
        var dir = hs.exitDir;
        var room = gameState.rooms[roomId];
        if (!room || !room.exits[dir]) return;

        // Check if exit is blocked
        if (hs.blocked && hs.blocked(gameState)) {
            eventBus.emit('narration:show', {
                text: hs.blockedText || "You can't go that way.",
                style: 'normal'
            });
            return;
        }

        var targetRoomId = room.exits[dir];
        navigateToRoom(targetRoomId, dir);
    }

    // ========================================
    // Context menu
    // ========================================

    var currentContextHotspot = null;

    function showContextMenu(hs, roomId, e) {
        currentContextHotspot = { hs: hs, roomId: roomId };
        contextMenu.innerHTML = '';

        var actions = [];

        // Look action for everything
        if (hs.lookText) {
            actions.push({ icon: '\uD83D\uDC41', label: 'Look', action: 'look' }); // 👁
        }

        // Type-specific actions
        if (hs.type === 'item') {
            var item = gameState.items[hs.itemId];
            if (item && item.takeable) {
                actions.push({ icon: '\u270B', label: 'Take', action: 'take' }); // ✋
            }
        }

        if (hs.type === 'searchable') {
            actions.push({ icon: '\uD83D\uDD0D', label: 'Search', action: 'search' }); // 🔍
        }

        if (hs.type === 'character') {
            var ch = gameState.characters[hs.characterId];
            if (ch && ch.dialogueId && !ch.defeated) {
                actions.push({ icon: '\uD83D\uDCAC', label: 'Talk to', action: 'talk' }); // 💬
            }
        }

        if (actions.length === 0) return;

        for (var i = 0; i < actions.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'context-action';
            btn.setAttribute('data-action', actions[i].action);

            var iconSpan = document.createElement('span');
            iconSpan.className = 'action-icon';
            iconSpan.textContent = actions[i].icon;

            var labelSpan = document.createElement('span');
            labelSpan.textContent = actions[i].label;

            btn.appendChild(iconSpan);
            btn.appendChild(labelSpan);

            (function(act) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    handleContextAction(act.action);
                });
            })(actions[i]);

            contextMenu.appendChild(btn);
        }

        // Position the menu near the click
        var x = e.clientX || e.pageX || 0;
        var y = e.clientY || e.pageY || 0;

        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('visible');

        // Adjust if off-screen
        requestAnimationFrame(function() {
            var rect = contextMenu.getBoundingClientRect();
            if (rect.right > window.innerWidth - 10) {
                contextMenu.style.left = (window.innerWidth - rect.width - 10) + 'px';
            }
            if (rect.bottom > window.innerHeight - 10) {
                contextMenu.style.top = (window.innerHeight - rect.height - 10) + 'px';
            }
        });
    }

    function hideContextMenu() {
        contextMenu.classList.remove('visible');
        currentContextHotspot = null;
    }

    function handleContextAction(action) {
        if (!currentContextHotspot) return;
        var hs = currentContextHotspot.hs;
        var roomId = currentContextHotspot.roomId;
        hideContextMenu();

        switch (action) {
            case 'look':
                var lookText = hs.lookText;
                // Check for character-specific post-defeat look text
                if (hs.type === 'character' && hs.characterId) {
                    var charState = gameState.characters[hs.characterId];
                    if (charState && charState.defeated && hs.lookTextDefeated) {
                        lookText = hs.lookTextDefeated;
                    }
                }
                eventBus.emit('narration:show', {
                    text: lookText,
                    style: 'normal'
                });
                break;

            case 'take':
                handleTakeItem(hs);
                break;

            case 'search':
                handleSearch(hs, roomId);
                break;

            case 'talk':
                handleTalkTo(hs);
                break;
        }
    }

    // ========================================
    // Actions
    // ========================================

    function handleTakeItem(hs) {
        if (!hs.itemId) return;
        var item = gameState.items[hs.itemId];
        if (!item || !item.takeable) {
            eventBus.emit('narration:show', { text: "You can't take that.", style: 'normal' });
            return;
        }

        // Remove from room, add to inventory
        gameState.removeItemFromRoom(hs.itemId);
        gameState.addToInventory(hs.itemId);

        eventBus.emit('narration:show', {
            text: 'You pick up the ' + item.name + '.',
            style: 'item'
        });

        // Refresh scene to remove the hotspot
        buildScene(gameState.player.currentRoom);

        // Open inventory drawer briefly to show new item
        inventory.open();
        setTimeout(function() {
            inventory.close();
        }, 2000);
    }

    function handleSearch(hs, roomId) {
        if (hs.onSearch) {
            hs.onSearch(gameState, eventBus);
            // Refresh scene after search (might reveal new items)
            setTimeout(function() {
                buildScene(gameState.player.currentRoom);
            }, 300);
            // Open inventory if item was added
            if (gameState.player.inventory.length > 0) {
                inventory.open();
                setTimeout(function() {
                    inventory.close();
                }, 2500);
            }
        } else {
            eventBus.emit('narration:show', {
                text: "You search carefully but find nothing of interest.",
                style: 'normal'
            });
        }
    }

    function handleTalkTo(hs) {
        if (!hs.characterId) return;
        var ch = gameState.characters[hs.characterId];
        if (!ch || !ch.dialogueId) return;

        var dialogueDef = FRT3.DialogueDefs[ch.dialogueId];
        if (!dialogueDef) return;

        startDialogue(hs.characterId, dialogueDef);
    }

    // ========================================
    // Dialogue system
    // ========================================

    var activeDialogue = null;

    function startDialogue(characterId, dialogueDef) {
        var ch = gameState.characters[characterId];
        var charDef = FRT3.CharacterDefs[characterId];

        activeDialogue = {
            characterId: characterId,
            def: dialogueDef,
            character: ch,
            charDef: charDef
        };

        // Set portrait
        dialoguePort.textContent = charDef ? (charDef.portrait || '') : '';

        // Show the dialogue overlay
        dialogueOvl.classList.add('active');

        // Show the drop zone if character has a puzzle
        if (charDef && charDef.puzzle) {
            dialogueDrop.style.display = '';
        } else {
            dialogueDrop.style.display = 'none';
        }

        // Navigate to start node
        showDialogueNode(dialogueDef.startNode);
    }

    function showDialogueNode(nodeId) {
        if (!activeDialogue) return;
        var node = activeDialogue.def.nodes[nodeId];
        if (!node) {
            endDialogue();
            return;
        }

        dialogueSpeaker.textContent = node.speaker || '';
        dialogueText.textContent = node.text || '';
        dialogueOpts.innerHTML = '';

        if (node.options) {
            for (var i = 0; i < node.options.length; i++) {
                var opt = node.options[i];
                var btn = document.createElement('button');
                btn.className = 'dialogue-option';
                btn.textContent = opt.text;

                (function(nextNode) {
                    btn.addEventListener('click', function() {
                        if (nextNode === null || nextNode === undefined) {
                            endDialogue();
                        } else {
                            showDialogueNode(nextNode);
                        }
                    });
                })(opt.next);

                dialogueOpts.appendChild(btn);
            }
        }
    }

    function endDialogue() {
        activeDialogue = null;
        dialogueOvl.classList.remove('active');
    }

    // ========================================
    // Drag-and-drop onto characters / dialogue
    // ========================================

    eventBus.on('drag:start', function(data) {
        // Highlight character hotspots as drop targets
        var charHotspots = sceneLayer.querySelectorAll('.hotspot[data-type="character"]');
        for (var i = 0; i < charHotspots.length; i++) {
            charHotspots[i].classList.add('drop-target');
        }
        // Highlight dialogue drop zone if open
        if (dialogueOvl.classList.contains('active')) {
            dialogueDrop.classList.add('drag-over');
        }
    });

    eventBus.on('drag:end', function() {
        // Remove all drop target highlights
        var targets = document.querySelectorAll('.drop-target');
        for (var i = 0; i < targets.length; i++) {
            targets[i].classList.remove('drop-target');
        }
        dialogueDrop.classList.remove('drag-over');
    });

    eventBus.on('drag:move', function(data) {
        // Update drop zone highlight
        var el = data.elementBelow;
        if (el && (el === dialogueDrop || dialogueDrop.contains(el))) {
            dialogueDrop.classList.add('drag-over');
        } else {
            dialogueDrop.classList.remove('drag-over');
        }
    });

    eventBus.on('drag:drop', function(data) {
        var itemId = data.itemId;
        var target = data.target;

        // Check if dropped on dialogue drop zone
        if (target && (target === dialogueDrop || dialogueDrop.contains(target)) && activeDialogue) {
            handleGiveItem(activeDialogue.characterId, itemId);
            return;
        }

        // Check if dropped on a character hotspot in the scene
        if (target) {
            var hotspotEl = target.closest('.hotspot[data-type="character"]');
            if (hotspotEl) {
                var charId = hotspotEl.getAttribute('data-character-id');
                if (charId) {
                    handleGiveItem(charId, itemId);
                    return;
                }
            }
        }

        // Dropped on nothing — no action
    });

    /**
     * Give an item to a character (puzzle interaction)
     */
    function handleGiveItem(characterId, itemId) {
        var charDef = FRT3.CharacterDefs[characterId];
        var charState = gameState.characters[characterId];

        // Don't allow giving items to defeated characters or those without puzzles
        if (!charDef || !charDef.puzzle || (charState && charState.defeated)) {
            eventBus.emit('narration:show', {
                text: "They don't seem interested in that.",
                style: 'character'
            });
            return;
        }

        var puzzle = charDef.puzzle;

        // Close dialogue if open
        if (activeDialogue) {
            endDialogue();
        }

        // Check if item is accepted
        if (puzzle.acceptedItems.indexOf(itemId) !== -1) {
            // Correct item!
            puzzle.onCorrectItem(gameState, eventBus, itemId);

            // Refresh scene after a brief delay
            setTimeout(function() {
                buildScene(gameState.player.currentRoom);
            }, 500);
        } else {
            // Wrong item
            puzzle.onWrongItem(gameState, eventBus, itemId);
        }
    }

    // ========================================
    // Puzzle solved celebration
    // ========================================
    eventBus.on('puzzle:solved', function(data) {
        // Flash the scene with a golden glow
        sceneViewport.classList.add('puzzle-success-glow');
        setTimeout(function() {
            sceneViewport.classList.remove('puzzle-success-glow');
        }, 1200);
    });

    // ========================================
    // Room navigation
    // ========================================

    function navigateToRoom(roomId, direction) {
        if (!gameState.rooms[roomId]) return;

        // Transition: fade out
        transitionOvl.classList.add('active');

        setTimeout(function() {
            // Clear narration
            narrator.clear();

            // Move game state
            gameState.moveToRoom(roomId, direction);
        }, 300);
    }

    eventBus.on('room:enter', function(data) {
        var roomId = data.roomId;
        var room = gameState.rooms[roomId];
        var sceneDef = FRT3.SceneDefs[roomId];
        if (!room || !sceneDef) return;

        // Update room header
        roomHeader.textContent = room.name;

        // Build the scene
        buildScene(roomId);

        // Determine slide animation direction
        var animName = 'fadeInGentle';
        var dir = data.direction;
        if (dir === 'east')  animName = 'slideFromEast';
        if (dir === 'west')  animName = 'slideFromWest';
        if (dir === 'north' || dir === 'up') animName = 'slideFromNorth';
        if (dir === 'south' || dir === 'down') animName = 'slideFromSouth';

        // Apply slide animation
        sceneLayer.style.animation = 'none';
        sceneLayer.offsetHeight; // force reflow
        sceneLayer.style.animation = animName + ' 0.4s ease-out forwards';

        // Fade in (remove transition overlay)
        setTimeout(function() {
            transitionOvl.classList.remove('active');
        }, 50);

        // Show room description
        var descText = sceneDef.description;
        eventBus.emit('narration:show', {
            text: descText,
            style: 'normal'
        });

        // Run onEnter callback
        if (sceneDef.onEnter) {
            sceneDef.onEnter(gameState, eventBus, data);
        }
    });

    // Scene refresh (e.g., after puzzle, after discovering sewer exit)
    eventBus.on('scene:refresh', function() {
        var roomId = gameState.player.currentRoom;
        if (roomId) {
            buildScene(roomId);
        }
    });

    // ========================================
    // Click outside to close things
    // ========================================
    document.addEventListener('click', function(e) {
        // Close context menu if clicking outside
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (activeDialogue) {
                endDialogue();
            } else if (contextMenu.classList.contains('visible')) {
                hideContextMenu();
            } else if (!menuOverlay.classList.contains('hidden')) {
                menuOverlay.classList.add('hidden');
            } else {
                menuOverlay.classList.remove('hidden');
            }
        }
    });

    // ========================================
    // Menu
    // ========================================
    menuBtn.addEventListener('click', function() {
        menuOverlay.classList.toggle('hidden');
    });

    document.getElementById('menu-resume').addEventListener('click', function() {
        menuOverlay.classList.add('hidden');
    });

    document.getElementById('menu-save').addEventListener('click', function() {
        try {
            var saveData = gameState.serialize();
            localStorage.setItem('frt3_save', saveData);
            eventBus.emit('narration:show', {
                text: 'Game saved!',
                style: 'hint'
            });
        } catch (e) {
            eventBus.emit('narration:show', {
                text: 'Failed to save game.',
                style: 'hint'
            });
        }
        menuOverlay.classList.add('hidden');
    });

    document.getElementById('menu-load').addEventListener('click', function() {
        try {
            var saveData = localStorage.getItem('frt3_save');
            if (!saveData) {
                eventBus.emit('narration:show', {
                    text: 'No saved game found.',
                    style: 'hint'
                });
                menuOverlay.classList.add('hidden');
                return;
            }
            // Re-init first to get clean room/item/character defs
            gameState.init(FRT3.SceneDefs, FRT3.ItemDefs, FRT3.CharacterDefs);
            gameState.deserialize(saveData);

            // Rebuild current room scene
            var roomId = gameState.player.currentRoom;
            if (roomId) {
                var room = gameState.rooms[roomId];
                var sceneDef = FRT3.SceneDefs[roomId];
                if (room && sceneDef) {
                    roomHeader.textContent = room.name;
                    buildScene(roomId);
                    narrator.clear();
                    eventBus.emit('narration:show', {
                        text: 'Game loaded!',
                        style: 'hint'
                    });
                }
            }
            inventory.render();
        } catch (e) {
            eventBus.emit('narration:show', {
                text: 'Failed to load game.',
                style: 'hint'
            });
        }
        menuOverlay.classList.add('hidden');
    });

    document.getElementById('menu-restart').addEventListener('click', function() {
        menuOverlay.classList.add('hidden');
        startGame();
    });

    // Click overlay to close menu
    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            menuOverlay.classList.add('hidden');
        }
    });

    // ========================================
    // Score display
    // ========================================
    eventBus.on('score:change', function(data) {
        // Update the persistent score badge
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Score: ' + data.score;
        }
    });

    // ========================================
    // Game start
    // ========================================
    function startGame() {
        // Initialize state from definitions
        gameState.init(FRT3.SceneDefs, FRT3.ItemDefs, FRT3.CharacterDefs);

        // Reset UI
        narrator.clear();
        inventory.render();
        endDialogue();
        hideContextMenu();

        // Hide title, show game
        titleScreen.classList.add('hidden');
        gameContainer.style.display = '';

        // Enter starting room
        eventBus.emit('game:started');
        gameState.moveToRoom('freds_house', 'instant');
    }

    // ========================================
    // Title screen
    // ========================================
    beginBtn.addEventListener('click', function() {
        startGame();
    });

    // Initially hide game container, show title
    gameContainer.style.display = 'none';

    // ========================================
    // Debug access
    // ========================================
    window.FRT3._runtime = {
        gameState: gameState,
        eventBus: eventBus,
        narrator: narrator,
        inventory: inventory,
        navigateToRoom: navigateToRoom,
        buildScene: buildScene,
        handleGiveItem: handleGiveItem
    };

})();
