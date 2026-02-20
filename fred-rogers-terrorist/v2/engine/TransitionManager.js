/**
 * TransitionManager.js - Room Transition Animations
 * Uses a DOM overlay element for fade transitions.
 */
window.FRT = window.FRT || {};

window.FRT.TransitionManager = class TransitionManager {
    constructor(overlayElement, eventBus) {
        this.overlay = overlayElement;
        this.eventBus = eventBus;
        this.transitioning = false;

        var self = this;
        eventBus.on('room:enter', function(data) {
            if (data.direction && data.direction !== 'instant') {
                self.fadeTransition();
            }
        });
    }

    fadeTransition() {
        if (this.transitioning) return;
        this.transitioning = true;
        var overlay = this.overlay;
        var self = this;

        // Quick fade in then fade out
        overlay.style.transition = 'opacity 0.15s ease';
        overlay.style.opacity = '1';

        setTimeout(function() {
            overlay.style.transition = 'opacity 0.3s ease';
            overlay.style.opacity = '0';
            setTimeout(function() {
                self.transitioning = false;
            }, 300);
        }, 150);
    }
};
