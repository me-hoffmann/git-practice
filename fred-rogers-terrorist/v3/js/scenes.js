/**
 * scenes.js — Room/Scene Definitions
 * Fred Rogers, Terrorist v3
 *
 * Each room defines:
 * - name, description, exits
 * - art: { background, layers[] } for CSS-composed illustration
 * - hotspots[] for interactive elements
 * - items[], characters[] initially present
 * - onEnter callback for room-entry logic
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.SceneDefs = {

    // ========================================
    // FRED'S HOUSE (Living Room)
    // ========================================
    'freds_house': {
        name: "Fred's House",
        description: "You stand in the famous living room of Fred Rogers. Warm light filters through the window. A closet sits against the wall, and you spot a box of fish food on the shelf. It feels cozy here\u2026 but something is off.",
        exits: { east: 'fish_room', west: 'front_porch' },
        items: ['fish_food'],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #e8dcc8 0%, #ddd0bc 60%, #c4a882 100%)',
            layers: [
                // Back wall
                { style: 'top:0;left:0;right:0;height:62%', classes: 'art-wall' },
                // Wooden floor
                { style: 'bottom:0;left:0;right:0;height:38%', classes: 'art-floor-wood' },
                // Window (left)
                { style: 'top:10%;left:8%;width:22%;height:32%', classes: 'art-window' },
                // Window glow
                { style: 'top:5%;left:4%;width:30%;height:42%', classes: 'art-window-glow' },
                // Closet door (center-left)
                { style: 'top:12%;left:35%;width:14%;height:50%;background:linear-gradient(to right,#7a5a3a,#8b6b4a,#7a5a3a);border-radius:3px 3px 0 0;box-shadow:inset -2px 0 4px rgba(0,0,0,0.15)' },
                // Closet knob
                { style: 'top:38%;left:47%;width:2%;height:2%;background:#c4a060;border-radius:50%;box-shadow:0 1px 2px rgba(0,0,0,0.2)' },
                // Shelf (right side)
                { style: 'top:42%;right:10%;width:28%;height:3%;background:linear-gradient(to bottom,#9a7a5a,#8b6b4a);border-radius:1px;box-shadow:0 2px 4px rgba(0,0,0,0.1)' },
                // Fish food box on shelf
                { style: 'top:34%;right:20%;width:6%;height:8%;background:linear-gradient(to bottom,#e0c060,#c8a030);border-radius:2px;border:1px solid rgba(139,107,74,0.3)' },
                // Rug on floor
                { style: 'bottom:10%;left:25%;width:50%;height:12%;background:radial-gradient(ellipse,#c86050 0%,#a84838 60%,transparent 100%);border-radius:50%;opacity:0.4' },
                // Baseboard
                { style: 'top:62%;left:0;right:0;height:2%;background:#8b7b6a' }
            ]
        },
        hotspots: [
            {
                id: 'closet', type: 'searchable', label: 'Closet',
                position: { top: '12%', left: '35%', width: '14%', height: '50%' },
                lookText: "A wooden closet full of old cardigan sweaters and sneakers. Classic Fred.",
                onSearch: function(gs, eb) {
                    if (gs.getFlag('closet_searched')) {
                        eb.emit('narration:show', { text: "You've already rummaged through the closet. Nothing else in there but sweaters.", style: 'normal' });
                        return;
                    }
                    gs.setFlag('closet_searched', true);
                    gs.revealItem('glasses');
                    gs.addToInventory('glasses');
                    eb.emit('narration:show', { text: "You dig through piles of cardigans and find\u2026 a chincy pair of glasses wedged behind the shoe rack!", style: 'discovery' });
                    gs.addScore(5);
                }
            },
            {
                id: 'fish_food_shelf', type: 'item', itemId: 'fish_food', label: 'Fish Food',
                position: { top: '32%', right: '18%', width: '10%', height: '12%' },
                lookText: "A small box of fish food flakes. The goldfish next door would love these."
            },
            {
                id: 'window', type: 'scenery', label: 'Window',
                position: { top: '10%', left: '8%', width: '22%', height: '32%' },
                lookText: "Sunlight streams through the window. Outside, the neighborhood looks peaceful\u2026 for now."
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: 'Fish Room \u2192',
                position: { top: '15%', right: '0', width: '6%', height: '47%' }
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: '\u2190 Front Porch',
                position: { top: '15%', left: '0', width: '6%', height: '47%' }
            }
        ],
        onEnter: function(gs, eb, data) {
            if (data.firstVisit) {
                eb.emit('narration:show', {
                    text: "Welcome to the neighborhood! Take time to explore and HAVE FUN! Mr. Rogers ALWAYS says: I LIKE YOU JUST THE WAY YOU ARE!",
                    style: 'hint'
                });
            }
        }
    },

    // ========================================
    // FISH ROOM
    // ========================================
    'fish_room': {
        name: "Fish Room",
        description: "A small room dominated by a large fish tank. Two goldfish swim in lazy circles, watching you with an unsettling intelligence.",
        exits: { west: 'freds_house', east: 'backyard' },
        items: [],
        characters: ['goldfish'],
        art: {
            background: 'linear-gradient(to bottom, #ddd5c5 0%, #d0c8b8 60%, #c4a882 100%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:62%', classes: 'art-wall' },
                { style: 'bottom:0;left:0;right:0;height:38%', classes: 'art-floor-wood' },
                // Fish tank
                { style: 'top:18%;left:28%;width:44%;height:40%;background:linear-gradient(to bottom,rgba(100,180,220,0.3),rgba(60,140,180,0.5));border:3px solid #8b8b8b;border-radius:4px;box-shadow:inset 0 0 20px rgba(60,140,180,0.2),0 4px 8px rgba(0,0,0,0.1)' },
                // Water in tank
                { style: 'top:22%;left:29%;width:42%;height:34%;background:linear-gradient(to bottom,rgba(100,180,220,0.2),rgba(60,140,180,0.4));border-radius:2px;overflow:hidden', classes: 'art-water' },
                // Fish 1 (animated)
                { style: 'top:30%;left:38%;width:5%;height:4%;background:radial-gradient(ellipse,#f0a040,#d08020);border-radius:50% 30% 30% 50%', classes: 'animate-bob' },
                // Fish 2 (animated, offset)
                { style: 'top:38%;left:52%;width:5%;height:4%;background:radial-gradient(ellipse,#e09030,#c07018);border-radius:30% 50% 50% 30%;animation-delay:-1.5s', classes: 'animate-bob' },
                // Tank stand
                { style: 'top:58%;left:32%;width:36%;height:4%;background:linear-gradient(to bottom,#7a5a3a,#6a4a2a);border-radius:2px' },
                // Picture frame on wall
                { style: 'top:12%;left:8%;width:14%;height:18%;background:linear-gradient(135deg,#c8b898,#b0a080);border:2px solid #8b7b6a;border-radius:2px' },
                { style: 'top:62%;left:0;right:0;height:2%;background:#8b7b6a' }
            ]
        },
        hotspots: [
            {
                id: 'fish_tank', type: 'character', characterId: 'goldfish', label: 'Goldfish',
                position: { top: '18%', left: '28%', width: '44%', height: '42%' },
                lookText: "Two goldfish swim in circles. One of them winks at you. Did\u2026 did that just happen?",
                lookTextDefeated: "The goldfish swim happily, well-fed and content. One of them gives you a knowing nod."
            },
            {
                id: 'picture', type: 'scenery', label: 'Picture',
                position: { top: '12%', left: '8%', width: '14%', height: '18%' },
                lookText: "A framed picture of a trolley. How quaint."
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: "\u2190 Fred's House",
                position: { top: '15%', left: '0', width: '6%', height: '47%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: 'Backyard \u2192',
                position: { top: '15%', right: '0', width: '6%', height: '47%' }
            }
        ]
    },

    // ========================================
    // FRONT PORCH
    // ========================================
    'front_porch': {
        name: "Front Porch",
        description: "You step onto the front porch. The neighborhood stretches out before you under a pleasant sky. A quiet street leads north.",
        exits: { east: 'freds_house', west: 'bathroom', north: 'quiet_street' },
        items: [],
        characters: ['landlord'],
        art: {
            background: 'linear-gradient(to bottom, var(--sky-blue) 0%, #cfe0ee 40%, var(--cream) 55%, #b09572 100%)',
            layers: [
                // Sky
                { style: 'top:0;left:0;right:0;height:45%', classes: 'art-sky' },
                // Porch floor
                { style: 'bottom:0;left:0;right:0;height:30%', classes: 'art-floor-wood' },
                // House wall (right)
                { style: 'top:20%;right:0;width:35%;height:55%;background:linear-gradient(to bottom,#d8cfc0,#c8bfb0)' },
                // Door frame
                { style: 'top:22%;right:8%;width:18%;height:48%;background:#5a4a3a;border-radius:4px 4px 0 0' },
                // Door
                { style: 'top:24%;right:10%;width:14%;height:44%;background:linear-gradient(to right,#8b6b4a,#9a7a5a,#8b6b4a);border-radius:3px 3px 0 0' },
                // Porch railing
                { style: 'top:52%;left:0;width:60%;height:3%;background:#c8b898;border-radius:1px' },
                // Railing posts
                { style: 'top:52%;left:10%;width:2%;height:23%;background:#b0a080;border-radius:1px' },
                { style: 'top:52%;left:30%;width:2%;height:23%;background:#b0a080;border-radius:1px' },
                { style: 'top:52%;left:50%;width:2%;height:23%;background:#b0a080;border-radius:1px' },
                // Grass beyond porch
                { style: 'bottom:0;left:0;width:55%;height:15%', classes: 'art-grass' },
                // Path to street
                { style: 'bottom:0;left:20%;width:15%;height:30%', classes: 'art-path' }
            ]
        },
        hotspots: [
            {
                id: 'landlord_spot', type: 'character', characterId: 'landlord', label: 'The Landlord',
                position: { top: '30%', left: '15%', width: '20%', height: '40%' },
                lookText: "A gruff-looking landlord. He's been waiting for you, and he doesn't look happy."
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: "Fred's House \u2192",
                position: { top: '22%', right: '0', width: '8%', height: '48%' }
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: '\u2190 Bathroom',
                position: { top: '30%', left: '0', width: '6%', height: '40%' }
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north', label: '\u2191 Quiet Street',
                position: { top: '0', left: '20%', width: '15%', height: '12%' }
            }
        ]
    },

    // ========================================
    // BACKYARD
    // ========================================
    'backyard': {
        name: "Backyard",
        description: "Fred's backyard. A sandbox sits in the middle of a modest lawn. A garden gate leads south to the neighbor's garden, and the kitchen is to the east.",
        exits: { west: 'fish_room', south: 'neighbors_garden', east: 'kitchen' },
        items: ['spade'],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, var(--sky-blue) 0%, #cfe0ee 30%, #a3c49a 50%, #8fad88 100%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:35%', classes: 'art-sky' },
                { style: 'bottom:0;left:0;right:0;height:50%', classes: 'art-grass' },
                // Sandbox
                { style: 'bottom:18%;left:30%;width:35%;height:18%;background:linear-gradient(to bottom,#e0d0a0,#d0c090);border:3px solid #b0a070;border-radius:4px;box-shadow:inset 0 2px 6px rgba(0,0,0,0.1)' },
                // Sand texture
                { style: 'bottom:20%;left:32%;width:31%;height:14%;background:radial-gradient(circle at 30% 40%,#e8d8a8,#d8c898);border-radius:2px' },
                // Spade in sandbox
                { style: 'bottom:22%;left:50%;width:4%;height:12%;background:linear-gradient(to bottom,#888,#666);clip-path:polygon(30% 0%,70% 0%,60% 45%,60% 100%,40% 100%,40% 45%);transform:rotate(-15deg)' },
                // Fence (back)
                { style: 'top:30%;left:0;right:0;height:5%;background:repeating-linear-gradient(90deg,#c8b080 0px,#c8b080 8px,#b0a070 8px,#b0a070 10px)' },
                // Tree (right)
                { style: 'top:8%;right:5%;width:20%;height:35%', classes: 'art-tree animate-sway' },
                { style: 'top:35%;right:12%;width:5%;height:20%', classes: 'art-trunk' },
                // Flowers
                { style: 'bottom:48%;left:8%;width:3%;height:3%;background:#e06080;border-radius:50%' },
                { style: 'bottom:46%;left:14%;width:2.5%;height:2.5%;background:#f0a040;border-radius:50%' },
                { style: 'bottom:49%;left:20%;width:3%;height:3%;background:#a060c0;border-radius:50%' }
            ]
        },
        hotspots: [
            {
                id: 'sandbox', type: 'searchable', label: 'Sandbox',
                position: { top: '48%', left: '30%', width: '35%', height: '22%' },
                lookText: "A well-used sandbox. Something seems to be buried under the sand.",
                onSearch: function(gs, eb) {
                    if (gs.getFlag('sandbox_searched')) {
                        eb.emit('narration:show', { text: "You've already dug through the sandbox. Just sand now.", style: 'normal' });
                        return;
                    }
                    gs.setFlag('sandbox_searched', true);
                    gs.revealItem('unmentionables');
                    gs.addToInventory('unmentionables');
                    eb.emit('narration:show', { text: "You dig through the sand and find\u2026 oh. Oh no. It's a pair of unmentionables. You reluctantly pocket them.", style: 'discovery' });
                }
            },
            {
                id: 'spade_spot', type: 'item', itemId: 'spade', label: 'Spade',
                position: { top: '40%', left: '48%', width: '10%', height: '15%' },
                lookText: "A sturdy garden spade, half-buried in the sandbox."
            },
            {
                id: 'tree', type: 'scenery', label: 'Tree',
                position: { top: '8%', right: '5%', width: '20%', height: '47%' },
                lookText: "A nice oak tree. It sways gently in the breeze."
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: '\u2190 Fish Room',
                position: { top: '15%', left: '0', width: '6%', height: '40%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south', label: "\u2193 Neighbor's Garden",
                position: { bottom: '0', left: '35%', width: '20%', height: '10%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: 'Kitchen \u2192',
                position: { top: '15%', right: '0', width: '6%', height: '40%' }
            }
        ]
    },

    // ========================================
    // KITCHEN
    // ========================================
    'kitchen': {
        name: "Kitchen",
        description: "Fred's kitchen. Clean countertops, a few dishes in the sink, and\u2026 is that a model castle sitting on the shelf? How very Fred.",
        exits: { west: 'backyard', south: 'bathroom', east: 'scuzzy_alley' },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #e0d8c8 0%, #d5ccbc 60%, #c8bfb0 100%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:60%', classes: 'art-wall' },
                { style: 'bottom:0;left:0;right:0;height:40%', classes: 'art-floor-tile' },
                // Counter
                { style: 'top:45%;left:5%;width:50%;height:5%;background:linear-gradient(to bottom,#d0c8b8,#c0b8a8);box-shadow:0 2px 4px rgba(0,0,0,0.1)' },
                // Cabinets above
                { style: 'top:15%;left:8%;width:20%;height:28%;background:linear-gradient(to bottom,#b09572,#a08562);border-radius:2px;border:1px solid #8b7b6a' },
                { style: 'top:15%;left:32%;width:20%;height:28%;background:linear-gradient(to bottom,#b09572,#a08562);border-radius:2px;border:1px solid #8b7b6a' },
                // Sink
                { style: 'top:38%;left:15%;width:15%;height:7%;background:linear-gradient(to bottom,#c0c0c0,#a0a0a0);border-radius:0 0 4px 4px;border:1px solid #888' },
                // Model castle on shelf (right side)
                { style: 'top:30%;right:10%;width:18%;height:3%;background:#9a8a7a;border-radius:1px' },
                // Castle towers
                { style: 'top:18%;right:14%;width:5%;height:12%;background:linear-gradient(to bottom,#b0a090,#9a8a7a);border-radius:2px 2px 0 0' },
                { style: 'top:15%;right:14.5%;width:4%;height:3%;background:#c0b0a0;clip-path:polygon(50% 0%,100% 100%,0% 100%)' },
                { style: 'top:20%;right:20%;width:4%;height:10%;background:linear-gradient(to bottom,#b0a090,#9a8a7a);border-radius:2px 2px 0 0' },
                { style: 'top:17%;right:20.5%;width:3%;height:3%;background:#c0b0a0;clip-path:polygon(50% 0%,100% 100%,0% 100%)' },
                // Castle wall
                { style: 'top:24%;right:12%;width:14%;height:6%;background:#a89a8a;border:1px solid #8b7b6a;border-radius:1px' },
                { style: 'top:60%;left:0;right:0;height:1.5%;background:#8b8078' }
            ]
        },
        hotspots: [
            {
                id: 'model_castle', type: 'searchable', label: 'Model Castle',
                position: { top: '15%', right: '8%', width: '22%', height: '20%' },
                lookText: "A detailed model of a castle. It looks like it came from the Neighborhood of Make-Believe.",
                onSearch: function(gs, eb) {
                    if (gs.getFlag('castle_searched')) {
                        eb.emit('narration:show', { text: "You've already found what was hidden behind the castle.", style: 'normal' });
                        return;
                    }
                    gs.setFlag('castle_searched', true);
                    gs.revealItem('dollar_bill');
                    gs.addToInventory('dollar_bill');
                    eb.emit('narration:show', { text: "You peek behind the model castle and find a crumpled dollar bill wedged against the wall! Not much, but it's something.", style: 'discovery' });
                }
            },
            {
                id: 'sink', type: 'scenery', label: 'Sink',
                position: { top: '35%', left: '12%', width: '20%', height: '15%' },
                lookText: "A few dishes sit in the sink. Even terrorists have to do the dishes."
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: '\u2190 Backyard',
                position: { top: '15%', left: '0', width: '6%', height: '45%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south', label: '\u2193 Bathroom',
                position: { bottom: '0', left: '35%', width: '20%', height: '10%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: 'Scuzzy Alley \u2192',
                position: { top: '15%', right: '0', width: '6%', height: '45%' }
            }
        ]
    },

    // ========================================
    // BATHROOM
    // ========================================
    'bathroom': {
        name: "Bathroom",
        description: "A small, somewhat cramped bathroom. The toilet sits against the far wall. There's a faint draft coming from somewhere below\u2026",
        exits: { east: 'front_porch', north: 'kitchen' },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #d5dde5 0%, #c8d4dc 60%, #b8c8d0 100%)',
            layers: [
                // Walls - lighter blue-ish
                { style: 'top:0;left:0;right:0;height:58%;background:linear-gradient(to bottom,#dce5ec,#c8d4dc)' },
                // Tile floor
                { style: 'bottom:0;left:0;right:0;height:42%', classes: 'art-floor-tile' },
                // Toilet
                { style: 'bottom:30%;left:35%;width:16%;height:22%;background:linear-gradient(to bottom,#f0f0f0,#e0e0e0);border-radius:6px 6px 2px 2px;border:1px solid #ccc' },
                // Toilet tank
                { style: 'bottom:48%;left:37%;width:12%;height:12%;background:linear-gradient(to bottom,#f5f5f5,#e8e8e8);border-radius:3px;border:1px solid #ccc' },
                // Toilet handle
                { style: 'bottom:54%;left:48%;width:4%;height:1.5%;background:#c0c0c0;border-radius:1px' },
                // Sink (left)
                { style: 'top:35%;left:8%;width:18%;height:15%;background:linear-gradient(to bottom,#e8e8e8,#d0d0d0);border-radius:0 0 50% 50%;border:1px solid #bbb' },
                // Mirror above sink
                { style: 'top:12%;left:10%;width:14%;height:20%;background:linear-gradient(135deg,#e8f0f8,#d0dce5);border:2px solid #999;border-radius:2px' },
                // Bathtub (right)
                { style: 'bottom:20%;right:5%;width:25%;height:25%;background:linear-gradient(to bottom,#f0f0f0,#e0e0e0);border-radius:8px;border:2px solid #ccc' },
                // Drain hint - subtle dark spot
                { style: 'bottom:25%;left:40%;width:6%;height:6%;background:radial-gradient(circle,#333 0%,#555 40%,transparent 70%)' },
                { style: 'top:58%;left:0;right:0;height:1.5%;background:#a0a8b0' }
            ]
        },
        hotspots: [
            {
                id: 'toilet', type: 'searchable', label: 'Toilet',
                position: { top: '28%', left: '33%', width: '20%', height: '38%' },
                lookText: "An ordinary toilet. But there's something scrawled on the wall behind it\u2026 and is that a draft coming from below?",
                onSearch: function(gs, eb) {
                    if (gs.getFlag('toilet_searched')) {
                        eb.emit('narration:show', { text: "You've already found what was behind the toilet. The memory of those words will stay with you.", style: 'normal' });
                        return;
                    }
                    gs.setFlag('toilet_searched', true);
                    gs.addToInventory('cuss_words');
                    eb.emit('narration:show', { text: "Behind the toilet, someone has scrawled an impressive collection of profanity on the wall. You memorize every word. Your vocabulary has\u2026 expanded.", style: 'discovery' });
                    eb.emit('narration:show', { text: "You also notice a large drain grate beneath the toilet. Cold, damp air rises from below. This leads somewhere\u2026", style: 'hint' });

                    // Unlock sewer exit
                    gs.rooms['bathroom'].exits['down'] = 'sewer';
                    gs.setFlag('sewer_discovered', true);
                    eb.emit('scene:refresh');
                }
            },
            {
                id: 'mirror', type: 'scenery', label: 'Mirror',
                position: { top: '12%', left: '8%', width: '18%', height: '22%' },
                lookText: "You see your own reflection. You look\u2026 surprisingly good for a terrorist."
            },
            {
                id: 'bathtub', type: 'scenery', label: 'Bathtub',
                position: { top: '42%', right: '3%', width: '28%', height: '30%' },
                lookText: "A bathtub. Nothing unusual here."
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east', label: 'Front Porch \u2192',
                position: { top: '15%', right: '0', width: '6%', height: '43%' }
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north', label: '\u2191 Kitchen',
                position: { top: '0', left: '35%', width: '20%', height: '10%' }
            }
        ],
        onEnter: function(gs, eb, data) {
            // If sewer is discovered, add the down exit hotspot dynamically
            if (gs.getFlag('sewer_discovered') && gs.rooms['bathroom'].exits['down']) {
                // The scene:refresh event will re-render with the new exit
            }
        }
    },

    // ========================================
    // NEIGHBOR'S GARDEN
    // ========================================
    'neighbors_garden': {
        name: "Neighbor's Garden",
        description: "A messy garden belonging to one of Fred's neighbors. Overgrown bushes and a crooked fence surround a neglected flower bed.",
        exits: { north: 'backyard' },
        items: [],
        characters: ['streaker'],
        art: {
            background: 'linear-gradient(to bottom, var(--sky-blue) 0%, #cfe0ee 25%, #8fad88 45%, #6a9060 100%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%', classes: 'art-sky' },
                { style: 'bottom:0;left:0;right:0;height:55%', classes: 'art-grass-dark' },
                // Messy bushes
                { style: 'top:25%;left:5%;width:25%;height:20%;background:radial-gradient(ellipse,#6a9060,#4a7040);border-radius:50%' },
                { style: 'top:28%;right:10%;width:20%;height:18%;background:radial-gradient(ellipse,#5a8050,#3a6030);border-radius:50%' },
                // Crooked fence
                { style: 'top:32%;left:0;right:0;height:4%;background:repeating-linear-gradient(90deg,#b0a070 0px,#b0a070 6px,transparent 6px,transparent 12px);transform:rotate(-1deg)' },
                // Neglected flowers
                { style: 'bottom:25%;left:30%;width:2.5%;height:3%;background:#e06080;border-radius:50%' },
                { style: 'bottom:28%;left:38%;width:2%;height:2.5%;background:#f0d040;border-radius:50%' },
                { style: 'bottom:22%;left:45%;width:3%;height:3%;background:#8060c0;border-radius:50%;opacity:0.7' },
                // Dirt patch
                { style: 'bottom:12%;left:20%;width:40%;height:15%;background:radial-gradient(ellipse,#a08860,#8a7550);border-radius:40%;opacity:0.5' }
            ]
        },
        hotspots: [
            {
                id: 'streaker_spot', type: 'character', characterId: 'streaker', label: 'The Streaker',
                position: { top: '30%', left: '40%', width: '20%', height: '40%' },
                lookText: "A nude figure running laps around the garden. Please, someone give him some clothes."
            },
            {
                id: 'bushes', type: 'scenery', label: 'Bushes',
                position: { top: '25%', left: '5%', width: '25%', height: '20%' },
                lookText: "Overgrown bushes. Something might be hiding in there, but you're not that brave."
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north', label: '\u2191 Backyard',
                position: { top: '0', left: '35%', width: '20%', height: '10%' }
            }
        ]
    },

    // ========================================
    // SCUZZY ALLEY
    // ========================================
    'scuzzy_alley': {
        name: "Scuzzy Alley",
        description: "A dark, grimy alley on the wrong side of the neighborhood. Trash litters the ground, and the shadows feel\u2026 watchful.",
        exits: { west: 'kitchen' },
        items: ['bundle_of_money'],
        characters: ['mugger'],
        art: {
            background: 'linear-gradient(to bottom, #5a5550 0%, #4a4540 40%, #3a3530 100%)',
            layers: [
                // Dark walls
                { style: 'top:0;left:0;width:35%;height:65%;background:linear-gradient(to right,#4a4540,#5a5550)' },
                { style: 'top:0;right:0;width:35%;height:60%;background:linear-gradient(to left,#4a4540,#5a5550)' },
                // Ground
                { style: 'bottom:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,#5a5048,#4a4038)' },
                // Trash
                { style: 'bottom:20%;left:15%;width:5%;height:4%;background:#7a6a5a;border-radius:2px;transform:rotate(20deg)' },
                { style: 'bottom:22%;left:60%;width:4%;height:5%;background:#6a7a5a;border-radius:1px;transform:rotate(-15deg)' },
                { style: 'bottom:18%;left:45%;width:6%;height:3%;background:#8a7a6a;border-radius:3px;transform:rotate(5deg)' },
                // Dim light from above
                { style: 'top:0;left:35%;width:30%;height:40%;background:radial-gradient(ellipse at top,rgba(200,180,140,0.15),transparent 70%)' },
                // Money glint
                { style: 'bottom:25%;right:25%;width:6%;height:5%;background:radial-gradient(circle,rgba(100,200,100,0.3),transparent);border-radius:50%', classes: 'animate-flicker' },
                // Dumpster
                { style: 'bottom:25%;left:5%;width:15%;height:20%;background:linear-gradient(to bottom,#4a5a4a,#3a4a3a);border-radius:2px;border:1px solid #2a3a2a' }
            ]
        },
        hotspots: [
            {
                id: 'money_spot', type: 'item', itemId: 'bundle_of_money', label: 'Bundle of Money',
                position: { top: '55%', right: '22%', width: '12%', height: '12%' },
                lookText: "A bundle of cash on the ground! Someone dropped this. Finders keepers."
            },
            {
                id: 'mugger_spot', type: 'character', characterId: 'mugger', label: 'A Mugger',
                position: { top: '20%', left: '45%', width: '18%', height: '45%' },
                lookText: "A threatening figure blocking the deeper part of the alley. He wants your money."
            },
            {
                id: 'switchblade_spot', type: 'item', itemId: 'switchblade', label: 'Switchblade',
                position: { top: '60%', left: '42%', width: '10%', height: '10%' },
                lookText: "A mean-looking switchblade knife, dropped by the mugger. It glints in the dim light."
            },
            {
                id: 'dumpster', type: 'scenery', label: 'Dumpster',
                position: { top: '42%', left: '3%', width: '18%', height: '25%' },
                lookText: "A dumpster. It smells exactly how you'd expect."
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west', label: '\u2190 Kitchen',
                position: { top: '15%', left: '0', width: '6%', height: '45%' }
            }
        ]
    },

    // ========================================
    // SEWER
    // ========================================
    'sewer': {
        name: "The Sewer",
        description: "You drop down into a damp, dark sewer tunnel. Water trickles along the floor and the walls glisten with moisture. The smell is\u2026 unforgettable.",
        exits: { up: 'bathroom', south: 'dark_area' },
        items: ['body_slime'],
        characters: ['tapeworm'],
        art: {
            background: 'linear-gradient(to bottom, #3a3530 0%, #2d2926 40%, #1a1816 100%)',
            layers: [
                // Tunnel arch
                { style: 'top:0;left:10%;right:10%;height:70%;background:radial-gradient(ellipse at 50% 0%,#4a4540 0%,#3a3530 50%,#2d2926 100%);border-radius:50% 50% 0 0' },
                // Sewer walls
                { style: 'top:0;left:0;width:15%;height:100%', classes: 'art-sewer-wall' },
                { style: 'top:0;right:0;width:15%;height:100%', classes: 'art-sewer-wall' },
                // Water at bottom
                { style: 'bottom:0;left:10%;right:10%;height:25%', classes: 'art-water' },
                // Moss streaks
                { style: 'top:20%;left:12%;width:3%;height:30%;background:linear-gradient(to bottom,rgba(80,120,60,0.3),transparent);border-radius:2px' },
                { style: 'top:15%;right:14%;width:2%;height:25%;background:linear-gradient(to bottom,rgba(60,100,40,0.3),transparent);border-radius:2px' },
                // Slime on ground
                { style: 'bottom:22%;left:25%;width:8%;height:5%;background:radial-gradient(ellipse,rgba(120,160,80,0.4),transparent);border-radius:50%' },
                // Drip animation
                { style: 'top:10%;left:40%;width:1%;height:3%;background:rgba(100,140,180,0.4);border-radius:50%', classes: 'animate-flicker' },
                // Dim central light
                { style: 'top:5%;left:30%;width:40%;height:30%;background:radial-gradient(ellipse,rgba(150,130,100,0.08),transparent)' }
            ]
        },
        hotspots: [
            {
                id: 'slime_spot', type: 'item', itemId: 'body_slime', label: 'Body Slime',
                position: { top: '60%', left: '22%', width: '14%', height: '12%' },
                lookText: "Disgusting slime from some unknown biological source. You might need this\u2026 unfortunately."
            },
            {
                id: 'tapeworm_spot', type: 'character', characterId: 'tapeworm', label: 'Tapeworm',
                position: { top: '30%', left: '30%', width: '30%', height: '35%' },
                lookText: "A massive tapeworm blocks the passage south. Its body coils across the entire tunnel."
            },
            {
                id: 'exit_up', type: 'exit', exitDir: 'up', label: '\u2191 Bathroom',
                position: { top: '0', left: '35%', width: '20%', height: '10%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south', label: '\u2193 Dark Area',
                position: { bottom: '0', left: '35%', width: '20%', height: '10%' },
                blocked: function(gs) {
                    return gs.getRoomCharacters('sewer').indexOf('tapeworm') !== -1;
                },
                blockedText: "The Tapeworm blocks the way! You need to deal with it first."
            }
        ]
    },

    // ========================================
    // DARK AREA
    // ========================================
    'dark_area': {
        name: "The Dark Area",
        description: "Almost total darkness. You can barely see a few feet in front of you. Two red eyes gleam from the shadows ahead\u2026",
        exits: { north: 'sewer' },
        items: [],
        characters: ['rat'],
        art: {
            background: '#0a0908',
            layers: [
                // Near-total darkness
                { style: 'inset:0', classes: 'art-darkness' },
                // Faint light from behind (sewer)
                { style: 'top:0;left:30%;width:40%;height:30%;background:radial-gradient(ellipse at 50% 0%,rgba(80,70,50,0.1),transparent 60%)' },
                // Rat's red eyes
                { style: 'top:40%;left:48%;width:1.5%;height:2%;background:radial-gradient(circle,#ff3030,#cc0000);border-radius:50%;box-shadow:0 0 6px rgba(255,0,0,0.5)', classes: 'animate-flicker' },
                { style: 'top:40%;left:53%;width:1.5%;height:2%;background:radial-gradient(circle,#ff3030,#cc0000);border-radius:50%;box-shadow:0 0 6px rgba(255,0,0,0.5)', classes: 'animate-flicker' },
                // Ground barely visible
                { style: 'bottom:0;left:0;right:0;height:20%;background:linear-gradient(to top,rgba(40,35,30,0.5),transparent)' }
            ]
        },
        hotspots: [
            {
                id: 'rat_spot', type: 'character', characterId: 'rat', label: 'Giant Rat',
                position: { top: '30%', left: '35%', width: '30%', height: '35%' },
                lookText: "Two gleaming red eyes stare at you from the darkness. A giant, probably rabid rat. It's blocking the only way forward."
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north', label: '\u2191 Sewer',
                position: { top: '0', left: '30%', width: '25%', height: '12%' }
            }
        ],
        onEnter: function(gs, eb, data) {
            if (data.firstVisit) {
                eb.emit('narration:show', {
                    text: "The darkness is almost absolute. You hear something large scurrying in the shadows ahead\u2026",
                    style: 'character'
                });
            }
        }
    },

    // ========================================
    // QUIET STREET (minimal — future expansion)
    // ========================================
    'quiet_street': {
        name: "Quiet Street",
        description: "A quiet residential street stretching north. Neat houses line both sides. This is as far as you can go for now\u2026 the road ahead is still being paved.",
        exits: { south: 'front_porch' },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, var(--sky-blue) 0%, #cfe0ee 35%, var(--cream) 50%, #b09572 70%, #8fad88 100%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:35%', classes: 'art-sky' },
                // Road
                { style: 'bottom:10%;left:25%;width:50%;height:35%', classes: 'art-path' },
                // Houses (left)
                { style: 'top:25%;left:5%;width:18%;height:30%;background:linear-gradient(to bottom,#d8cfc0,#c8bfb0);border:1px solid #b0a090' },
                { style: 'top:20%;left:7%;width:14%;height:5%;background:#a04040;clip-path:polygon(50% 0%,100% 100%,0% 100%)' },
                // Houses (right)
                { style: 'top:22%;right:5%;width:18%;height:32%;background:linear-gradient(to bottom,#c8d0c0,#b8c0b0);border:1px solid #a0b090' },
                { style: 'top:17%;right:7%;width:14%;height:5%;background:#406040;clip-path:polygon(50% 0%,100% 100%,0% 100%)' },
                // Grass
                { style: 'bottom:0;left:0;right:0;height:15%', classes: 'art-grass' },
                // "Under construction" sign
                { style: 'top:40%;left:42%;width:16%;height:10%;background:#f0d040;border:2px solid #c0a020;border-radius:2px;display:flex;align-items:center;justify-content:center;font-size:8px;color:#4a3728;font-family:var(--font-ui)', html: '&mdash;' }
            ]
        },
        hotspots: [
            {
                id: 'sign', type: 'scenery', label: 'Construction Sign',
                position: { top: '38%', left: '40%', width: '20%', height: '14%' },
                lookText: "A sign reads: \"Road ahead under construction. More neighborhood coming soon!\" Looks like this adventure continues another day."
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south', label: '\u2193 Front Porch',
                position: { bottom: '0', left: '35%', width: '20%', height: '12%' }
            }
        ]
    }
};
