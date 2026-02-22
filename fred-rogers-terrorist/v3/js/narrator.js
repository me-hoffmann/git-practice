/**
 * narrator.js — Typewriter narration system
 * Fred Rogers, Terrorist v3
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.Narrator = class Narrator {
    constructor(containerEl, eventBus) {
        this.el = containerEl;
        this.eventBus = eventBus;
        this.queue = [];
        this.typing = false;
        this.typeSpeed = 25; // ms per character
        this._currentInterval = null;
        this._currentLine = null;
        this._currentFullText = null; // Store full text for skip
        this._cursor = null;

        var self = this;
        eventBus.on('narration:show', function(data) {
            self.enqueue(data);
        });
        eventBus.on('narration:clear', function() {
            self.clear();
        });

        // Click narration area to skip current typewriter
        this.el.parentNode.addEventListener('click', function() {
            self.skipCurrent();
        });
    }

    enqueue(data) {
        if (typeof data === 'string') {
            data = { text: data, style: 'normal' };
        }
        this.queue.push(data);
        if (!this.typing) {
            this.processNext();
        }
    }

    processNext() {
        if (this.queue.length === 0) {
            this.typing = false;
            this._removeCursor();
            return;
        }
        this.typing = true;
        var data = this.queue.shift();
        this.typeText(data.text, data.style || 'normal');
    }

    typeText(text, style) {
        var p = document.createElement('p');
        p.className = 'narration-line narration-' + style;
        this.el.appendChild(p);
        this._currentLine = p;
        this._currentFullText = text;

        // Add blinking cursor
        this._removeCursor();
        this._cursor = document.createElement('span');
        this._cursor.className = 'narration-cursor';
        p.appendChild(this._cursor);

        // Scroll to bottom
        this.el.scrollTop = this.el.scrollHeight;

        var self = this;
        var i = 0;
        var chars = text.split('');

        this._currentInterval = setInterval(function() {
            if (i < chars.length) {
                // Insert character before cursor
                var textNode = document.createTextNode(chars[i]);
                p.insertBefore(textNode, self._cursor);
                i++;
                // Scroll as we type
                self.el.scrollTop = self.el.scrollHeight;
            } else {
                clearInterval(self._currentInterval);
                self._currentInterval = null;
                self._currentFullText = null;
                self._removeCursor();
                // Pause briefly, then process next
                setTimeout(function() {
                    self.processNext();
                }, 250);
            }
        }, this.typeSpeed);
    }

    skipCurrent() {
        if (!this._currentInterval) return;

        clearInterval(this._currentInterval);
        this._currentInterval = null;

        // Complete the current line instantly with the full text
        if (this._currentLine && this._currentFullText) {
            this._removeCursor();
            this._currentLine.textContent = this._currentFullText;
            this._currentFullText = null;
            this.el.scrollTop = this.el.scrollHeight;
        }

        // Move to next message
        var self = this;
        setTimeout(function() {
            self.processNext();
        }, 100);
    }

    _removeCursor() {
        if (this._cursor && this._cursor.parentNode) {
            this._cursor.parentNode.removeChild(this._cursor);
        }
        this._cursor = null;
    }

    clear() {
        if (this._currentInterval) {
            clearInterval(this._currentInterval);
            this._currentInterval = null;
        }
        this.queue = [];
        this.typing = false;
        this._currentFullText = null;
        this._removeCursor();
        this.el.innerHTML = '';
    }

    // Show text instantly (no typewriter)
    showInstant(text, style) {
        var p = document.createElement('p');
        p.className = 'narration-line narration-' + (style || 'normal');
        p.textContent = text;
        this.el.appendChild(p);
        this.el.scrollTop = this.el.scrollHeight;
    }
};
