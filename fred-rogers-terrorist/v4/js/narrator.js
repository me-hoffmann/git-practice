/**
 * narrator.js — Typewriter narration system
 * Fred Rogers, Terrorist v4
 */
window.FRT = window.FRT || {};

window.FRT.Narrator = class Narrator {
    constructor(containerEl, eventBus) {
        this.el = containerEl;
        this.eventBus = eventBus;
        this.queue = [];
        this.typing = false;
        this.typeSpeed = 25;
        this._currentInterval = null;
        this._currentLine = null;
        this._currentFullText = null;
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

        this._removeCursor();
        this._cursor = document.createElement('span');
        this._cursor.className = 'narration-cursor';
        p.appendChild(this._cursor);

        this.el.parentNode.scrollTop = this.el.parentNode.scrollHeight;

        var self = this;
        var i = 0;
        var chars = text.split('');

        this._currentInterval = setInterval(function() {
            if (i < chars.length) {
                var textNode = document.createTextNode(chars[i]);
                p.insertBefore(textNode, self._cursor);
                i++;
                self.el.parentNode.scrollTop = self.el.parentNode.scrollHeight;
            } else {
                clearInterval(self._currentInterval);
                self._currentInterval = null;
                self._currentFullText = null;
                self._removeCursor();
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

        if (this._currentLine && this._currentFullText) {
            this._removeCursor();
            this._currentLine.textContent = this._currentFullText;
            this._currentFullText = null;
            this.el.scrollTop = this.el.scrollHeight;
        }

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

    showInstant(text, style) {
        var p = document.createElement('p');
        p.className = 'narration-line narration-' + (style || 'normal');
        p.textContent = text;
        this.el.appendChild(p);
        this.el.parentNode.scrollTop = this.el.parentNode.scrollHeight;
    }
};
