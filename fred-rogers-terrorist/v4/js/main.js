/**
 * main.js — Game Entry Point & Wiring
 * Fred Rogers, Terrorist v4
 *
 * Wires together all modules: engine, scene renderer, narrator,
 * inventory, dialogue, puzzle engine, and UI interactions.
 */
(function() {
    'use strict';

    var FRT = window.FRT;

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
    var eventBus      = new FRT.EventBus();
    var gameState     = new FRT.GameState(eventBus);
    var narrator      = new FRT.Narrator(narrationText, eventBus);
    var inventory     = new FRT.Inventory(
        inventoryDrawer, drawerHandle, drawerContents, inventoryEmpty,
        gameState, eventBus
    );
    var sceneRenderer = new FRT.SceneRenderer(sceneLayer, gameState, eventBus);
    var dialogueMgr   = new FRT.DialogueManager(
        dialogueOvl, dialoguePort, dialogueSpeaker, dialogueText,
        dialogueOpts, dialogueDrop, gameState, eventBus
    );
    var puzzleEngine  = new FRT.PuzzleEngine(gameState, eventBus);

    // ========================================
    // Hotspot interaction
    // ========================================
    eventBus.on('hotspot:click', function(data) {
        var hs = data.hotspot;
        var roomId = data.roomId;
        var e = data.event;

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
    });

    function handleExitClick(hs, roomId) {
        var dir = hs.exitDir;
        var room = gameState.rooms[roomId];

        // Check if blocked (before null destination, so blocked text shows)
        if (hs.blocked && hs.blocked(gameState)) {
            eventBus.emit('narration:show', {
                text: hs.blockedText || "You can't go that way.",
                style: 'character'
            });
            return;
        }

        if (!room || !room.exits[dir]) {
            eventBus.emit('narration:show', {
                text: "You can't go that way.",
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

        if (hs.lookText) {
            actions.push({ icon: '\uD83D\uDC41\uFE0F', label: 'Look', action: 'look' });
        }

        if (hs.type === 'item') {
            var item = gameState.items[hs.itemId];
            if (item && item.takeable) {
                actions.push({ icon: '\u270B', label: 'Take', action: 'take' });
            }
        }

        if (hs.type === 'searchable') {
            actions.push({ icon: '\uD83D\uDD0D', label: 'Search', action: 'search' });
        }

        if (hs.onInteract) {
            actions.push({ icon: '\u270B', label: 'Use', action: 'use' });
        }

        if (hs.type === 'character') {
            var ch = gameState.characters[hs.characterId];
            if (ch && ch.dialogueId && !ch.defeated) {
                actions.push({ icon: '\uD83D\uDCAC', label: 'Talk to', action: 'talk' });
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
                btn.addEventListener('click', function(ev) {
                    ev.stopPropagation();
                    handleContextAction(act.action);
                });
            })(actions[i]);

            contextMenu.appendChild(btn);
        }

        // Position near click
        var x = e.clientX || e.pageX || 0;
        var y = e.clientY || e.pageY || 0;
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
        contextMenu.classList.add('visible');

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
                eventBus.emit('narration:show', {
                    text: hs.lookText,
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
            case 'use':
                if (hs.onInteract) {
                    hs.onInteract(gameState, eventBus);
                }
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

        gameState.removeItemFromRoom(hs.itemId);
        gameState.addToInventory(hs.itemId);

        eventBus.emit('narration:show', {
            text: 'You pick up the ' + item.name + '.',
            style: 'item'
        });

        sceneRenderer.buildScene(gameState.player.currentRoom);

        inventory.open();
        setTimeout(function() { inventory.close(); }, 2000);
    }

    function handleSearch(hs, roomId) {
        if (hs.onSearch) {
            hs.onSearch(gameState, eventBus);
            setTimeout(function() {
                sceneRenderer.buildScene(gameState.player.currentRoom);
            }, 300);
            if (gameState.player.inventory.length > 0) {
                inventory.open();
                setTimeout(function() { inventory.close(); }, 2500);
            }
        } else {
            eventBus.emit('narration:show', {
                text: 'You search carefully but find nothing of interest.',
                style: 'normal'
            });
        }
    }

    function handleTalkTo(hs) {
        if (!hs.characterId) return;
        dialogueMgr.start(hs.characterId);
    }

    // ========================================
    // Drag-and-drop onto characters / dialogue
    // ========================================
    eventBus.on('drag:start', function(data) {
        var charHotspots = sceneLayer.querySelectorAll('.hotspot[data-type="character"]');
        for (var i = 0; i < charHotspots.length; i++) {
            charHotspots[i].classList.add('drop-target');
        }
        if (dialogueOvl.classList.contains('active')) {
            dialogueDrop.classList.add('drag-over');
        }
    });

    eventBus.on('drag:end', function() {
        var targets = document.querySelectorAll('.drop-target');
        for (var i = 0; i < targets.length; i++) {
            targets[i].classList.remove('drop-target');
        }
        dialogueDrop.classList.remove('drag-over');
    });

    eventBus.on('drag:move', function(data) {
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

        // Dropped on dialogue drop zone
        if (target && (target === dialogueDrop || dialogueDrop.contains(target)) && dialogueMgr.isActive()) {
            handleGiveItem(dialogueMgr.getActiveCharacterId(), itemId);
            return;
        }

        // Dropped on character hotspot
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
    });

    function handleGiveItem(characterId, itemId) {
        // Close dialogue if open
        if (dialogueMgr.isActive()) {
            dialogueMgr.end();
        }

        var result = puzzleEngine.tryGiveItem(characterId, itemId);

        if (result.success) {
            // Refresh scene after a brief delay
            setTimeout(function() {
                sceneRenderer.buildScene(gameState.player.currentRoom);
            }, 500);
        }
    }

    // ========================================
    // Puzzle solved celebration
    // ========================================
    eventBus.on('puzzle:solved', function(data) {
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

        transitionOvl.classList.add('active');

        setTimeout(function() {
            narrator.clear();
            gameState.moveToRoom(roomId, direction);
        }, 300);
    }

    eventBus.on('room:enter', function(data) {
        var roomId = data.roomId;
        var room = gameState.rooms[roomId];
        var roomDef = FRT.RoomDefs[roomId];
        if (!room || !roomDef) return;

        // Update header
        roomHeader.textContent = room.name;

        // Build scene
        sceneRenderer.buildScene(roomId);

        // Slide animation
        var animName = 'fadeInGentle';
        var dir = data.direction;
        if (dir === 'east')  animName = 'slideFromEast';
        if (dir === 'west')  animName = 'slideFromWest';
        if (dir === 'north' || dir === 'up') animName = 'slideFromNorth';
        if (dir === 'south' || dir === 'down') animName = 'slideFromSouth';

        sceneLayer.style.animation = 'none';
        sceneLayer.offsetHeight; // force reflow
        sceneLayer.style.animation = animName + ' 0.4s ease-out forwards';

        setTimeout(function() {
            transitionOvl.classList.remove('active');
        }, 50);

        // Show room description
        eventBus.emit('narration:show', {
            text: roomDef.description,
            style: 'normal'
        });

        // Run onEnter callback
        if (roomDef.onEnter) {
            roomDef.onEnter(gameState, eventBus, data);
        }
    });

    // Scene refresh
    eventBus.on('scene:refresh', function() {
        var roomId = gameState.player.currentRoom;
        if (roomId) {
            sceneRenderer.buildScene(roomId);
        }
    });

    // ========================================
    // Score display
    // ========================================
    eventBus.on('score:change', function(data) {
        if (scoreDisplay) {
            scoreDisplay.textContent = 'Score: ' + data.score;
        }
    });

    // ========================================
    // Click outside to close things
    // ========================================
    document.addEventListener('click', function(e) {
        if (!contextMenu.contains(e.target)) {
            hideContextMenu();
        }
    });

    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (dialogueMgr.isActive()) {
                dialogueMgr.end();
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
            localStorage.setItem('frt4_save', saveData);
            eventBus.emit('narration:show', { text: 'Game saved!', style: 'hint' });
        } catch (e) {
            eventBus.emit('narration:show', { text: 'Failed to save game.', style: 'hint' });
        }
        menuOverlay.classList.add('hidden');
    });

    document.getElementById('menu-load').addEventListener('click', function() {
        try {
            var saveData = localStorage.getItem('frt4_save');
            if (!saveData) {
                eventBus.emit('narration:show', { text: 'No saved game found.', style: 'hint' });
                menuOverlay.classList.add('hidden');
                return;
            }
            gameState.init(FRT.RoomDefs, FRT.ItemDefs, FRT.CharacterDefs);
            gameState.deserialize(saveData);

            var roomId = gameState.player.currentRoom;
            if (roomId) {
                var room = gameState.rooms[roomId];
                if (room) {
                    roomHeader.textContent = room.name;
                    sceneRenderer.buildScene(roomId);
                    narrator.clear();
                    eventBus.emit('narration:show', { text: 'Game loaded!', style: 'hint' });
                }
            }
            inventory.render();
            scoreDisplay.textContent = 'Score: ' + gameState.player.score;
        } catch (e) {
            eventBus.emit('narration:show', { text: 'Failed to load game.', style: 'hint' });
        }
        menuOverlay.classList.add('hidden');
    });

    document.getElementById('menu-restart').addEventListener('click', function() {
        menuOverlay.classList.add('hidden');
        startGame();
    });

    menuOverlay.addEventListener('click', function(e) {
        if (e.target === menuOverlay) {
            menuOverlay.classList.add('hidden');
        }
    });

    // ========================================
    // Win screen
    // ========================================
    var winOverlay = document.getElementById('win-overlay');
    var winScoreValue = document.getElementById('win-score-value');

    eventBus.on('game:win', function() {
        winScoreValue.textContent = gameState.player.score;
        winOverlay.classList.remove('hidden');
    });

    document.getElementById('win-play-again').addEventListener('click', function() {
        winOverlay.classList.add('hidden');
        startGame();
    });

    // ========================================
    // Game start
    // ========================================
    function startGame() {
        gameState.init(FRT.RoomDefs, FRT.ItemDefs, FRT.CharacterDefs);

        narrator.clear();
        inventory.render();
        dialogueMgr.end();
        hideContextMenu();

        titleScreen.classList.add('hidden');
        gameContainer.style.display = '';

        eventBus.emit('game:started');
        gameState.moveToRoom('freds_house', 'instant');
    }

    // ========================================
    // Title screen
    // ========================================
    beginBtn.addEventListener('click', function() {
        startGame();
    });

    gameContainer.style.display = 'none';

    // ========================================
    // Debug access
    // ========================================
    window.FRT._runtime = {
        gameState: gameState,
        eventBus: eventBus,
        narrator: narrator,
        inventory: inventory,
        sceneRenderer: sceneRenderer,
        dialogueMgr: dialogueMgr,
        puzzleEngine: puzzleEngine,
        navigateToRoom: navigateToRoom
    };

})();
