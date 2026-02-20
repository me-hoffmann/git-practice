/**
 * CursorManager.js - Custom Cursor per Verb/Hotspot
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.CursorManager = class CursorManager {
    constructor(canvas, verbSystem, eventBus) {
        this.canvas = canvas;
        this.verbSystem = verbSystem;
        this.eventBus = eventBus;
        this.currentCursor = 'default';
        this.listen();
    }

    listen() {
        var self = this;
        this.eventBus.on('verb:select', function(data) {
            self.updateForVerb(data.verb);
        });
        this.eventBus.on('verb:cancel', function() {
            self.setCursor('default');
        });
        this.eventBus.on('hotspot:hover', function(data) {
            if (data.hotspot) {
                self.updateForHotspot(data.hotspot);
            } else {
                self.updateForVerb(self.verbSystem.currentVerb);
            }
        });
    }

    updateForVerb(verb) {
        if (!verb) {
            this.setCursor('default');
            return;
        }
        switch (verb) {
            case 'Look at': this.setCursor('help'); break;
            case 'Pick up': this.setCursor('grab'); break;
            case 'Use': this.setCursor('cell'); break;
            case 'Talk to': this.setCursor('pointer'); break;
            case 'Give': this.setCursor('pointer'); break;
            case 'Open': this.setCursor('pointer'); break;
            case 'Pull': this.setCursor('grab'); break;
            case 'Attack': this.setCursor('crosshair'); break;
            default: this.setCursor('default');
        }
    }

    updateForHotspot(hotspot) {
        if (!hotspot) {
            this.updateForVerb(this.verbSystem.currentVerb);
            return;
        }
        switch (hotspot.type) {
            case 'exit': this.setCursor('pointer'); break;
            case 'item': this.setCursor('grab'); break;
            case 'character': this.setCursor('pointer'); break;
            case 'searchable': this.setCursor('zoom-in'); break;
            default: this.setCursor('pointer');
        }
    }

    setCursor(cursor) {
        if (this.currentCursor !== cursor) {
            this.canvas.style.cursor = cursor;
            this.currentCursor = cursor;
        }
    }
};
