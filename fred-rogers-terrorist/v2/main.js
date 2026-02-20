/**
 * main.js - Game Entry Point
 * Fred Rogers, Terrorist v2
 *
 * Wires together all engine modules, data, and UI components.
 */
(function() {
    'use strict';

    var FRT = window.FRT;

    // ========================================
    // DOM elements
    // ========================================
    var canvas = document.getElementById('scene-canvas');
    var roomNameOverlay = document.getElementById('room-name-overlay');
    var transitionOverlay = document.getElementById('transition-overlay');
    var gameOverOverlay = document.getElementById('game-over-overlay');

    // ========================================
    // Core systems
    // ========================================
    var eventBus = new FRT.EventBus();
    var gameState = new FRT.GameState(eventBus);
    var sceneRenderer = new FRT.SceneRenderer(canvas, eventBus, gameState);
    var verbSystem = new FRT.VerbSystem(eventBus);
    var dialogueManager = new FRT.DialogueManager(gameState, eventBus, FRT.DialogueDefs);
    var combatManager = new FRT.CombatManager(gameState, eventBus);
    var transitionManager = new FRT.TransitionManager(transitionOverlay, eventBus);
    var saveManager = new FRT.SaveManager(gameState);

    // CommandExecutor needs access to scripts
    var commandExecutor = new FRT.CommandExecutor(gameState, eventBus, verbSystem, dialogueManager, combatManager);

    // InputManager
    var inputManager = new FRT.InputManager(canvas, eventBus, sceneRenderer, verbSystem, commandExecutor);

    // ========================================
    // UI Components
    // ========================================
    var verbPanel = new FRT.VerbPanel(document.getElementById('verb-panel'), verbSystem, eventBus);
    var inventoryBar = new FRT.InventoryBar(document.getElementById('inventory-bar'), gameState, eventBus, verbSystem);
    var statusBar = new FRT.StatusBar(document.getElementById('status-bar'), gameState, eventBus, verbSystem);
    var messageLog = new FRT.MessageLog(document.getElementById('message-log'), eventBus);
    var dialogueBox = new FRT.DialogueBox(document.getElementById('dialogue-container'), dialogueManager, eventBus, gameState);
    var combatOverlay = new FRT.CombatOverlay(document.getElementById('combat-container'), combatManager, eventBus, gameState);
    var cursorManager = new FRT.CursorManager(canvas, verbSystem, eventBus);
    var gameMenu = new FRT.GameMenu(document.getElementById('game-menu'), saveManager, eventBus);

    // ========================================
    // Event wiring
    // ========================================

    // Room enter: show room, render scene, show description
    eventBus.on('room:enter', function(data) {
        var room = gameState.rooms[data.roomId];
        if (!room) return;

        // Update room name overlay
        roomNameOverlay.textContent = room.name;

        // Load and render the scene
        sceneRenderer.loadScene(data.roomId);

        // Show room description
        eventBus.emit('message:add', { text: room.description });

        // Show items in room
        var roomItems = gameState.getRoomItems();
        if (roomItems.length > 0) {
            var itemNames = roomItems.map(function(id) {
                var item = gameState.items[id];
                return item ? item.name : id;
            });
            eventBus.emit('message:add', { text: 'You see: ' + itemNames.join(', ') + '.' });
        }

        // Show characters in room
        var roomChars = gameState.getRoomCharacters();
        if (roomChars.length > 0) {
            for (var i = 0; i < roomChars.length; i++) {
                var c = gameState.characters[roomChars[i]];
                if (c) {
                    eventBus.emit('message:add', { text: c.name + ' is here.' });
                }
            }
        }

        // Run room enter script
        if (room.onEnter) {
            var scriptName = room.onEnter;
            if (typeof scriptName === 'string' && scriptName.indexOf('$script:') === 0) {
                var fn = FRT.Scripts[scriptName.substring(8)];
                if (fn) fn(gameState, eventBus, data);
            }
        }

        // Check for hostile ambush
        for (var j = 0; j < roomChars.length; j++) {
            var charId = roomChars[j];
            var ch = gameState.characters[charId];
            if (ch && ch.hostile && ch.alive && !ch.defeated) {
                // Start combat after a brief delay
                (function(cid) {
                    setTimeout(function() {
                        combatManager.startCombat(cid);
                    }, 500);
                })(charId);
                break; // only one ambush at a time
            }
        }
    });

    // Game over
    eventBus.on('game:over', function(data) {
        showGameOver(data.won, data.message);
    });

    // Game restart
    eventBus.on('game:restart', function() {
        startGame();
    });

    // Game loaded (from save)
    eventBus.on('game:loaded', function() {
        var roomId = gameState.player.currentRoom;
        if (roomId) {
            roomNameOverlay.textContent = gameState.rooms[roomId].name;
            sceneRenderer.loadScene(roomId);
            inventoryBar.render();
        }
    });

    // Menu button
    document.getElementById('menu-btn').addEventListener('click', function() {
        gameMenu.toggle();
    });

    // Escape key: cancel verb or open menu
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (dialogueManager.active) {
                dialogueManager.endDialogue();
            } else if (verbSystem.currentVerb) {
                verbSystem.cancel();
            } else {
                gameMenu.toggle();
            }
        }
    });

    // ========================================
    // Game Over screen
    // ========================================
    function showGameOver(won, message) {
        gameOverOverlay.classList.remove('hidden');
        gameOverOverlay.innerHTML = '';

        var title = document.createElement('div');
        title.className = 'game-over-title ' + (won ? 'win' : 'lose');
        title.textContent = won ? 'YOU WIN!' : 'GAME OVER';

        var msg = document.createElement('div');
        msg.className = 'game-over-message';
        msg.textContent = message;

        var score = document.createElement('div');
        score.className = 'game-over-score';
        score.textContent = 'Final Score: ' + gameState.player.score;

        var btn = document.createElement('button');
        btn.className = 'game-over-btn';
        btn.textContent = 'Play Again';
        btn.addEventListener('click', function() {
            gameOverOverlay.classList.add('hidden');
            startGame();
        });

        gameOverOverlay.appendChild(title);
        gameOverOverlay.appendChild(msg);
        gameOverOverlay.appendChild(score);
        gameOverOverlay.appendChild(btn);
    }

    // ========================================
    // Start / Initialize Game
    // ========================================
    function startGame() {
        // Hide game over
        gameOverOverlay.classList.add('hidden');

        // Initialize game state with data definitions
        gameState.init(FRT.RoomDefs, FRT.ItemDefs, FRT.CharacterDefs);

        // Copy character definitions back (for reference data like combatMessages)
        for (var cid in FRT.CharacterDefs) {
            var def = FRT.CharacterDefs[cid];
            var runtime = gameState.characters[cid];
            if (runtime && def.combatMessages) {
                runtime.combatMessages = def.combatMessages;
            }
            if (runtime && def.portrait) {
                runtime.portrait = def.portrait;
            }
            if (runtime && def.icon) {
                runtime.icon = def.icon;
            }
        }

        // Copy item reference data
        for (var iid in FRT.ItemDefs) {
            var idef = FRT.ItemDefs[iid];
            var iruntime = gameState.items[iid];
            if (iruntime && idef.icon) {
                iruntime.icon = idef.icon;
            }
        }

        // Clear message log
        messageLog.clear();

        // Reset inventory display
        inventoryBar.render();

        // Initial HP/Score display
        eventBus.emit('hp:change', { hp: gameState.player.hp, maxHp: gameState.player.maxHp });
        eventBus.emit('score:change', { score: 0 });

        // Enter starting room
        var startRoom = FRT.Constants.START_ROOM || 'introduction';
        gameState.moveToRoom(startRoom);
    }

    // ========================================
    // Copy scene assets from parent directory if available
    // ========================================
    // The original monochrome PNGs are in ../scenes/
    // We reference them from assets/scenes/ in room definitions.
    // For now, the art paths will try to load from assets/scenes/.
    // If no art is found, SceneRenderer falls back to room name display.

    // ========================================
    // Debug / test access
    // ========================================
    window.FRT._runtime = {
        gameState: gameState,
        eventBus: eventBus,
        combatManager: combatManager,
        dialogueManager: dialogueManager,
        commandExecutor: commandExecutor,
        sceneRenderer: sceneRenderer,
        verbSystem: verbSystem,
        saveManager: saveManager
    };

    // ========================================
    // Launch!
    // ========================================
    startGame();

})();
