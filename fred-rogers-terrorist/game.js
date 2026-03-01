/**
 * Fred Rogers, Terrorist - Main Game File
 * Initializes the game, handles input, arrow keys, context menus
 */

let game;

function initializeGame() {
    game = new GameEngine();
    loadGameData(game);

    // Start the game
    game.clearOutput();
    game.enterRoom('introduction');
    game.flushOutput();
    game.toggleInventoryWindow(true);
}

// Run a command programmatically (from buttons, clicks, arrow keys)
function runCommand(command) {
    if (!game || game.gameOver) return;

    // Echo it
    const textArea = document.getElementById('game-text');
    const echo = document.createElement('p');
    echo.innerHTML = `<strong>&gt; ${escapeHtml(command)}</strong>`;
    echo.style.color = '#666';
    textArea.appendChild(echo);

    game.parseCommand(command);

    // Refocus input
    document.getElementById('command-input').focus();
}

// Context menu for items (in room or inventory)
function showItemMenu(event, itemId, location) {
    event.preventDefault();
    event.stopPropagation();

    const menu = document.getElementById('context-menu');
    const menuItems = document.getElementById('context-menu-items');
    menuItems.innerHTML = '';

    const item = game.items[itemId];
    if (!item) return;

    // Header
    const header = document.createElement('div');
    header.className = 'context-option';
    header.style.fontWeight = 'bold';
    header.style.borderBottom = '1px solid #000';
    header.style.cursor = 'default';
    header.textContent = item.name;
    menuItems.appendChild(header);

    if (location === 'room') {
        // Item is on the ground
        if (item.takeable) {
            addContextOption(menuItems, 'Take', () => runCommand(`take ${item.name}`));
        }
        addContextOption(menuItems, 'Examine', () => runCommand(`examine ${item.name}`));
        if (item.onUse) {
            addContextOption(menuItems, 'Use', () => runCommand(`use ${item.name}`));
        }
    } else if (location === 'inventory') {
        // Item is in inventory
        addContextOption(menuItems, 'Use', () => runCommand(`use ${item.name}`));
        addContextOption(menuItems, 'Drop', () => runCommand(`drop ${item.name}`));

        // If there's a character in the room, offer "Give to..."
        const room = game.rooms[game.player.currentRoom];
        room.characters.forEach(charId => {
            const char = game.characters[charId];
            if (char && char.alive && !char.defeated) {
                addContextOption(menuItems, `Give to ${char.name}`, () => runCommand(`give ${item.name} to ${char.name}`));
            }
        });

        addContextOption(menuItems, 'Read', () => runCommand(`read ${item.name}`));
    }

    positionContextMenu(menu, event);
}

// Context menu for characters
function showCharacterMenu(event, charId) {
    event.preventDefault();
    event.stopPropagation();

    const menu = document.getElementById('context-menu');
    const menuItems = document.getElementById('context-menu-items');
    menuItems.innerHTML = '';

    const char = game.characters[charId];
    if (!char || !char.alive) return;

    // Header
    const header = document.createElement('div');
    header.className = 'context-option';
    header.style.fontWeight = 'bold';
    header.style.borderBottom = '1px solid #000';
    header.style.cursor = 'default';
    header.textContent = char.name;
    menuItems.appendChild(header);

    addContextOption(menuItems, 'Talk to', () => runCommand(`talk to ${char.name}`));
    addContextOption(menuItems, 'Attack', () => runCommand(`attack ${char.name}`));

    // Offer to give items from inventory
    if (game.player.inventory.length > 0) {
        const sep = document.createElement('div');
        sep.className = 'context-separator';
        menuItems.appendChild(sep);

        const giveHeader = document.createElement('div');
        giveHeader.className = 'context-option';
        giveHeader.style.fontStyle = 'italic';
        giveHeader.style.cursor = 'default';
        giveHeader.style.color = '#666';
        giveHeader.textContent = 'Give item:';
        menuItems.appendChild(giveHeader);

        game.player.inventory.forEach(itemId => {
            const item = game.items[itemId];
            if (item) {
                addContextOption(menuItems, `  ${item.name}`, () => runCommand(`give ${item.name} to ${char.name}`));
            }
        });
    }

    positionContextMenu(menu, event);
}

