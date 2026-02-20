/**
 * EventBus.js - Pub/Sub Event System
 * Part of Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.EventBus = class EventBus {
    constructor() {
        this._listeners = {};
    }

    on(event, callback) {
        if (!this._listeners[event]) this._listeners[event] = [];
        this._listeners[event].push(callback);
        return () => this.off(event, callback);
    }

    off(event, callback) {
        if (!this._listeners[event]) return;
        this._listeners[event] = this._listeners[event].filter(cb => cb !== callback);
        if (this._listeners[event].length === 0) delete this._listeners[event];
    }

    emit(event, data) {
        if (!this._listeners[event]) return;
        var listeners = this._listeners[event].slice();
        for (var i = 0; i < listeners.length; i++) {
            try { listeners[i](data); }
            catch (err) { console.error('[EventBus] Error in "' + event + '":', err); }
        }
    }
};
