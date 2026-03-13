/**
 * dialogue-manager.js — Dialogue Tree Navigation
 * Fred Rogers, Terrorist v4
 *
 * Manages branching dialogue conversations with characters.
 * Displays portrait, speaker name, text, and clickable options.
 * Supports item drop zones for give-item interactions.
 */
window.FRT = window.FRT || {};

window.FRT.DialogueManager = class DialogueManager {
    constructor(overlayEl, portraitEl, speakerEl, textEl, optionsEl, dropZoneEl, gameState, eventBus) {
        this.overlay = overlayEl;
        this.portrait = portraitEl;
        this.speaker = speakerEl;
        this.text = textEl;
        this.options = optionsEl;
        this.dropZone = dropZoneEl;
        this.state = gameState;
        this.eventBus = eventBus;

        this.active = null; // { characterId, def, charDef }
    }

    /**
     * Start a dialogue with a character.
     */
    start(characterId) {
        var ch = this.state.characters[characterId];
        var charDef = FRT.CharacterDefs[characterId];
        if (!ch || !ch.dialogueId) return;

        var dialogueDef = FRT.DialogueDefs[ch.dialogueId];
        if (!dialogueDef) return;

        this.active = {
            characterId: characterId,
            def: dialogueDef,
            charDef: charDef
        };

        // Set portrait
        if (charDef && charDef.portraitHTML) {
            this.portrait.innerHTML = charDef.portraitHTML;
        } else {
            this.portrait.innerHTML = '';
            this.portrait.textContent = charDef ? (charDef.portrait || '') : '';
        }

        // Show overlay
        this.overlay.classList.add('active');

        // Show drop zone if character has a puzzle
        if (charDef && charDef.puzzle) {
            this.dropZone.style.display = '';
        } else {
            this.dropZone.style.display = 'none';
        }

        // Navigate to start node
        this.showNode(dialogueDef.startNode);
    }

    /**
     * Show a specific dialogue node.
     */
    showNode(nodeId) {
        if (!this.active) return;

        var node = this.active.def.nodes[nodeId];
        if (!node) {
            this.end();
            return;
        }

        // Run node's onEnter callback if present
        if (node.onEnter) {
            node.onEnter(this.state, this.eventBus);
        }

        this.speaker.textContent = node.speaker || '';
        this.text.textContent = node.text || '';
        this.options.innerHTML = '';

        if (node.options) {
            for (var i = 0; i < node.options.length; i++) {
                var opt = node.options[i];

                // Check if option should be visible (conditional options)
                if (opt.visible && !opt.visible(this.state)) continue;

                var btn = document.createElement('button');
                btn.className = 'dialogue-option';
                btn.textContent = opt.text;

                var self = this;
                (function(option) {
                    btn.addEventListener('click', function() {
                        // Run option's onSelect callback if present
                        if (option.onSelect) {
                            option.onSelect(self.state, self.eventBus);
                        }

                        if (option.next === null || option.next === undefined) {
                            self.end();
                        } else {
                            self.showNode(option.next);
                        }
                    });
                })(opt);

                this.options.appendChild(btn);
            }
        }

        // If no options and no next, show a "close" button
        if (!node.options || node.options.length === 0) {
            var closeBtn = document.createElement('button');
            closeBtn.className = 'dialogue-option';
            closeBtn.textContent = '[End conversation]';
            var self = this;
            closeBtn.addEventListener('click', function() {
                self.end();
            });
            this.options.appendChild(closeBtn);
        }
    }

    /**
     * End the current dialogue.
     */
    end() {
        this.active = null;
        this.overlay.classList.remove('active');
        this.portrait.innerHTML = '';
    }

    /**
     * Check if dialogue is currently active.
     */
    isActive() {
        return this.active !== null;
    }

    /**
     * Get the current character ID in dialogue.
     */
    getActiveCharacterId() {
        return this.active ? this.active.characterId : null;
    }
};
