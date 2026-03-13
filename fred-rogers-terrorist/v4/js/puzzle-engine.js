/**
 * puzzle-engine.js — Puzzle Condition Checking
 * Fred Rogers, Terrorist v4
 *
 * Evaluates whether giving items to characters solves their puzzles.
 * Handles multi-step puzzle chains and alternative solutions.
 */
window.FRT = window.FRT || {};

window.FRT.PuzzleEngine = class PuzzleEngine {
    constructor(gameState, eventBus) {
        this.state = gameState;
        this.eventBus = eventBus;
    }

    /**
     * Try giving an item to a character.
     * Returns { success: boolean, message: string }
     */
    tryGiveItem(characterId, itemId) {
        var charDef = FRT.CharacterDefs[characterId];
        var charState = this.state.characters[characterId];

        // No puzzle defined or already defeated
        if (!charDef || !charDef.puzzle || (charState && charState.defeated)) {
            return {
                success: false,
                message: "They don't seem interested in that."
            };
        }

        var puzzle = charDef.puzzle;

        // Check required flags
        if (puzzle.requiredFlags) {
            for (var i = 0; i < puzzle.requiredFlags.length; i++) {
                if (!this.state.getFlag(puzzle.requiredFlags[i])) {
                    return {
                        success: false,
                        message: puzzle.notReadyText || "Something isn't right yet."
                    };
                }
            }
        }

        // Check if item is accepted
        if (puzzle.acceptedItems && puzzle.acceptedItems.indexOf(itemId) !== -1) {
            // Correct item — run success callback
            if (puzzle.onCorrectItem) {
                puzzle.onCorrectItem(this.state, this.eventBus, itemId);
            }

            this.eventBus.emit('puzzle:solved', {
                characterId: characterId,
                itemId: itemId
            });

            return {
                success: true,
                message: '' // Success message handled by onCorrectItem
            };
        }

        // Wrong item
        if (puzzle.onWrongItem) {
            puzzle.onWrongItem(this.state, this.eventBus, itemId);
        }

        return {
            success: false,
            message: '' // Rejection message handled by onWrongItem
        };
    }

    /**
     * Try using an item on a hotspot/environment target.
     * Hotspots can define onUseItem callbacks.
     */
    tryUseItem(itemId, hotspot) {
        if (!hotspot || !hotspot.onUseItem) {
            return {
                success: false,
                message: "That doesn't work here."
            };
        }

        return hotspot.onUseItem(this.state, this.eventBus, itemId);
    }

    /**
     * Check if a specific flag-based condition is met.
     */
    checkCondition(flagName) {
        return !!this.state.getFlag(flagName);
    }
};
