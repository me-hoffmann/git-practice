/**
 * items.js — Item Definitions
 * Fred Rogers, Terrorist v3
 *
 * Each item has a name, description, emoji icon, and CSS class for styled display.
 * No weapon stats — items are puzzle solutions, not combat tools.
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.ItemDefs = {
    'fish_food': {
        name: 'Fish Food',
        description: 'A small box of fish food flakes. The goldfish might enjoy these.',
        icon: '\uD83D\uDC1F', // 🐟
        takeable: true,
        hidden: false
    },

    'glasses': {
        name: 'Glasses',
        description: "A chincy no-name pair of glasses. They've seen better days.",
        icon: '\uD83D\uDC53', // 👓
        takeable: true,
        hidden: true
    },

    'spade': {
        name: 'Spade',
        description: 'A sturdy little garden spade. Good for digging.',
        icon: '\uD83E\uDEA3', // 🪣 (close enough) — using ⛏ instead
        takeable: true,
        hidden: false
    },

    'unmentionables': {
        name: 'Unmentionables',
        description: "You really don't want to know what these are. But someone might need them.",
        icon: '\uD83E\uDE72', // 🩲
        takeable: true,
        hidden: true
    },

    'dollar_bill': {
        name: 'Dollar Bill',
        description: 'A crumpled one-dollar bill. Not much, but it could come in handy.',
        icon: '\uD83D\uDCB5', // 💵
        takeable: true,
        hidden: true
    },

    'bundle_of_money': {
        name: 'Bundle of Money',
        description: 'A fat bundle of cash — $50! Someone left this in a rough part of town.',
        icon: '\uD83D\uDCB0', // 💰
        takeable: true,
        hidden: false
    },

    'cuss_words': {
        name: 'Cuss Words',
        description: 'A colorful vocabulary of profanity scrawled on the wall. Now etched in your brain.',
        icon: '\uD83E\uDD2C', // 🤬
        takeable: false, // acquired via search, added to inventory by script
        hidden: false
    },

    'penny': {
        name: 'Penny',
        description: 'A single penny, freshly spit out by a talking goldfish. Still a little slimy.',
        icon: '\uD83E\uDE99', // 🪙
        takeable: true,
        hidden: false
    },

    'body_slime': {
        name: 'Body Slime',
        description: 'Disgusting slime from some unknown source. The smell is... memorable.',
        icon: '\uD83E\uDDEA', // 🧪
        takeable: true,
        hidden: false
    },

    'switchblade': {
        name: 'Switchblade',
        description: 'A mean-looking switchblade knife. Dropped by the mugger in his haste to flee.',
        icon: '\uD83D\uDD2A', // 🔪
        takeable: true,
        hidden: false
    }
};
