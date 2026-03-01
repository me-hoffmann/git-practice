/**
 * MessageLog.js - Scrolling Message Area
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.MessageLog = class MessageLog {
    constructor(container, eventBus) {
        this.container = container;
        this.eventBus = eventBus;
        this.container.className = 'message-log';
        this.maxMessages = 100;
        this.listen();
    }

    listen() {
        var self = this;
        this.eventBus.on('message:add', function(data) {
            self.addMessage(data.text, data.type);
        });
        this.eventBus.on('room:enter', function(data) {
            self.addDivider();
        });
        this.eventBus.on('game:over', function(data) {
            self.addMessage(data.message, data.won ? 'win-msg' : 'lose-msg');
        });
    }

    addMessage(text, type) {
        if (!text || text.trim() === '') {
            // Add spacer
            var spacer = document.createElement('div');
            spacer.className = 'message-spacer';
            this.container.appendChild(spacer);
        } else {
            var el = document.createElement('div');
            el.className = 'message';
            if (type) el.classList.add(type);
            el.textContent = text;
            this.container.appendChild(el);
        }

        // Trim old messages
        while (this.container.childNodes.length > this.maxMessages) {
            this.container.removeChild(this.container.firstChild);
        }

        // Auto-scroll to bottom
        this.container.scrollTop = this.container.scrollHeight;
    }

    addDivider() {
        var div = document.createElement('hr');
        div.className = 'message-divider';
        this.container.appendChild(div);
        this.container.scrollTop = this.container.scrollHeight;
    }

    clear() {
        this.container.innerHTML = '';
    }
};
