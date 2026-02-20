/**
 * scripts.js - Scripted Behaviors
 * Fred Rogers, Terrorist v2
 *
 * All game logic callbacks referenced by $script: in data files.
 * Each script receives (gameState, eventBus) or (gameState, eventBus, extra).
 * Scripts register themselves in window.FRT.Scripts.
 */
window.FRT = window.FRT || {};
window.FRT.Scripts = {};

(function(S) {

    // Helper: emit message
    function msg(eventBus, text) {
        eventBus.emit('message:add', { text: text });
    }

    // ================================================================
    // ITEM SCRIPTS
    // ================================================================

    S.dollarBillTake = function(gs, eb) {
        msg(eb, "You picked up the dollar bill. Every penny counts!");
    };

    S.bundleOfMoneyTake = function(gs, eb) {
        msg(eb, "Congratulations, you picked up $50!");
        gs.addScore(5);
    };

    S.machineGunTake = function(gs, eb) {
        msg(eb, "You have picked up a fully automatic weapon. Mr. Rogers would NOT approve.");
        gs.addScore(5);
    };

    S.grenadeTake = function(gs, eb) {
        msg(eb, "You picked up some hand grenades. There are only a few, so use wisely.");
    };

    S.switchbladeTake = function(gs, eb) {
        msg(eb, "You picked up a switchblade. Feeling dangerous.");
    };

    S.grenadeUse = function(gs, eb) {
        var room = gs.rooms[gs.player.currentRoom];
        var chars = gs.getRoomCharacters();
        if (chars.length > 0) {
            var charId = chars[0];
            var c = gs.characters[charId];
            if (c && c.alive) {
                if (Math.random() < 0.7) {
                    msg(eb, 'You throw a grenade at ' + c.name + '! KABOOM!');
                    gs.damageCharacter(charId, 40);
                } else {
                    msg(eb, "You throw a grenade... but it was a dud!");
                }
            }
        } else {
            msg(eb, "There's no one here to throw a grenade at.");
        }
    };

    S.cussWordsUse = function(gs, eb) {
        var chars = gs.getRoomCharacters();
        if (chars.length > 0) {
            var charId = chars[0];
            var c = gs.characters[charId];
            if (c && c.alive) {
                msg(eb, "You unleash a torrent of profanity at " + c.name + "!");
                if (c.combatMessages && c.combatMessages.insult) {
                    msg(eb, c.combatMessages.insult);
                }
                gs.damageCharacter(charId, 8);
            }
        } else {
            msg(eb, "You practice your colorful vocabulary. There's no one here to offend.");
        }
    };

    S.signRead = function(gs, eb) {
        msg(eb, 'The sign reads: "DIMENSIONAL WARP AHEAD \u2014 Enter at Your Own Risk!"');
        msg(eb, '"Warning: One-way travel only. No refunds."');
    };

    S.firstTicketUse = function(gs, eb) {
        msg(eb, "You board the plane with the first ticket...");
        gs.moveToRoom('holding_tank');
    };

    S.secondTicketUse = function(gs, eb) {
        msg(eb, "You board the plane with the second ticket...");
        gs.addScore(10);
        gs.moveToRoom('right_flight');
    };

    S.thirdTicketUse = function(gs, eb) {
        msg(eb, "You board the plane with the third ticket...");
        gs.moveToRoom('sesame_street');
    };


    // ================================================================
    // CHARACTER TALK SCRIPTS
    // ================================================================

    S.landlordTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.pbsTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.devilTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.ladyElaineTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.henriettaTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.tapewormTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.drPlatypusTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.chefBrockettTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.danielTigerTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.streakerTalk = function(gs, eb) {
        // Handled via dialogue tree
    };

    S.goldfishTalk = function(gs, eb) {
        // Handled via dialogue tree
    };


    // ================================================================
    // CHARACTER GIVE SCRIPTS
    // ================================================================

    S.landlordGive = function(gs, eb, itemId) {
        if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
            gs.removeFromInventory(itemId);
            msg(eb, 'The Landlord: "That\'s all I wanted. You\'re free to go."');
            gs.characters['landlord'].hostile = false;
            gs.characters['landlord'].defeated = true;
            var room = gs.rooms[gs.player.currentRoom];
            room.characters = room.characters.filter(function(id) { return id !== 'landlord'; });
            gs.addScore(10);
        } else {
            msg(eb, 'The Landlord: "What am I supposed to do with THAT? I want MONEY!"');
        }
    };

    S.landlordOfferMoney = function(gs, eb) {
        // Check if player has money to give
        if (gs.isItemInInventory('bundle_of_money')) {
            S.landlordGive(gs, eb, 'bundle_of_money');
        } else if (gs.isItemInInventory('dollar_bill')) {
            S.landlordGive(gs, eb, 'dollar_bill');
        } else {
            msg(eb, "You don't have any money to give him.");
        }
    };

    S.pbsGive = function(gs, eb, itemId) {
        msg(eb, 'The PBS President: "I don\'t want your junk, Rogers."');
    };

    S.muggerGive = function(gs, eb, itemId) {
        if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
            gs.removeFromInventory(itemId);
            msg(eb, 'The Mugger: "Nobody is to hear about this, got it?"');
            msg(eb, 'The mugger takes your money and disappears into the shadows.');
            gs.characters['mugger'].hostile = false;
            gs.characters['mugger'].defeated = true;
            var room = gs.rooms[gs.player.currentRoom];
            room.characters = room.characters.filter(function(id) { return id !== 'mugger'; });
        } else {
            msg(eb, 'The Mugger: "Give me all your money, honey."');
        }
    };

    S.devilGive = function(gs, eb, itemId) {
        msg(eb, 'The Devil: "Ha!! We\'ll have a HOT time together!"');
        msg(eb, '...probably best not to give things to the Devil.');
    };

    S.ladyElaineGive = function(gs, eb, itemId) {
        if (itemId === 'bundle_of_money' || itemId === 'dollar_bill') {
            gs.removeFromInventory(itemId);
            msg(eb, 'Lady Elaine: "Just give me a raise."');
            msg(eb, 'Lady Elaine takes the money and calms down.');
            gs.characters['lady_elaine'].hostile = false;
            gs.characters['lady_elaine'].defeated = true;
            var room = gs.rooms[gs.player.currentRoom];
            room.characters = room.characters.filter(function(id) { return id !== 'lady_elaine'; });
            gs.addScore(10);
        } else {
            msg(eb, 'Lady Elaine: "What would I do with THAT?"');
        }
    };

    S.henriettaGive = function(gs, eb, itemId) {
        if (itemId === 'fish_food') {
            gs.removeFromInventory(itemId);
            msg(eb, 'Henrietta purrs happily and calms down.');
            gs.characters['henrietta'].hostile = false;
            gs.characters['henrietta'].defeated = true;
            var room = gs.rooms[gs.player.currentRoom];
            room.characters = room.characters.filter(function(id) { return id !== 'henrietta'; });
            gs.addScore(10);
        } else {
            msg(eb, 'Henrietta: "What would I do with that??"');
        }
    };

    S.drPlatypusGive = function(gs, eb, itemId) {
        msg(eb, 'Dr. Platypus: "I don\'t take PBS money. It\'s worthless."');
    };

    S.goldfishGive = function(gs, eb, itemId) {
        if (itemId === 'fish_food') {
            gs.removeFromInventory(itemId);
            msg(eb, 'The Goldfish: "Oh...alright."');
            msg(eb, 'The goldfish is pleased and spits out a penny!');
            gs.addItemToRoom('penny');
            gs.setFlag('goldfish_fed', true);
            gs.addScore(5);
        } else {
            msg(eb, 'The Goldfish: "What would I do with that??"');
        }
    };


    // ================================================================
    // CHARACTER DEFEAT SCRIPTS
    // ================================================================

    S.landlordDefeat = function(gs, eb) {
        // Score handled by defeatScore in CharacterDefs
    };

    S.pbsDefeat = function(gs, eb) {};

    S.muggerDefeat = function(gs, eb) {
        // Loot handled by loot property in CharacterDefs
    };

    S.devilDefeat = function(gs, eb) {};

    S.ladyElaineDefeat = function(gs, eb) {};

    S.henriettaDefeat = function(gs, eb) {};

    S.tapewormDefeat = function(gs, eb) {};

    S.drPlatypusDefeat = function(gs, eb) {};

    S.chefBrockettDefeat = function(gs, eb) {
        // Loot (butcher knife) handled by loot property in CharacterDefs
        msg(eb, 'Chef Brockett dropped his butcher knife!');
    };

    S.danielTigerDefeat = function(gs, eb) {};

    S.mutatedExDefeat = function(gs, eb) {};

    S.streakerDefeat = function(gs, eb) {};

    S.ratDefeat = function(gs, eb) {};


    // ================================================================
    // ROOM ENTER SCRIPTS
    // ================================================================

    S.introEnter = function(gs, eb, data) {
        if (!gs.rooms['introduction'].visited) {
            msg(eb, ' ');
            msg(eb, "While most of the scenes in this game are as accurate as we could make them, the game is not identical to the TV show. Therefore, don't start saying things that your mother wouldn't feel appropriate.");
            msg(eb, ' ');
            msg(eb, "This game is our attempt to satirize a show that really needs making fun of. Take time to read the text and HAVE FUN!!");
            msg(eb, ' ');
            msg(eb, "If you like this game, please send $5.00 to Michael E. Hoffmann or Matthew R. Montgomery at: 1602 Rochester St., Caldwell, Idaho 83605");
            msg(eb, ' ');
            msg(eb, "Click the exit to the south to begin your adventure!");
        }
    };

    S.dimensionalWarpEnter = function(gs, eb, data) {
        if (!gs.rooms['dimensional_warp'].visited) {
            msg(eb, ' ');
            msg(eb, "The object of this game is to steal the trolley and return back to your normal dimension. That's about all I can tell you as of now, but good luck!");
            msg(eb, ' ');
            msg(eb, "And REMEMBER; Mr. Rogers ALWAYS says I LIKE YOU JUST THE WAY YOU ARE!!");
            gs.addScore(10);
        }
        msg(eb, "Sorry. The dimensional warp was only one-way.");
    };

    S.platypusMoundEnter = function(gs, eb, data) {
        if (!gs.rooms['platypus_mound'].visited) {
            msg(eb, "Wait... Dr. Platypus IS here after all!");
        }
    };

    S.airportEnter = function(gs, eb, data) {
        if (!gs.rooms['airport'].visited) {
            msg(eb, ' ');
            msg(eb, "There are three tickets here. Choose wisely \u2014 only one leads to the right flight!");
        }
    };

    S.trolleyStationEnter = function(gs, eb, data) {
        if (!gs.rooms['trolley_station'].visited) {
            msg(eb, ' ');
            msg(eb, "Click one of the four levers to try your luck!");
        }
    };

    S.holdingTankEnter = function(gs, eb) {
        gs.endGame(false, "YOU LOSE!! You are trapped in the holding tank of evil spirits forever.");
    };

    S.sesameStreetEnter = function(gs, eb) {
        gs.endGame(false, "Better luck next time!! You're stuck on Sesame Street forever.");
    };


    // ================================================================
    // ROOM SEARCH SCRIPTS
    // ================================================================

    S.fredsHouseSearch = function(gs, eb) {
        if (!gs.getFlag('closet_searched')) {
            msg(eb, "You search through the closet of old clothes...");
            msg(eb, "You found a pair of glasses hidden behind the sweaters!");
            gs.items['glasses'].hidden = false;
            gs.addItemToRoom('glasses', 'freds_house');
            gs.setFlag('closet_searched', true);
        } else {
            msg(eb, "Nothing else in the closet but old sweaters and sneakers.");
        }
    };

    S.backyardSearch = function(gs, eb) {
        if (!gs.getFlag('sandbox_searched')) {
            msg(eb, "You dig around in the sandbox and find some unmentionables!");
            gs.addItemToRoom('unmentionables', 'backyard');
            gs.setFlag('sandbox_searched', true);
        } else {
            msg(eb, "Nothing else in the sandbox.");
        }
    };

    S.bathroomSearch = function(gs, eb) {
        if (!gs.getFlag('bathroom_searched')) {
            msg(eb, "Behind the toilet, you find some cuss words scrawled on the wall. You memorize them for later use.");
            gs.addToInventory('cuss_words');
            gs.setFlag('bathroom_searched', true);
            gs.addScore(5);
        } else {
            msg(eb, "Nothing else here worth noting.");
        }
    };

    S.kitchenSearch = function(gs, eb) {
        msg(eb, "You examine the model castle. It looks like the Neighborhood of Make-Believe in miniature.");
        if (!gs.getFlag('kitchen_searched')) {
            msg(eb, "Behind the model, you find a dollar bill!");
            gs.addItemToRoom('dollar_bill', 'kitchen');
            gs.setFlag('kitchen_searched', true);
        }
    };

    S.pbsLairSearch = function(gs, eb) {
        if (!gs.getFlag('pbs_searched')) {
            msg(eb, "Behind the egg painting, you find a hidden safe... but it's empty.");
            msg(eb, "However, you do notice a strange looking hunk of metal on the desk.");
            gs.addItemToRoom('metal_piece', 'pbs_lair');
            gs.setFlag('pbs_searched', true);
        } else {
            msg(eb, "Nothing else of interest here.");
        }
    };

    S.henriettaPlaceSearch = function(gs, eb) {
        msg(eb, "You pull the cord...");
        if (!gs.getFlag('ex_found')) {
            msg(eb, "The door in the trunk opens and the Mutated Ex jumps out!");
            gs.spawnCharacter('mutated_ex', 'henrietta_place');
            gs.setFlag('ex_found', true);
        } else {
            msg(eb, "Nothing happens this time.");
        }
    };

    S.ladyElainesSearch = function(gs, eb) {
        if (!gs.getFlag('merrygoround_searched')) {
            msg(eb, "You examine the merry-go-round closely and break off a piece.");
            msg(eb, 'You spy a tag on it that says, "Made in Japan."');
            gs.items['merry_go_round_piece'].hidden = false;
            gs.addItemToRoom('merry_go_round_piece', 'lady_elaines');
            gs.setFlag('merrygoround_searched', true);
        } else {
            msg(eb, "The cheap thing is already chipped enough.");
        }
    };

    S.darkAreaSearch = function(gs, eb) {
        var rat = gs.characters['rat'];
        if (rat && rat.alive && !rat.defeated) {
            msg(eb, "You can't search in the dark with that rat coming at you!");
        } else {
            if (!gs.getFlag('dark_searched')) {
                msg(eb, "Now that the rat is gone, you find a hand grenade stash!");
                gs.addItemToRoom('hand_grenades', 'dark_area');
                gs.setFlag('dark_searched', true);
            } else {
                msg(eb, "Nothing else here but darkness and bad smells.");
            }
        }
    };

    S.danielClockSearch = function(gs, eb) {
        var dt = gs.characters['daniel_tiger'];
        if (dt && dt.alive && !dt.defeated) {
            msg(eb, 'Daniel Tiger: "Leave my clock alone."');
            return;
        }
        if (!gs.getFlag('clock_searched')) {
            msg(eb, "With Daniel Tiger out of the way, you examine the clock closely.");
            msg(eb, "You discover a hole behind the clock!");
            gs.setFlag('clock_searched', true);
            gs.setFlag('clock_hole_found', true);
        } else if (gs.getFlag('clock_hole_found') && !gs.getFlag('tunnel_open')) {
            msg(eb, "The hole is too small to fit through. Maybe you could dig it bigger?");
        } else {
            msg(eb, "The tunnel entrance is open.");
        }
    };


    // ================================================================
    // BLOCKED EXIT SCRIPTS
    // ================================================================

    S.tollGateCheck = function(gs, eb) {
        if (gs.getFlag('toll_paid')) {
            return true; // allow passage
        }
        if (gs.isItemInInventory('dollar_bill')) {
            gs.removeFromInventory('dollar_bill');
            gs.setFlag('toll_paid', true);
            msg(eb, "You pay the toll with your dollar bill.");
            return true; // allow passage
        }
        msg(eb, "You need the dollar bill to pass, buddy.");
        return false; // block
    };

    S.warpBlockWest = function(gs, eb) {
        msg(eb, "Sorry. The dimensional warp was only one-way.");
        return false;
    };


    // ================================================================
    // DIG SCRIPT (special verb for spade)
    // ================================================================

    S.digAtClock = function(gs, eb) {
        if (gs.player.currentRoom !== 'daniel_tigers_clock') {
            msg(eb, "There's nothing to dig here.");
            return;
        }
        if (!gs.getFlag('clock_hole_found')) {
            msg(eb, "You don't see anything to dig here.");
            return;
        }
        if (!gs.isItemInInventory('spade')) {
            msg(eb, "You need something to dig with.");
            return;
        }
        msg(eb, "You use the spade to widen the hole behind the clock...");
        msg(eb, "You've uncovered a hidden tunnel!");
        gs.setFlag('tunnel_open', true);
        gs.rooms['daniel_tigers_clock'].exits.down = 'hidden_tunnel';
        gs.addScore(10);
    };


    // ================================================================
    // LEVER SCRIPTS (Trolley Station)
    // ================================================================

    S.pullLever1 = function(gs, eb) {
        msg(eb, "You pull lever 1...");
        msg(eb, "The ground shakes and you're transported away!");
        gs.moveToRoom('sesame_street');
    };

    S.pullLever2 = function(gs, eb) {
        msg(eb, "You pull lever 2...");
        msg(eb, "CLICK! Nothing seems to happen... wait...");
        msg(eb, "The game restarts!!");
        // Restart after delay
        setTimeout(function() {
            eb.emit('game:restart', {});
        }, 2000);
    };

    S.pullLever3 = function(gs, eb) {
        msg(eb, "You pull lever 3...");
        msg(eb, "The mystic aura dissipates! The trolley is FREE!!");
        gs.addScore(25);
        gs.endGame(true, "You've won!! You recovered the trolley and brought it back to the real world. Congratulations!!");
    };

    S.pullLever4 = function(gs, eb) {
        msg(eb, "You pull lever 4...");
        msg(eb, "A trapdoor opens beneath you!");
        gs.moveToRoom('holding_tank');
    };


    // ================================================================
    // DIALOGUE ACTION SCRIPTS
    // ================================================================

    S.pbsSetTalked = function(gs, eb) {
        gs.setFlag('pbs_talked', true);
    };

    S.danielSetTalked = function(gs, eb) {
        if (!gs.getFlag('daniel_talked')) {
            msg(eb, 'He seems very protective of that clock...');
            gs.setFlag('daniel_talked', true);
        }
    };

    S.goldfishSetTalked = function(gs, eb) {
        gs.setFlag('goldfish_talked', true);
    };

})(window.FRT.Scripts);
