/**
 * Fred Rogers, Terrorist - Main Game File
 * Initializes the game and handles input
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

// Input handling
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('command-input');

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = input.value.trim();
            if (command) {
                // Echo the command
                const textArea = document.getElementById('game-text');
                const echo = document.createElement('p');
                echo.innerHTML = `<strong>&gt; ${escapeHtml(command)}</strong>`;
                echo.style.color = '#666';
                textArea.appendChild(echo);

                game.parseCommand(command);
                input.value = '';
            }
        } else if (e.key === 'ArrowUp') {
            // Command history
            e.preventDefault();
            if (game.commandHistory.length > 0) {
                game.historyIndex = Math.min(game.historyIndex + 1, game.commandHistory.length - 1);
                input.value = game.commandHistory[game.historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (game.historyIndex > 0) {
                game.historyIndex--;
                input.value = game.commandHistory[game.historyIndex];
            } else {
                game.historyIndex = -1;
                input.value = '';
            }
        }
    });

    // Keep focus on input
    document.addEventListener('click', (e) => {
        if (!e.target.closest('button') && !e.target.closest('.close-box')) {
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
