/**
 * items.js - Item Definitions (Declarative)
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.ItemDefs = {
    'dollar_bill': {
        name: 'dollar bill',
        description: 'A crumpled one-dollar bill.',
        aliases: ['dollar', 'bill', 'money'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/dollar_bill.png',
        onTake: '$script:dollarBillTake'
    },

    'bundle_of_money': {
        name: 'bundle of money',
        description: 'A fat bundle of cash — $50!',
        aliases: ['money', 'bundle', 'cash'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/bundle_of_money.png',
        onTake: '$script:bundleOfMoneyTake'
    },

    'machine_gun': {
        name: 'submachine gun',
        description: 'A fully automatic weapon. Overkill for a kids\' show.',
        aliases: ['gun', 'machine gun', 'weapon', 'smg'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/machine_gun.png',
        onTake: '$script:machineGunTake',
        isWeapon: true,
        damage: 25
    },

    'hand_grenades': {
        name: 'hand grenades',
        description: 'A small cluster of hand grenades. There are only a few, so use wisely.',
        aliases: ['grenades', 'grenade'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/hand_grenades.png',
        onTake: '$script:grenadeTake',
        onUse: '$script:grenadeUse',
        isWeapon: true,
        damage: 40
    },

    'switchblade': {
        name: 'switchblade',
        description: 'A mean-looking switchblade knife.',
        aliases: ['blade', 'knife'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/switchblade.png',
        onTake: '$script:switchbladeTake',
        isWeapon: true,
        damage: 12
    },

    'butcher_knife': {
        name: 'butcher knife',
        description: 'A heavy butcher knife. Chef Brockett\'s finest.',
        aliases: ['knife', 'cleaver'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/butcher_knife.png',
        isWeapon: true,
        damage: 15
    },

    'fish_food': {
        name: 'box of fish food',
        description: 'A small box of fish food flakes.',
        aliases: ['fish food', 'food', 'flakes'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/fish_food.png'
    },

    'glasses': {
        name: 'pair of glasses',
        description: 'It\'s a chincy no-name brand.',
        aliases: ['glasses', 'spectacles'],
        takeable: true,
        hidden: true,
        icon: 'assets/items/glasses.png'
    },

    'cuss_words': {
        name: 'cuss words',
        description: 'A colorful vocabulary of profanity.',
        aliases: ['cuss', 'profanity', 'swear words'],
        takeable: false, // acquired via search, not pick up
        hidden: false,
        icon: 'assets/items/cuss_words.png',
        onUse: '$script:cussWordsUse',
        isWeapon: true,
        damage: 8
    },

    'spade': {
        name: 'spade',
        description: 'A sturdy-looking spade.',
        aliases: ['shovel'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/spade.png'
    },

    'warproom_sign': {
        name: 'warproom sign',
        description: 'A sign with some text on it.',
        aliases: ['sign'],
        takeable: false,
        hidden: false,
        icon: 'assets/items/sign.png',
        onLook: '$script:signRead'
    },

    'first_ticket': {
        name: 'first ticket',
        description: 'An airline ticket. Gate 1.',
        aliases: ['ticket 1', 'ticket one'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/ticket.png',
        onUse: '$script:firstTicketUse'
    },

    'second_ticket': {
        name: 'second ticket',
        description: 'An airline ticket. Gate 2.',
        aliases: ['ticket 2', 'ticket two'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/ticket.png',
        onUse: '$script:secondTicketUse'
    },

    'third_ticket': {
        name: 'third ticket',
        description: 'An airline ticket. Gate 3.',
        aliases: ['ticket 3', 'ticket three'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/ticket.png',
        onUse: '$script:thirdTicketUse'
    },

    'body_slime': {
        name: 'body slime',
        description: 'Disgusting slime from some unknown source.',
        aliases: ['slime', 'goo'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/body_slime.png'
    },

    'metal_piece': {
        name: 'strange looking hunk of metal',
        description: 'An odd looking piece of metal. Could be useful somewhere.',
        aliases: ['metal', 'hunk', 'piece of metal'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/metal_piece.png'
    },

    'merry_go_round_piece': {
        name: 'merry-go-round piece',
        description: 'You spy a tag on it that says, "Made in Japan."',
        aliases: ['piece', 'merry go round'],
        takeable: true,
        hidden: true,
        icon: 'assets/items/merry_go_round_piece.png'
    },

    'unmentionables': {
        name: 'unmentionables',
        description: 'You really don\'t want to know.',
        aliases: ['underwear'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/unmentionables.png'
    },

    'penny': {
        name: 'penny',
        description: 'A single penny from the goldfish.',
        aliases: ['coin'],
        takeable: true,
        hidden: false,
        icon: 'assets/items/penny.png'
    }
};
