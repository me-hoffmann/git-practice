/**
 * SceneRenderer.js - Canvas Scene Rendering + Hotspot Hit Testing
 */
window.FRT = window.FRT || {};

window.FRT.SceneRenderer = class SceneRenderer {
    constructor(canvas, eventBus, gameState) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.eventBus = eventBus;
        this.state = gameState;
        this.imageCache = {};
        this.hoveredHotspot = null;
        this.currentBackground = null;
    }

    async loadScene(roomId) {
        var room = this.state.rooms[roomId];
        if (!room) return;
        var artPath = room.art;
        if (artPath) {
            try {
                this.currentBackground = await this.loadImage(artPath);
            } catch (e) {
                console.warn('Could not load scene art:', artPath);
                this.currentBackground = null;
            }
        } else {
            this.currentBackground = null;
        }
        this.render();
    }

    render() {
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;

        // Clear
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);

        // Draw background
        if (this.currentBackground) {
            ctx.imageSmoothingEnabled = false;
            var img = this.currentBackground;
            var scaleX = w / img.width;
            var scaleY = h / img.height;
            var scale = Math.min(scaleX, scaleY);
            var dw = img.width * scale;
            var dh = img.height * scale;
            var dx = (w - dw) / 2;
            var dy = (h - dh) / 2;
            ctx.drawImage(img, dx, dy, dw, dh);
        } else {
            // No art — show room name in center
            ctx.fillStyle = '#000';
            ctx.font = 'bold 16px Monaco, monospace';
            ctx.textAlign = 'center';
            var room = this.state.rooms[this.state.player.currentRoom];
            if (room) ctx.fillText(room.name, w / 2, h / 2);
            ctx.textAlign = 'left';
        }

        // Draw hotspot highlight
        if (this.hoveredHotspot) {
            this.drawHotspotHighlight(this.hoveredHotspot);
        }

        // Draw exit indicators
        this.drawExitIndicators();

        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, w - 2, h - 2);
    }

    drawHotspotHighlight(hotspot) {
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;
        var poly = hotspot.polygon;
        if (!poly || poly.length < 3) return;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(poly[0][0] * w, poly[0][1] * h);
        for (var i = 1; i < poly.length; i++) {
            ctx.lineTo(poly[i][0] * w, poly[i][1] * h);
        }
        ctx.closePath();

        if (hotspot.type === 'exit') {
            ctx.fillStyle = 'rgba(100, 200, 255, 0.2)';
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)';
        } else if (hotspot.type === 'item') {
            ctx.fillStyle = 'rgba(100, 255, 100, 0.2)';
            ctx.strokeStyle = 'rgba(100, 255, 100, 0.5)';
        } else if (hotspot.type === 'character') {
            ctx.fillStyle = 'rgba(255, 150, 100, 0.2)';
            ctx.strokeStyle = 'rgba(255, 150, 100, 0.5)';
        } else {
            ctx.fillStyle = 'rgba(255, 255, 100, 0.2)';
            ctx.strokeStyle = 'rgba(255, 255, 100, 0.5)';
        }
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    drawExitIndicators() {
        var ctx = this.ctx;
        var w = this.canvas.width;
        var h = this.canvas.height;
        var room = this.state.rooms[this.state.player.currentRoom];
        if (!room) return;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;

        var exits = room.exits;
        // Small arrow indicators
        if (exits.north) { this.drawArrow(ctx, w/2, 12, 'up'); }
        if (exits.south) { this.drawArrow(ctx, w/2, h-12, 'down'); }
        if (exits.east)  { this.drawArrow(ctx, w-12, h/2, 'right'); }
        if (exits.west)  { this.drawArrow(ctx, 12, h/2, 'left'); }
        ctx.restore();
    }

    drawArrow(ctx, x, y, dir) {
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        var s = 8;
        switch(dir) {
            case 'up':    ctx.moveTo(x, y-s); ctx.lineTo(x-s, y+s); ctx.lineTo(x+s, y+s); break;
            case 'down':  ctx.moveTo(x, y+s); ctx.lineTo(x-s, y-s); ctx.lineTo(x+s, y-s); break;
            case 'left':  ctx.moveTo(x-s, y); ctx.lineTo(x+s, y-s); ctx.lineTo(x+s, y+s); break;
            case 'right': ctx.moveTo(x+s, y); ctx.lineTo(x-s, y-s); ctx.lineTo(x-s, y+s); break;
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    hitTest(canvasX, canvasY) {
        var w = this.canvas.width;
        var h = this.canvas.height;
        var room = this.state.rooms[this.state.player.currentRoom];
        if (!room || !room.hotspots) return null;

        for (var i = room.hotspots.length - 1; i >= 0; i--) {
            var hs = room.hotspots[i];
            // Skip hotspots for items not in room
            if (hs.type === 'item' && hs.itemId) {
                if (room.items.indexOf(hs.itemId) < 0) continue;
                var item = this.state.items[hs.itemId];
                if (item && item.hidden) continue;
            }
            // Skip hotspots for characters not alive
            if (hs.type === 'character' && hs.characterId) {
                var c = this.state.characters[hs.characterId];
                if (!c || !c.alive || c.defeated) continue;
            }
            if (this.pointInPolygon(canvasX, canvasY, hs.polygon, w, h)) {
                return hs;
            }
        }
        return null;
    }

    pointInPolygon(px, py, polygon, w, h) {
        if (!polygon || polygon.length < 3) return false;
        var inside = false;
        var pts = polygon.map(function(p) { return [p[0] * w, p[1] * h]; });
        for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
            var xi = pts[i][0], yi = pts[i][1];
            var xj = pts[j][0], yj = pts[j][1];
            if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) {
                inside = !inside;
            }
        }
        return inside;
    }

    setHoveredHotspot(hotspot) {
        if (this.hoveredHotspot !== hotspot) {
            this.hoveredHotspot = hotspot;
            this.render();
        }
    }

    loadImage(path) {
        var self = this;
        if (this.imageCache[path]) return Promise.resolve(this.imageCache[path]);
        return new Promise(function(resolve, reject) {
            var img = new Image();
            img.onload = function() { self.imageCache[path] = img; resolve(img); };
            img.onerror = function() { reject(new Error('Failed to load: ' + path)); };
            img.src = path;
        });
    }
};
