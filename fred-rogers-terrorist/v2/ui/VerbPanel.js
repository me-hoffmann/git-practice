/**
 * VerbPanel.js - Verb Button Grid
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.VerbPanel = class VerbPanel {
    constructor(container, verbSystem, eventBus) {
        this.container = container;
        this.verbSystem = verbSystem;
        this.eventBus = eventBus;
        this.buttons = {};
        this.build();
        this.listen();
    }

    build() {
        this.container.innerHTML = '';
        this.container.className = 'verb-panel';
        var verbs = window.FRT.VERBS || ['Look at', 'Pick up', 'Use', 'Talk to', 'Give', 'Open', 'Pull', 'Attack'];
        var self = this;
        for (var i = 0; i < verbs.length; i++) {
            var btn = document.createElement('button');
            btn.className = 'verb-btn';
            btn.textContent = verbs[i];
            btn.dataset.verb = verbs[i];
            btn.dataset.index = i;
            btn.addEventListener('click', function(e) {
                self.verbSystem.selectVerb(e.target.dataset.verb);
            });
            this.container.appendChild(btn);
            this.buttons[verbs[i]] = btn;
        }
    }

    listen() {
        var self = this;
        this.eventBus.on('verb:select', function(data) {
            self.updateHighlight(data.verb);
        });
        this.eventBus.on('verb:cancel', function() {
            self.updateHighlight(null);
        });
    }

    updateHighlight(activeVerb) {
        for (var verb in this.buttons) {
            if (verb === activeVerb) {
                this.buttons[verb].classList.add('active');
            } else {
                this.buttons[verb].classList.remove('active');
            }
        }
    }
};
