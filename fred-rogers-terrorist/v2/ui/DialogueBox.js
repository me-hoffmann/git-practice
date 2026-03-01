/**
 * DialogueBox.js - Character Dialogue UI
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.DialogueBox = class DialogueBox {
    constructor(container, dialogueManager, eventBus, gameState) {
        this.container = container;
        this.dialogueManager = dialogueManager;
        this.eventBus = eventBus;
        this.state = gameState;
        this.container.className = 'dialogue-box';
        this.container.style.display = 'none';
        this.build();
        this.listen();
    }

    build() {
        this.portrait = document.createElement('div');
        this.portrait.className = 'dialogue-portrait';

        this.content = document.createElement('div');
        this.content.className = 'dialogue-content';

        this.speakerName = document.createElement('div');
        this.speakerName.className = 'dialogue-speaker';

        this.text = document.createElement('div');
        this.text.className = 'dialogue-text';

        this.options = document.createElement('div');
        this.options.className = 'dialogue-options';

        this.content.appendChild(this.speakerName);
        this.content.appendChild(this.text);
        this.content.appendChild(this.options);

        this.container.appendChild(this.portrait);
        this.container.appendChild(this.content);
    }

    listen() {
        var self = this;
        this.eventBus.on('dialogue:start', function(data) {
            self.show(data.characterId);
        });
        this.eventBus.on('dialogue:node', function(data) {
            self.showNode(data.node, data.options);
        });
        this.eventBus.on('dialogue:end', function() {
            self.hide();
        });
    }

    show(characterId) {
        var charDef = this.state.characters[characterId];
        this.container.style.display = 'flex';

        // Set portrait
        this.portrait.innerHTML = '';
        if (charDef && charDef.portrait) {
            var img = document.createElement('img');
            img.src = charDef.portrait;
            img.alt = charDef.name;
            img.onerror = function() {
                this.style.display = 'none';
            };
            this.portrait.appendChild(img);
        }

        // Show first node
        var node = this.dialogueManager.getCurrentNode();
        if (node) {
            var opts = this.dialogueManager.getAvailableOptions();
            this.showNode(node, opts);
        }
    }

    showNode(node, availableOptions) {
        this.speakerName.textContent = node.speaker || '';
        this.text.textContent = node.text || '';

        this.options.innerHTML = '';
        var self = this;

        if (!availableOptions || availableOptions.length === 0) {
            // Auto-close after a moment
            var closeBtn = document.createElement('button');
            closeBtn.className = 'dialogue-option-btn';
            closeBtn.textContent = '[Continue]';
            closeBtn.addEventListener('click', function() {
                self.dialogueManager.endDialogue();
            });
            this.options.appendChild(closeBtn);
            return;
        }

        for (var i = 0; i < availableOptions.length; i++) {
            var opt = availableOptions[i];
            var btn = document.createElement('button');
            btn.className = 'dialogue-option-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', (function(idx) {
                return function() {
                    self.dialogueManager.selectOption(idx);
                };
            })(i));
            this.options.appendChild(btn);
        }
    }

    hide() {
        this.container.style.display = 'none';
        this.portrait.innerHTML = '';
        this.speakerName.textContent = '';
        this.text.textContent = '';
        this.options.innerHTML = '';
    }
};
