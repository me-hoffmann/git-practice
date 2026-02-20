/**
 * characters.js - Character Definitions (Declarative)
 * Fred Rogers, Terrorist v2
 */
window.FRT = window.FRT || {};

window.FRT.CharacterDefs = {
    'landlord': {
        name: 'The Landlord',
        description: 'A gruff, impatient landlord who wants his rent money.',
        hp: 60,
        attack: 12,
        hostile: false,
        portrait: 'assets/characters/landlord.png',
        defeatScore: 10,
        acceptedItems: ['bundle_of_money', 'dollar_bill'],
        combatMessages: {
            playerHit: '"OW! I don\'t take that from MY tenants!"',
            enemyHit: '"Take that, ya filthy no-good!!"',
            defeat: '"YOU\'RE HEREBY EVICTED!!!" The Landlord storms off.',
            insult: '"Just pay up, Freddy boy."',
            ambush: 'The Landlord shoves you! "Pay ALL of it. NOW!!"'
        },
        onTalk: '$script:landlordTalk',
        onGive: '$script:landlordGive',
        onDefeat: '$script:landlordDefeat'
    },

    'pbs_president': {
        name: 'The PBS President',
        description: 'A snooty executive sitting behind a plush desk.',
        hp: 50,
        attack: 8,
        hostile: false,
        portrait: 'assets/characters/pbs_president.png',
        defeatScore: 10,
        combatMessages: {
            playerHit: '"You think you can insult me, you scuz?"',
            enemyHit: '"That\'s two weeks\' docked wages!"',
            defeat: '"You have just been CANCELED!!!!" The PBS President collapses.',
            insult: '"YOU think YOU deserve a RAISE??"',
            ambush: 'The PBS President throws a paperweight at you!'
        },
        onTalk: '$script:pbsTalk',
        onGive: '$script:pbsGive',
        onDefeat: '$script:pbsDefeat'
    },

    'mugger': {
        name: 'A Mugger',
        description: 'A threatening figure lurking in the shadows.',
        hp: 40,
        attack: 15,
        hostile: true,
        portrait: 'assets/characters/mugger.png',
        defeatScore: 10,
        loot: 'switchblade',
        acceptedItems: ['bundle_of_money', 'dollar_bill'],
        combatMessages: {
            playerHit: '"OOOOOOOF!!"',
            enemyHit: '"HA!! Take that!"',
            defeat: '"You really SUCK, man!" The mugger collapses.',
            insult: '"No Canadian coins, jerk!!"',
            ambush: '"Your money or your life, dip!" The mugger attacks!'
        },
        onGive: '$script:muggerGive',
        onDefeat: '$script:muggerDefeat'
    },

    'devil': {
        name: 'The Devil',
        description: 'The Prince of Evil himself, looking rather out of place in this neighborhood.',
        hp: 80,
        attack: 20,
        hostile: true,
        portrait: 'assets/characters/devil.png',
        defeatScore: 15,
        combatMessages: {
            playerHit: '"You dare insult the Prince of Evil??"',
            enemyHit: '"HA!!!!! Chalk up one for Lucifer!!"',
            defeat: '"Mine, and your, success is down the toilet!" The Devil vanishes in a puff of smoke.',
            insult: '"Your soul is too kind for my type!!"',
            ambush: '"You ain\'t been to church lately, Fred!!" The Devil attacks!'
        },
        onTalk: '$script:devilTalk',
        onGive: '$script:devilGive',
        onDefeat: '$script:devilDefeat'
    },

    'lady_elaine': {
        name: 'Lady Elaine Fairchild',
        description: 'A stuck-up, snobby puppet with a very bad attitude.',
        hp: 55,
        attack: 14,
        hostile: true,
        portrait: 'assets/characters/lady_elaine.png',
        defeatScore: 10,
        acceptedItems: ['bundle_of_money', 'dollar_bill'],
        combatMessages: {
            playerHit: '"OW!! One big setback for us puppets!"',
            enemyHit: '"BOOMERANG, TOOMERANG, ZOOMERANG!"',
            defeat: '"My loss will sadden millions of KIDS!!" Lady Elaine crumples.',
            insult: '"YOUR WORKING CONDITIONS SUCK!"',
            ambush: '"I\'m a stuck-up, snobby puppet! DIE!!" Lady Elaine attacks!'
        },
        onTalk: '$script:ladyElaineTalk',
        onGive: '$script:ladyElaineGive',
        onDefeat: '$script:ladyElaineDefeat'
    },

    'henrietta': {
        name: 'Henrietta Pussycat',
        description: 'A feisty cat puppet with claws bared.',
        hp: 45,
        attack: 12,
        hostile: true,
        portrait: 'assets/characters/henrietta.png',
        defeatScore: 10,
        acceptedItems: ['fish_food'],
        combatMessages: {
            playerHit: '"Meow-meow OUCH!!"',
            enemyHit: '"Suck this!!!!"',
            defeat: '"Ohhhhhhhhh....okay." Henrietta slinks away.',
            insult: '"NO ONE gets away with THAT!!!!!"',
            ambush: '"You are gonna PAY!!" Henrietta swipes at you!'
        },
        onTalk: '$script:henriettaTalk',
        onGive: '$script:henriettaGive',
        onDefeat: '$script:henriettaDefeat'
    },

    'tapeworm': {
        name: 'Scuzmodian Tapeworm',
        description: 'A hideous worm creature blocking the sewer passage.',
        hp: 50,
        attack: 16,
        hostile: true,
        portrait: 'assets/characters/tapeworm.png',
        defeatScore: 10,
        combatMessages: {
            playerHit: '"Ugh! Tapeworms have feelings too!"',
            enemyHit: '"You have been nailed, Fred!"',
            defeat: '"I shouldn\'t have picked on a TV star!" The tapeworm retreats.',
            insult: '"I wouldn\'t come any closer, bub!!"',
            ambush: '"I wouldn\'t come any closer, bub!!" The tapeworm lashes out!'
        },
        onTalk: '$script:tapewormTalk',
        onDefeat: '$script:tapewormDefeat'
    },

    'dr_platypus': {
        name: 'Dr. Platypus',
        description: 'A suspicious-looking platypus with a medical degree.',
        hp: 45,
        attack: 10,
        hostile: false,
        portrait: 'assets/characters/dr_platypus.png',
        defeatScore: 5,
        combatMessages: {
            playerHit: '"Ouch, you scrawny wimp!"',
            enemyHit: '"I\'ll show you I\'m not just a dumb duck!"',
            defeat: '"The PBS President will hear about this!" Dr. Platypus waddles away.',
            insult: '"I don\'t take PBS money. It\'s worthless."',
            ambush: '"Hello!!" Dr. Platypus attacks unexpectedly!'
        },
        onTalk: '$script:drPlatypusTalk',
        onGive: '$script:drPlatypusGive',
        onDefeat: '$script:drPlatypusDefeat'
    },

    'chef_brockett': {
        name: 'Chef Brockett',
        description: 'An angry chef wielding kitchen implements.',
        hp: 55,
        attack: 18,
        hostile: true,
        portrait: 'assets/characters/chef_brockett.png',
        defeatScore: 10,
        loot: 'butcher_knife',
        combatMessages: {
            playerHit: '"Stop it, you unit of cholesterol!"',
            enemyHit: '"Ha! Take that!!!"',
            defeat: '"My career! Down the TOILET!!" Chef Brockett collapses into a flour pile.',
            insult: '"No way, scuz face!"',
            ambush: '"How DARE you disturb me!?" Chef Brockett attacks with a rolling pin!'
        },
        onTalk: '$script:chefBrockettTalk',
        onDefeat: '$script:chefBrockettDefeat'
    },

    'daniel_tiger': {
        name: 'Daniel Tiger',
        description: 'A timid tiger puppet guarding his clock.',
        hp: 30,
        attack: 8,
        hostile: false,
        portrait: 'assets/characters/daniel_tiger.png',
        defeatScore: 5,
        combatMessages: {
            playerHit: '"SORRY!!! I didn\'t MEAN to!!!!!"',
            enemyHit: '"Leave my clock alone."',
            defeat: '"OHHHH, WOE is ME!!!!!!!" Daniel Tiger curls up and cries.',
            insult: '"As long as you leave my clock alone."'
        },
        onTalk: '$script:danielTigerTalk',
        onDefeat: '$script:danielTigerDefeat'
    },

    'mutated_ex': {
        name: 'Mutated Ex',
        description: 'A vulture-like creature that was once Ex the owl.',
        hp: 65,
        attack: 18,
        hostile: true,
        portrait: 'assets/characters/mutated_ex.png',
        defeatScore: 10,
        combatMessages: {
            playerHit: '"He\'s already dead, stupid!"',
            enemyHit: 'The Mutated Ex swoops down and claws you!',
            defeat: 'The Mutated Ex lets out a final screech and collapses.',
            ambush: 'You see a vulture-like creature jump out! The Mutated Ex attacks!'
        },
        onDefeat: '$script:mutatedExDefeat'
    },

    'streaker': {
        name: 'The Streaker',
        description: 'A nude gardener running through the garden.',
        hp: 25,
        attack: 5,
        hostile: false,
        portrait: 'assets/characters/streaker.png',
        defeatScore: 5,
        combatMessages: {
            playerHit: '"Pow!! Right in the (censored)!!"',
            enemyHit: '"It could of been worse!"',
            defeat: '"Old streakers never die!" The streaker runs off.',
            insult: '"Just leave me alone."',
            ambush: '"OH YES THEY CALL HIM THE STREAK!!" The streaker bumps into you!'
        },
        onTalk: '$script:streakerTalk',
        onDefeat: '$script:streakerDefeat'
    },

    'goldfish': {
        name: 'The Goldfish',
        description: 'Two ugly, well fed goldfish in a tank.',
        hp: 999,
        attack: 0,
        hostile: false,
        portrait: 'assets/characters/goldfish.png',
        defeatScore: 0,
        acceptedItems: ['fish_food'],
        combatMessages: {
            playerHit: '"YOWOWOWOWOW!!!!"'
        },
        onTalk: '$script:goldfishTalk',
        onGive: '$script:goldfishGive'
    },

    'rat': {
        name: 'Giant Rabid Rat',
        description: 'A big, ugly, probably rabid rat.',
        hp: 35,
        attack: 14,
        hostile: true,
        portrait: 'assets/characters/rat.png',
        defeatScore: 5,
        combatMessages: {
            playerHit: 'The rat squeals in pain!',
            enemyHit: 'The rat bites you with its diseased teeth!',
            defeat: 'The rat scurries away into the darkness.',
            ambush: 'The giant rat lunges at you!'
        },
        onDefeat: '$script:ratDefeat'
    }
};
