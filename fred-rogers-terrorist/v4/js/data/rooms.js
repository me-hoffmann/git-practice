/**
 * rooms.js — Room Definitions
 * Fred Rogers, Terrorist v4
 *
 * Phase 1: Fred's House, Fish Room, Front Porch
 * Each room has: name, description, zone, exits, items, characters,
 * art (CSS layers), hotspots (clickable areas), and callbacks.
 */
window.FRT = window.FRT || {};

window.FRT.RoomDefs = {

    // ====================================================
    // FRED'S HOUSE (START)
    // ====================================================
    freds_house: {
        name: "Fred's House",
        description: "You're standing in the famous living room of Fred Rogers. It smells like old sweaters and moral superiority. A closet stands against one wall, and the fish tank glimmers to the east.",
        zone: 'realworld',
        exits: {
            east: 'fish_room',
            west: 'front_porch'
        },
        items: ['fish_food'],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #f5e6d0, #ede0cc)',
            layers: [
                // Back wall
                { style: 'top:0;left:0;right:0;height:65%', classes: 'art-wall' },
                // Floor
                { style: 'bottom:0;left:0;right:0;height:35%', classes: 'art-floor-wood' },
                // Baseboard
                { style: 'top:65%;left:0;right:0;height:3%', classes: 'art-baseboard' },
                // Window (back wall center)
                { style: 'top:8%;left:38%;width:24%;height:30%', classes: 'art-window' },
                // Window curtains
                { style: 'top:6%;left:36%;width:5%;height:34%;background:linear-gradient(to right,#c8556a,#d4687a);border-radius:0 0 40% 0;opacity:0.85' },
                { style: 'top:6%;left:59%;width:5%;height:34%;background:linear-gradient(to left,#c8556a,#d4687a);border-radius:0 0 0 40%;opacity:0.85' },
                // Closet (left wall)
                { id: 'closet-body', style: 'top:15%;left:5%;width:22%;height:50%', classes: 'art-closet' },
                { id: 'closet-door', style: 'top:15%;left:5%;width:22%;height:50%', classes: 'art-closet-door' },
                { id: 'closet-knob', style: 'top:40%;left:24%;width:2%;height:3%;background:radial-gradient(circle,#d4a832,#b8922a);border-radius:50%' },
                // Closet interior (hidden until searched)
                { id: 'closet-interior', style: 'top:18%;left:8%;width:16%;height:20%;opacity:0', classes: 'closet-interior art-sweaters' },
                { id: 'closet-glasses', style: 'top:42%;left:12%;width:8%;height:8%;opacity:0;font-size:1.8rem;display:flex;align-items:center;justify-content:center', classes: 'closet-interior closet-glasses', html: '\uD83D\uDC53' },
                // Couch (center)
                { style: 'top:48%;left:30%;width:35%;height:18%;background:linear-gradient(to bottom,#8b4a5e,#7a3f52);border-radius:12px 12px 4px 4px;box-shadow:0 3px 6px rgba(0,0,0,0.2)' },
                // Couch cushions
                { style: 'top:49%;left:32%;width:14%;height:12%;background:linear-gradient(to bottom,#9e5a6e,#8b4a5e);border-radius:8px' },
                { style: 'top:49%;left:49%;width:14%;height:12%;background:linear-gradient(to bottom,#9e5a6e,#8b4a5e);border-radius:8px' },
                // Side table with fish food
                { style: 'top:46%;left:72%;width:12%;height:20%;background:linear-gradient(to bottom,#8b6914,#7a5c12);border-radius:3px' },
                // Lamp on side table
                { style: 'top:32%;left:74%;width:8%;height:16%;background:linear-gradient(to bottom,#f0d88a,#e8cc70);border-radius:50% 50% 0 0;box-shadow:0 0 12px rgba(240,216,138,0.4)' },
                // Rug
                { style: 'bottom:8%;left:20%;width:55%;height:12%;background:radial-gradient(ellipse,#b8556a,#a04858,#883c4a);border-radius:50%;opacity:0.7' },
                // Vignette
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            // Exit east to fish room
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Fish Room \u2192',
                position: { top: '30%', right: '0', width: '8%', height: '35%' }
            },
            // Exit west to front porch
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Front Porch',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            // Closet (searchable)
            {
                id: 'closet', type: 'searchable',
                label: 'Closet',
                lookText: "A tall wooden closet. It smells like mothballs and decades of cardigan storage.",
                position: { top: '15%', left: '5%', width: '22%', height: '50%' },
                onSearch: function(state, eventBus) {
                    if (state.getFlag('closet_searched')) {
                        eventBus.emit('narration:show', {
                            text: "You've already searched the closet. Nothing but old sweaters and regret.",
                            style: 'normal'
                        });
                        return;
                    }
                    state.setFlag('closet_searched', true);
                    state.revealItem('glasses');
                    state.addItemToRoom('glasses', 'freds_house');
                    state.addScore(5);
                    eventBus.emit('narration:show', {
                        text: "You rummage through a wall of identical cardigans. Behind the sweaters, you find a pair of cheap glasses wedged in the back.",
                        style: 'discovery'
                    });
                }
            },
            // Fish food on side table (item)
            {
                id: 'fish_food_item', type: 'item', itemId: 'fish_food',
                label: 'Fish Food',
                lookText: 'A small box of fish food flakes sitting on the side table.',
                position: { top: '44%', left: '73%', width: '10%', height: '10%' }
            },
            // Glasses (hidden until closet searched)
            {
                id: 'glasses_item', type: 'item', itemId: 'glasses',
                label: 'Glasses',
                lookText: 'A pair of cheap glasses.',
                position: { top: '40%', left: '10%', width: '10%', height: '12%' },
                visible: function(state) {
                    return state.getFlag('closet_searched') && !state.isItemInInventory('glasses');
                }
            },
            // Window (scenery)
            {
                id: 'window', type: 'scenery',
                label: 'Window',
                lookText: "Through the window you can see the neighborhood. It's a beautiful day in the neighborhood. A beautiful day for a neighbor. Would you be mine?",
                position: { top: '8%', left: '38%', width: '24%', height: '30%' }
            },
            // Couch (scenery)
            {
                id: 'couch', type: 'scenery',
                label: 'Couch',
                lookText: "The famous couch. It's seen more heart-to-heart conversations than a therapist's office. There's a permanent Fred-shaped dent in the center cushion.",
                position: { top: '48%', left: '30%', width: '35%', height: '18%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "It's a beautiful day in the neighborhood... or it WAS, until someone stole the trolley.",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // FISH ROOM
    // ====================================================
    fish_room: {
        name: 'Fish & Picture Picture',
        description: "The fish tank room. Two oversized goldfish swim in a tank that's definitely too small for them. A strange picture hangs on the wall that nobody has ever been able to explain.",
        zone: 'realworld',
        exits: {
            west: 'freds_house',
            east: 'kitchen'
        },
        items: [],
        characters: ['goldfish'],
        art: {
            background: 'linear-gradient(to bottom, #e8dcc8, #ddd0bc)',
            layers: [
                // Back wall
                { style: 'top:0;left:0;right:0;height:65%', classes: 'art-wall' },
                // Floor
                { style: 'bottom:0;left:0;right:0;height:35%', classes: 'art-floor-wood' },
                // Baseboard
                { style: 'top:65%;left:0;right:0;height:3%', classes: 'art-baseboard' },
                // Fish tank stand
                { style: 'top:30%;left:32%;width:36%;height:38%;background:linear-gradient(to bottom,#6b4a2a,#5a3d22);border-radius:3px;box-shadow:0 4px 8px rgba(0,0,0,0.3)' },
                // Fish tank (glass)
                { style: 'top:12%;left:34%;width:32%;height:30%;background:linear-gradient(to bottom,rgba(160,210,230,0.3),rgba(100,180,210,0.4));border:3px solid rgba(200,220,230,0.6);border-radius:6px 6px 2px 2px' },
                // Tank water
                { style: 'top:16%;left:35%;width:30%;height:24%;background:linear-gradient(to bottom,rgba(80,160,200,0.3),rgba(60,140,180,0.5));border-radius:0 0 2px 2px' },
                // Fish 1 (orange)
                { style: 'top:22%;left:40%;width:8%;height:10%;background:radial-gradient(ellipse,#ff8c42,#e67020);border-radius:60% 40% 50% 50%;box-shadow:0 0 4px rgba(255,140,66,0.4)', classes: 'art-fish-bob' },
                // Fish 2 (gold)
                { style: 'top:28%;left:52%;width:7%;height:8%;background:radial-gradient(ellipse,#ffc842,#e6a820);border-radius:50% 60% 50% 40%;box-shadow:0 0 4px rgba(255,200,66,0.4)', classes: 'art-fish-bob-delay' },
                // Bubbles
                { style: 'top:18%;left:48%;width:3%;height:3%;background:radial-gradient(circle,rgba(200,230,250,0.6),transparent);border-radius:50%', classes: 'art-bubble-rise' },
                { style: 'top:20%;left:44%;width:2%;height:2%;background:radial-gradient(circle,rgba(200,230,250,0.5),transparent);border-radius:50%', classes: 'art-bubble-rise-delay' },
                // Strange picture on wall
                { style: 'top:10%;left:8%;width:18%;height:22%;background:linear-gradient(135deg,#d4a030,#c89020,#e0b840,#d4a030);border:4px solid #5a3d22;box-shadow:2px 2px 6px rgba(0,0,0,0.3)' },
                // Picture inner (abstract)
                { style: 'top:13%;left:10%;width:14%;height:16%;background:radial-gradient(ellipse at 40% 40%,#e8c040,#c89020,#a07818);opacity:0.8' },
                // Small shelf with knick-knacks
                { style: 'top:38%;left:72%;width:20%;height:4%;background:linear-gradient(to bottom,#8b6914,#7a5c12);border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.2)' },
                // Vignette
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            // Exit west
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Fred\'s House',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            // Exit east to kitchen
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Kitchen \u2192',
                position: { top: '30%', right: '0', width: '8%', height: '35%' }
            },
            // Goldfish
            {
                id: 'goldfish_char', type: 'character', characterId: 'goldfish',
                label: 'The Goldfish',
                lookText: 'Two oversized goldfish swim in lazy circles. The larger one seems to be watching you.',
                position: { top: '12%', left: '34%', width: '32%', height: '30%' }
            },
            // Penny (appears after feeding fish)
            {
                id: 'penny_item', type: 'item', itemId: 'penny',
                label: 'Penny',
                lookText: 'A slimy penny sitting on the edge of the tank stand.',
                position: { top: '32%', left: '42%', width: '8%', height: '8%' },
                visible: function(state) {
                    return state.getFlag('goldfish_fed');
                }
            },
            // Picture (scenery)
            {
                id: 'picture', type: 'scenery',
                label: 'Strange Picture',
                lookText: "It's the famous picture. Generations of viewers have stared at this thing trying to figure out what it is. You're no closer to understanding it than anyone else.",
                position: { top: '10%', left: '8%', width: '18%', height: '22%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "The goldfish eye you suspiciously. They've seen things.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // FRONT PORCH
    // ====================================================
    front_porch: {
        name: 'Front Porch',
        description: "You're standing on Fred's front porch. The Landlord is blocking the path to the street, arms crossed, looking extremely unimpressed with your life choices.",
        zone: 'realworld',
        exits: {
            east: 'freds_house',
            north: 'road_with_houses'
        },
        items: [],
        characters: ['landlord'],
        art: {
            background: 'linear-gradient(to bottom, #87CEEB, #a8d8ea 40%, #e8dcc8 40%)',
            layers: [
                // Sky
                { style: 'top:0;left:0;right:0;height:40%', classes: 'art-sky' },
                // Clouds
                { style: 'top:5%;left:15%;width:20%;height:10%;background:radial-gradient(ellipse,rgba(255,255,255,0.9),transparent);border-radius:50%' },
                { style: 'top:8%;left:60%;width:25%;height:12%;background:radial-gradient(ellipse,rgba(255,255,255,0.85),transparent);border-radius:50%' },
                // House front wall
                { style: 'top:20%;left:45%;right:0;height:48%;background:linear-gradient(to bottom,#d4c0a0,#c8b494)' },
                // Roof edge
                { style: 'top:18%;left:40%;right:0;height:4%;background:linear-gradient(to bottom,#6b4a2a,#5a3d22);transform:skewX(-5deg)' },
                // Front door
                { style: 'top:30%;left:65%;width:16%;height:35%;background:linear-gradient(to bottom,#6b3020,#5a2818);border-radius:4px 4px 0 0;box-shadow:inset 0 0 8px rgba(0,0,0,0.3)' },
                // Door window
                { style: 'top:32%;left:68%;width:10%;height:12%;background:linear-gradient(to bottom,rgba(160,210,230,0.5),rgba(120,180,210,0.3));border:2px solid #4a2015;border-radius:2px' },
                // Doorknob
                { style: 'top:48%;left:78%;width:2%;height:3%;background:radial-gradient(circle,#d4a832,#b8922a);border-radius:50%' },
                // Porch floor
                { style: 'top:65%;left:0;right:0;height:10%;background:linear-gradient(to bottom,#b8a080,#a89070)' },
                // Porch railing
                { style: 'top:40%;left:0;width:45%;height:3%;background:linear-gradient(to bottom,#f0e0c8,#e0d0b8);border-radius:2px' },
                // Railing posts
                { style: 'top:40%;left:5%;width:2%;height:25%;background:linear-gradient(to right,#f0e0c8,#e0d0b8);border-radius:2px' },
                { style: 'top:40%;left:20%;width:2%;height:25%;background:linear-gradient(to right,#f0e0c8,#e0d0b8);border-radius:2px' },
                { style: 'top:40%;left:35%;width:2%;height:25%;background:linear-gradient(to right,#f0e0c8,#e0d0b8);border-radius:2px' },
                // Porch steps (leading to street/north)
                { style: 'bottom:15%;left:10%;width:25%;height:12%;background:linear-gradient(to bottom,#a89070,#988060,#887050);border-radius:2px' },
                // Ground/grass
                { style: 'bottom:0;left:0;right:0;height:15%', classes: 'art-grass' },
                // Mailbox
                { style: 'bottom:12%;left:3%;width:6%;height:18%;background:linear-gradient(to bottom,#4a6080,#3a5070);border-radius:4px 4px 0 0' },
                { style: 'bottom:28%;left:2%;width:8%;height:4%;background:#5a7090;border-radius:2px' },
                // Vignette
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            // Exit east back to house
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Fred\'s House \u2192',
                position: { top: '30%', right: '0', width: '10%', height: '35%' }
            },
            // Exit north to street (blocked by landlord initially)
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 Street',
                position: { bottom: '10%', left: '12%', width: '20%', height: '18%' },
                blocked: function(state) {
                    return !state.getFlag('landlord_paid');
                },
                blockedText: 'The Landlord blocks your path. "You\'re not going ANYWHERE until you pay up, Rogers!"'
            },
            // Landlord
            {
                id: 'landlord_char', type: 'character', characterId: 'landlord',
                label: 'The Landlord',
                lookText: 'A red-faced man in a rumpled suit. He looks like he\'s been waiting here for approximately six years.',
                position: { top: '35%', left: '15%', width: '18%', height: '32%' }
            },
            // Front door (scenery)
            {
                id: 'front_door', type: 'scenery',
                label: 'Front Door',
                lookText: "The front door to Fred's house. You just came from in there. The doorknob is worn smooth from decades of wholesome entrances.",
                position: { top: '30%', left: '65%', width: '16%', height: '35%' }
            },
            // Mailbox (scenery)
            {
                id: 'mailbox', type: 'scenery',
                label: 'Mailbox',
                lookText: "The mailbox reads 'ROGERS' in faded letters. It's stuffed with collection notices and fan mail in equal measure.",
                position: { bottom: '12%', left: '2%', width: '8%', height: '20%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit && !state.getFlag('landlord_paid')) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "The Landlord spots you immediately. This is not going to be pleasant.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // KITCHEN
    // ====================================================
    kitchen: {
        name: 'Kitchen',
        description: "Fred's kitchen. It's surprisingly normal except for the cookie jar shaped like a trolley. Something tells you there's more than cookies in there.",
        zone: 'realworld',
        exits: {
            south: 'fish_room',
            north: 'backyard',
            east: 'bathroom'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #f5e6d0, #ede0cc)',
            layers: [
                { style: 'top:0;left:0;right:0;height:65%', classes: 'art-wall' },
                { style: 'bottom:0;left:0;right:0;height:35%', classes: 'art-floor-tile' },
                { style: 'top:65%;left:0;right:0;height:3%', classes: 'art-baseboard' },
                // Cabinets upper
                { style: 'top:5%;left:10%;width:35%;height:25%;background:linear-gradient(to bottom,#b8956a,#a88558);border:2px solid #8a6540;border-radius:4px' },
                { style: 'top:5%;left:55%;width:35%;height:25%;background:linear-gradient(to bottom,#b8956a,#a88558);border:2px solid #8a6540;border-radius:4px' },
                // Cabinet doors
                { style: 'top:7%;left:12%;width:14%;height:21%;background:linear-gradient(to bottom,#c8a578,#b89568);border:1px solid #8a6540;border-radius:2px' },
                { style: 'top:7%;left:29%;width:14%;height:21%;background:linear-gradient(to bottom,#c8a578,#b89568);border:1px solid #8a6540;border-radius:2px' },
                // Counter
                { style: 'top:32%;left:5%;width:90%;height:8%;background:linear-gradient(to bottom,#e0d0b8,#d0c0a8);border-radius:2px;box-shadow:0 2px 4px rgba(0,0,0,0.15)' },
                // Lower cabinets
                { style: 'top:40%;left:5%;width:40%;height:25%;background:linear-gradient(to bottom,#b8956a,#a88558);border:2px solid #8a6540;border-radius:2px' },
                // Stove
                { style: 'top:40%;left:55%;width:30%;height:25%;background:linear-gradient(to bottom,#e8e8e8,#d0d0d0);border:2px solid #a0a0a0;border-radius:2px' },
                // Stove burners
                { style: 'top:41%;left:60%;width:8%;height:5%;background:radial-gradient(circle,#333,#555);border-radius:50%' },
                { style: 'top:41%;left:72%;width:8%;height:5%;background:radial-gradient(circle,#333,#555);border-radius:50%' },
                // Cookie jar (trolley-shaped)
                { style: 'top:24%;left:42%;width:12%;height:12%;background:linear-gradient(to bottom,#d44040,#b83030);border-radius:6px 6px 2px 2px;box-shadow:0 2px 4px rgba(0,0,0,0.2)' },
                { style: 'top:25%;left:44%;width:8%;height:4%;background:linear-gradient(to bottom,#e05050,#d44040);border-radius:4px 4px 0 0' },
                // Window over sink
                { style: 'top:5%;left:42%;width:12%;height:20%', classes: 'art-window' },
                // Vignette
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Fish Room',
                position: { bottom: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 Backyard',
                position: { top: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Bathroom \u2192',
                position: { top: '30%', right: '0', width: '8%', height: '35%' }
            },
            {
                id: 'cookie_jar', type: 'searchable',
                label: 'Cookie Jar',
                lookText: 'A cookie jar shaped like a tiny trolley. Classic Fred.',
                position: { top: '22%', left: '40%', width: '16%', height: '16%' },
                onSearch: function(state, eventBus) {
                    if (state.getFlag('cookie_jar_searched')) {
                        eventBus.emit('narration:show', {
                            text: "You've already cleaned out the cookie jar. Not a crumb left.",
                            style: 'normal'
                        });
                        return;
                    }
                    state.setFlag('cookie_jar_searched', true);
                    state.revealItem('bundle_of_money');
                    state.addToInventory('bundle_of_money');
                    state.addScore(5);
                    eventBus.emit('narration:show', {
                        text: "Inside the cookie jar, hidden beneath stale cookies, you find a bundle of cash. About fifty bucks, held together with a rubber band. Fred's rainy-day fund.",
                        style: 'discovery'
                    });
                }
            },
            {
                id: 'stove', type: 'scenery',
                label: 'Stove',
                lookText: "The stove hasn't been used in a while. There's a pot of fossilized oatmeal that may have achieved sentience.",
                position: { top: '40%', left: '55%', width: '30%', height: '25%' }
            }
        ]
    },

    // ====================================================
    // BACKYARD
    // ====================================================
    backyard: {
        name: 'Backyard',
        description: "Fred's backyard. A modest patch of grass with a garden shed and a suspicious amount of gardening equipment for someone who's never been seen gardening.",
        zone: 'realworld',
        exits: {
            south: 'kitchen',
            west: 'neighbors_garden',
            north: 'pbs_lair'
        },
        items: ['axe'],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #87CEEB, #a8d8ea 35%, #7cb868 35%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:35%', classes: 'art-sky' },
                { style: 'top:5%;left:20%;width:18%;height:8%;background:radial-gradient(ellipse,rgba(255,255,255,0.9),transparent);border-radius:50%' },
                { style: 'bottom:0;left:0;right:0;height:65%', classes: 'art-grass' },
                // Fence
                { style: 'top:30%;left:0;right:0;height:8%;background:linear-gradient(to bottom,#d4c0a0,#c8b090);border-top:3px solid #b8a080' },
                // Fence posts
                { style: 'top:28%;left:10%;width:2%;height:14%;background:#c8b090;border-radius:2px' },
                { style: 'top:28%;left:30%;width:2%;height:14%;background:#c8b090;border-radius:2px' },
                { style: 'top:28%;left:50%;width:2%;height:14%;background:#c8b090;border-radius:2px' },
                { style: 'top:28%;left:70%;width:2%;height:14%;background:#c8b090;border-radius:2px' },
                { style: 'top:28%;left:90%;width:2%;height:14%;background:#c8b090;border-radius:2px' },
                // Garden shed
                { style: 'top:35%;right:5%;width:25%;height:32%;background:linear-gradient(to bottom,#8b6540,#7a5830);border-radius:2px' },
                { style: 'top:30%;right:3%;width:29%;height:8%;background:linear-gradient(to bottom,#6b4520,#5a3818);border-radius:2px 2px 0 0;transform:perspective(100px) rotateX(5deg)' },
                // Shed door
                { style: 'top:42%;right:10%;width:10%;height:22%;background:linear-gradient(to bottom,#6b4a2a,#5a3d22);border:1px solid #4a3018' },
                // Tree
                { style: 'top:20%;left:15%;width:20%;height:25%;background:radial-gradient(ellipse,#5a8a3a,#4a7a2a,#3a6a20);border-radius:50%' },
                { style: 'top:42%;left:23%;width:4%;height:25%;background:linear-gradient(to right,#6b4520,#5a3818,#6b4520)' },
                // Axe (visible item)
                { style: 'top:55%;left:60%;width:3%;height:18%;background:linear-gradient(to bottom,#8b6540,#7a5830);border-radius:1px;transform:rotate(15deg)' },
                { style: 'top:53%;left:59%;width:5%;height:6%;background:linear-gradient(to bottom,#888,#666);border-radius:2px 2px 50% 50%;transform:rotate(15deg)' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Kitchen',
                position: { bottom: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Neighbor\'s Garden',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 PBS Lair',
                position: { top: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'axe_item', type: 'item', itemId: 'axe',
                label: 'Axe',
                lookText: 'A small axe leaning against the shed. It looks sharp enough to scare something.',
                position: { top: '50%', left: '55%', width: '14%', height: '25%' }
            },
            {
                id: 'shed', type: 'scenery',
                label: 'Garden Shed',
                lookText: "The shed is padlocked shut. Through the cracks you can see more garden tools and what appears to be a very old lawnmower.",
                position: { top: '35%', right: '5%', width: '25%', height: '32%' }
            },
            {
                id: 'tree', type: 'scenery',
                label: 'Tree',
                lookText: "A tired-looking oak tree. A squirrel glares at you from a branch, clearly judging your life choices.",
                position: { top: '20%', left: '10%', width: '25%', height: '45%' }
            }
        ]
    },

    // ====================================================
    // BATHROOM
    // ====================================================
    bathroom: {
        name: 'Bathroom',
        description: "Fred's bathroom. Surprisingly clean for a man who lives alone. A laundry hamper sits in the corner, and the drain looks... unusual.",
        zone: 'realworld',
        exits: {
            west: 'kitchen',
            down: 'sewer'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #e0e8f0, #d0d8e0)',
            layers: [
                // Tile walls
                { style: 'top:0;left:0;right:0;height:65%;background:repeating-linear-gradient(90deg,#d0dce8 0px,#d0dce8 48px,#c0ccd8 48px,#c0ccd8 50px),repeating-linear-gradient(0deg,#d0dce8 0px,#d0dce8 48px,#c0ccd8 48px,#c0ccd8 50px)' },
                // Floor tile
                { style: 'bottom:0;left:0;right:0;height:35%', classes: 'art-floor-tile' },
                // Bathtub
                { style: 'top:35%;left:5%;width:40%;height:30%;background:linear-gradient(to bottom,#f8f8ff,#e8e8f0);border:3px solid #c0c8d0;border-radius:0 0 20px 20px' },
                // Tub inner
                { style: 'top:38%;left:8%;width:34%;height:20%;background:linear-gradient(to bottom,rgba(160,200,230,0.2),rgba(140,180,210,0.3));border-radius:0 0 16px 16px' },
                // Faucet
                { style: 'top:30%;left:35%;width:8%;height:8%;background:linear-gradient(to bottom,#c0c0c0,#a0a0a0);border-radius:50% 50% 0 0' },
                // Sink
                { style: 'top:25%;left:55%;width:20%;height:18%;background:linear-gradient(to bottom,#f0f0f5,#e0e0e8);border:2px solid #c0c8d0;border-radius:0 0 50% 50%' },
                // Mirror over sink
                { style: 'top:5%;left:57%;width:16%;height:18%;background:linear-gradient(135deg,#c8d8e8,#e0eaf4,#b8c8d8);border:3px solid #a0a0a0;border-radius:4px' },
                // Toilet
                { style: 'top:38%;right:8%;width:14%;height:24%;background:linear-gradient(to bottom,#f8f8ff,#e8e8f0);border:2px solid #d0d0d8;border-radius:4px 4px 50% 50%' },
                { style: 'top:32%;right:9%;width:12%;height:8%;background:linear-gradient(to bottom,#f0f0f5,#e8e8f0);border:2px solid #d0d0d8;border-radius:4px' },
                // Hamper
                { style: 'bottom:12%;left:50%;width:14%;height:20%;background:linear-gradient(to bottom,#c8a870,#b89860);border-radius:4px;box-shadow:inset 0 -4px 8px rgba(0,0,0,0.1)' },
                { style: 'bottom:30%;left:51%;width:12%;height:4%;background:linear-gradient(to bottom,#d8b880,#c8a870);border-radius:4px 4px 0 0' },
                // Drain grate (floor, near tub)
                { style: 'bottom:8%;left:20%;width:10%;height:6%;background:repeating-linear-gradient(90deg,#555 0px,#555 3px,#444 3px,#444 5px);border-radius:2px;opacity:0.7' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Kitchen',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            {
                id: 'exit_down', type: 'exit', exitDir: 'down',
                label: '\u2193 Sewer',
                position: { bottom: '5%', left: '18%', width: '14%', height: '12%' },
                blocked: function(state) {
                    return !state.getFlag('sewer_hinted');
                },
                blockedText: "It's just a drain. Nothing special about it... right?"
            },
            {
                id: 'hamper', type: 'searchable',
                label: 'Hamper',
                lookText: "A wicker laundry hamper. It's overflowing slightly.",
                position: { bottom: '10%', left: '48%', width: '18%', height: '24%' },
                onSearch: function(state, eventBus) {
                    if (state.getFlag('hamper_searched')) {
                        eventBus.emit('narration:show', {
                            text: "You've already dug through Fred's laundry. Once was traumatic enough.",
                            style: 'normal'
                        });
                        return;
                    }
                    state.setFlag('hamper_searched', true);
                    state.revealItem('unmentionables');
                    state.addToInventory('unmentionables');
                    state.addScore(5);
                    eventBus.emit('narration:show', {
                        text: "You dig through the hamper and find a pair of Fred's unmentionables. They have tiny trolleys printed on them. You reluctantly pocket them.",
                        style: 'discovery'
                    });
                }
            },
            {
                id: 'bathtub', type: 'scenery',
                label: 'Bathtub',
                lookText: "A perfectly normal bathtub. There's a rubber duck sitting on the edge, staring into the void.",
                position: { top: '35%', left: '5%', width: '40%', height: '30%' }
            },
            {
                id: 'mirror', type: 'scenery',
                label: 'Mirror',
                lookText: "You look at yourself in the mirror. You see a man in a cardigan who steals trolleys. Is this who you've become, Fred?",
                position: { top: '5%', left: '57%', width: '16%', height: '18%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (state.getFlag('sewer_hinted') && !state.getFlag('sewer_shown') && data.firstVisit) {
                state.setFlag('sewer_shown', true);
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "Wait... the goldfish mentioned something about the plumbing. That drain grate looks like it could be lifted...",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // NEIGHBOR'S GARDEN
    // ====================================================
    neighbors_garden: {
        name: "Neighbor's Garden",
        description: "The neighbor's garden. It's annoyingly well-maintained. Someone appears to be hiding behind the prize-winning hedge.",
        zone: 'realworld',
        exits: {
            east: 'backyard'
        },
        items: [],
        characters: ['streaker'],
        art: {
            background: 'linear-gradient(to bottom, #87CEEB, #a8d8ea 30%, #6ab858 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%', classes: 'art-sky' },
                { style: 'bottom:0;left:0;right:0;height:70%', classes: 'art-grass' },
                // Flower beds
                { style: 'bottom:30%;left:5%;width:25%;height:15%;background:linear-gradient(to bottom,#4a7a2a,#3a6a20);border-radius:50% 50% 0 0' },
                // Flowers
                { style: 'bottom:40%;left:8%;width:4%;height:4%;background:radial-gradient(circle,#ff6080,#e04060);border-radius:50%' },
                { style: 'bottom:42%;left:15%;width:4%;height:4%;background:radial-gradient(circle,#ff8040,#e06020);border-radius:50%' },
                { style: 'bottom:38%;left:22%;width:4%;height:4%;background:radial-gradient(circle,#ffe040,#e0c020);border-radius:50%' },
                // Prize-winning hedge (large, center)
                { style: 'top:30%;left:30%;width:35%;height:40%;background:radial-gradient(ellipse,#4a8a2a,#3a7a1a,#2a6a10);border-radius:50% 50% 10% 10%' },
                // Garden statue
                { style: 'bottom:20%;right:10%;width:8%;height:25%;background:linear-gradient(to bottom,#c8c8c8,#a0a0a0);border-radius:4px' },
                { style: 'bottom:42%;right:11%;width:6%;height:6%;background:radial-gradient(circle,#d0d0d0,#b0b0b0);border-radius:50%' },
                // White picket fence
                { style: 'top:28%;left:0;right:0;height:4%;background:linear-gradient(to bottom,#f8f8f0,#e8e8e0)' },
                { style: 'top:25%;left:5%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { style: 'top:25%;left:15%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { style: 'top:25%;left:25%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { style: 'top:25%;left:75%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { style: 'top:25%;left:85%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { style: 'top:25%;left:95%;width:2%;height:10%;background:#f0f0e8;border-radius:2px 2px 0 0' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Backyard \u2192',
                position: { top: '30%', right: '0', width: '8%', height: '35%' }
            },
            {
                id: 'streaker_char', type: 'character', characterId: 'streaker',
                label: 'The Streaker',
                lookText: "Someone is hiding behind the hedge, and they're... not wearing clothes. They look absolutely mortified.",
                position: { top: '35%', left: '35%', width: '25%', height: '35%' }
            },
            {
                id: 'dollar_bill_item', type: 'item', itemId: 'dollar_bill',
                label: 'Dollar Bill',
                lookText: "A crumpled dollar bill on the ground. You don't want to think about where it was before.",
                position: { bottom: '25%', left: '40%', width: '10%', height: '8%' },
                visible: function(state) {
                    return state.getFlag('streaker_clothed');
                }
            },
            {
                id: 'flowers', type: 'scenery',
                label: 'Flowers',
                lookText: "Beautiful, well-tended flowers. Your neighbor clearly has more time than you do.",
                position: { bottom: '28%', left: '5%', width: '25%', height: '18%' }
            },
            {
                id: 'statue', type: 'scenery',
                label: 'Garden Statue',
                lookText: "A garden gnome with an unsettling grin. Its eyes seem to follow you. This neighborhood is weird.",
                position: { bottom: '18%', right: '8%', width: '12%', height: '30%' }
            }
        ]
    },

    // ====================================================
    // PBS LAIR
    // ====================================================
    pbs_lair: {
        name: 'PBS Lair',
        description: "The PBS President's private office. It's disgustingly opulent by public broadcasting standards. The President sits behind an enormous desk, painting a tiny egg.",
        zone: 'realworld',
        exits: {
            south: 'backyard'
        },
        items: [],
        characters: ['pbs_president'],
        art: {
            background: 'linear-gradient(to bottom, #2a2040, #3a2850)',
            layers: [
                // Dark paneled walls
                { style: 'top:0;left:0;right:0;height:65%;background:linear-gradient(to bottom,#4a3828,#3a2818);box-shadow:inset 0 0 20px rgba(0,0,0,0.3)' },
                // Wainscoting
                { style: 'top:45%;left:0;right:0;height:20%;background:linear-gradient(to bottom,#5a4838,#4a3828);border-top:2px solid #6a5848' },
                // Floor (carpet)
                { style: 'bottom:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,#4a2028,#3a1820)' },
                // Enormous desk
                { style: 'top:40%;left:20%;width:55%;height:25%;background:linear-gradient(to bottom,#5a3818,#4a2810);border-radius:2px;box-shadow:0 4px 8px rgba(0,0,0,0.4)' },
                // Desk top surface
                { style: 'top:38%;left:18%;width:59%;height:4%;background:linear-gradient(to bottom,#6a4828,#5a3818);border-radius:2px' },
                // Egg painting on desk
                { style: 'top:32%;left:40%;width:6%;height:8%;background:radial-gradient(ellipse,#f0e0c0,#e0d0b0);border-radius:50%;box-shadow:0 0 6px rgba(240,224,192,0.3)' },
                // PBS logo on wall
                { style: 'top:8%;left:40%;width:16%;height:12%;background:linear-gradient(135deg,#2060a0,#3080c0);border:3px solid #80a0c0;border-radius:4px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:0.9rem', html: 'PBS' },
                // Ego wall (framed photos)
                { style: 'top:10%;left:5%;width:10%;height:14%;background:linear-gradient(to bottom,#888,#666);border:2px solid #aa8844;border-radius:2px' },
                { style: 'top:8%;left:20%;width:8%;height:12%;background:linear-gradient(to bottom,#888,#666);border:2px solid #aa8844;border-radius:2px' },
                { style: 'top:12%;right:5%;width:10%;height:14%;background:linear-gradient(to bottom,#888,#666);border:2px solid #aa8844;border-radius:2px' },
                { style: 'top:10%;right:20%;width:8%;height:10%;background:linear-gradient(to bottom,#888,#666);border:2px solid #aa8844;border-radius:2px' },
                // Leather chair behind desk
                { style: 'top:28%;left:38%;width:20%;height:20%;background:radial-gradient(ellipse,#6a3828,#5a2818);border-radius:50% 50% 10% 10%' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Backyard',
                position: { bottom: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'pbs_char', type: 'character', characterId: 'pbs_president',
                label: 'PBS President',
                lookText: "The PBS President. He's wearing a suit that costs more than Fred's annual salary. He's painting a tiny egg with extreme concentration.",
                position: { top: '25%', left: '30%', width: '30%', height: '35%' }
            },
            {
                id: 'egg_painting', type: 'scenery',
                label: 'Egg Painting',
                lookText: "A tiny egg being painstakingly painted. It looks like a blind child's first attempt at abstract art, but the President seems extremely proud of it.",
                position: { top: '30%', left: '38%', width: '10%', height: '12%' }
            },
            {
                id: 'ego_wall', type: 'scenery',
                label: 'Ego Wall',
                lookText: "Photos of the PBS President shaking hands with various minor celebrities. In every photo, he's the only one smiling.",
                position: { top: '5%', left: '3%', width: '30%', height: '20%' }
            }
        ]
    },

    // ====================================================
    // ROAD WITH HOUSES
    // ====================================================
    road_with_houses: {
        name: 'Road with Houses',
        description: "A quiet suburban street. Identical houses line both sides. It looks like the opening shot of a show about a man who's definitely hiding something.",
        zone: 'realworld',
        exits: {
            south: 'front_porch',
            east: 'quiet_street'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #87CEEB, #a8d8ea 30%, #a0a0a0 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%', classes: 'art-sky' },
                { style: 'top:4%;left:10%;width:22%;height:10%;background:radial-gradient(ellipse,rgba(255,255,255,0.8),transparent);border-radius:50%' },
                // Road
                { style: 'bottom:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#707070,#606060)' },
                // Road line
                { style: 'bottom:13%;left:15%;width:12%;height:2%;background:#e0d840;border-radius:1px' },
                { style: 'bottom:13%;left:40%;width:12%;height:2%;background:#e0d840;border-radius:1px' },
                { style: 'bottom:13%;left:65%;width:12%;height:2%;background:#e0d840;border-radius:1px' },
                // Sidewalk
                { style: 'bottom:28%;left:0;right:0;height:5%;background:linear-gradient(to bottom,#c8c0b0,#b8b0a0)' },
                // Grass strip
                { style: 'bottom:33%;left:0;right:0;height:5%', classes: 'art-grass' },
                // House 1 (left)
                { style: 'top:20%;left:5%;width:22%;height:38%;background:linear-gradient(to bottom,#d4b894,#c8a880)' },
                { style: 'top:14%;left:3%;width:26%;height:8%;background:linear-gradient(to bottom,#6b4520,#5a3818);clip-path:polygon(0 100%,50% 0,100% 100%)' },
                { style: 'top:28%;left:10%;width:8%;height:12%;background:linear-gradient(to bottom,#5a3020,#4a2818);border-radius:2px' },
                // House 2 (center)
                { style: 'top:22%;left:35%;width:24%;height:36%;background:linear-gradient(to bottom,#b8c8d8,#a8b8c8)' },
                { style: 'top:16%;left:33%;width:28%;height:8%;background:linear-gradient(to bottom,#8a4830,#7a3820);clip-path:polygon(0 100%,50% 0,100% 100%)' },
                { style: 'top:30%;left:42%;width:8%;height:12%;background:linear-gradient(to bottom,#5a3020,#4a2818);border-radius:2px' },
                // House 3 (right)
                { style: 'top:20%;right:5%;width:20%;height:38%;background:linear-gradient(to bottom,#e8d8c0,#d8c8b0)' },
                { style: 'top:14%;right:3%;width:24%;height:8%;background:linear-gradient(to bottom,#4a5a6a,#3a4a5a);clip-path:polygon(0 100%,50% 0,100% 100%)' },
                // Lamp post
                { style: 'bottom:25%;left:33%;width:1.5%;height:30%;background:linear-gradient(to right,#444,#333,#444)' },
                { style: 'top:18%;left:31%;width:6%;height:5%;background:radial-gradient(ellipse,#ffe880,#e8d060);border-radius:50%;box-shadow:0 0 10px rgba(255,232,128,0.4)' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Front Porch',
                position: { bottom: '0', left: '10%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Quiet Street \u2192',
                position: { top: '30%', right: '0', width: '8%', height: '35%' }
            },
            {
                id: 'houses', type: 'scenery',
                label: 'Houses',
                lookText: "Cookie-cutter houses. Each one harbors its own secrets, but you've got enough problems without getting involved in theirs.",
                position: { top: '15%', left: '5%', width: '85%', height: '40%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "Freedom! The open road stretches before you. Well, a suburban street. But it's a start.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // QUIET STREET
    // ====================================================
    quiet_street: {
        name: 'Quiet Street',
        description: "A quieter section of the neighborhood. The houses thin out here. An alley branches off to the north, and the street continues south toward something... strange.",
        zone: 'realworld',
        exits: {
            west: 'road_with_houses',
            north: 'scuzzy_alley',
            south: 'side_street'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #7ab8d8, #90c0d8 30%, #909090 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%', classes: 'art-sky' },
                // Road
                { style: 'bottom:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#686868,#585858)' },
                { style: 'bottom:13%;left:20%;width:10%;height:2%;background:#d8d040;border-radius:1px' },
                { style: 'bottom:13%;left:50%;width:10%;height:2%;background:#d8d040;border-radius:1px' },
                // Sidewalk
                { style: 'bottom:28%;left:0;right:0;height:5%;background:#b8b0a0' },
                { style: 'bottom:33%;left:0;right:0;height:5%', classes: 'art-grass' },
                // One house (distant)
                { style: 'top:22%;left:5%;width:18%;height:30%;background:linear-gradient(to bottom,#c0b0a0,#b0a090);opacity:0.7' },
                { style: 'top:17%;left:3%;width:22%;height:7%;background:#5a4a3a;clip-path:polygon(0 100%,50% 0,100% 100%);opacity:0.7' },
                // Empty lot
                { style: 'top:30%;left:30%;width:30%;height:30%;background:linear-gradient(to bottom,#7ab050,#6aa040);border-radius:2px' },
                // Lamp post (dimmer)
                { style: 'bottom:25%;right:20%;width:1.5%;height:28%;background:#444' },
                { style: 'top:22%;right:18%;width:5%;height:4%;background:radial-gradient(ellipse,#e8d870,#d0c050);border-radius:50%;opacity:0.6;box-shadow:0 0 6px rgba(232,216,112,0.3)' },
                // Alley entrance (north)
                { style: 'top:25%;left:65%;width:20%;height:35%;background:linear-gradient(to bottom,#3a3a3a,#2a2a2a);border-radius:2px' },
                // Alley walls
                { style: 'top:25%;left:64%;width:3%;height:35%;background:#5a4a3a' },
                { style: 'top:25%;left:84%;width:3%;height:35%;background:#5a4a3a' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Road',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 Scuzzy Alley',
                position: { top: '25%', left: '65%', width: '20%', height: '15%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Side Street',
                position: { bottom: '0', left: '38%', width: '24%', height: '8%' }
            }
        ]
    },

    // ====================================================
    // SCUZZY ALLEY
    // ====================================================
    scuzzy_alley: {
        name: 'Scuzzy Alley',
        description: "A dark, narrow alley that smells like bad decisions. Graffiti covers every surface. A shadowy figure lurks near the dumpster.",
        zone: 'realworld',
        exits: {
            south: 'quiet_street'
        },
        items: [],
        characters: ['mugger'],
        art: {
            background: 'linear-gradient(to bottom, #3a3a3a, #2a2a2a)',
            layers: [
                // Dirty brick walls
                { style: 'top:0;left:0;width:15%;height:100%;background:repeating-linear-gradient(0deg,#5a4030 0px,#5a4030 8px,#4a3020 8px,#4a3020 10px)' },
                { style: 'top:0;right:0;width:15%;height:100%;background:repeating-linear-gradient(0deg,#5a4030 0px,#5a4030 8px,#4a3020 8px,#4a3020 10px)' },
                // Ground
                { style: 'bottom:0;left:15%;right:15%;height:35%;background:linear-gradient(to bottom,#484040,#383030)' },
                // Puddle
                { style: 'bottom:5%;left:30%;width:15%;height:6%;background:radial-gradient(ellipse,rgba(60,80,100,0.6),transparent);border-radius:50%' },
                // Dumpster
                { style: 'top:30%;right:18%;width:22%;height:28%;background:linear-gradient(to bottom,#4a6848,#3a5838);border:2px solid #2a4828;border-radius:2px' },
                { style: 'top:28%;right:17%;width:24%;height:4%;background:#5a7858;border-radius:2px 2px 0 0' },
                // Graffiti wall
                { style: 'top:10%;left:18%;width:20%;height:18%;background:linear-gradient(135deg,#d04040,#e06020,#d0d030,#40a040);border-radius:2px;opacity:0.7' },
                { style: 'top:15%;left:20%;width:5%;height:3%;background:none;color:#e0e0e0;font-size:0.6rem;display:flex;align-items:center', html: '%@#!' },
                // Fire escape (on wall)
                { style: 'top:5%;left:3%;width:10%;height:40%;background:repeating-linear-gradient(0deg,#555 0px,#555 2px,transparent 2px,transparent 10px);opacity:0.5' },
                // Trash on ground
                { style: 'bottom:10%;left:20%;width:4%;height:3%;background:#8a8040;border-radius:1px;transform:rotate(20deg)' },
                { style: 'bottom:8%;left:50%;width:3%;height:3%;background:#6a6a6a;border-radius:50%;opacity:0.6' },
                // Dim overhead light
                { style: 'top:2%;left:45%;width:10%;height:8%;background:radial-gradient(ellipse,rgba(200,180,120,0.3),transparent);border-radius:50%' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Quiet Street',
                position: { bottom: '0', left: '30%', width: '24%', height: '8%' }
            },
            {
                id: 'mugger_char', type: 'character', characterId: 'mugger',
                label: 'The Mugger',
                lookText: "A figure in a ski mask lurking near the dumpster. He's trying to look menacing but keeps checking his phone.",
                position: { top: '35%', right: '20%', width: '18%', height: '30%' }
            },
            {
                id: 'graffiti', type: 'searchable',
                label: 'Graffiti Wall',
                lookText: "The wall is covered in creative profanity. Some of it is actually quite... artistic?",
                position: { top: '8%', left: '16%', width: '24%', height: '22%' },
                onSearch: function(state, eventBus) {
                    if (state.getFlag('graffiti_searched')) {
                        eventBus.emit('narration:show', {
                            text: "You've already memorized all the cuss words. Your vocabulary is... expanded.",
                            style: 'normal'
                        });
                        return;
                    }
                    state.setFlag('graffiti_searched', true);
                    state.revealItem('cuss_words');
                    state.addToInventory('cuss_words');
                    state.addScore(5);
                    eventBus.emit('narration:show', {
                        text: "You carefully transcribe the most creative profanity onto a scrap of paper. These cuss words would make a sailor blush. Might come in handy.",
                        style: 'discovery'
                    });
                }
            },
            {
                id: 'dumpster', type: 'scenery',
                label: 'Dumpster',
                lookText: "A dumpster overflowing with mysterious refuse. Something inside it just moved. You decide not to investigate further.",
                position: { top: '28%', right: '16%', width: '26%', height: '32%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit && !state.getFlag('mugger_paid')) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "A shadow detaches itself from the wall. This doesn't look like a friendly neighborhood.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // SIDE STREET
    // ====================================================
    side_street: {
        name: 'Side Street',
        description: "A side street that dead-ends at something impossible. The air shimmers and the colors seem wrong. Something beyond the end of the road shouldn't exist.",
        zone: 'realworld',
        exits: {
            north: 'quiet_street',
            south: 'dimensional_warp'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #6a98b8, #8ab0c8 25%, #808080 25%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:25%', classes: 'art-sky' },
                // Road narrowing toward south
                { style: 'bottom:0;left:10%;right:10%;height:40%;background:linear-gradient(to bottom,#606060,#505050)' },
                { style: 'bottom:38%;left:8%;right:8%;height:4%;background:#b0a890' },
                // Grass/dirt sides
                { style: 'bottom:0;left:0;width:12%;height:40%;background:#6a8a4a' },
                { style: 'bottom:0;right:0;width:12%;height:40%;background:#6a8a4a' },
                // Abandoned house
                { style: 'top:18%;left:5%;width:25%;height:35%;background:linear-gradient(to bottom,#8a7a6a,#7a6a5a);opacity:0.7' },
                { style: 'top:22%;left:10%;width:8%;height:10%;background:rgba(0,0,0,0.4);border:1px solid #5a4a3a' },
                // Strange shimmer at end of street
                { style: 'bottom:0;left:25%;right:25%;height:15%;background:linear-gradient(to bottom,rgba(160,100,200,0.4),rgba(200,120,220,0.6),rgba(160,100,200,0.4));animation:shimmer 2s ease-in-out infinite' },
                // Dead end barrier
                { style: 'bottom:38%;left:25%;right:25%;height:3%;background:linear-gradient(90deg,#a0a0a0,#c0c0c0,#a0a0a0)' },
                // Warning sign
                { style: 'bottom:35%;left:20%;width:8%;height:12%;background:#d0d030;border:2px solid #333;border-radius:2px;transform:rotate(-5deg)' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 Quiet Street',
                position: { top: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Dimensional Warp',
                position: { bottom: '0', left: '28%', width: '20%', height: '15%' }
            },
            {
                id: 'shimmer', type: 'scenery',
                label: 'Strange Shimmer',
                lookText: "The air at the end of the street warps and bends. Colors bleed together. This is definitely not normal suburban architecture.",
                position: { bottom: '0', left: '25%', width: '50%', height: '18%' }
            },
            {
                id: 'warning_sign', type: 'scenery',
                label: 'Warning Sign',
                lookText: 'The sign reads "DEAD END" but someone has crossed it out and written "DEAD BEGINNING" underneath in crayon.',
                position: { bottom: '33%', left: '18%', width: '12%', height: '14%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "The street dead-ends ahead, but something's not right. The air itself seems to shimmer with impossible colors...",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // DIMENSIONAL WARP
    // ====================================================
    dimensional_warp: {
        name: 'Dimensional Warp',
        description: "Reality folds in on itself here. Colors invert, gravity feels optional, and you can hear distant puppet music. This is the boundary between the Real World and the Land of Make-Believe.",
        zone: 'realworld',
        exits: {
            north: 'side_street',
            south: 'make_believe_hub'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(135deg, #4a2060, #6a3080, #8a40a0, #a050c0, #8a40a0, #6a3080)',
            layers: [
                // Swirling portal effect
                { style: 'top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 50%,rgba(200,100,255,0.3),rgba(100,50,200,0.2),rgba(50,20,100,0.4));animation:portalPulse 3s ease-in-out infinite' },
                // Warped ground
                { style: 'bottom:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,rgba(100,50,150,0.6),rgba(80,30,120,0.8));transform:perspective(300px) rotateX(10deg)' },
                // Floating fragments (reality breaking)
                { style: 'top:15%;left:10%;width:12%;height:10%;background:linear-gradient(to bottom,#87CEEB,#6ab858);border-radius:2px;transform:rotate(15deg);opacity:0.6;animation:float 4s ease-in-out infinite' },
                { style: 'top:30%;right:15%;width:10%;height:8%;background:linear-gradient(to bottom,#d4b894,#c8a880);border-radius:2px;transform:rotate(-10deg);opacity:0.5;animation:float 3s ease-in-out infinite 1s' },
                // Central warp ring
                { style: 'top:20%;left:25%;width:50%;height:50%;border:4px solid rgba(200,150,255,0.5);border-radius:50%;box-shadow:0 0 30px rgba(200,150,255,0.3),inset 0 0 30px rgba(200,150,255,0.2);animation:portalPulse 2s ease-in-out infinite' },
                { style: 'top:28%;left:32%;width:36%;height:36%;border:3px solid rgba(220,180,255,0.4);border-radius:50%;animation:portalPulse 2s ease-in-out infinite 0.5s' },
                { style: 'top:35%;left:38%;width:24%;height:24%;border:2px solid rgba(240,200,255,0.6);border-radius:50%;animation:portalPulse 2s ease-in-out infinite 1s' },
                // Stars/sparkles
                { style: 'top:10%;left:20%;width:3%;height:3%;background:radial-gradient(circle,#fff,transparent);border-radius:50%;animation:twinkle 1.5s ease-in-out infinite' },
                { style: 'top:40%;left:80%;width:2%;height:2%;background:radial-gradient(circle,#fff,transparent);border-radius:50%;animation:twinkle 1.5s ease-in-out infinite 0.3s' },
                { style: 'top:60%;left:15%;width:2%;height:2%;background:radial-gradient(circle,#fff,transparent);border-radius:50%;animation:twinkle 1.5s ease-in-out infinite 0.7s' },
                { style: 'top:25%;right:10%;width:3%;height:3%;background:radial-gradient(circle,#fff,transparent);border-radius:50%;animation:twinkle 1.5s ease-in-out infinite 1.1s' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_north', type: 'exit', exitDir: 'north',
                label: '\u2191 Side Street',
                position: { top: '0', left: '38%', width: '24%', height: '8%' }
            },
            {
                id: 'exit_south', type: 'exit', exitDir: 'south',
                label: '\u2193 Make-Believe',
                position: { bottom: '0', left: '35%', width: '30%', height: '10%' },
                blocked: function(state) {
                    return false; // Open once you get here
                }
            },
            {
                id: 'portal', type: 'scenery',
                label: 'Warp Portal',
                lookText: "The fabric of reality is thin here. Through the swirling colors you can make out a land of puppets, castles, and questionable governance.",
                position: { top: '20%', left: '25%', width: '50%', height: '50%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "Reality bends around you like taffy. Through the shimmer, you can see... the Land of Make-Believe. This is it.",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // SEWER
    // ====================================================
    sewer: {
        name: 'Sewer',
        description: "You've dropped into the sewers beneath the neighborhood. It's dark, it's damp, and something is moving in the tunnel ahead. Green slime covers the walls.",
        zone: 'realworld',
        exits: {
            up: 'bathroom',
            east: 'dark_area'
        },
        items: ['body_slime'],
        characters: ['tapeworm'],
        art: {
            background: 'linear-gradient(to bottom, #2a2a20, #1a1a10)',
            layers: [
                // Brick walls
                { style: 'top:0;left:0;width:100%;height:65%;background:repeating-linear-gradient(0deg,#4a3a28 0px,#4a3a28 10px,#3a2a18 10px,#3a2a18 12px),repeating-linear-gradient(90deg,#4a3a28 0px,#4a3a28 20px,#3a2a18 20px,#3a2a18 22px)' },
                // Arched ceiling
                { style: 'top:0;left:0;right:0;height:20%;background:linear-gradient(to bottom,#2a2018,#3a2a18);border-radius:0 0 50% 50%' },
                // Sewer water floor
                { style: 'bottom:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,#3a5040,#2a4030,#1a3020);opacity:0.8' },
                // Water ripples
                { style: 'bottom:15%;left:10%;width:80%;height:2%;background:linear-gradient(90deg,transparent,rgba(100,160,120,0.3),transparent);animation:waterRipple 3s ease-in-out infinite' },
                { style: 'bottom:20%;left:20%;width:60%;height:1%;background:linear-gradient(90deg,transparent,rgba(100,160,120,0.2),transparent);animation:waterRipple 3s ease-in-out infinite 1s' },
                // Slime on walls
                { style: 'top:30%;left:5%;width:8%;height:20%;background:linear-gradient(to bottom,rgba(100,200,80,0.6),rgba(80,160,60,0.3));border-radius:0 0 50% 50%' },
                { style: 'top:25%;left:40%;width:6%;height:15%;background:linear-gradient(to bottom,rgba(100,200,80,0.5),rgba(80,160,60,0.2));border-radius:0 0 50% 50%' },
                { style: 'top:35%;right:10%;width:10%;height:18%;background:linear-gradient(to bottom,rgba(100,200,80,0.4),rgba(80,160,60,0.2));border-radius:0 0 50% 50%' },
                // Pipe
                { style: 'top:15%;left:70%;width:25%;height:6%;background:linear-gradient(to bottom,#666,#555,#666);border-radius:3px' },
                // Dripping
                { style: 'top:21%;left:82%;width:2%;height:8%;background:linear-gradient(to bottom,rgba(100,160,200,0.4),transparent);animation:drip 2s ease-in infinite' },
                // Ladder going up
                { style: 'top:5%;left:8%;width:8%;height:55%;background:repeating-linear-gradient(0deg,#777 0px,#777 3px,transparent 3px,transparent 12px);border-left:2px solid #777;border-right:2px solid #777' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_up', type: 'exit', exitDir: 'up',
                label: '\u2191 Bathroom',
                position: { top: '5%', left: '6%', width: '12%', height: '30%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Dark Area \u2192',
                position: { top: '25%', right: '0', width: '8%', height: '35%' },
                blocked: function(state) {
                    return !state.getFlag('tapeworm_scared');
                },
                blockedText: 'The enormous Tapeworm blocks the passage, writhing menacingly. "You shall not passss!"'
            },
            {
                id: 'tapeworm_char', type: 'character', characterId: 'tapeworm',
                label: 'The Tapeworm',
                lookText: "An enormous tapeworm fills the eastern passage. It's segmented, slimy, and clearly not interested in letting you through.",
                position: { top: '30%', left: '55%', width: '25%', height: '30%' }
            },
            {
                id: 'body_slime_item', type: 'item', itemId: 'body_slime',
                label: 'Body Slime',
                lookText: "A thick patch of mysterious green slime oozing down the wall. It's gross, but it might be useful.",
                position: { top: '28%', right: '8%', width: '14%', height: '20%' }
            },
            {
                id: 'pipe', type: 'scenery',
                label: 'Pipe',
                lookText: "A rusted pipe disappears into the wall. It drips steadily. The rhythm is almost hypnotic.",
                position: { top: '12%', left: '68%', width: '28%', height: '10%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "The smell hits you first. Then the darkness. Then the sound of something LARGE moving in the tunnel ahead.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // DARK AREA
    // ====================================================
    dark_area: {
        name: 'Dark Area',
        description: "Almost total darkness. Red eyes glow in the distance. Something large and furry blocks the only way forward. The air feels different here\u2014thinner, stranger.",
        zone: 'realworld',
        exits: {
            west: 'sewer',
            east: 'make_believe_hub'
        },
        items: [],
        characters: ['giant_rat'],
        art: {
            background: 'linear-gradient(to bottom, #0a0a08, #151510)',
            layers: [
                // Near-total darkness
                { style: 'top:0;left:0;right:0;bottom:0;background:radial-gradient(circle at 50% 60%,rgba(40,35,25,0.8),rgba(10,10,5,0.95))' },
                // Faint tunnel walls
                { style: 'top:0;left:0;width:20%;height:100%;background:linear-gradient(to right,rgba(50,40,30,0.4),transparent)' },
                { style: 'top:0;right:0;width:20%;height:100%;background:linear-gradient(to left,rgba(50,40,30,0.4),transparent)' },
                // Faint ground
                { style: 'bottom:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,rgba(30,25,15,0.5),rgba(20,15,10,0.7))' },
                // Red eyes (rat)
                { style: 'top:40%;left:55%;width:3%;height:3%;background:radial-gradient(circle,#ff2020,#cc0000);border-radius:50%;box-shadow:0 0 10px rgba(255,32,32,0.6);animation:eyeGlow 2s ease-in-out infinite' },
                { style: 'top:40%;left:62%;width:3%;height:3%;background:radial-gradient(circle,#ff2020,#cc0000);border-radius:50%;box-shadow:0 0 10px rgba(255,32,32,0.6);animation:eyeGlow 2s ease-in-out infinite 0.2s' },
                // Faint light from east (Make-Believe glow)
                { style: 'top:20%;right:0;width:15%;height:50%;background:linear-gradient(to left,rgba(160,100,200,0.15),transparent)' },
                // Mysterious glow at end of tunnel
                { style: 'top:30%;right:2%;width:8%;height:30%;background:radial-gradient(ellipse,rgba(200,130,255,0.2),transparent);border-radius:50%' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_west', type: 'exit', exitDir: 'west',
                label: '\u2190 Sewer',
                position: { top: '30%', left: '0', width: '8%', height: '35%' }
            },
            {
                id: 'exit_east', type: 'exit', exitDir: 'east',
                label: 'Make-Believe \u2192',
                position: { top: '25%', right: '0', width: '10%', height: '40%' },
                blocked: function(state) {
                    return !state.getFlag('rat_distracted');
                },
                blockedText: 'The Giant Rat blocks the passage. Its red eyes bore into you. "SQUEAK." That\'s a threatening squeak.'
            },
            {
                id: 'giant_rat_char', type: 'character', characterId: 'giant_rat',
                label: 'Giant Rat',
                lookText: "A rat the size of a golden retriever. Its red eyes glow in the darkness. Its teeth are... very large. Very, very large.",
                position: { top: '30%', left: '45%', width: '25%', height: '35%' }
            },
            {
                id: 'glow', type: 'scenery',
                label: 'Mysterious Glow',
                lookText: "A faint purple glow emanates from the east. It pulses gently, like a heartbeat. The Land of Make-Believe is close.",
                position: { top: '20%', right: '12%', width: '12%', height: '30%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "Two red eyes materialize in the darkness. They're at waist height, which means whatever they belong to is ENORMOUS.",
                        style: 'normal'
                    });
                }, 100);
            }
        }
    },

    // ====================================================
    // MAKE-BELIEVE HUB (placeholder for Phase 3)
    // ====================================================
    // ====================================================
    // MAKE-BELIEVE ZONE (Phase 3)
    // ====================================================

    make_believe_hub: {
        name: 'Land of Make-Believe',
        description: "You've crossed over. Everything is slightly tilted, the sky is purple-pink, and the trees look like felt. The Devil leans against a signpost, blocking the crossroads.",
        zone: 'makebelieve',
        exits: {
            west: 'cornflakes_factory',
            east: 'henriettas_place',
            south: 'lady_elaines_place'
        },
        items: [],
        characters: ['the_devil'],
        art: {
            background: 'linear-gradient(to bottom, #8a50a0, #b070c0 40%, #70b858 40%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:40%;background:linear-gradient(to bottom,#6a3090,#8a50b0,#b070c0)' },
                { style: 'top:8%;left:15%;width:18%;height:10%;background:radial-gradient(ellipse,rgba(220,180,240,0.8),transparent);border-radius:50%' },
                { style: 'top:12%;left:60%;width:22%;height:12%;background:radial-gradient(ellipse,rgba(220,180,240,0.7),transparent);border-radius:50%' },
                { style: 'bottom:0;left:0;right:0;height:60%;background:linear-gradient(to bottom,#60a848,#509838);transform:rotate(-1deg);transform-origin:center' },
                // Signpost
                { style: 'top:25%;left:48%;width:3%;height:35%;background:#6a5030' },
                { style: 'top:22%;left:42%;width:20%;height:6%;background:#d8a868;border-radius:2px;transform:rotate(-2deg)' },
                { style: 'top:28%;left:40%;width:18%;height:5%;background:#d8a868;border-radius:2px;transform:rotate(2deg)' },
                { style: 'top:34%;left:43%;width:16%;height:5%;background:#d8a868;border-radius:2px;transform:rotate(-1deg)' },
                // Cardboard castle in distance
                { style: 'top:15%;left:35%;width:30%;height:25%;background:linear-gradient(to bottom,#d8a868,#c89858);border-radius:4px;transform:rotate(1deg);opacity:0.5' },
                { style: 'top:8%;left:38%;width:8%;height:10%;background:linear-gradient(to bottom,#d8a868,#c89858);border-radius:2px;opacity:0.5' },
                { style: 'top:5%;left:40%;width:4%;height:5%;background:#e04040;clip-path:polygon(0 100%,50% 0,100% 100%);opacity:0.5' },
                // Felt trees
                { style: 'top:20%;left:5%;width:14%;height:22%;background:radial-gradient(ellipse,#4a9a30,#3a8a20);border-radius:50%;transform:rotate(-2deg)' },
                { style: 'top:38%;left:9%;width:4%;height:15%;background:#6a5030' },
                { style: 'top:22%;right:8%;width:12%;height:20%;background:radial-gradient(ellipse,#4a9a30,#3a8a20);border-radius:50%;transform:rotate(2deg)' },
                { style: 'top:38%;right:12%;width:4%;height:15%;background:#6a5030' },
                // Path (3-way crossroads)
                { style: 'bottom:0;left:35%;width:30%;height:35%;background:linear-gradient(to bottom,#d0b888,#c0a878);border-radius:30% 30% 0 0;opacity:0.7' },
                { style: 'bottom:15%;left:0;width:45%;height:15%;background:linear-gradient(to right,#c0a878,#d0b888);border-radius:0;opacity:0.6' },
                { style: 'bottom:15%;right:0;width:45%;height:15%;background:linear-gradient(to left,#c0a878,#d0b888);border-radius:0;opacity:0.6' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_w', type: 'exit', target: 'cornflakes_factory',
                label: "\u2190 Factory",
                position: { top: '50%', left: '0%', width: '12%', height: '20%' }
            },
            {
                id: 'exit_e', type: 'exit', target: 'henriettas_place',
                label: "Henrietta's \u2192",
                position: { top: '50%', right: '0%', width: '12%', height: '20%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'lady_elaines_place',
                label: "\u2193 Lady Elaine's",
                position: { bottom: '2%', left: '35%', width: '30%', height: '12%' }
            },
            {
                id: 'devil_char', type: 'character', characterId: 'the_devil',
                label: 'The Devil',
                position: { top: '30%', left: '35%', width: '25%', height: '30%' }
            },
            {
                id: 'signpost', type: 'scenery',
                label: 'Signpost',
                lookText: "The signpost points in three directions: 'Factory', 'Henrietta's', and 'Lady Elaine's'. A fourth sign reads 'ABANDON HOPE' but someone crossed out 'HOPE' and wrote 'PANTS'.",
                position: { top: '20%', left: '42%', width: '20%', height: '25%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            state.setFlag('reached_makebelieve', true);
            if (data.firstVisit) {
                state.addScore(20);
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "You've made it to the Land of Make-Believe! Everything is slightly tilted and made of felt. The Devil stands at a crossroads, blocking your way. The trolley is somewhere deeper...",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    cornflakes_factory: {
        name: "Cornflake S. Pecially's Factory",
        description: "A wonky building that produces something. Nobody's quite sure what. A sign reads 'NOW HIRING: must have factory pass.'",
        zone: 'makebelieve',
        exits: {
            east: 'make_believe_hub',
            south: 'platypus_mound'
        },
        items: [],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #7a4090, #a060b0 35%, #60a848 35%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,#6a3090,#a060b0)' },
                { style: 'top:5%;left:15%;width:20%;height:10%;background:radial-gradient(ellipse,rgba(220,180,240,0.6),transparent);border-radius:50%' },
                { style: 'bottom:0;left:0;right:0;height:65%;background:linear-gradient(to bottom,#60a848,#509838)' },
                // Factory building
                { style: 'top:10%;left:20%;width:55%;height:50%;background:linear-gradient(to bottom,#b08050,#a07040);border:3px solid #805030;border-radius:4px;transform:rotate(-1deg)' },
                // Smokestack
                { style: 'top:0%;left:60%;width:8%;height:20%;background:#806040;border-radius:2px' },
                { style: 'top:-2%;left:61%;width:10%;height:6%;background:rgba(150,130,120,0.5);border-radius:50%;animation:float 3s ease-in-out infinite' },
                // Door
                { style: 'top:35%;left:40%;width:15%;height:25%;background:#604020;border:2px solid #503020;border-radius:4px 4px 0 0' },
                // Windows
                { style: 'top:18%;left:25%;width:10%;height:10%;background:rgba(200,220,255,0.6);border:2px solid #805030' },
                { style: 'top:18%;left:55%;width:10%;height:10%;background:rgba(200,220,255,0.6);border:2px solid #805030' },
                // Sign
                { style: 'top:12%;left:28%;width:38%;height:8%;background:#f0e0b0;border:2px solid #a08040;border-radius:2px;text-align:center;display:flex;align-items:center;justify-content:center;font-size:0.6em;color:#604020', content: 'FACTORY' },
                // Felt path
                { style: 'bottom:5%;left:35%;width:25%;height:20%;background:linear-gradient(to bottom,#d0b888,#c0a878);border-radius:40%;opacity:0.7' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_e', type: 'exit', target: 'make_believe_hub',
                label: "Hub \u2192",
                position: { top: '50%', right: '0%', width: '12%', height: '20%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'platypus_mound',
                label: "\u2193 Platypus Mound",
                position: { bottom: '2%', left: '30%', width: '30%', height: '12%' }
            },
            {
                id: 'factory_door', type: 'scenery',
                label: 'Factory Door',
                lookText: "The door has a sign: 'CORNFLAKE S. PECIALLY - Proprietor, CEO, Janitor.' Below that: 'Factory pass required for entry. No exceptions. Except Tuesdays.'",
                position: { top: '35%', left: '40%', width: '15%', height: '25%' }
            }
        ]
    },

    platypus_mound: {
        name: 'Platypus Mound',
        description: "A tall dirt mound with a tiny door. Dr. Platypus guards the entrance, checking credentials with extreme thoroughness.",
        zone: 'makebelieve',
        exits: {
            north: 'cornflakes_factory',
            south: { target: 'daniel_tigers_clock', blocked: true, blockedBy: 'platypus_impressed', blockedText: "Dr. Platypus blocks your path. \"CREDENTIALS, please!\"" }
        },
        items: [],
        characters: ['dr_platypus'],
        art: {
            background: 'linear-gradient(to bottom, #7a4090, #a060b0 30%, #60a848 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#6a3090,#a060b0)' },
                { style: 'bottom:0;left:0;right:0;height:70%;background:linear-gradient(to bottom,#60a848,#509838)' },
                // The mound
                { style: 'top:10%;left:15%;width:65%;height:60%;background:radial-gradient(ellipse at bottom,#8a6830,#6a5020);border-radius:50% 50% 20% 20%;transform:rotate(1deg)' },
                // Tiny door
                { style: 'top:40%;left:38%;width:18%;height:22%;background:#604020;border:3px solid #402010;border-radius:40% 40% 0 0' },
                // Door handle
                { style: 'top:52%;left:52%;width:3%;height:3%;background:#d0a040;border-radius:50%' },
                // Sign by door
                { style: 'top:35%;left:58%;width:18%;height:10%;background:#f0e0b0;border:1px solid #a08040;border-radius:2px;transform:rotate(3deg);font-size:0.4em;display:flex;align-items:center;justify-content:center;color:#604020', content: 'RESTRICTED' },
                // Flowers around mound
                { style: 'top:55%;left:10%;width:4%;height:6%;background:#e06080;border-radius:50%' },
                { style: 'top:58%;left:14%;width:3%;height:5%;background:#e08060;border-radius:50%' },
                { style: 'top:54%;right:15%;width:4%;height:6%;background:#8060e0;border-radius:50%' },
                { style: 'top:57%;right:12%;width:3%;height:5%;background:#e060a0;border-radius:50%' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'cornflakes_factory',
                label: "\u2191 Factory",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'daniel_tigers_clock',
                label: "\u2193 Daniel Tiger",
                position: { bottom: '2%', left: '35%', width: '30%', height: '12%' }
            },
            {
                id: 'platypus_char', type: 'character', characterId: 'dr_platypus',
                label: 'Dr. Platypus',
                position: { top: '35%', left: '30%', width: '30%', height: '30%' }
            }
        ]
    },

    daniel_tigers_clock: {
        name: "Daniel Tiger's Clock",
        description: "A cozy den with an enormous clock on the wall. Daniel Tiger sits before it, small and nervous.",
        zone: 'makebelieve',
        exits: {
            north: 'platypus_mound'
        },
        items: [],
        characters: ['daniel_tiger'],
        art: {
            background: 'linear-gradient(to bottom, #8b6030, #6b4520)',
            layers: [
                // Warm den walls - darker wood
                { style: 'top:0;left:0;right:0;bottom:40%;background:linear-gradient(to bottom,#9b6838,#7a5028)' },
                // Floor
                { style: 'bottom:0;left:0;right:0;height:40%;background:linear-gradient(to bottom,#6b4520,#5a3818)' },
                // Wood paneling lines
                { style: 'top:0;left:0;width:3%;height:100%;background:rgba(40,20,5,0.4)' },
                { style: 'top:0;left:25%;width:2%;height:60%;background:rgba(40,20,5,0.25)' },
                { style: 'top:0;left:50%;width:2%;height:60%;background:rgba(40,20,5,0.25)' },
                { style: 'top:0;left:75%;width:2%;height:60%;background:rgba(40,20,5,0.25)' },
                { style: 'top:0;right:0;width:3%;height:100%;background:rgba(40,20,5,0.4)' },
                // The clock (big, bright face!)
                { style: 'top:3%;left:28%;width:40%;height:48%;background:radial-gradient(circle,#fffff0,#f0e8c8);border:6px solid #503010;border-radius:50%;box-shadow:0 0 20px rgba(255,240,200,0.3)' },
                // Clock face numbers (3 highlighted in red)
                { style: 'top:7%;left:46%;width:5%;height:6%;background:transparent;font-size:0.9em;color:#503020;display:flex;align-items:center;justify-content:center', content: '12' },
                { style: 'top:24%;left:62%;width:5%;height:6%;background:transparent;font-size:1.1em;color:#d02020;font-weight:bold;display:flex;align-items:center;justify-content:center', content: '3' },
                { style: 'top:43%;left:46%;width:5%;height:6%;background:transparent;font-size:0.9em;color:#503020;display:flex;align-items:center;justify-content:center', content: '6' },
                { style: 'top:24%;left:30%;width:5%;height:6%;background:transparent;font-size:0.9em;color:#503020;display:flex;align-items:center;justify-content:center', content: '9' },
                // Clock hands pointing to 3
                { style: 'top:26%;left:48%;width:16%;height:2.5%;background:#302010;transform-origin:left center;border-radius:2px' },
                { style: 'top:26.5%;left:48%;width:9%;height:2%;background:#502010;transform-origin:left center;transform:rotate(-90deg);border-radius:2px' },
                // Warm rug on floor
                { style: 'bottom:8%;left:18%;width:60%;height:22%;background:radial-gradient(ellipse,#c05030,#902818);border-radius:50%' },
                // Small stool
                { style: 'bottom:18%;left:42%;width:12%;height:10%;background:#604020;border-radius:4px 4px 0 0' },
                { style: 'bottom:13%;left:40%;width:16%;height:5%;background:#704828;border-radius:2px' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'platypus_mound',
                label: "\u2191 Platypus Mound",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'daniel_char', type: 'character', characterId: 'daniel_tiger',
                label: 'Daniel Tiger',
                position: { bottom: '10%', left: '35%', width: '25%', height: '25%' }
            },
            {
                id: 'clock', type: 'scenery',
                label: 'The Clock',
                lookText: "An enormous clock. The hands are stuck at 3 o'clock. The number 3 is painted in red, bigger than all the others. Three seems important here.",
                position: { top: '5%', left: '30%', width: '35%', height: '45%' }
            }
        ]
    },

    lady_elaines_place: {
        name: "Lady Elaine's Merry-Go-Round",
        description: "Lady Elaine's place. The merry-go-round is broken, tilted at a sad angle. She sits beside it, drinking from a flask.",
        zone: 'makebelieve',
        exits: {
            north: 'make_believe_hub',
            south: 'aberlins_crypt'
        },
        items: [],
        characters: ['lady_elaine'],
        art: {
            background: 'linear-gradient(to bottom, #7a4090, #a060b0 35%, #60a848 35%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:35%;background:linear-gradient(to bottom,#6a3090,#a060b0)' },
                { style: 'bottom:0;left:0;right:0;height:65%;background:linear-gradient(to bottom,#60a848,#509838)' },
                // Broken merry-go-round
                { style: 'top:15%;left:15%;width:50%;height:45%;background:radial-gradient(circle,#e8c8a0,#d0a878);border:4px solid #a08050;border-radius:50%;transform:rotate(-8deg)' },
                // Top canopy (tilted)
                { style: 'top:8%;left:25%;width:30%;height:12%;background:linear-gradient(to right,#e04050,#e0a030,#4080e0,#40c040);border-radius:50%;transform:rotate(-8deg);opacity:0.8' },
                // Center pole (tilted)
                { style: 'top:12%;left:38%;width:4%;height:35%;background:#c0a060;transform:rotate(-8deg)' },
                // Broken arm (sticking out)
                { style: 'top:30%;left:55%;width:15%;height:3%;background:#a08040;transform:rotate(15deg);border-radius:2px' },
                // Horses (tiny, tilted)
                { style: 'top:35%;left:22%;width:8%;height:12%;background:#e0c0a0;border-radius:30%;transform:rotate(-15deg)' },
                { style: 'top:40%;left:45%;width:8%;height:12%;background:#c0a080;border-radius:30%;transform:rotate(-5deg)' },
                // Flask on ground
                { style: 'bottom:25%;left:70%;width:4%;height:8%;background:linear-gradient(to bottom,#808080,#606060);border-radius:2px 2px 4px 4px' },
                // Path
                { style: 'bottom:5%;left:35%;width:25%;height:15%;background:linear-gradient(to bottom,#d0b888,#c0a878);border-radius:40%;opacity:0.7' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'make_believe_hub',
                label: "\u2191 Hub",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'aberlins_crypt',
                label: "\u2193 Aberlin's Crypt",
                position: { bottom: '2%', left: '30%', width: '30%', height: '12%' }
            },
            {
                id: 'elaine_char', type: 'character', characterId: 'lady_elaine',
                label: 'Lady Elaine',
                position: { top: '35%', left: '60%', width: '25%', height: '25%' }
            },
            {
                id: 'merry_go_round', type: 'scenery',
                label: 'Merry-Go-Round',
                lookText: "The merry-go-round is broken and tilted. A key mechanical arm has snapped off. Lady Elaine's pride and joy, reduced to a fancy hat rack.",
                position: { top: '10%', left: '15%', width: '50%', height: '50%' }
            }
        ]
    },

    henriettas_place: {
        name: "Henrietta & X's Place",
        description: "A small cottage shared by Henrietta Pussycat and Mutated X the Owl. Henrietta is hungry and X is blind.",
        zone: 'makebelieve',
        exits: {
            west: 'make_believe_hub',
            south: 'chef_brocketts'
        },
        items: [],
        characters: ['henrietta'],
        art: {
            background: 'linear-gradient(to bottom, #7a4090, #a060b0 30%, #60a848 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#6a3090,#a060b0)' },
                { style: 'bottom:0;left:0;right:0;height:70%;background:linear-gradient(to bottom,#60a848,#509838)' },
                // Cottage
                { style: 'top:8%;left:20%;width:55%;height:50%;background:linear-gradient(to bottom,#e8d0b0,#d8c0a0);border:3px solid #a08060;border-radius:4px;transform:rotate(1deg)' },
                // Roof
                { style: 'top:0%;left:15%;width:65%;height:14%;background:#c06040;clip-path:polygon(5% 100%,50% 0%,95% 100%);transform:rotate(1deg)' },
                // Door
                { style: 'top:32%;left:40%;width:14%;height:25%;background:#806040;border:2px solid #604020;border-radius:4px 4px 0 0' },
                // Windows
                { style: 'top:20%;left:25%;width:10%;height:10%;background:rgba(200,220,255,0.6);border:2px solid #a08060' },
                { style: 'top:20%;right:22%;width:10%;height:10%;background:rgba(200,220,255,0.6);border:2px solid #a08060' },
                // Cat flap on door
                { style: 'top:50%;left:44%;width:6%;height:6%;background:#604020;border:1px solid #402010;border-radius:2px' },
                // Yarn ball on ground
                { style: 'bottom:20%;left:15%;width:5%;height:7%;background:radial-gradient(circle,#e06080,#c04060);border-radius:50%' },
                // Bird perch
                { style: 'top:15%;right:10%;width:3%;height:30%;background:#806040' },
                { style: 'top:12%;right:6%;width:10%;height:4%;background:#806040;border-radius:2px' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_w', type: 'exit', target: 'make_believe_hub',
                label: "\u2190 Hub",
                position: { top: '50%', left: '0%', width: '12%', height: '20%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'chef_brocketts',
                label: "\u2193 Chef Brockett's",
                position: { bottom: '2%', left: '30%', width: '30%', height: '12%' }
            },
            {
                id: 'henrietta_char', type: 'character', characterId: 'henrietta',
                label: 'Henrietta',
                position: { top: '40%', left: '25%', width: '20%', height: '20%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            // After feeding Henrietta, X appears
            if (state.getFlag('henrietta_fed') && !state.getFlag('x_can_see')) {
                if (!state.characters.mutated_x || !state.characters.mutated_x.placed) {
                    state.addCharacterToRoom('mutated_x', 'henriettas_place');
                    state.characters.mutated_x = state.characters.mutated_x || {};
                    state.characters.mutated_x.placed = true;
                }
            }
        }
    },

    chef_brocketts: {
        name: "Chef Brockett's Bakery",
        description: "A disaster zone of flour, dough, and culinary despair. Chef Brockett flails about, trying to cook without a knife.",
        zone: 'makebelieve',
        exits: {
            north: 'henriettas_place',
            south: { target: 'hidden_tunnel', blocked: true, blockedBy: 'chef_helped', blockedText: "Chef Brockett blocks the pantry. \"Sorry, kitchen staff only! Unless you can help with my knife situation...\"" }
        },
        items: ['rolling_pin'],
        characters: ['chef_brockett'],
        art: {
            background: '#e8d8c0',
            layers: [
                // Kitchen walls
                { style: 'top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,#e8d8c0,#d8c8b0)' },
                // Checkered floor
                { style: 'bottom:0;left:0;right:0;height:30%;background:repeating-conic-gradient(#d0c0a0 0% 25%,#c0b090 0% 50%) 0 0/30px 30px' },
                // Counter
                { style: 'top:35%;left:0;right:0;height:8%;background:linear-gradient(to bottom,#a08060,#907050)' },
                // Shelves
                { style: 'top:10%;left:5%;width:30%;height:5%;background:#a08060;border-radius:2px' },
                { style: 'top:22%;left:5%;width:30%;height:5%;background:#a08060;border-radius:2px' },
                // Pots and pans
                { style: 'top:5%;left:8%;width:6%;height:8%;background:#808080;border-radius:2px 2px 50% 50%' },
                { style: 'top:5%;left:18%;width:8%;height:8%;background:#909090;border-radius:2px 2px 50% 50%' },
                // Oven
                { style: 'top:15%;right:10%;width:25%;height:28%;background:linear-gradient(to bottom,#404040,#303030);border:3px solid #505050;border-radius:4px' },
                { style: 'top:25%;right:14%;width:18%;height:10%;background:rgba(255,100,0,0.3);border-radius:2px' },
                // Flour everywhere
                { style: 'top:38%;left:10%;width:15%;height:5%;background:rgba(255,255,240,0.6);border-radius:50%' },
                { style: 'top:36%;left:40%;width:10%;height:4%;background:rgba(255,255,240,0.5);border-radius:50%' },
                { style: 'bottom:25%;left:50%;width:12%;height:4%;background:rgba(255,255,240,0.4);border-radius:50%' },
                // Pantry door (south exit)
                { style: 'bottom:5%;left:40%;width:15%;height:25%;background:#806040;border:2px solid #604020;border-radius:4px 4px 0 0' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'henriettas_place',
                label: "\u2191 Henrietta's",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'hidden_tunnel',
                label: "\u2193 Pantry",
                position: { bottom: '2%', left: '38%', width: '20%', height: '15%' }
            },
            {
                id: 'chef_char', type: 'character', characterId: 'chef_brockett',
                label: 'Chef Brockett',
                position: { top: '35%', left: '35%', width: '25%', height: '25%' }
            },
            {
                id: 'rolling_pin_item', type: 'item', itemId: 'rolling_pin',
                label: 'Rolling Pin',
                position: { top: '28%', left: '10%', width: '12%', height: '8%' }
            }
        ]
    },

    aberlins_crypt: {
        name: "Aberlin's Crypt",
        description: "A spooky underground crypt. Cobwebs hang everywhere and something metallic glints on the ground. Lady Aberlin clearly moved on from cheerful to creepy.",
        zone: 'makebelieve',
        exits: {
            north: 'lady_elaines_place',
            south: 'airport'
        },
        items: ['metal_piece'],
        characters: [],
        art: {
            background: '#2a1a30',
            layers: [
                { style: 'top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,#2a1a30,#1a0a20)' },
                // Stone walls
                { style: 'top:0;left:0;width:5%;height:100%;background:linear-gradient(to right,#3a2a40,#2a1a30)' },
                { style: 'top:0;right:0;width:5%;height:100%;background:linear-gradient(to left,#3a2a40,#2a1a30)' },
                // Stone blocks pattern
                { style: 'top:10%;left:5%;width:20%;height:8%;border:1px solid rgba(100,80,110,0.3);border-radius:1px' },
                { style: 'top:10%;left:28%;width:25%;height:8%;border:1px solid rgba(100,80,110,0.3);border-radius:1px' },
                { style: 'top:20%;left:8%;width:22%;height:8%;border:1px solid rgba(100,80,110,0.3);border-radius:1px' },
                { style: 'top:20%;left:33%;width:18%;height:8%;border:1px solid rgba(100,80,110,0.3);border-radius:1px' },
                // Cobwebs
                { style: 'top:0;left:0;width:25%;height:20%;background:linear-gradient(135deg,rgba(200,200,220,0.2),transparent);border-radius:0 0 100% 0' },
                { style: 'top:0;right:0;width:25%;height:20%;background:linear-gradient(225deg,rgba(200,200,220,0.2),transparent);border-radius:0 0 0 100%' },
                // Stone floor
                { style: 'bottom:0;left:0;right:0;height:35%;background:#2a1a30;border-top:2px solid #3a2a40' },
                // Torches
                { style: 'top:20%;left:10%;width:3%;height:12%;background:#604020' },
                { style: 'top:16%;left:9%;width:5%;height:6%;background:radial-gradient(circle,#ff8020,#ff4000,transparent);border-radius:50%;animation:twinkle 2s ease-in-out infinite' },
                { style: 'top:20%;right:10%;width:3%;height:12%;background:#604020' },
                { style: 'top:16%;right:9%;width:5%;height:6%;background:radial-gradient(circle,#ff8020,#ff4000,transparent);border-radius:50%;animation:twinkle 2s ease-in-out infinite 0.5s' },
                // Coffin-shaped shelf
                { style: 'top:15%;left:30%;width:35%;height:35%;background:#3a2a40;border:2px solid #4a3a50;clip-path:polygon(15% 0,85% 0,100% 10%,100% 100%,0 100%,0 10%)' },
                // Skull decoration
                { style: 'top:20%;left:44%;width:8%;height:10%;background:radial-gradient(circle,#e0d8d0,#c0b8b0);border-radius:50% 50% 40% 40%' },
                { style: 'top:23%;left:46%;width:2%;height:2%;background:#2a1a30;border-radius:50%' },
                { style: 'top:23%;left:49%;width:2%;height:2%;background:#2a1a30;border-radius:50%' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'lady_elaines_place',
                label: "\u2191 Lady Elaine's",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'airport',
                label: "\u2193 Airport",
                position: { bottom: '2%', left: '35%', width: '30%', height: '12%' }
            },
            {
                id: 'metal_piece_item', type: 'item', itemId: 'metal_piece',
                label: 'Metal Piece',
                position: { bottom: '20%', left: '45%', width: '10%', height: '10%' }
            },
            {
                id: 'coffin_shelf', type: 'scenery',
                label: 'Coffin Shelf',
                lookText: "A shelf shaped disturbingly like a coffin. Lady Aberlin's interior design choices have taken a dark turn. A skull sits atop it. Probably decorative. Probably.",
                position: { top: '15%', left: '30%', width: '35%', height: '35%' }
            }
        ]
    },

    hidden_tunnel: {
        name: 'Hidden Tunnel',
        description: "A narrow tunnel behind Chef Brockett's pantry. It smells like sourdough and regret. The tunnel slopes downward toward a distant light.",
        zone: 'makebelieve',
        exits: {
            north: 'chef_brocketts',
            south: 'trolley_station'
        },
        items: [],
        characters: [],
        art: {
            background: '#3a2a20',
            layers: [
                { style: 'top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,#3a2a20,#2a1a10)' },
                // Tunnel walls (converging perspective)
                { style: 'top:0;left:0;width:15%;height:100%;background:linear-gradient(to right,#4a3a28,#3a2a20)' },
                { style: 'top:0;right:0;width:15%;height:100%;background:linear-gradient(to left,#4a3a28,#3a2a20)' },
                // Tunnel ceiling arch
                { style: 'top:0;left:10%;right:10%;height:15%;background:radial-gradient(ellipse at top,#4a3a28,transparent);border-radius:0 0 50% 50%' },
                // Stone floor
                { style: 'bottom:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#3a2a20,#2a1a10)' },
                // Light at the end
                { style: 'top:20%;left:35%;width:25%;height:40%;background:radial-gradient(circle,rgba(255,200,100,0.5),rgba(255,200,100,0.1),transparent);border-radius:50%' },
                // Bread shelves (it's behind a pantry)
                { style: 'top:20%;left:2%;width:10%;height:8%;background:#c0a070;border-radius:2px' },
                { style: 'top:35%;left:2%;width:10%;height:8%;background:#c0a070;border-radius:2px' },
                // Bread on shelves
                { style: 'top:18%;left:4%;width:6%;height:5%;background:#d8b878;border-radius:40% 40% 10% 10%' },
                { style: 'top:33%;left:4%;width:5%;height:5%;background:#d0b070;border-radius:40% 40% 10% 10%' },
                // Cobwebs
                { style: 'top:0;right:10%;width:15%;height:12%;background:linear-gradient(225deg,rgba(200,200,220,0.15),transparent)' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'chef_brocketts',
                label: "\u2191 Bakery",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_s', type: 'exit', target: 'trolley_station',
                label: "\u2193 Trolley Station",
                position: { bottom: '2%', left: '30%', width: '35%', height: '12%' }
            }
        ]
    },

    airport: {
        name: 'Make-Believe Airport',
        description: "A tiny airport with one runway and a departure board that just says 'DELAYED' for every flight. A ticket booth sits unattended.",
        zone: 'makebelieve',
        exits: {
            north: 'aberlins_crypt',
            east: 'trolley_station'
        },
        items: ['airline_tickets'],
        characters: [],
        art: {
            background: 'linear-gradient(to bottom, #7a4090, #a060b0 30%, #909090 30%)',
            layers: [
                { style: 'top:0;left:0;right:0;height:30%;background:linear-gradient(to bottom,#6a3090,#a060b0)' },
                { style: 'bottom:0;left:0;right:0;height:70%;background:#909090' },
                // Runway
                { style: 'bottom:10%;left:5%;right:5%;height:20%;background:#505050;border:2px solid #707070' },
                // Runway markings
                { style: 'bottom:18%;left:25%;width:8%;height:3%;background:#e0e0e0' },
                { style: 'bottom:18%;left:45%;width:8%;height:3%;background:#e0e0e0' },
                { style: 'bottom:18%;left:65%;width:8%;height:3%;background:#e0e0e0' },
                // Runway number (3)
                { style: 'bottom:22%;left:10%;width:8%;height:6%;background:transparent;font-size:0.8em;color:#e0e0e0;font-weight:bold;display:flex;align-items:center;justify-content:center', content: '3' },
                // Terminal building
                { style: 'top:12%;left:15%;width:60%;height:30%;background:linear-gradient(to bottom,#c0c0c0,#a0a0a0);border:2px solid #808080;border-radius:4px' },
                // Control tower
                { style: 'top:5%;right:20%;width:10%;height:25%;background:#b0b0b0;border:2px solid #808080' },
                { style: 'top:2%;right:18%;width:14%;height:8%;background:rgba(180,220,255,0.7);border:2px solid #808080;border-radius:2px' },
                // Windows
                { style: 'top:18%;left:22%;width:6%;height:6%;background:rgba(180,220,255,0.5);border:1px solid #808080' },
                { style: 'top:18%;left:35%;width:6%;height:6%;background:rgba(180,220,255,0.5);border:1px solid #808080' },
                { style: 'top:18%;left:48%;width:6%;height:6%;background:rgba(180,220,255,0.5);border:1px solid #808080' },
                // Departure board
                { style: 'top:15%;left:60%;width:12%;height:15%;background:#202020;border:2px solid #404040;border-radius:2px' },
                { style: 'top:17%;left:62%;width:8%;height:3%;background:#ff4040;font-size:0.3em;color:#ff4040;display:flex;align-items:center;justify-content:center', content: 'DELAYED' },
                { style: 'top:21%;left:62%;width:8%;height:3%;background:#ff4040;font-size:0.3em;color:#ff4040;display:flex;align-items:center;justify-content:center', content: 'DELAYED' },
                // Ticket booth
                { style: 'bottom:32%;left:15%;width:15%;height:18%;background:#d8a050;border:2px solid #a08040;border-radius:4px 4px 0 0' },
                { style: 'bottom:40%;left:18%;width:9%;height:6%;background:rgba(180,220,255,0.5);border:1px solid #a08040' },
                // Windsock
                { style: 'top:10%;left:8%;width:2%;height:18%;background:#808080' },
                { style: 'top:10%;left:10%;width:8%;height:4%;background:linear-gradient(to right,#e04040,#e0e0e0,#e04040);border-radius:0 4px 4px 0;animation:float 2s ease-in-out infinite' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_n', type: 'exit', target: 'aberlins_crypt',
                label: "\u2191 Crypt",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'exit_e', type: 'exit', target: 'trolley_station',
                label: "Trolley Station \u2192",
                position: { top: '50%', right: '0%', width: '12%', height: '20%' }
            },
            {
                id: 'tickets_item', type: 'item', itemId: 'airline_tickets',
                label: 'Airline Tickets',
                position: { bottom: '35%', left: '15%', width: '15%', height: '15%' }
            },
            {
                id: 'runway', type: 'scenery',
                label: 'Runway 3',
                lookText: "Runway 3. The only runway that still works, apparently. A faded sign says 'TROLLEY CLEARANCE ZONE.' Interesting.",
                position: { bottom: '10%', left: '5%', width: '90%', height: '20%' }
            },
            {
                id: 'departure_board', type: 'scenery',
                label: 'Departure Board',
                lookText: "Every flight is DELAYED. The fine print says 'Estimated departure: When pigs fly. (Literally. We're working on it.)'",
                position: { top: '15%', left: '60%', width: '12%', height: '15%' }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "Runway 3. The note said 'Pull lever 3.' This must connect to the Trolley Station somehow.",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    },

    trolley_station: {
        name: 'Trolley Station',
        description: "THE TROLLEY! It's here! A beautiful red trolley sits on the tracks, locked behind a gate with three levers. This is it. The final puzzle.",
        zone: 'makebelieve',
        exits: {
            west: 'airport',
            north: 'hidden_tunnel'
        },
        items: [],
        characters: [],
        art: {
            background: '#4a3a30',
            layers: [
                // Station walls
                { style: 'top:0;left:0;right:0;bottom:0;background:linear-gradient(to bottom,#4a3a30,#3a2a20)' },
                // Platform
                { style: 'bottom:0;left:0;right:0;height:30%;background:#606060;border-top:4px solid #808080' },
                // Tracks
                { style: 'bottom:15%;left:5%;right:5%;height:3%;background:#404040' },
                { style: 'bottom:14%;left:5%;right:5%;height:1%;background:#808080' },
                { style: 'bottom:10%;left:5%;right:5%;height:3%;background:#404040' },
                { style: 'bottom:9%;left:5%;right:5%;height:1%;background:#808080' },
                // Cross ties
                { style: 'bottom:9%;left:15%;width:3%;height:10%;background:#604020' },
                { style: 'bottom:9%;left:30%;width:3%;height:10%;background:#604020' },
                { style: 'bottom:9%;left:45%;width:3%;height:10%;background:#604020' },
                { style: 'bottom:9%;left:60%;width:3%;height:10%;background:#604020' },
                { style: 'bottom:9%;left:75%;width:3%;height:10%;background:#604020' },
                // THE TROLLEY
                { style: 'bottom:18%;left:25%;width:45%;height:25%;background:linear-gradient(to bottom,#d02020,#b01818);border:3px solid #901010;border-radius:6px' },
                // Trolley windows
                { style: 'bottom:30%;left:30%;width:8%;height:10%;background:rgba(200,220,255,0.7);border:2px solid #901010;border-radius:2px' },
                { style: 'bottom:30%;left:42%;width:8%;height:10%;background:rgba(200,220,255,0.7);border:2px solid #901010;border-radius:2px' },
                { style: 'bottom:30%;left:54%;width:8%;height:10%;background:rgba(200,220,255,0.7);border:2px solid #901010;border-radius:2px' },
                // Trolley roof
                { style: 'bottom:43%;left:23%;width:49%;height:4%;background:#c01818;border-radius:4px 4px 0 0' },
                // Trolley wheels
                { style: 'bottom:16%;left:30%;width:6%;height:6%;background:#404040;border:2px solid #606060;border-radius:50%' },
                { style: 'bottom:16%;left:58%;width:6%;height:6%;background:#404040;border:2px solid #606060;border-radius:50%' },
                // Gate (bars)
                { style: 'bottom:18%;left:20%;width:2%;height:30%;background:#808080' },
                { style: 'bottom:18%;left:72%;width:2%;height:30%;background:#808080' },
                { style: 'bottom:42%;left:20%;width:54%;height:3%;background:#808080' },
                // Three levers
                { style: 'bottom:35%;left:8%;width:3%;height:15%;background:#606060;border-radius:2px' },
                { style: 'bottom:48%;left:7%;width:5%;height:4%;background:#808080;border-radius:50%' },
                { style: 'bottom:35%;left:13%;width:3%;height:15%;background:#606060;border-radius:2px' },
                { style: 'bottom:48%;left:12%;width:5%;height:4%;background:#808080;border-radius:50%' },
                { style: 'bottom:35%;left:18%;width:3%;height:15%;background:#606060;border-radius:2px' },
                { style: 'bottom:48%;left:17%;width:5%;height:4%;background:#d0a020;border-radius:50%' },
                // Lever labels
                { style: 'bottom:32%;left:7%;width:5%;height:4%;font-size:0.5em;color:#c0c0c0;display:flex;align-items:center;justify-content:center', content: '1' },
                { style: 'bottom:32%;left:12%;width:5%;height:4%;font-size:0.5em;color:#c0c0c0;display:flex;align-items:center;justify-content:center', content: '2' },
                { style: 'bottom:32%;left:17%;width:5%;height:4%;font-size:0.5em;color:#d0a020;display:flex;align-items:center;justify-content:center', content: '3' },
                // Station sign
                { style: 'top:5%;left:25%;width:45%;height:10%;background:#d8a050;border:3px solid #a08040;border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:0.7em;color:#604020;font-weight:bold', content: 'TROLLEY STATION' },
                { classes: 'scene-vignette' }
            ]
        },
        hotspots: [
            {
                id: 'exit_w', type: 'exit', target: 'airport',
                label: "\u2190 Airport",
                position: { top: '50%', left: '0%', width: '8%', height: '20%' }
            },
            {
                id: 'exit_n', type: 'exit', target: 'hidden_tunnel',
                label: "\u2191 Tunnel",
                position: { top: '2%', left: '35%', width: '30%', height: '10%' }
            },
            {
                id: 'trolley', type: 'scenery',
                label: 'The Trolley',
                lookText: "IT'S THE TROLLEY! The beautiful red trolley that started all of this. It sits on the tracks, locked behind a gate. Three levers control the gate. Which one to pull?",
                position: { bottom: '18%', left: '25%', width: '45%', height: '30%' }
            },
            {
                id: 'lever_1', type: 'scenery',
                label: 'Lever 1',
                lookText: "Lever 1. A metal lever with a round handle. It's cold to the touch.",
                position: { bottom: '35%', left: '6%', width: '7%', height: '18%' },
                onInteract: function(state, eventBus) {
                    eventBus.emit('narration:show', {
                        text: "You pull Lever 1. A loud BUZZING sound fills the station. Wrong lever! The gate remains locked. A sign flashes: 'NICE TRY.'",
                        style: 'warning'
                    });
                }
            },
            {
                id: 'lever_2', type: 'scenery',
                label: 'Lever 2',
                lookText: "Lever 2. A metal lever with a round handle. Seems identical to the others.",
                position: { bottom: '35%', left: '11%', width: '7%', height: '18%' },
                onInteract: function(state, eventBus) {
                    eventBus.emit('narration:show', {
                        text: "You pull Lever 2. Steam hisses from somewhere. Wrong lever! A parrot squawks 'WRONG!' from the rafters. Where did that parrot come from?",
                        style: 'warning'
                    });
                }
            },
            {
                id: 'lever_3', type: 'scenery',
                label: 'Lever 3',
                lookText: "Lever 3. This one has a golden handle, slightly different from the others. The number 3 is engraved in it.",
                position: { bottom: '35%', left: '16%', width: '7%', height: '18%' },
                onInteract: function(state, eventBus) {
                    if (state.getFlag('trolley_won')) return;
                    state.setFlag('trolley_won', true);
                    state.addScore(50);
                    eventBus.emit('narration:show', {
                        text: "You pull Lever 3. The gate swings open with a satisfying CLANK! The trolley's engine roars to life. YOU DID IT! You've stolen the trolley! Fred Rogers, TERRORIST, has won the day!",
                        style: 'character'
                    });
                    setTimeout(function() {
                        eventBus.emit('game:win');
                    }, 3000);
                }
            }
        ],
        onEnter: function(state, eventBus, data) {
            if (data.firstVisit) {
                state.addScore(10);
                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: "There it is. The TROLLEY. Three levers control the gate. Daniel said 'Three is the magic number.' Lady Elaine's note said 'Pull lever 3.' This is the moment of truth.",
                        style: 'hint'
                    });
                }, 100);
            }
        }
    }
};
