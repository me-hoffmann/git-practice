/**
 * VerbSystem.js - Verb Selection & Two-Step Interaction State
 */
window.FRT = window.FRT || {};

window.FRT.VERBS = ['Look at', 'Pick up', 'Use', 'Talk to', 'Give', 'Open', 'Pull', 'Attack'];

window.FRT.VerbSystem = class VerbSystem {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.currentVerb = null;
        this.pendingItem = null;
    }

    selectVerb(verb) {
        this.currentVerb = verb;
        this.pendingItem = null;
        this.eventBus.emit('verb:select', { verb: verb });
    }

    setPendingItem(itemId) {
        this.pendingItem = itemId;
        this.eventBus.emit('verb:pendingItem', { verb: this.currentVerb, itemId: itemId });
    }

    cancel() {
        this.currentVerb = null;
        this.pendingItem = null;
        this.eventBus.emit('verb:cancel', {});
    }

    clearPending() {
        this.pendingItem = null;
    }

    // Get default verb for a hotspot type (used on right-click)
    getDefaultVerb(hotspotType) {
        switch (hotspotType) {
            case 'exit':       return 'Walk to';
            case 'item':       return 'Pick up';
            case 'character':  return 'Talk to';
            case 'searchable': return 'Look at';
            case 'scenery':    return 'Look at';
            default:           return 'Look at';
        }
    }
};