function addContextOption(container, label, action) {
    const opt = document.createElement('div');
    opt.className = 'context-option';
    opt.textContent = label;
    opt.onclick = () => {
        hideContextMenu();
        action();
    };
    container.appendChild(opt);
}

function positionContextMenu(menu, event) {
    menu.classList.remove('hidden');

    // Position near the click
    let x = event.clientX;
    let y = event.clientY;

    // Make sure it doesn't overflow off screen
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    // Adjust if off-screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = (window.innerWidth - rect.width - 4) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = (window.innerHeight - rect.height - 4) + 'px';
    }
}

function hideContextMenu() {
    document.getElementById('context-menu').classList.add('hidden');
}

// Input handling
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('command-input');

    // Text input handler
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                const textArea = document.getElementById('game-text');
                const echo = document.createElement('p');
                echo.innerHTML = `<strong>&gt; ${escapeHtml(command)}</strong>`;
                echo.style.color = '#666';
                textArea.appendChild(echo);

                game.parseCommand(command);
                input.value = '';
            }
        } else if (e.key === 'ArrowUp' && !e.shiftKey && document.activeElement === input) {
            // Command history (only when input is focused and no shift)
            if (input.value === '' || game.historyIndex >= 0) {
                e.preventDefault();
                if (game.commandHistory.length > 0) {
                    game.historyIndex = Math.min(game.historyIndex + 1, game.commandHistory.length - 1);
                    input.value = game.commandHistory[game.historyIndex];
                }
            }
        } else if (e.key === 'ArrowDown' && !e.shiftKey && document.activeElement === input) {
            if (game.historyIndex >= 0) {
                e.preventDefault();
                if (game.historyIndex > 0) {
                    game.historyIndex--;
                    input.value = game.commandHistory[game.historyIndex];
                } else {
                    game.historyIndex = -1;
                    input.value = '';
                }
            }
        }
    });

    // Arrow key navigation (global, when input is not being typed in)
    document.addEventListener('keydown', (e) => {
        // Only handle arrow keys when input field is empty or not focused
        const inputFocused = document.activeElement === input;
        const inputHasText = input.value.trim().length > 0;

        // If input has text, let arrow keys work normally for text editing
        if (inputFocused && inputHasText) return;

        // Arrow key navigation
        if (e.key === 'ArrowUp' && !inputHasText) {
            if (e.shiftKey) {
                e.preventDefault();
                runCommand('up');
            } else if (!inputFocused) {
                e.preventDefault();
                runCommand('north');
            }
        } else if (e.key === 'ArrowDown' && !inputHasText) {
            if (e.shiftKey) {
                e.preventDefault();
                runCommand('down');
            } else if (!inputFocused) {
                e.preventDefault();
                runCommand('south');
            }
        } else if (e.key === 'ArrowLeft') {
            if (!inputFocused || !inputHasText) {
                e.preventDefault();
                runCommand('west');
            }
        } else if (e.key === 'ArrowRight') {
            if (!inputFocused || !inputHasText) {
                e.preventDefault();
                runCommand('east');
            }
        }
    });

    // Click anywhere to dismiss context menu
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#context-menu')) {
            hideContextMenu();
        }
        // Refocus input unless clicking on buttons/menus
        if (!e.target.closest('button') && !e.target.closest('.close-box') &&
            !e.target.closest('#context-menu') && !e.target.closest('.clickable-item') &&
            !e.target.closest('.clickable-char') && !e.target.closest('.inv-item')) {
            input.focus();
        }
    });

    // Initialize
    initializeGame();
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
