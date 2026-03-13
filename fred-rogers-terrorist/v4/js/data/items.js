/**
 * items.js — Item Definitions
 * Fred Rogers, Terrorist v4
 *
 * All Real World items (Phase 1 + Phase 2)
 */
window.FRT = window.FRT || {};

window.FRT.ItemDefs = {

    // === Phase 1 items ===

    fish_food: {
        name: 'Fish Food',
        description: 'A small box of fish food flakes. The goldfish might like these.',
        icon: '\uD83D\uDC1F', // 🐟
        takeable: true,
        hidden: false
    },

    glasses: {
        name: 'Glasses',
        description: "A pair of cheap glasses. They're a chincy no-name brand, but they work.",
        icon: '\uD83D\uDC53', // 👓
        takeable: true,
        hidden: true
    },

    penny: {
        name: 'Penny',
        description: 'A single penny, freshly spat out by the goldfish. Still a bit slimy.',
        icon: '\uD83E\uDE99', // 🪙
        takeable: true,
        hidden: false
    },

    // === Phase 2 items ===

    spade: {
        name: 'Spade',
        description: 'A sturdy garden spade. Good for digging, and probably intimidating small creatures.',
        icon: '\uD83E\uDE93', // 🪓 (closest)
        takeable: true,
        hidden: false
    },

    unmentionables: {
        name: 'Unmentionables',
        description: 'A pair of Fred\'s undergarments. They have tiny trolleys printed on them.',
        icon: '\uD83A\u9EA2', // 🩲
        takeable: true,
        hidden: true
    },

    bundle_of_money: {
        name: 'Bundle of Money',
        description: 'A roll of bills held together with a rubber band. Looks like about fifty bucks.',
        icon: '\uD83D\uDCB5', // 💵
        takeable: true,
        hidden: true
    },

    cuss_words: {
        name: 'Cuss Words',
        description: 'A scrap of paper covered in the foulest language imaginable. Where did you even LEARN these?',
        icon: '\uD83E\uDD2C', // 🤬
        takeable: true,
        hidden: true
    },

    body_slime: {
        name: 'Body Slime',
        description: 'A handful of mysterious green slime from the sewer. It smells exactly like you\'d expect.',
        icon: '\uD83E\uDDEA', // 🧪
        takeable: true,
        hidden: false
    },

    dollar_bill: {
        name: 'Dollar Bill',
        description: 'A single crumpled dollar bill. It\'s not much, but it\'s honest money.',
        icon: '\uD83D\uDCB2', // 💲
        takeable: true,
        hidden: true
    },

    switchblade: {
        name: 'Switchblade',
        description: 'A small switchblade knife. Probably not standard equipment for a children\'s TV host.',
        icon: '\uD83D\uDD2A', // 🔪
        takeable: true,
        hidden: true
    },

    executive_pass: {
        name: 'Executive Pass',
        description: 'An official PBS Executive Pass. It reads "ALL ACCESS" in gold lettering.',
        icon: '\uD83C\uDFAB', // 🎫
        takeable: true,
        hidden: true
    },

    // === Phase 3 items (Make-Believe) ===

    devils_coin: {
        name: "Devil's Coin",
        description: 'A coin with the Devil\'s face on one side and a rude gesture on the other. It radiates faint heat.',
        icon: '\uD83E\uDE99', // 🪙
        takeable: true,
        hidden: true
    },

    metal_piece: {
        name: 'Metal Piece',
        description: 'A twisted piece of ornate metal. It looks like it broke off something that spins.',
        icon: '\u2699\uFE0F', // ⚙️
        takeable: true,
        hidden: false
    },

    factory_pass: {
        name: 'Factory Pass',
        description: 'A pass stamped "CORNFLAKE S. PECIALLY APPROVED." The spelling is... creative.',
        icon: '\uD83C\uDFAB', // 🎫
        takeable: true,
        hidden: true
    },

    merry_go_round_piece: {
        name: 'Merry-Go-Round Piece',
        description: 'An ornate metal arm from a merry-go-round. Looks like it snapped off during enthusiastic spinning.',
        icon: '\uD83C\uDFA0', // 🎠
        takeable: true,
        hidden: true
    },

    lady_elaines_note: {
        name: "Lady Elaine's Note",
        description: 'A crumpled note reading: "Airport runway 3. Pull lever 3. Tell NO ONE." Signed with a lipstick kiss.',
        icon: '\uD83D\uDCDD', // 📝
        takeable: true,
        hidden: true
    },

    rolling_pin: {
        name: 'Rolling Pin',
        description: 'A heavy wooden rolling pin. Chef Brockett uses it for baking. You could also use it for... persuasion.',
        icon: '\uD83E\uDD5E', // 🥞 (closest)
        takeable: true,
        hidden: false
    },

    airline_tickets: {
        name: 'Airline Tickets',
        description: 'Three airline tickets to "Anywhere But Here." The departure gate is... Runway 3.',
        icon: '\u2708\uFE0F', // ✈️
        takeable: true,
        hidden: true
    },

    clock_note: {
        name: 'Clock Note',
        description: 'A note from Daniel Tiger: "The clock always points to THREE. Three is the magic number, friend." How cryptic.',
        icon: '\uD83D\uDD50', // 🕐
        takeable: true,
        hidden: true
    }
};
