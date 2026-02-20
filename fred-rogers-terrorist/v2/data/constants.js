/**
 * constants.js - Game Constants
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.Constants = {
    // Player defaults
    PLAYER_MAX_HP: 100,
    PLAYER_START_HP: 100,

    // Combat
    FIST_DAMAGE: 5,
    SWITCHBLADE_DAMAGE: 12,
    BUTCHER_KNIFE_DAMAGE: 15,
    MACHINE_GUN_DAMAGE: 25,
    GRENADE_DAMAGE: 40,
    GRENADE_HIT_CHANCE: 0.7,
    CUSS_WORDS_DAMAGE: 8,

    // Weapon definitions (id → damage)
    WEAPON_DAMAGE: {
        'machine_gun': 25,
        'butcher_knife': 15,
        'switchblade': 12,
        'hand_grenades': 40,  // special handling
        'cuss_words': 8       // special handling
    },

    // Score values
    SCORE_BUNDLE_OF_MONEY: 5,
    SCORE_MACHINE_GUN: 5,
    SCORE_BATHROOM_SEARCH: 5,
    SCORE_GOLDFISH_FED: 5,
    SCORE_DIMENSIONAL_WARP: 10,
    SCORE_TOLL_PAID: 0,
    SCORE_TUNNEL_OPEN: 10,
    SCORE_RIGHT_FLIGHT: 10,
    SCORE_WIN: 25,
    SCORE_DEFEAT_MINOR: 5,
    SCORE_DEFEAT_MAJOR: 10,
    SCORE_DEFEAT_DEVIL: 15,
    SCORE_LANDLORD_PAID: 10,

    // Starting room
    START_ROOM: 'introduction',

    // Canvas dimensions
    CANVAS_WIDTH: 640,
    CANVAS_HEIGHT: 400,

    // Transition
    TRANSITION_DURATION: 300,

    // Verb list
    VERBS: ['Look at', 'Pick up', 'Use', 'Talk to', 'Give', 'Open', 'Pull', 'Attack']
};
