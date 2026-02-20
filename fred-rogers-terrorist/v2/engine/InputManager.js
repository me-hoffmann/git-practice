/**
 * InputManager.js - Mouse/Keyboard Input Routing
 */
window.FRT = window.FRT || {};

window.FRT.InputManager = class InputManager {
    constructor(canvas, eventBus, sceneRenderer, verbSystem, commandExecutor) {
        this.canvas = canvas;
        this.eventBus = eventBus;
        this.renderer = sceneRenderer;
        this.verbSystem = verbSystem;
        this.enabled = true;

        canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        canvas.addEventListener('click', this.onClick.bind(this));
        canvas.addEventListener('contextmenu', this.onRightClick.bind(this));
        document.addEventListener('keydown', this.onKeyDown.bind(this));
    }

    getCanvasCoords(e) {
        var rect = this.canvas.getBoundingClientRect();
        var scaleX = this.canvas.width / rect.width;
        var scaleY = this.canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    onMouseMove(e) {
        if (!this.enabled) return;
        var coords = this.getCanvasCoords(e);
        var hotspot = this.renderer.hitTest(coords.x, coords.y);
        this.renderer.setHoveredHotspot(hotspot);
        this.eventBus.emit('hotspot:hover', { hotspot: hotspot });
    }

    onClick(e) {
        if (!this.enabled) return;
        var coords = this.getCanvasCoords(e);
        var hotspot = this.renderer.hitTest(coords.x, coords.y);
        if (!hotspot) return;

        var verb = this.verbSystem.currentVerb;
        // If no verb selected, use smart default
        if (!verb) {
            verb = this.verbSystem.getDefaultVerb(hotspot.type);
        }

        this.eventBus.emit('action:perform', {
            verb: verb,
            hotspot: hotspot,
            pendingItem: this.verbSystem.pendingItem
        });
    }

    onRightClick(e) {
        e.preventDefault();
        if (!this.enabled) return;
        var coords = this.getCanvasCoords(e);
        var hotspot = this.renderer.hitTest(coords.x, coords.y);
        if (!hotspot) return;

        // Right-click: use smart default verb
        var defaultVerb = this.verbSystem.getDefaultVerb(hotspot.type);
        this.eventBus.emit('action:perform', {
            verb: defaultVerb,
            hotspot: hotspot,
            pendingItem: null
        });
    }

    onKeyDown(e) {
        if (!this.enabled) return;
        // Number keys 1-8 for verb selection
        var verbs = window.FRT.VERBS;
        var num = parseInt(e.key);
        if (num >= 1 && num <= 8 && verbs[num - 1]) {
            e.preventDefault();
            this.verbSystem.selectVerb(verbs[num - 1]);
        }
        // Escape: cancel verb or handled by main.js
    }

    enable() { this.enabled = true; }
    disable() { this.enabled = false; }
};
