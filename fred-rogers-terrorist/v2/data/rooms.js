/**
 * rooms.js - Room Definitions (Declarative)
 * Fred Rogers, Terrorist v2
 *
 * Hotspot polygons use normalized [0,1] coordinates.
 * These are rough initial placements — will be refined to match artwork.
 */
window.FRT = window.FRT || {};

window.FRT.RoomDefs = {
    'introduction': {
        name: 'Introduction',
        description: 'This adventure was produced with World Builder. Copyright 1986 by William C. Appleton. Published by Silicon Beach Software, Inc.',
        art: 'assets/scenes/introduction.png',
        exits: { south: 'freds_house' },
        items: [],
        characters: [],
        onEnter: '$script:introEnter',
        hotspots: [
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' }
        ]
    },

    'freds_house': {
        name: "Fred's House",
        description: "HI NEIGHBOR!!!!! You have entered the house so famous to millions of children, the home of Fred Rogers. There is a closet which contains nothing but old clothes. Exits are to the east and west.",
        art: 'assets/scenes/freds_house.png',
        exits: { east: 'fish_room', west: 'front_porch' },
        items: ['fish_food'],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'searchable', id: 'closet', polygon: [[0.2,0.15],[0.45,0.15],[0.45,0.7],[0.2,0.7]], label: 'Closet', onSearch: '$script:fredsHouseSearch', onOpen: '$script:fredsHouseSearch' },
            { type: 'item', itemId: 'fish_food', polygon: [[0.55,0.5],[0.7,0.5],[0.7,0.65],[0.55,0.65]], label: 'Fish Food' }
        ]
    },

    'fish_room': {
        name: "Fish & Pic. Pic.",
        description: "You have entered a room with a very stupid looking picture with a weird thing inside it and a tank with two ugly, well fed goldfish in it. The only visible exits are to the east and west.",
        art: 'assets/scenes/fish_room.png',
        exits: { west: 'freds_house', east: 'backyard' },
        items: [],
        characters: ['goldfish'],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'character', characterId: 'goldfish', polygon: [[0.35,0.3],[0.65,0.3],[0.65,0.7],[0.35,0.7]], label: 'Goldfish' },
            { type: 'scenery', id: 'picture', polygon: [[0.1,0.1],[0.35,0.1],[0.35,0.45],[0.1,0.45]], label: 'Weird Picture', lookText: 'A very stupid looking picture with a weird thing inside it.' }
        ]
    },

    'front_porch': {
        name: "Front Porch",
        description: "You are in the threshold of your front door. It's a beautiful day outside. Exits are to the east, west, and north.",
        art: 'assets/scenes/front_porch.png',
        exits: { east: 'freds_house', west: 'bathroom', north: 'quiet_street' },
        items: [],
        characters: ['landlord'],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'character', characterId: 'landlord', polygon: [[0.4,0.25],[0.65,0.25],[0.65,0.75],[0.4,0.75]], label: 'The Landlord' }
        ]
    },

    'backyard': {
        name: "Backyard",
        description: "You have entered your backyard. Your sandbox is lying there in the same place it's been since the dawn of time. Your exits are to the south, east, and west.",
        art: 'assets/scenes/backyard.png',
        exits: { west: 'fish_room', south: 'neighbors_garden', east: 'kitchen' },
        items: ['spade'],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'searchable', id: 'sandbox', polygon: [[0.25,0.5],[0.7,0.5],[0.7,0.8],[0.25,0.8]], label: 'Sandbox', onSearch: '$script:backyardSearch' },
            { type: 'item', itemId: 'spade', polygon: [[0.72,0.4],[0.82,0.4],[0.82,0.7],[0.72,0.7]], label: 'Spade' }
        ]
    },

    'bathroom': {
        name: "Bathroom",
        description: "You have entered a tidy but rather small bathroom. It is seldom used on the show because it is reserved for 'cast emergencies'. Exits are to the north and east.",
        art: 'assets/scenes/bathroom.png',
        exits: { east: 'front_porch', north: 'kitchen' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'searchable', id: 'toilet', polygon: [[0.3,0.4],[0.6,0.4],[0.6,0.75],[0.3,0.75]], label: 'Behind the Toilet', onSearch: '$script:bathroomSearch' }
        ]
    },

    'kitchen': {
        name: "Kitchen",
        description: "You are in a tidy but small kitchen. A model of a castle is on the shelf in front of you. Exits are to the east, west, and south.",
        art: 'assets/scenes/kitchen.png',
        exits: { west: 'backyard', south: 'bathroom', east: 'scuzzy_alley' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'searchable', id: 'castle', polygon: [[0.3,0.2],[0.65,0.2],[0.65,0.55],[0.3,0.55]], label: 'Model Castle', onSearch: '$script:kitchenSearch' }
        ]
    },

    'scuzzy_alley': {
        name: "Scuzzy Alley",
        description: "You are in a scuzzy alley, something you wouldn't dream was possible in this small of a town. Dirt and trash are all around you. The only exit is the way you came in, unless you have suction cups on your feet.",
        art: 'assets/scenes/scuzzy_alley.png',
        exits: { west: 'kitchen', east: 'pbs_lair' },
        items: ['bundle_of_money'],
        characters: ['mugger'],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'character', characterId: 'mugger', polygon: [[0.5,0.2],[0.75,0.2],[0.75,0.7],[0.5,0.7]], label: 'Mugger' },
            { type: 'item', itemId: 'bundle_of_money', polygon: [[0.2,0.6],[0.4,0.6],[0.4,0.75],[0.2,0.75]], label: 'Bundle of Money' }
        ]
    },

    'pbs_lair': {
        name: "Lair of the PBS President",
        description: "You are now in a plushly decorated office. There is a painting of a cross section of an egg and a mirror on the back wall. Evidently the owner has weird taste. The only exit is to the west.",
        art: 'assets/scenes/pbs_lair.png',
        exits: { west: 'scuzzy_alley' },
        items: [],
        characters: ['pbs_president'],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'character', characterId: 'pbs_president', polygon: [[0.4,0.25],[0.7,0.25],[0.7,0.75],[0.4,0.75]], label: 'PBS President' },
            { type: 'searchable', id: 'egg_painting', polygon: [[0.15,0.1],[0.4,0.1],[0.4,0.4],[0.15,0.4]], label: 'Egg Painting', onSearch: '$script:pbsLairSearch' }
        ]
    },

    'neighbors_garden': {
        name: "Neighbor's Garden",
        description: "You are in the neighbor's garden. Smooth move, because it's in the process of being planted!",
        art: 'assets/scenes/neighbors_garden.png',
        exits: { north: 'backyard' },
        items: [],
        characters: ['streaker'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'character', characterId: 'streaker', polygon: [[0.35,0.3],[0.65,0.3],[0.65,0.75],[0.35,0.75]], label: 'The Streaker' },
            { type: 'scenery', id: 'garden', polygon: [[0.1,0.6],[0.9,0.6],[0.9,0.9],[0.1,0.9]], label: 'Garden', lookText: 'Mostly just dirt and seedlings.' }
        ]
    },

    'quiet_street': {
        name: "Quiet Street",
        description: "You are on a quiet, small town street. Exits are to the south and east.",
        art: 'assets/scenes/quiet_street.png',
        exits: { south: 'front_porch', east: 'road_with_houses' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' }
        ]
    },

    'road_with_houses': {
        name: "Road with Houses",
        description: "You are on a road with a few small houses to either side. Something about this place scares you. Maybe it's because this is the first time you've ever seen the real neighborhood and not just a model. Exits are to the north and south.",
        art: 'assets/scenes/road_with_houses.png',
        exits: { north: 'side_street', south: 'quiet_street' },
        items: [],
        characters: [],
        blocked: { north: '$script:tollGateCheck' },
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' }
        ]
    },

    'side_street': {
        name: "Side Street",
        description: "You turn down the side street onto this well-paved but nearly deserted road. As you come to a dead end, you notice an ad on the fence behind the road. Exits are to the west and south.",
        art: 'assets/scenes/side_street.png',
        exits: { south: 'road_with_houses', west: 'dimensional_warp' },
        items: ['warproom_sign'],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'scenery', id: 'fence_ad', polygon: [[0.2,0.15],[0.8,0.15],[0.8,0.5],[0.2,0.5]], label: 'Fence Ad', lookText: 'The ad reads: "Dimensional Warp Ahead \u2014 Enter at Your Own Risk!"' },
            { type: 'item', itemId: 'warproom_sign', polygon: [[0.35,0.2],[0.65,0.2],[0.65,0.45],[0.35,0.45]], label: 'Sign' }
        ]
    },

    'dimensional_warp': {
        name: "Dimensional Warp",
        description: "You have finally entered the neighborhood of make believe. I suppose we'd better tell you what your quest is now.",
        art: 'assets/scenes/dimensional_warp.png',
        exits: { east: 'make_believe_zone' },
        items: [],
        characters: [],
        blocked: { west: '$script:warpBlockWest' },
        onEnter: '$script:dimensionalWarpEnter',
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' }
        ]
    },

    'make_believe_zone': {
        name: "The Make-Believe Zone",
        description: "You have entered another dimension. A dimension not of sight or sound, but of little puppets and kiddy playthings that come to life in the hands of a true maniac. Your guess is as good as mine for which way you go, because you are now in... THE MAKE-BELIEVE ZONE!!",
        art: 'assets/scenes/make_believe_zone.png',
        exits: { north: 'cornflakes_factory', south: 'lady_elaines', east: 'henrietta_place', west: 'sewer' },
        items: ['machine_gun'],
        characters: ['devil'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'character', characterId: 'devil', polygon: [[0.4,0.2],[0.7,0.2],[0.7,0.7],[0.4,0.7]], label: 'The Devil' },
            { type: 'item', itemId: 'machine_gun', polygon: [[0.15,0.55],[0.35,0.55],[0.35,0.7],[0.15,0.7]], label: 'Submachine Gun' }
        ]
    },

    'sewer': {
        name: "Sewer",
        description: "You are now in a sewer. When you fell, you landed on something soft floating through the water. You wanted to see what it was, but it floated by too fast. The moss on the side of the sewer plus other things gives this place an awful smell.",
        art: 'assets/scenes/sewer.png',
        exits: { east: 'make_believe_zone', south: 'dark_area' },
        items: ['body_slime'],
        characters: ['tapeworm'],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'character', characterId: 'tapeworm', polygon: [[0.35,0.3],[0.65,0.3],[0.65,0.7],[0.35,0.7]], label: 'Tapeworm' },
            { type: 'item', itemId: 'body_slime', polygon: [[0.15,0.6],[0.3,0.6],[0.3,0.75],[0.15,0.75]], label: 'Body Slime' }
        ]
    },

    'dark_area': {
        name: "Dark Area",
        description: "It's so dark in here, you can't see a thing. However, you can barely make out a big, ugly, probably rabid rat coming right at you.",
        art: 'assets/scenes/dark_area.png',
        exits: { north: 'sewer' },
        items: [],
        characters: ['rat'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'character', characterId: 'rat', polygon: [[0.3,0.3],[0.7,0.3],[0.7,0.7],[0.3,0.7]], label: 'Giant Rat' },
            { type: 'searchable', id: 'darkness', polygon: [[0.1,0.5],[0.9,0.5],[0.9,0.9],[0.1,0.9]], label: 'Search the Dark', onSearch: '$script:darkAreaSearch' }
        ]
    },

    'cornflakes_factory': {
        name: "Cornflake's Factory",
        description: "You have come to the front of the factory of Cornflake S. Pecially. From the inside, you can hear whirring sounds and an occasional swear-word. You ask him to come out, but all you get is a recorded, 'Not now!! I'm BUSY!!'",
        art: 'assets/scenes/cornflakes_factory.png',
        exits: { south: 'make_believe_zone', west: 'platypus_mound' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'scenery', id: 'factory_door', polygon: [[0.3,0.2],[0.7,0.2],[0.7,0.7],[0.3,0.7]], label: 'Factory Door', lookText: 'The factory door is firmly locked. Cornflake really doesn\'t want visitors.' }
        ]
    },

    'henrietta_place': {
        name: "Henrietta & Ex's Place",
        description: "You are standing in front of a tree with a small house on one limb and a door in the middle of the main trunk. There is a cord hanging down next to the house.",
        art: 'assets/scenes/henrietta_place.png',
        exits: { west: 'make_believe_zone', south: 'chef_brocketts' },
        items: [],
        characters: ['henrietta'],
        hotspots: [
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'character', characterId: 'henrietta', polygon: [[0.35,0.15],[0.6,0.15],[0.6,0.55],[0.35,0.55]], label: 'Henrietta' },
            { type: 'searchable', id: 'cord', polygon: [[0.65,0.2],[0.8,0.2],[0.8,0.7],[0.65,0.7]], label: 'Cord', onSearch: '$script:henriettaPlaceSearch', onPull: '$script:henriettaPlaceSearch' }
        ]
    },

    'lady_elaines': {
        name: "Lady Elaine's Merry-Go-Round",
        description: "You are now standing next to Lady Elaine Fairchild's merry-go-round. She is nowhere in sight, much to your relief. Exits are to the north and south.",
        art: 'assets/scenes/lady_elaines.png',
        exits: { north: 'make_believe_zone', south: 'aberlins_crypt' },
        items: [],
        characters: ['lady_elaine'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'character', characterId: 'lady_elaine', polygon: [[0.4,0.2],[0.65,0.2],[0.65,0.65],[0.4,0.65]], label: 'Lady Elaine' },
            { type: 'searchable', id: 'merry_go_round', polygon: [[0.15,0.4],[0.85,0.4],[0.85,0.8],[0.15,0.8]], label: 'Merry-Go-Round', onSearch: '$script:ladyElainesSearch' }
        ]
    },

    'platypus_mound': {
        name: "Platypus Mound",
        description: "You are now at the platypuses' home. They appear to be absent, but I wouldn't bet my life on it.",
        art: 'assets/scenes/platypus_mound.png',
        exits: { east: 'cornflakes_factory', south: 'daniel_tigers_clock' },
        items: [],
        characters: ['dr_platypus'],
        onEnter: '$script:platypusMoundEnter',
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.85],[0.7,0.85],[0.7,1.0],[0.3,1.0]], label: 'Go South' },
            { type: 'character', characterId: 'dr_platypus', polygon: [[0.35,0.3],[0.65,0.3],[0.65,0.7],[0.35,0.7]], label: 'Dr. Platypus' }
        ]
    },

    'aberlins_crypt': {
        name: "Lady Aberlin's Crypt",
        description: "You've walked into what you know to be the final resting place of one of your colleagues for many years, Lady Aberlin. The coffin door is open, and you begin to get suspicious that this is not normal procedure. You can go east from here.",
        art: 'assets/scenes/aberlins_crypt.png',
        exits: { north: 'lady_elaines', east: 'airport' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'scenery', id: 'coffin', polygon: [[0.25,0.25],[0.7,0.25],[0.7,0.7],[0.25,0.7]], label: 'Open Coffin', lookText: 'The coffin is already open. It\'s empty and unsettling. Where did Lady Aberlin go?' }
        ]
    },

    'chef_brocketts': {
        name: "Chef Brockett's Bakery",
        description: "You are now in the bakery of Chef Brockett. I might stress that it wasn't wise to come here.",
        art: 'assets/scenes/chef_brocketts.png',
        exits: { north: 'henrietta_place', west: 'daniel_tigers_clock' },
        items: [],
        characters: ['chef_brockett'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'west', polygon: [[0.0,0.2],[0.15,0.2],[0.15,0.8],[0.0,0.8]], label: 'Go West' },
            { type: 'character', characterId: 'chef_brockett', polygon: [[0.35,0.2],[0.65,0.2],[0.65,0.7],[0.35,0.7]], label: 'Chef Brockett' }
        ]
    },

    'daniel_tigers_clock': {
        name: "Daniel Tiger's Clock",
        description: "You are standing next to Daniel Tiger's Clock. You cannot go any further south. The only visible exit is north.",
        art: 'assets/scenes/daniel_tigers_clock.png',
        exits: { north: 'platypus_mound', east: 'chef_brocketts' },
        items: [],
        characters: ['daniel_tiger'],
        hotspots: [
            { type: 'exit', exitDir: 'north', polygon: [[0.3,0.0],[0.7,0.0],[0.7,0.15],[0.3,0.15]], label: 'Go North' },
            { type: 'exit', exitDir: 'east', polygon: [[0.85,0.2],[1.0,0.2],[1.0,0.8],[0.85,0.8]], label: 'Go East' },
            { type: 'character', characterId: 'daniel_tiger', polygon: [[0.2,0.25],[0.45,0.25],[0.45,0.65],[0.2,0.65]], label: 'Daniel Tiger' },
            { type: 'searchable', id: 'clock', polygon: [[0.5,0.15],[0.8,0.15],[0.8,0.6],[0.5,0.6]], label: 'The Clock', onSearch: '$script:danielClockSearch' }
        ]
    },

    'hidden_tunnel': {
        name: "Hidden Tunnel",
        description: "You have dug yourself into a hidden tunnel. You can faintly see light from the east. You could manage to pull yourself back up.",
        art: 'assets/scenes/hidden_tunnel.png',
        exits: { up: 'daniel_tigers_clock', east: 'trolley_station' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'up', polygon: [[0.1,0.0],[0.4,0.0],[0.4,0.3],[0.1,0.3]], label: 'Climb Up' },
            { type: 'exit', exitDir: 'east', polygon: [[0.7,0.3],[1.0,0.3],[1.0,0.7],[0.7,0.7]], label: 'Go East' }
        ]
    },

    'airport': {
        name: "Airport",
        description: "As you stand out on the tarmac looking at the nice plane on the runway, a thought strikes you: You're a terrorist, hijack the thing!! You don't want to attract attention, though, so you decide it's better to get on the correct plane without anyone noticing. Your only problem is, you don't know which one!",
        art: 'assets/scenes/airport.png',
        exits: {},
        items: ['first_ticket', 'second_ticket', 'third_ticket'],
        characters: [],
        onEnter: '$script:airportEnter',
        hotspots: [
            { type: 'item', itemId: 'first_ticket', polygon: [[0.1,0.6],[0.3,0.6],[0.3,0.8],[0.1,0.8]], label: 'First Ticket' },
            { type: 'item', itemId: 'second_ticket', polygon: [[0.4,0.6],[0.6,0.6],[0.6,0.8],[0.4,0.8]], label: 'Second Ticket' },
            { type: 'item', itemId: 'third_ticket', polygon: [[0.7,0.6],[0.9,0.6],[0.9,0.8],[0.7,0.8]], label: 'Third Ticket' },
            { type: 'scenery', id: 'plane', polygon: [[0.2,0.1],[0.8,0.1],[0.8,0.5],[0.2,0.5]], label: 'Airplane', lookText: 'A nice plane sitting on the runway. Which ticket gets you on the right one?' }
        ]
    },

    'airplane': {
        name: "Airplane",
        description: "You are now in the airplane, heading off for whatever your destination might be. You'd better pray it's the right one!",
        art: 'assets/scenes/airplane.png',
        exits: { east: 'chute_room' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.75,0.3],[1.0,0.3],[1.0,0.7],[0.75,0.7]], label: 'Go East' }
        ]
    },

    'right_flight': {
        name: "Right Flight",
        description: "HALLELUJAH!! It WAS the right flight! But the flight crew quickly recognizes you as Fred Rogers, the crazed terrorist who has been destroying everyone and everything in the neighborhood of make-believe. You'd better get out of here fast!! But WHERE??",
        art: 'assets/scenes/right_flight.png',
        exits: { east: 'chute_room' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'east', polygon: [[0.75,0.3],[1.0,0.3],[1.0,0.7],[0.75,0.7]], label: 'Go East' }
        ]
    },

    'chute_room': {
        name: "Chute Room",
        description: "Just in time! The fasten seat belts sign just went off! It's a good thing you got up, came in here, and locked the door when you did, because those flight attendants were ready to throw you out the door without a parachute, which might have been about the only way out.",
        art: 'assets/scenes/chute_room.png',
        exits: { south: 'trolley_station' },
        items: [],
        characters: [],
        hotspots: [
            { type: 'exit', exitDir: 'south', polygon: [[0.3,0.7],[0.7,0.7],[0.7,1.0],[0.3,1.0]], label: 'Go South' }
        ]
    },

    'trolley_station': {
        name: "Trolley Station",
        description: "At last, you have come to the sacred vault where the trolley is kept between filmings of your show. There are four levers, though, and you have absolutely no idea which one releases the mystic aura that envelopes the trolley. Good luck, you'll need it!",
        art: 'assets/scenes/trolley_station.png',
        exits: {},
        items: [],
        characters: [],
        onEnter: '$script:trolleyStationEnter',
        hotspots: [
            { type: 'scenery', id: 'lever1', polygon: [[0.1,0.3],[0.25,0.3],[0.25,0.7],[0.1,0.7]], label: 'Lever 1', onPull: '$script:pullLever1' },
            { type: 'scenery', id: 'lever2', polygon: [[0.3,0.3],[0.45,0.3],[0.45,0.7],[0.3,0.7]], label: 'Lever 2', onPull: '$script:pullLever2' },
            { type: 'scenery', id: 'lever3', polygon: [[0.55,0.3],[0.7,0.3],[0.7,0.7],[0.55,0.7]], label: 'Lever 3', onPull: '$script:pullLever3' },
            { type: 'scenery', id: 'lever4', polygon: [[0.75,0.3],[0.9,0.3],[0.9,0.7],[0.75,0.7]], label: 'Lever 4', onPull: '$script:pullLever4' }
        ]
    },

    'holding_tank': {
        name: "Holding Tank",
        description: "I'm afraid to say, but it looks like you've purchased the wrong ticket. You are now in the holding tank of evil spirits. There is no way out.",
        art: 'assets/scenes/holding_tank.png',
        exits: {},
        items: [],
        characters: [],
        onEnter: '$script:holdingTankEnter'
    },

    'sesame_street': {
        name: "Sesame Street",
        description: "You have been magically transported to a land where sunny days chase the clouds away. Since you are now on the set of the wrong show, it looks to me like you've lost.",
        art: 'assets/scenes/sesame_street.png',
        exits: {},
        items: [],
        characters: [],
        onEnter: '$script:sesameStreetEnter'
    }
};
