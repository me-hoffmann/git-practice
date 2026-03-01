/**
 * Fred Rogers, Terrorist - Game Data
 * All rooms, items, characters, and game logic
 * Based on the original 1986 World Builder game by Michael E. Hoffmann & Matthew R. Montgomery
 */

function loadGameData(engine) {

    // ============================================================
    // ITEMS
    // ============================================================

    engine.addItem('dollar_bill', {
        name: 'dollar bill',
        description: 'A crumpled one-dollar bill.',
        aliases: ['dollar', 'bill', 'money'],
        onTake: (e) => { e.print("You picked up the dollar bill. Every penny counts!"); }
    });

    engine.addItem('bundle_of_money', {
        name: 'bundle of money',
        description: 'A fat bundle of cash — $50!',
        aliases: ['money', 'bundle', 'cash'],
        onTake: (e) => {
            e.print("Congratulations, you picked up $50!");
            e.addScore(5);
        }
    });

    engine.addItem('machine_gun', {
        name: 'submachine gun',
        description: 'A fully automatic weapon. Overkill for a kids\' show.',
        aliases: ['gun', 'machine gun', 'weapon', 'smg'],
        onTake: (e) => {
            e.print("You have picked up a fully automatic weapon. Mr. Rogers would NOT approve.");
            e.addScore(5);
        }
    });

    engine.addItem('hand_grenades', {
        name: 'hand grenades',
        description: 'A small cluster of hand grenades. There are only a few, so use wisely.',
        aliases: ['grenades', 'grenade'],
        onTake: (e) => { e.print("You picked up some hand grenades. There are only a few, so use wisely."); },
        onUse: (e) => {
            const room = e.rooms[e.player.currentRoom];
            if (room.characters.length > 0) {
                const charId = room.characters[0];
                const char = e.characters[charId];
                if (char && char.alive) {
                    if (Math.random() < 0.7) {
                        char.hp -= 40;
                        e.print(`You throw a grenade at ${char.name}! KABOOM!`, 'combat-msg');
                        if (char.hp <= 0) {
                            char.alive = false;
                            char.defeated = true;
                            e.print(`${char.name} has been obliterated!`, 'combat-msg');
                            if (char.onDefeat) char.onDefeat(e);
                            room.characters = room.characters.filter(id => id !== charId);
                        }
                    } else {
                        e.print("You throw a grenade... but it was a dud!", 'combat-msg');
                    }
                } else {
                    e.print("There's no one here to throw a grenade at.");
                }
            } else {
                e.print("There's no one here to throw a grenade at.");
            }
        }
    });

    engine.addItem('switchblade', {
        name: 'switchblade',
        description: 'A mean-looking switchblade knife.',
        aliases: ['blade', 'knife'],
        onTake: (e) => { e.print("You picked up a switchblade. Feeling dangerous."); }
    });

    engine.addItem('butcher_knife', {
        name: 'butcher knife',
        description: 'A heavy butcher knife. Chef Brockett\'s finest.',
        aliases: ['knife', 'cleaver'],
    });

    engine.addItem('fish_food', {
        name: 'box of fish food',
        description: 'A small box of fish food flakes.',
        aliases: ['fish food', 'food', 'flakes'],
    });

    engine.addItem('glasses', {
        name: 'pair of glasses',
        description: 'It\'s a chincy no-name brand.',
        aliases: ['glasses', 'spectacles'],
        hidden: true,
    });

    engine.addItem('cuss_words', {
        name: 'cuss words',
        description: 'A colorful vocabulary of profanity.',
        aliases: ['cuss', 'profanity', 'swear words'],
        onUse: (e) => { e.useCussWords(); }
    });

    engine.addItem('spade', {
        name: 'spade',
        description: 'A sturdy-looking spade.',
        aliases: ['shovel'],
    });

    engine.addItem('warproom_sign', {
        name: 'warproom sign',
        description: 'A sign with some text on it.',
        aliases: ['sign'],
        takeable: false,
        onUse: (e) => { e.readItem('sign'); }
    });

    engine.addItem('first_ticket', {
        name: 'first ticket',
        description: 'An airline ticket. Gate 1.',
        aliases: ['ticket 1', 'ticket one'],
    });

    engine.addItem('second_ticket', {
        name: 'second ticket',
        description: 'An airline ticket. Gate 2.',
        aliases: ['ticket 2', 'ticket two'],
    });

    engine.addItem('third_ticket', {
        name: 'third ticket',
        description: 'An airline ticket. Gate 3.',
        aliases: ['ticket 3', 'ticket three'],
    });

    engine.addItem('body_slime', {
        name: 'body slime',
        description: 'Disgusting slime from some unknown source.',
        aliases: ['slime', 'goo'],
    });

    engine.addItem('metal_piece', {
        name: 'strange looking hunk of metal',
        description: 'An odd looking piece of metal. Could be useful somewhere.',
        aliases: ['metal', 'hunk', 'piece of metal'],
    });

    engine.addItem('merry_go_round_piece', {
        name: 'merry-go-round piece',
        description: 'You spy a tag on it that says, "Made in Japan."',
        aliases: ['piece', 'merry go round'],
        hidden: true,
    });

    engine.addItem('unmentionables', {
        name: 'unmentionables',
        description: 'You really don\'t want to know.',
        aliases: ['underwear'],
    });

    engine.addItem('penny', {
        name: 'penny',
        description: 'A single penny from the goldfish.',
        aliases: ['coin'],
    });


    // ============================================================
    // CHARACTERS
    // ============================================================

    engine.addCharacter('landlord', {
        name: 'The Landlord',
        description: 'A gruff, impatient landlord who wants his rent money.',
        hp: 60,
        attack: 12,
        hostile: false,
        dialogue: {
            greeting: "HA!! You owe me 6 years rent!!"
        },
        combatMessages: {
            playerHit: '"OW! I don\'t take that from MY tenants!"',
            enemyHit: '"Take that, ya filthy no-good!!"',
            defeat: '"YOU\'RE HEREBY EVICTED!!!" The Landlord storms off.',
            insult: '"Just pay up, Freddy boy."',
            ambush: 'The Landlord shoves you! "Pay ALL of it. NOW!!"'
        },
        onTalk: (e) => {
            if (!e.getFlag('landlord_talked')) {
                e.print('The Landlord: "HA!! You owe me 6 years rent!!"');
                e.setFlag('landlord_talked', true);
            } else {
                e.print('The Landlord: "Just pay up, Freddy boy."');
            }
        },
        onGive: (e, itemId) => {
            if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
                e.player.inventory = e.player.inventory.filter(id => id !== itemId);
                e.print('The Landlord: "That\'s all I wanted. You\'re free to go."');
                e.characters['landlord'].hostile = false;
                e.characters['landlord'].defeated = true;
                const room = e.rooms[e.player.currentRoom];
                room.characters = room.characters.filter(id => id !== 'landlord');
                e.addScore(10);
                e.updateInventory();
            } else {
                e.print('The Landlord: "What am I supposed to do with THAT? I want MONEY!"');
            }
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('pbs_president', {
        name: 'The PBS President',
        description: 'A snooty executive sitting behind a plush desk.',
        hp: 50,
        attack: 8,
        hostile: false,
        dialogue: {
            greeting: "Long time no see, Fred my boy."
        },
        combatMessages: {
            playerHit: '"You think you can insult me, you scuz?"',
            enemyHit: '"That\'s two weeks\' docked wages!"',
            defeat: '"You have just been CANCELED!!!!" The PBS President collapses.',
            insult: '"YOU think YOU deserve a RAISE??"',
            ambush: 'The PBS President throws a paperweight at you!'
        },
        onTalk: (e) => {
            if (!e.getFlag('pbs_talked')) {
                e.print('The PBS President: "Long time no see, Fred my boy."');
                e.print('He slides a contract across the desk.');
                e.print('"Here. Just sign this contract."');
                e.setFlag('pbs_talked', true);
            } else {
                e.print('The PBS President: "Okay. Be here tomorrow morning."');
            }
        },
        onGive: (e, itemId) => {
            e.print('The PBS President: "I don\'t want your junk, Rogers."');
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('mugger', {
        name: 'A Mugger',
        description: 'A threatening figure lurking in the shadows.',
        hp: 40,
        attack: 15,
        hostile: true,
        combatMessages: {
            playerHit: '"OOOOOOOF!!"',
            enemyHit: '"HA!! Take that!"',
            defeat: '"You really SUCK, man!" The mugger collapses.',
            insult: '"No Canadian coins, jerk!!"',
            ambush: '"Your money or your life, dip!" The mugger attacks!'
        },
        onGive: (e, itemId) => {
            if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
                e.player.inventory = e.player.inventory.filter(id => id !== itemId);
                e.print('The Mugger: "Nobody is to hear about this, got it?"');
                e.print('The mugger takes your money and disappears into the shadows.');
                e.characters['mugger'].hostile = false;
                e.characters['mugger'].defeated = true;
                const room = e.rooms[e.player.currentRoom];
                room.characters = room.characters.filter(id => id !== 'mugger');
                e.updateInventory();
            } else {
                e.print('The Mugger: "Give me all your money, honey."');
            }
        },
        onDefeat: (e) => { e.addScore(10); },
        loot: 'switchblade'
    });

    engine.addCharacter('devil', {
        name: 'The Devil',
        description: 'The Prince of Evil himself, looking rather out of place in this neighborhood.',
        hp: 80,
        attack: 20,
        hostile: true,
        combatMessages: {
            playerHit: '"You dare insult the Prince of Evil??"',
            enemyHit: '"HA!!!!! Chalk up one for Lucifer!!"',
            defeat: '"Mine, and your, success is down the toilet!" The Devil vanishes in a puff of smoke.',
            insult: '"Your soul is too kind for my type!!"',
            ambush: '"You ain\'t been to church lately, Fred!!" The Devil attacks!'
        },
        onTalk: (e) => {
            e.print('The Devil: "Your soul or your life, puny human!!"');
        },
        onGive: (e, itemId) => {
            e.print('The Devil: "Ha!! We\'ll have a HOT time together!"');
            e.print('...probably best not to give things to the Devil.');
        },
        onDefeat: (e) => { e.addScore(15); }
    });

    engine.addCharacter('lady_elaine', {
        name: 'Lady Elaine Fairchild',
        description: 'A stuck-up, snobby puppet with a very bad attitude.',
        hp: 55,
        attack: 14,
        hostile: true,
        combatMessages: {
            playerHit: '"OW!! One big setback for us puppets!"',
            enemyHit: '"BOOMERANG, TOOMERANG, ZOOMERANG!"',
            defeat: '"My loss will sadden millions of KIDS!!" Lady Elaine crumples.',
            insult: '"YOUR WORKING CONDITIONS SUCK!"',
            ambush: '"I\'m a stuck-up, snobby puppet! DIE!!" Lady Elaine attacks!'
        },
        onTalk: (e) => {
            e.print('Lady Elaine: "That\'s no way to treat ME!!"');
            e.print('"My friends will see that you pay, Fred."');
        },
        onGive: (e, itemId) => {
            if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
                e.player.inventory = e.player.inventory.filter(id => id !== itemId);
                e.print('Lady Elaine: "Just give me a raise."');
                e.print('Lady Elaine takes the money and calms down.');
                e.characters['lady_elaine'].hostile = false;
                e.characters['lady_elaine'].defeated = true;
                const room = e.rooms[e.player.currentRoom];
                room.characters = room.characters.filter(id => id !== 'lady_elaine');
                e.addScore(10);
                e.updateInventory();
            } else {
                e.print('Lady Elaine: "What would I do with THAT?"');
            }
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('henrietta', {
        name: 'Henrietta Pussycat',
        description: 'A feisty cat puppet with claws bared.',
        hp: 45,
        attack: 12,
        hostile: true,
        combatMessages: {
            playerHit: '"Meow-meow OUCH!!"',
            enemyHit: '"Suck this!!!!"',
            defeat: '"Ohhhhhhhhh....okay." Henrietta slinks away.',
            insult: '"NO ONE gets away with THAT!!!!!"',
            ambush: '"You are gonna PAY!!" Henrietta swipes at you!'
        },
        onTalk: (e) => {
            e.print('Henrietta: "I never make offers...but..."');
        },
        onGive: (e, itemId) => {
            if (itemId === 'fish_food') {
                e.player.inventory = e.player.inventory.filter(id => id !== itemId);
                e.print('Henrietta purrs happily and calms down.');
                e.characters['henrietta'].hostile = false;
                e.characters['henrietta'].defeated = true;
                const room = e.rooms[e.player.currentRoom];
                room.characters = room.characters.filter(id => id !== 'henrietta');
                e.addScore(10);
                e.updateInventory();
            } else {
                e.print('Henrietta: "What would I do with that??"');
            }
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('tapeworm', {
        name: 'Scuzmodian Tapeworm',
        description: 'A hideous worm creature blocking the sewer passage.',
        hp: 50,
        attack: 16,
        hostile: true,
        combatMessages: {
            playerHit: '"Ugh! Tapeworms have feelings too!"',
            enemyHit: '"You have been nailed, Fred!"',
            defeat: '"I shouldn\'t have picked on a TV star!" The tapeworm retreats.',
            insult: '"I wouldn\'t come any closer, bub!!"',
            ambush: '"I wouldn\'t come any closer, bub!!" The tapeworm lashes out!'
        },
        onTalk: (e) => {
            e.print('The Tapeworm: "I suppose, but you\'re lucky I like you!"');
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('dr_platypus', {
        name: 'Dr. Platypus',
        description: 'A suspicious-looking platypus with a medical degree.',
        hp: 45,
        attack: 10,
        hostile: false,
        combatMessages: {
            playerHit: '"Ouch, you scrawny wimp!"',
            enemyHit: '"I\'ll show you I\'m not just a dumb duck!"',
            defeat: '"The PBS President will hear about this!" Dr. Platypus waddles away.',
            insult: '"I don\'t take PBS money. It\'s worthless."',
            ambush: '"Hello!!" Dr. Platypus attacks unexpectedly!'
        },
        onTalk: (e) => {
            e.print('Dr. Platypus: "Hello!!"');
        },
        onGive: (e, itemId) => {
            e.print('Dr. Platypus: "I don\'t take PBS money. It\'s worthless."');
        },
        onDefeat: (e) => { e.addScore(5); }
    });

    engine.addCharacter('chef_brockett', {
        name: 'Chef Brockett',
        description: 'An angry chef wielding kitchen implements.',
        hp: 55,
        attack: 18,
        hostile: true,
        combatMessages: {
            playerHit: '"Stop it, you unit of cholesterol!"',
            enemyHit: '"Ha! Take that!!!"',
            defeat: '"My career! Down the TOILET!!" Chef Brockett collapses into a flour pile.',
            insult: '"No way, scuz face!"',
            ambush: '"How DARE you disturb me!?" Chef Brockett attacks with a rolling pin!'
        },
        onTalk: (e) => {
            e.print('Chef Brockett: "How DARE you disturb me!?"');
        },
        onDefeat: (e) => {
            e.addScore(10);
            // Drop butcher knife
            const room = e.rooms[e.player.currentRoom];
            room.items.push('butcher_knife');
            e.print('Chef Brockett dropped his butcher knife!', 'item-msg');
        }
    });

    engine.addCharacter('daniel_tiger', {
        name: 'Daniel Tiger',
        description: 'A timid tiger puppet guarding his clock.',
        hp: 30,
        attack: 8,
        hostile: false,
        combatMessages: {
            playerHit: '"SORRY!!! I didn\'t MEAN to!!!!!"',
            enemyHit: '"Leave my clock alone."',
            defeat: '"OHHHH, WOE is ME!!!!!!!" Daniel Tiger curls up and cries.',
            insult: '"As long as you leave my clock alone."'
        },
        onTalk: (e) => {
            e.print('Daniel Tiger: "Leave my clock alone."');
            if (!e.getFlag('daniel_talked')) {
                e.print('He seems very protective of that clock...');
                e.setFlag('daniel_talked', true);
            }
        },
        onDefeat: (e) => { e.addScore(5); }
    });

    engine.addCharacter('mutated_ex', {
        name: 'Mutated Ex',
        description: 'A vulture-like creature that was once Ex the owl.',
        hp: 65,
        attack: 18,
        hostile: true,
        combatMessages: {
            playerHit: '"He\'s already dead, stupid!"',
            enemyHit: 'The Mutated Ex swoops down and claws you!',
            defeat: 'The Mutated Ex lets out a final screech and collapses.',
            ambush: 'You see a vulture-like creature jump out! The Mutated Ex attacks!'
        },
        onDefeat: (e) => { e.addScore(10); }
    });

    engine.addCharacter('streaker', {
        name: 'The Streaker',
        description: 'A nude gardener running through the garden.',
        hp: 25,
        attack: 5,
        hostile: false,
        combatMessages: {
            playerHit: '"Pow!! Right in the (censored)!!"',
            enemyHit: '"It could of been worse!"',
            defeat: '"Old streakers never die!" The streaker runs off.',
            insult: '"Just leave me alone."',
            ambush: '"OH YES THEY CALL HIM THE STREAK!!" The streaker bumps into you!'
        },
        onTalk: (e) => {
            e.print('The Streaker: "OH YES THEY CALL HIM THE STREAK!!"');
            e.print('"Just leave me alone."');
        },
        onDefeat: (e) => { e.addScore(5); }
    });

    engine.addCharacter('goldfish', {
        name: 'The Goldfish',
        description: 'Two ugly, well fed goldfish in a tank.',
        hp: 999,
        attack: 0,
        hostile: false,
        combatMessages: {
            playerHit: '"YOWOWOWOWOW!!!!"',
        },
        onTalk: (e) => {
            if (!e.getFlag('goldfish_talked')) {
                e.print('The Goldfish: "Betcha didn\'t think I could talk!"');
                e.print('"Let\'s make a deal."');
                e.setFlag('goldfish_talked', true);
            } else {
                e.print('The Goldfish: "Oh...alright."');
            }
        },
        onGive: (e, itemId) => {
            if (itemId === 'fish_food') {
                e.player.inventory = e.player.inventory.filter(id => id !== itemId);
                e.print('The Goldfish: "Oh...alright."');
                e.print('The goldfish is pleased and spits out a penny!');
                const room = e.rooms[e.player.currentRoom];
                room.items.push('penny');
                e.setFlag('goldfish_fed', true);
                e.addScore(5);
                e.updateInventory();
            } else {
                e.print('The Goldfish: "What would I do with that??"');
            }
        }
    });

    engine.addCharacter('rat', {
        name: 'Giant Rabid Rat',
        description: 'A big, ugly, probably rabid rat.',
        hp: 35,
        attack: 14,
        hostile: true,
        combatMessages: {
            playerHit: 'The rat squeals in pain!',
            enemyHit: 'The rat bites you with its diseased teeth!',
            defeat: 'The rat scurries away into the darkness.',
            ambush: 'The giant rat lunges at you!'
        },
        onDefeat: (e) => { e.addScore(5); }
    });


    // ============================================================
    // ROOMS
    // ============================================================

    engine.addRoom('introduction', {
        name: 'Introduction',
        description: 'This adventure was produced with World Builder. Copyright 1986 by William C. Appleton. Published by Silicon Beach Software, Inc.',
        exits: { south: 'freds_house' },
        onEnter: (e, visited) => {
            if (!visited) {
                e.print("&nbsp;");
                e.print("While most of the scenes in this game are as accurate as we could make them, the game is not identical to the TV show. Therefore, don't start saying things that your mother wouldn't feel appropriate.", 'system-msg');
                e.print("&nbsp;");
                e.print("This game is our attempt to satirize a show that really needs making fun of. Take time to read the text and HAVE FUN!!", 'system-msg');
                e.print("&nbsp;");
                e.print("If you like this game, please send $5.00 to Michael E. Hoffmann or Matthew R. Montgomery at: 1602 Rochester St., Caldwell, Idaho 83605", 'system-msg');
                e.print("&nbsp;");
                e.print("Type SOUTH or S to begin your adventure!", 'system-msg');
            }
        }
    });

    engine.addRoom('freds_house', {
        name: "Fred's House",
        description: "HI NEIGHBOR!!!!! You have entered the house so famous to millions of children, the home of Fred Rogers. There is a closet which contains nothing but old clothes. Exits are to the east and west.",
        exits: {
            east: 'fish_room',
            west: 'front_porch'
        },
        items: ['fish_food'],
        characters: [],
        onSearch: (e, target) => {
            if (!e.getFlag('closet_searched')) {
                e.print("You search through the closet of old clothes...");
                e.print("You found a pair of glasses hidden behind the sweaters!", 'item-msg');
                e.items['glasses'].hidden = false;
                e.rooms['freds_house'].items.push('glasses');
                e.setFlag('closet_searched', true);
            } else {
                e.print("Nothing else in the closet but old sweaters and sneakers.");
            }
        }
    });

    engine.addRoom('fish_room', {
        name: "Fish & Pic. Pic.",
        description: "You have entered a room with a very stupid looking picture with a weird thing inside it and a tank with two ugly, well fed goldfish in it. The only visible exits are to the east and west.",
        exits: {
            west: 'freds_house',
            east: 'backyard'
        },
        characters: ['goldfish']
    });

    engine.addRoom('front_porch', {
        name: "Front Porch",
        description: "You are in the threshold of your front door. It's a beautiful day outside. Exits are to the east, west, and north.",
        exits: {
            east: 'freds_house',
            west: 'bathroom',
            north: 'quiet_street'
        },
        characters: ['landlord']
    });

    engine.addRoom('backyard', {
        name: "Backyard",
        description: "You have entered your backyard. Your sandbox is lying there in the same place it's been since the dawn of time. Your exits are to the south, east, and west.",
        exits: {
            west: 'fish_room',
            south: 'neighbors_garden',
            east: 'kitchen'
        },
        items: ['spade'],
        onSearch: (e, target) => {
            if (!e.getFlag('sandbox_searched')) {
                e.print("You dig around in the sandbox and find some unmentionables!", 'item-msg');
                e.rooms['backyard'].items.push('unmentionables');
                e.setFlag('sandbox_searched', true);
            } else {
                e.print("Nothing else in the sandbox.");
            }
        }
    });

    engine.addRoom('bathroom', {
        name: "Bathroom",
        description: "You have entered a tidy but rather small bathroom. It is seldom used on the show because it is reserved for 'cast emergencies'. Exits are to the north and east.",
        exits: {
            east: 'front_porch',
            north: 'kitchen'
        },
        onSearch: (e) => {
            if (!e.getFlag('bathroom_searched')) {
                e.print("Behind the toilet, you find some cuss words scrawled on the wall. You memorize them for later use.", 'item-msg');
                e.player.inventory.push('cuss_words');
                e.setFlag('bathroom_searched', true);
                e.addScore(5);
                e.updateInventory();
            } else {
                e.print("Nothing else here worth noting.");
            }
        }
    });

    engine.addRoom('kitchen', {
        name: "Kitchen",
        description: "You are in a tidy but small kitchen. A model of a castle is on the shelf in front of you. Exits are to the east, west, and south.",
        exits: {
            west: 'backyard',
            south: 'bathroom',
            east: 'scuzzy_alley'
        },
        onSearch: (e) => {
            e.print("You examine the model castle. It looks like the Neighborhood of Make-Believe in miniature.");
            if (!e.getFlag('kitchen_searched')) {
                e.print("Behind the model, you find a dollar bill!", 'item-msg');
                e.rooms['kitchen'].items.push('dollar_bill');
                e.setFlag('kitchen_searched', true);
            }
        }
    });

    engine.addRoom('scuzzy_alley', {
        name: "Scuzzy Alley",
        description: "You are in a scuzzy alley, something you wouldn't dream was possible in this small of a town. Dirt and trash are all around you. The only exit is the way you came in, unless you have suction cups on your feet.",
        exits: {
            west: 'kitchen',
            east: 'pbs_lair'
        },
        characters: ['mugger'],
        items: ['bundle_of_money']
    });

    engine.addRoom('pbs_lair', {
        name: "Lair of the PBS President",
        description: "You are now in a plushly decorated office. There is a painting of a cross section of an egg and a mirror on the back wall. Evidently the owner has weird taste. The only exit is to the west.",
        exits: {
            west: 'scuzzy_alley'
        },
        characters: ['pbs_president'],
        onSearch: (e) => {
            if (!e.getFlag('pbs_searched')) {
                e.print("Behind the egg painting, you find a hidden safe... but it's empty.");
                e.print("However, you do notice a strange looking hunk of metal on the desk.", 'item-msg');
                e.rooms['pbs_lair'].items.push('metal_piece');
                e.setFlag('pbs_searched', true);
            } else {
                e.print("Nothing else of interest here.");
            }
        }
    });

    engine.addRoom('neighbors_garden', {
        name: "Neighbor's Garden",
        description: "You are in the neighbor's garden. Smooth move, because it's in the process of being planted!",
        exits: {
            north: 'backyard'
        },
        characters: ['streaker'],
        onSearch: (e) => {
            e.print("You look around the garden. Mostly just dirt and seedlings.");
        }
    });

    engine.addRoom('quiet_street', {
        name: "Quiet Street",
        description: "You are on a quiet, small town street. Exits are to the south and east.",
        exits: {
            south: 'front_porch',
            east: 'road_with_houses'
        }
    });

    engine.addRoom('road_with_houses', {
        name: "Road with Houses",
        description: "You are on a road with a few small houses to either side. Something about this place scares you. Maybe it's because this is the first time you've ever seen the real neighborhood and not just a model. Exits are to the north and south.",
        exits: {
            north: 'side_street',
            south: 'quiet_street'
        },
        blocked: {
            north: (e) => {
                if (!e.player.inventory.includes('dollar_bill') && !e.getFlag('toll_paid')) {
                    return "You need the dollar bill to pass, buddy.";
                }
                if (e.player.inventory.includes('dollar_bill') && !e.getFlag('toll_paid')) {
                    e.player.inventory = e.player.inventory.filter(id => id !== 'dollar_bill');
                    e.setFlag('toll_paid', true);
                    e.print("You pay the toll with your dollar bill.");
                    e.updateInventory();
                }
                return true;
            }
        }
    });

    engine.addRoom('side_street', {
        name: "Side Street",
        description: "You turn down the side street onto this well-paved but nearly deserted road. As you come to a dead end, you notice an ad on the fence behind the road. Exits are to the west and south.",
        exits: {
            south: 'road_with_houses',
            west: 'dimensional_warp'
        },
        items: ['warproom_sign'],
        onSearch: (e) => {
            e.print("The ad on the fence reads: 'Dimensional Warp Ahead — Enter at Your Own Risk!'");
            e.print("Interesting...", 'system-msg');
        }
    });

    engine.addRoom('dimensional_warp', {
        name: "Dimensional Warp",
        description: "You have finally entered the neighborhood of make believe. I suppose we'd better tell you what your quest is now.",
        exits: {
            east: 'make_believe_zone'
        },
        onEnter: (e, visited) => {
            if (!visited) {
                e.print("&nbsp;");
                e.print("The object of this game is to steal the trolley and return back to your normal dimension. That's about all I can tell you as of now, but good luck!", 'system-msg');
                e.print("&nbsp;");
                e.print("And REMEMBER; Mr. Rogers ALWAYS says I LIKE YOU JUST THE WAY YOU ARE!!", 'system-msg');
                e.addScore(10);
            }
            e.print("Sorry. The dimensional warp was only one-way.", 'system-msg');
        },
        blocked: {
            west: () => "Sorry. The dimensional warp was only one-way."
        }
    });

    engine.addRoom('make_believe_zone', {
        name: "The Make-Believe Zone",
        description: "You have entered another dimension. A dimension not of sight or sound, but of little puppets and kiddy playthings that come to life in the hands of a true maniac. Your guess is as good as mine for which way you go, because you are now in... THE MAKE-BELIEVE ZONE!!",
        exits: {
            north: 'cornflakes_factory',
            south: 'lady_elaines',
            east: 'henrietta_place',
            west: 'sewer'
        },
        characters: ['devil'],
        items: ['machine_gun']
    });

    engine.addRoom('sewer', {
        name: "Sewer",
        description: "You are now in a sewer. When you fell, you landed on something soft floating through the water. You wanted to see what it was, but it floated by too fast. The moss on the side of the sewer plus other things gives this place an awful smell.",
        exits: {
            east: 'make_believe_zone',
            south: 'dark_area'
        },
        items: ['body_slime'],
        characters: ['tapeworm']
    });

    engine.addRoom('dark_area', {
        name: "Dark Area",
        description: "It's so dark in here, you can't see a thing. However, you can barely make out a big, ugly, probably rabid rat coming right at you.",
        exits: {
            north: 'sewer'
        },
        characters: ['rat'],
        onSearch: (e) => {
            if (e.characters['rat'].alive) {
                e.print("You can't search in the dark with that rat coming at you!");
            } else {
                if (!e.getFlag('dark_searched')) {
                    e.print("Now that the rat is gone, you find a hand grenade stash!", 'item-msg');
                    e.rooms['dark_area'].items.push('hand_grenades');
                    e.setFlag('dark_searched', true);
                } else {
                    e.print("Nothing else here but darkness and bad smells.");
                }
            }
        }
    });

    engine.addRoom('cornflakes_factory', {
        name: "Cornflake's Factory",
        description: "You have come to the front of the factory of Cornflake S. Pecially. From the inside, you can hear whirring sounds and an occasional swear-word. You ask him to come out, but all you get is a recorded, 'Not now!! I'm BUSY!!' Exits are to the south and west.",
        exits: {
            south: 'make_believe_zone',
            west: 'platypus_mound'
        },
        onSearch: (e) => {
            e.print("The factory door is firmly locked. Cornflake really doesn't want visitors.");
        }
    });

    engine.addRoom('henrietta_place', {
        name: "Henrietta & Ex's Place",
        description: "You are standing in front of a tree with a small house on one limb and a door in the middle of the main trunk. There is a cord hanging down next to the house.",
        exits: {
            west: 'make_believe_zone',
            south: 'chef_brocketts'
        },
        characters: ['henrietta'],
        onSearch: (e) => {
            e.print("You pull the cord...");
            if (!e.getFlag('ex_found')) {
                e.print("The door in the trunk opens and the Mutated Ex jumps out!", 'combat-msg');
                e.rooms['henrietta_place'].characters.push('mutated_ex');
                e.setFlag('ex_found', true);
            } else {
                e.print("Nothing happens this time.");
            }
        }
    });

    engine.addRoom('lady_elaines', {
        name: "Lady Elaine's Merry-Go-Round",
        description: "You are now standing next to Lady Elaine Fairchild's merry-go-round. She is nowhere in sight, much to your relief. Exits are to the north and south.",
        exits: {
            north: 'make_believe_zone',
            south: 'aberlins_crypt'
        },
        characters: ['lady_elaine'],
        onSearch: (e) => {
            if (!e.getFlag('merrygoround_searched')) {
                e.print("You examine the merry-go-round closely and break off a piece.", 'item-msg');
                e.print('You spy a tag on it that says, "Made in Japan."');
                e.items['merry_go_round_piece'].hidden = false;
                e.rooms['lady_elaines'].items.push('merry_go_round_piece');
                e.setFlag('merrygoround_searched', true);
            } else {
                e.print("The cheap thing is already chipped enough.");
            }
        }
    });

    engine.addRoom('platypus_mound', {
        name: "Platypus Mound",
        description: "You are now at the platypuses' home. They appear to be absent, but I wouldn't bet my life on it.",
        exits: {
            east: 'cornflakes_factory',
            south: 'daniel_tigers_clock'
        },
        characters: ['dr_platypus'],
        onEnter: (e, visited) => {
            if (!visited) {
                e.print("Wait... Dr. Platypus IS here after all!");
            }
        }
    });

    engine.addRoom('aberlins_crypt', {
        name: "Lady Aberlin's Crypt",
        description: "You've walked into what you know to be the final resting place of one of your colleagues for many years, Lady Aberlin. The coffin door is open, and you begin to get suspicious that this is not normal procedure. You can go east from here.",
        exits: {
            north: 'lady_elaines',
            east: 'airport'
        },
        onSearch: (e) => {
            e.print("You peer into the open coffin... it's empty. Where did Lady Aberlin go?");
            e.print("This is deeply unsettling.");
        }
    });

    engine.addRoom('chef_brocketts', {
        name: "Chef Brockett's Bakery",
        description: "You are now in the bakery of Chef Brockett. I might stress that it wasn't wise to come here.",
        exits: {
            north: 'henrietta_place',
            west: 'daniel_tigers_clock'
        },
        characters: ['chef_brockett']
    });

    engine.addRoom('daniel_tigers_clock', {
        name: "Daniel Tiger's Clock",
        description: "You are standing next to Daniel Tiger's Clock. You cannot go any further south. The only visible exit is north.",
        exits: {
            north: 'platypus_mound',
            east: 'chef_brocketts'
        },
        characters: ['daniel_tiger'],
        onSearch: (e, target) => {
            if (e.characters['daniel_tiger'].alive && !e.characters['daniel_tiger'].defeated) {
                e.print('Daniel Tiger: "Leave my clock alone."');
                return;
            }
            if (!e.getFlag('clock_searched')) {
                e.print("With Daniel Tiger out of the way, you examine the clock closely.");
                e.print("You discover a hole behind the clock!");
                e.setFlag('clock_searched', true);
                e.setFlag('clock_hole_found', true);
            } else if (e.getFlag('clock_hole_found') && !e.getFlag('tunnel_open')) {
                e.print("The hole is too small to fit through. Maybe you could dig it bigger?");
            } else {
                e.print("The tunnel entrance is open.");
            }
        }
    });

    engine.addRoom('hidden_tunnel', {
        name: "Hidden Tunnel",
        description: "You have dug yourself into a hidden tunnel. You can faintly see light from the east. You could manage to pull yourself back up.",
        exits: {
            up: 'daniel_tigers_clock',
            east: 'trolley_station'
        }
    });

    engine.addRoom('airport', {
        name: "Airport",
        description: "As you stand out on the tarmac looking at the nice plane on the runway, a thought strikes you: You're a terrorist, hijack the thing!! You don't want to attract attention, though, so you decide it's better to get on the correct plane without anyone noticing. Your only problem is, you don't know which one!",
        exits: {},
        items: ['first_ticket', 'second_ticket', 'third_ticket'],
        onEnter: (e, visited) => {
            if (!visited) {
                e.print("&nbsp;");
                e.print("There are three tickets here. Choose wisely — only one leads to the right flight!", 'system-msg');
            }
        }
    });

    engine.addRoom('airplane', {
        name: "Airplane",
        description: "You are now in the airplane, heading off for whatever your destination might be. You'd better pray it's the right one!",
        exits: {
            east: 'chute_room'
        }
    });

    engine.addRoom('right_flight', {
        name: "Right Flight",
        description: "HALLELUJAH!! It WAS the right flight! But the flight crew quickly recognizes you as Fred Rogers, the crazed terrorist who has been destroying everyone and everything in the neighborhood of make-believe. You'd better get out of here fast!! But WHERE??",
        exits: {
            east: 'chute_room'
        }
    });

    engine.addRoom('chute_room', {
        name: "Chute Room",
        description: "Just in time! The fasten seat belts sign just went off! It's a good thing you got up, came in here, and locked the door when you did, because those flight attendants were ready to throw you out the door without a parachute, which might have been about the only way out.",
        exits: {
            south: 'trolley_station'
        }
    });

    engine.addRoom('trolley_station', {
        name: "Trolley Station",
        description: "At last, you have come to the sacred vault where the trolley is kept between filmings of your show. There are four levers, though, and you have absolutely no idea which one releases the mystic aura that envelopes the trolley. Good luck, you'll need it!",
        exits: {},
        onEnter: (e, visited) => {
            if (!visited) {
                e.print("&nbsp;");
                e.print("Type PULL LEVER 1, PULL LEVER 2, PULL LEVER 3, or PULL LEVER 4 to try a lever.", 'system-msg');
            }
        }
    });

    engine.addRoom('holding_tank', {
        name: "Holding Tank",
        description: "I'm afraid to say, but it looks like you've purchased the wrong ticket. You are now in the holding tank of evil spirits. There is no way out.",
        exits: {},
        onEnter: (e) => {
            e.endGame(false, "YOU LOSE!! You are trapped in the holding tank of evil spirits forever.");
        }
    });

    engine.addRoom('sesame_street', {
        name: "Sesame Street",
        description: "You have been magically transported to a land where sunny days chase the clouds away. Since you are now on the set of the wrong show, it looks to me like you've lost.",
        exits: {},
        onEnter: (e) => {
            e.endGame(false, "Better luck next time!! You're stuck on Sesame Street forever.");
        }
    });


    // ============================================================
    // SPECIAL ROOM OVERRIDES
    // ============================================================

    // Override dig for Daniel Tiger's Clock
    const origDig = engine.digThing.bind(engine);
    engine.digThing = function(target) {
        if (this.player.currentRoom === 'daniel_tigers_clock') {
            if (!this.getFlag('clock_hole_found')) {
                this.print("You don't see anything to dig here.");
                return;
            }
            if (!this.player.inventory.includes('spade')) {
                this.print("You need something to dig with.");
                return;
            }
            this.print("You use the spade to widen the hole behind the clock...");
            this.print("You've uncovered a hidden tunnel!", 'item-msg');
            this.setFlag('tunnel_open', true);
            this.rooms['daniel_tigers_clock'].exits.down = 'hidden_tunnel';
            this.addScore(10);
            return;
        }
        if (this.player.currentRoom === 'backyard') {
            if (this.player.inventory.includes('spade')) {
                this.print("You dig around in the sandbox but find nothing new.");
            } else {
                this.print("You need something to dig with.");
            }
            return;
        }
        origDig(target);
    };

    // Override pull for Trolley Station levers
    const origPull = engine.pullThing.bind(engine);
    engine.pullThing = function(target) {
        if (this.player.currentRoom === 'trolley_station') {
            const leverMatch = target.match(/lever\s*(\d)/i);
            if (leverMatch) {
                const leverNum = parseInt(leverMatch[1]);
                switch (leverNum) {
                    case 1:
                        this.print("You pull lever 1...");
                        this.print("The ground shakes and you're transported away!", 'combat-msg');
                        this.enterRoom('sesame_street');
                        return;
                    case 2:
                        this.print("You pull lever 2...");
                        this.print("CLICK! Nothing seems to happen... wait...", 'combat-msg');
                        this.print("The game restarts!!", 'lose-msg');
                        setTimeout(() => this.restart(), 2000);
                        return;
                    case 3:
                        this.print("You pull lever 3...");
                        this.print("The mystic aura dissipates! The trolley is FREE!!", 'combat-msg');
                        this.addScore(25);
                        this.endGame(true, "You've won!! You recovered the trolley and brought it back to the real world. Congratulations!!");
                        return;
                    case 4:
                        this.print("You pull lever 4...");
                        this.print("A trapdoor opens beneath you!", 'combat-msg');
                        this.enterRoom('holding_tank');
                        return;
                    default:
                        this.print("There are only 4 levers.");
                        return;
                }
            }
            this.print("Which lever? Type PULL LEVER 1, 2, 3, or 4.");
            return;
        }
        if (this.player.currentRoom === 'henrietta_place') {
            if (target.includes('cord') || target.includes('rope') || target.includes('string')) {
                this.searchRoom(target);
                return;
            }
        }
        origPull(target);
    };

    // Override open for specific rooms
    const origOpen = engine.openThing.bind(engine);
    engine.openThing = function(target) {
        if (this.player.currentRoom === 'freds_house' && target.includes('closet')) {
            this.searchRoom(target);
            return;
        }
        if (this.player.currentRoom === 'aberlins_crypt' && target.includes('coffin')) {
            this.print("The coffin is already open. It's empty and unsettling.");
            return;
        }
        origOpen(target);
    };

    // Override use for tickets at the airport
    const origUse = engine.useItem.bind(engine);
    engine.useItem = function(itemName) {
        if (this.player.currentRoom === 'airport') {
            const resolvedId = this.resolveItemId(itemName, this.player.inventory);
            if (resolvedId === 'first_ticket') {
                this.print("You board the plane with the first ticket...");
                this.enterRoom('holding_tank');
                return;
            }
            if (resolvedId === 'second_ticket') {
                this.print("You board the plane with the second ticket...");
                this.addScore(10);
                this.enterRoom('right_flight');
                return;
            }
            if (resolvedId === 'third_ticket') {
                this.print("You board the plane with the third ticket...");
                this.enterRoom('sesame_street');
                return;
            }
        }
        origUse(itemName);
    };

    // Override read for signs and items
    const origRead = engine.readItem.bind(engine);
    engine.readItem = function(target) {
        if (this.player.currentRoom === 'side_street') {
            this.print("The sign reads: 'DIMENSIONAL WARP AHEAD — Enter at Your Own Risk!'");
            this.print("'Warning: One-way travel only. No refunds.'");
            return;
        }
        if (target && target.includes('sign')) {
            this.print("Just read it. Please don't vandalize.");
            return;
        }
        origRead(target);
    };
}
