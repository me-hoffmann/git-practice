/**
 * characters.js — Character Definitions
 * Fred Rogers, Terrorist v4
 *
 * All Real World characters (Phase 1 + Phase 2)
 */
window.FRT = window.FRT || {};

window.FRT.CharacterDefs = {

    goldfish: {
        name: 'The Goldfish',
        description: 'Two ugly, well-fed goldfish swimming lazily in their tank. They look judgmental.',
        portrait: '\uD83D\uDC20', // 🐠
        portraitHTML: '<div class="char-goldfish"><div class="gf-bowl"></div><div class="gf-water"></div><div class="gf-fish1"></div><div class="gf-fish2"></div><div class="gf-bubbles"><div class="gf-bubble"></div><div class="gf-bubble b2"></div><div class="gf-bubble b3"></div></div></div>',
        dialogueId: 'goldfish_talk',
        puzzle: {
            acceptedItems: ['fish_food'],
            onCorrectItem: function(state, eventBus, itemId) {
                // Remove fish food from inventory
                state.removeFromInventory(itemId);

                // Add penny to the room
                state.revealItem('penny');
                state.addItemToRoom('penny', 'fish_room');

                // Set flags
                state.setFlag('goldfish_fed', true);
                state.setFlag('sewer_hinted', true);

                // Award points
                state.addScore(5);

                // Narration
                eventBus.emit('narration:show', {
                    text: 'The goldfish gobble up the fish food greedily. One of them burps and spits out a penny.',
                    style: 'character'
                });

                setTimeout(function() {
                    eventBus.emit('narration:show', {
                        text: '"Not bad!" burps the larger fish. "Here\'s a penny for your trouble. And a tip: your bathroom has more exits than you think."',
                        style: 'character'
                    });
                }, 100);

                // Remove character (puzzle solved)
                state.removeCharacterFromRoom('goldfish', 'fish_room');

                // Refresh scene after delay
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: 'The goldfish stare at the ' + (state.items[itemId] ? state.items[itemId].name : 'item') + ' with utter disdain. "We\'re FISH. What would we do with THAT?"',
                    style: 'character'
                });
            }
        }
    },

    landlord: {
        name: 'The Landlord',
        description: 'A gruff, impatient landlord blocking the front door. He wants his rent money.',
        portrait: '\uD83D\uDE20', // 😠
        portraitHTML: '<div class="char-landlord"><div class="ll-body"></div><div class="ll-head"></div><div class="ll-eye-l"></div><div class="ll-eye-r"></div><div class="ll-brow-l"></div><div class="ll-brow-r"></div><div class="ll-mouth"></div></div>',
        dialogueId: 'landlord_talk',
        puzzle: {
            acceptedItems: ['bundle_of_money', 'dollar_bill'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(10);
                state.setFlag('landlord_paid', true);

                if (itemId === 'dollar_bill') {
                    eventBus.emit('narration:show', {
                        text: '"ONE dollar?! That barely covers the LATE FEE on the late fees!" The Landlord snatches it and storms off, muttering.',
                        style: 'character'
                    });
                } else {
                    eventBus.emit('narration:show', {
                        text: '"Fifty bucks. That\'ll do for now." The Landlord pockets the cash and shuffles away.',
                        style: 'character'
                    });
                }

                state.removeCharacterFromRoom('landlord', 'front_porch');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"What am I supposed to do with THAT? I want MONEY, Rogers!"',
                    style: 'character'
                });
            }
        }
    },

    // ====================================================
    // PHASE 2 CHARACTERS
    // ====================================================

    pbs_president: {
        name: 'PBS President',
        description: 'The self-important President of PBS. He\'s sitting behind an enormous desk, painting a tiny egg.',
        portrait: '\uD83D\uDC68\u200D\uD83D\uDCBC',
        portraitHTML: '<div class="char-pbs"><div class="pbs-body"></div><div class="pbs-head"></div><div class="pbs-hair"></div><div class="pbs-eye-l"></div><div class="pbs-eye-r"></div><div class="pbs-mouth"></div><div class="pbs-tie"></div></div>',
        dialogueId: 'pbs_president_talk',
        puzzle: null
    },

    mugger: {
        name: 'The Mugger',
        description: 'A sketchy character lurking in the alley. He\'s wearing a ski mask in broad daylight.',
        portrait: '\uD83E\uDD78',
        portraitHTML: '<div class="char-mugger"><div class="mg-body"></div><div class="mg-head"></div><div class="mg-mask"></div><div class="mg-eye-l"></div><div class="mg-eye-r"></div><div class="mg-knife"></div></div>',
        dialogueId: 'mugger_talk',
        puzzle: {
            acceptedItems: ['bundle_of_money', 'dollar_bill'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(5);
                state.setFlag('mugger_paid', true);

                // Give switchblade
                state.revealItem('switchblade');
                state.addToInventory('switchblade');

                if (itemId === 'dollar_bill') {
                    eventBus.emit('narration:show', {
                        text: '"ONE dollar?! This is the worst mugging of my career!" He snatches it anyway and tosses you a switchblade. "Here, you clearly need this more than I do."',
                        style: 'character'
                    });
                } else {
                    eventBus.emit('narration:show', {
                        text: '"Now THAT\'S more like it!" The Mugger grins and hands you a switchblade. "Professional courtesy. You seem like you\'re having a rough day."',
                        style: 'character'
                    });
                }

                state.removeCharacterFromRoom('mugger', 'scuzzy_alley');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"What is this, show and tell? I want MONEY, pal. Cash. Greenbacks. Moolah."',
                    style: 'character'
                });
            }
        }
    },

    streaker: {
        name: 'The Streaker',
        description: 'A mortified person hiding behind a hedge. They seem to have lost their clothes.',
        portrait: '\uD83D\uDE31',
        portraitHTML: '<div class="char-streaker"><div class="sk-bush"></div><div class="sk-head"></div><div class="sk-eyes"></div><div class="sk-mouth"></div><div class="sk-blush-l"></div><div class="sk-blush-r"></div></div>',
        dialogueId: 'streaker_talk',
        puzzle: {
            acceptedItems: ['unmentionables'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(5);
                state.setFlag('streaker_clothed', true);

                // Drop dollar bill
                state.revealItem('dollar_bill');
                state.addItemToRoom('dollar_bill', 'neighbors_garden');

                eventBus.emit('narration:show', {
                    text: '"OH THANK GOD!" The Streaker snatches the underwear and ducks behind the hedge. A crumpled dollar bill falls from... somewhere. You decide not to think about where.',
                    style: 'character'
                });

                state.removeCharacterFromRoom('streaker', 'neighbors_garden');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"I appreciate the thought, but I need CLOTHES! Or at least... underwear. ANYTHING!"',
                    style: 'character'
                });
            }
        }
    },

    tapeworm: {
        name: 'The Tapeworm',
        description: 'An enormous tapeworm blocking the sewer passage. It writhes menacingly.',
        portrait: '\uD83D\uDC1B',
        portraitHTML: '<div class="char-tapeworm"><div class="tw-body"></div><div class="tw-segment s1"></div><div class="tw-segment s2"></div><div class="tw-segment s3"></div><div class="tw-head"></div><div class="tw-eye-l"></div><div class="tw-eye-r"></div><div class="tw-mouth"></div></div>',
        dialogueId: 'tapeworm_talk',
        puzzle: {
            acceptedItems: ['spade'],
            onCorrectItem: function(state, eventBus, itemId) {
                // Spade NOT consumed — just brandished
                state.addScore(5);
                state.setFlag('tapeworm_scared', true);

                eventBus.emit('narration:show', {
                    text: 'You brandish the spade menacingly. The Tapeworm recoils in terror. "SHARP THING! SHARP THING! NOOOO!" It slithers away into a crack in the wall at impressive speed.',
                    style: 'character'
                });

                state.removeCharacterFromRoom('tapeworm', 'sewer');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: 'The Tapeworm sniffs the ' + (state.items[itemId] ? state.items[itemId].name : 'item') + ' and looks unimpressed. "Mmmm, not sharp enough to scare ME."',
                    style: 'character'
                });
            }
        }
    },

    giant_rat: {
        name: 'Giant Rat',
        description: 'A rat the size of a golden retriever blocks the passage. Its eyes glow red in the darkness.',
        portrait: '\uD83D\uDC00',
        portraitHTML: '<div class="char-rat"><div class="rt-body"></div><div class="rt-head"></div><div class="rt-ear-l"></div><div class="rt-ear-r"></div><div class="rt-eye-l"></div><div class="rt-eye-r"></div><div class="rt-nose"></div><div class="rt-tail"></div></div>',
        dialogueId: 'giant_rat_talk',
        puzzle: {
            acceptedItems: ['body_slime'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(5);
                state.setFlag('rat_distracted', true);

                eventBus.emit('narration:show', {
                    text: 'You fling the body slime down the passage. The Giant Rat\'s eyes light up. "SLIME! DELICIOUS SLIME!" It scurries after the slime, clearing your path. Rats have questionable taste.',
                    style: 'character'
                });

                state.removeCharacterFromRoom('giant_rat', 'dark_area');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: 'The Giant Rat sniffs the ' + (state.items[itemId] ? state.items[itemId].name : 'item') + ' and hisses. "NOT SLIMY ENOUGH. Rat wants SLIME."',
                    style: 'character'
                });
            }
        }
    },

    // ====================================================
    // PHASE 3 CHARACTERS (Make-Believe)
    // ====================================================

    the_devil: {
        name: 'The Devil',
        description: 'A dapper devil in a red suit. He\'s leaning against a signpost, filing his nails with a tiny pitchfork.',
        portrait: '\uD83D\uDE08',
        portraitHTML: '<div class="char-devil"><div class="dv-body"></div><div class="dv-head"></div><div class="dv-horn-l"></div><div class="dv-horn-r"></div><div class="dv-eye-l"></div><div class="dv-eye-r"></div><div class="dv-grin"></div><div class="dv-goatee"></div></div>',
        dialogueId: 'devil_talk',
        puzzle: {
            acceptedItems: ['cuss_words'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(10);
                state.setFlag('devil_pleased', true);

                state.revealItem('devils_coin');
                state.addToInventory('devils_coin');

                eventBus.emit('narration:show', {
                    text: 'The Devil snatches the paper and reads it, his eyes widening. "Oh my... OH MY! This is MAGNIFICENT! I haven\'t seen profanity this creative since the 14th century!" He bows and hands you a glowing coin.',
                    style: 'character'
                });

                state.removeCharacterFromRoom('the_devil', 'make_believe_hub');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"How PEDESTRIAN." The Devil examines the ' + (state.items[itemId] ? state.items[itemId].name : 'item') + ' and yawns. "I deal in the DARK ARTS. Bring me something truly PROFANE."',
                    style: 'character'
                });
            }
        }
    },

    lady_elaine: {
        name: 'Lady Elaine Fairchilde',
        description: 'Lady Elaine sits beside her broken merry-go-round, drinking from a flask. She looks annoyed. So, normal.',
        portrait: '\uD83E\uDDD9',
        portraitHTML: '<div class="char-elaine"><div class="le-body"></div><div class="le-head"></div><div class="le-hair"></div><div class="le-nose"></div><div class="le-eye-l"></div><div class="le-eye-r"></div><div class="le-mouth"></div><div class="le-blush-l"></div><div class="le-blush-r"></div></div>',
        dialogueId: 'lady_elaine_talk',
        puzzle: {
            acceptedItems: ['merry_go_round_piece'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(10);
                state.setFlag('elaine_helped', true);

                state.revealItem('lady_elaines_note');
                state.addToInventory('lady_elaines_note');

                eventBus.emit('narration:show', {
                    text: '"FINALLY! Someone with half a brain!" Lady Elaine snatches the piece and starts reassembling her ride. A note falls from her pocket. "Keep that. You didn\'t get it from me."',
                    style: 'character'
                });

                state.removeCharacterFromRoom('lady_elaine', 'lady_elaines_place');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"What am I supposed to do with THAT?" Lady Elaine takes a swig from her flask. "I need the PIECE that broke off my merry-go-round, you nitwit!"',
                    style: 'character'
                });
            }
        }
    },

    henrietta: {
        name: 'Henrietta Pussycat',
        description: 'Henrietta Pussycat sits in her little house, meowing plaintively. She seems hungry and distressed.',
        portrait: '\uD83D\uDC31',
        portraitHTML: '<div class="char-henrietta"><div class="hn-body"></div><div class="hn-head"></div><div class="hn-ear-l"></div><div class="hn-ear-r"></div><div class="hn-eye-l"></div><div class="hn-eye-r"></div><div class="hn-nose"></div><div class="hn-whisker-l"></div><div class="hn-whisker-r"></div></div>',
        dialogueId: 'henrietta_talk',
        puzzle: {
            acceptedItems: ['fish_food'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(5);
                state.setFlag('henrietta_fed', true);

                eventBus.emit('narration:show', {
                    text: '"Meow meow MEOW meow fish meow!" Henrietta pounces on the fish food and devours it. Once satiated, she purrs and points toward the back room. "Meow meow Ex meow meow cord meow."',
                    style: 'character'
                });

                state.removeCharacterFromRoom('henrietta', 'henriettas_place');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"Meow meow NO meow." Henrietta sniffs the ' + (state.items[itemId] ? state.items[itemId].name : 'item') + ' and turns up her nose. "Meow meow HUNGRY meow meow FISH meow."',
                    style: 'character'
                });
            }
        }
    },

    mutated_x: {
        name: 'Mutated X the Owl',
        description: 'What was once X the Owl is now a grotesque, oversized bird-thing. His eyes are milky and unfocused. He seems harmless but blind.',
        portrait: '\uD83E\uDD89',
        portraitHTML: '<div class="char-mutx"><div class="mx-body"></div><div class="mx-head"></div><div class="mx-eye-l"></div><div class="mx-eye-r"></div><div class="mx-beak"></div><div class="mx-wing-l"></div><div class="mx-wing-r"></div></div>',
        dialogueId: 'mutated_x_talk',
        puzzle: {
            acceptedItems: ['glasses'],
            requiredFlags: ['henrietta_fed'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(10);
                state.setFlag('x_can_see', true);

                state.revealItem('merry_go_round_piece');
                state.addItemToRoom('merry_go_round_piece', 'henriettas_place');

                eventBus.emit('narration:show', {
                    text: '"I CAN SEE! I CAN SEE AGAIN!" X the Owl flaps excitedly, knocking a metal piece off a shelf. "Oh! Was that important? Hoo hoo, sorry! I\'ve been BLIND for months!"',
                    style: 'character'
                });

                state.removeCharacterFromRoom('mutated_x', 'henriettas_place');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"Hoo? WHO\'S THERE? I can\'t SEE!" X flaps blindly. "I need something for my EYES! Everything is blurry!"',
                    style: 'character'
                });
            }
        }
    },

    dr_platypus: {
        name: 'Dr. Platypus',
        description: 'Dr. Platypus guards the entrance to Platypus Mound. He\'s wearing a tiny lab coat and a stethoscope made of string.',
        portrait: '\uD83E\uDDAB',
        portraitHTML: '<div class="char-platypus"><div class="dp-body"></div><div class="dp-head"></div><div class="dp-bill"></div><div class="dp-eye-l"></div><div class="dp-eye-r"></div><div class="dp-coat"></div><div class="dp-steth"></div></div>',
        dialogueId: 'dr_platypus_talk',
        puzzle: {
            acceptedItems: ['executive_pass'],
            onCorrectItem: function(state, eventBus, itemId) {
                // Pass NOT consumed - just shown
                state.addScore(10);
                state.setFlag('platypus_impressed', true);

                eventBus.emit('narration:show', {
                    text: '"An EXECUTIVE pass?! Well well well!" Dr. Platypus adjusts his tiny spectacles. "Anyone with THIS level of authority may pass through to Daniel Tiger\'s domain. Right this way, sir!"',
                    style: 'character'
                });

                state.removeCharacterFromRoom('dr_platypus', 'platypus_mound');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"I\'m sorry, but THAT is not sufficient credentials." Dr. Platypus pushes his spectacles up. "I need to see OFFICIAL documentation. Something... EXECUTIVE."',
                    style: 'character'
                });
            }
        }
    },

    chef_brockett: {
        name: 'Chef Brockett',
        description: 'Chef Brockett is frantically trying to bake something but keeps failing. His kitchen is a disaster of flour and despair.',
        portrait: '\uD83D\uDC68\u200D\uD83C\uDF73',
        portraitHTML: '<div class="char-chef"><div class="cb-body"></div><div class="cb-head"></div><div class="cb-hat"></div><div class="cb-eye-l"></div><div class="cb-eye-r"></div><div class="cb-mustache"></div></div>',
        dialogueId: 'chef_brockett_talk',
        puzzle: {
            acceptedItems: ['switchblade'],
            onCorrectItem: function(state, eventBus, itemId) {
                state.removeFromInventory(itemId);
                state.addScore(5);
                state.setFlag('chef_helped', true);

                eventBus.emit('narration:show', {
                    text: '"A KNIFE! A real knife! My old one melted in the oven incident!" Chef Brockett snatches the switchblade. "Take anything from the kitchen! The tunnel behind the pantry leads somewhere interesting!"',
                    style: 'character'
                });

                state.removeCharacterFromRoom('chef_brockett', 'chef_brocketts');
                setTimeout(function() {
                    eventBus.emit('scene:refresh');
                }, 500);
            },
            onWrongItem: function(state, eventBus, itemId) {
                eventBus.emit('narration:show', {
                    text: '"That\'s not going to help my BAKING!" Chef Brockett waves his flour-covered hands. "I need a proper CUTTING implement! My last knife got... destroyed."',
                    style: 'character'
                });
            }
        }
    },

    daniel_tiger: {
        name: 'Daniel Tiger',
        description: 'Daniel Tiger sits in front of his clock, looking small and worried. He clutches a tiny stuffed animal.',
        portrait: '\uD83D\uDC2F',
        portraitHTML: '<div class="char-daniel"><div class="dt-body"></div><div class="dt-head"></div><div class="dt-ear-l"></div><div class="dt-ear-r"></div><div class="dt-eye-l"></div><div class="dt-eye-r"></div><div class="dt-nose"></div><div class="dt-stripes"></div></div>',
        dialogueId: 'daniel_tiger_talk',
        puzzle: null
    }
};
