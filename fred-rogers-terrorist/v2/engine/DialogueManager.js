/**
 * DialogueManager.js - Dialogue Tree Traversal
 */
window.FRT = window.FRT || {};

window.FRT.DialogueManager = class DialogueManager {
    constructor(gameState, eventBus, dialogueData) {
        this.state = gameState;
        this.eventBus = eventBus;
        this.dialogueData = dialogueData || {};
        this.active = false;
        this.currentCharacterId = null;
        this.currentNodeId = null;
    }

    startDialogue(charId) {
        var tree = this.dialogueData[charId];
        if (!tree) {
            // No dialogue tree — just show a default message
            var c = this.state.characters[charId];
            this.eventBus.emit('message:add', {
                text: (c ? c.name : 'They') + " doesn't seem interested in talking."
            });
            return;
        }

        this.active = true;
        this.currentCharacterId = charId;
        this.currentNodeId = tree.startNode || 'greeting';

        // Run node action if any
        var node = this.getCurrentNode();
        if (node && node.action) {
            this.runAction(node.action);
        }

        this.eventBus.emit('dialogue:start', { characterId: charId });

        // Emit the node for the UI
        var options = this.getAvailableOptions();
        this.eventBus.emit('dialogue:node', { node: node, options: options });
    }

    getCurrentNode() {
        if (!this.active || !this.currentCharacterId) return null;
        var tree = this.dialogueData[this.currentCharacterId];
        if (!tree || !tree.nodes) return null;
        return tree.nodes[this.currentNodeId] || null;
    }

    getAvailableOptions() {
        var node = this.getCurrentNode();
        if (!node || !node.options) return [];
        var self = this;
        return node.options.filter(function(opt) {
            if (!opt.condition) return true;
            // Check condition as $script: ref or flag
            if (typeof opt.condition === 'string' && opt.condition.indexOf('$script:') === 0) {
                var name = opt.condition.substring(8);
                var fn = window.FRT.Scripts[name];
                return fn ? fn(self.state, self.eventBus) : false;
            }
            return self.state.getFlag(opt.condition);
        });
    }

    selectOption(index) {
        var options = this.getAvailableOptions();
        if (index < 0 || index >= options.length) return;
        var opt = options[index];

        // Run action if specified
        if (opt.action) {
            this.runAction(opt.action);
        }

        // Navigate to next node
        if (opt.next === null || opt.next === undefined) {
            this.endDialogue();
        } else {
            this.currentNodeId = opt.next;

            var node = this.getCurrentNode();
            if (node && node.action) {
                this.runAction(node.action);
            }

            var newOptions = this.getAvailableOptions();
            this.eventBus.emit('dialogue:node', { node: node, options: newOptions });
        }
    }

    runAction(actionRef) {
        if (typeof actionRef === 'string' && actionRef.indexOf('$script:') === 0) {
            var name = actionRef.substring(8);
            var fn = window.FRT.Scripts[name];
            if (fn) fn(this.state, this.eventBus);
        }
    }

    endDialogue() {
        this.active = false;
        var charId = this.currentCharacterId;
        this.currentCharacterId = null;
        this.currentNodeId = null;
        this.eventBus.emit('dialogue:end', { charId: charId });
    }
};
