/**
 * characters.js — Character Definitions with Puzzle Solutions
 * Fred Rogers, Terrorist v3
 *
 * Each character is a puzzle encounter. No HP, no combat.
 * Give them the right item and they resolve peacefully (or not).
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.CharacterDefs = {
    'goldfish': {
        name: 'The Goldfish',
        description: 'Two ugly, well-fed goldfish in a tank. They seem to be watching you.',
        portrait: '\uD83D\uDC1F', // 🐟
        dialogueId: 'goldfish',
        puzzle: {
            acceptedItems: ['fish_food'],
            onCorrectItem: function(gs, eb, itemId) {
                gs.removeFromInventory(itemId);
                eb.emit('narration:clear');
                eb.emit('narration:show', {
                    text: 'You sprinkle the fish food into the tank. The goldfish gobble it up greedily.',
                    style: 'normal'
                });
                eb.emit('narration:show', {
                    text: '"Not bad!" the goldfish burps. A penny flies out of its mouth and lands at your feet.',
                    style: 'character'
                });
                eb.emit('narration:show', {
                    text: '"Word of advice, Fred — things aren\'t always what they seem around here. If you\'re looking for adventure, maybe check what\'s under your own bathroom. Just sayin\'."',
                    style: 'character'
                });
                gs.addToInventory('penny');
                gs.setFlag('goldfish_fed', true);
                gs.setFlag('sewer_hinted', true);
                gs.addScore(5);
                eb.emit('puzzle:solved', { characterId: 'goldfish', method: 'give' });
                // Goldfish stays but puzzle is solved
                gs.characters['goldfish'].defeated = true;
            },
            onWrongItem: function(gs, eb, itemId) {
                eb.emit('narration:show', {
                    text: '"What am I supposed to do with THAT? I\'m a fish! Bring me something I can eat!"',
                    style: 'character'
                });
            }
        }
    },

    'landlord': {
        name: 'The Landlord',
        description: 'A gruff, impatient landlord blocking the porch. He looks like he means business.',
        portrait: '\uD83D\uDE21', // 😡
        dialogueId: 'landlord',
        puzzle: {
            acceptedItems: ['bundle_of_money', 'dollar_bill'],
            onCorrectItem: function(gs, eb, itemId) {
                gs.removeFromInventory(itemId);
                eb.emit('narration:clear');
                if (itemId === 'dollar_bill') {
                    eb.emit('narration:show', {
                        text: 'The Landlord snatches the dollar bill and squints at it.',
                        style: 'normal'
                    });
                    eb.emit('narration:show', {
                        text: '"ONE lousy dollar?! That barely covers... you know what, fine. I\'m tired of waiting. Consider it settled." He stomps off the porch, still muttering.',
                        style: 'character'
                    });
                } else {
                    eb.emit('narration:show', {
                        text: 'The Landlord snatches the bundle of cash and counts it with practiced fingers.',
                        style: 'normal'
                    });
                    eb.emit('narration:show', {
                        text: '"That\'s all I wanted, Freddy boy. You\'re free to go. FOR NOW." He stomps off the porch, muttering about deadbeats.',
                        style: 'character'
                    });
                }
                gs.removeCharacterFromRoom('landlord', 'front_porch');
                gs.setFlag('landlord_paid', true);
                gs.addScore(10);
                eb.emit('puzzle:solved', { characterId: 'landlord', method: 'give' });
            },
            onWrongItem: function(gs, eb, itemId) {
                var item = gs.items[itemId];
                var name = item ? item.name : 'that';
                eb.emit('narration:show', {
                    text: '"' + name + '?! What am I supposed to do with ' + name + '?! I want MONEY! Six years of BACK RENT!"',
                    style: 'character'
                });
            }
        }
    },

    'streaker': {
        name: 'The Streaker',
        description: 'A nude figure darting through the garden. This is deeply uncomfortable.',
        portrait: '\uD83D\uDE31', // 😱
        dialogueId: 'streaker',
        puzzle: {
            acceptedItems: ['unmentionables'],
            onCorrectItem: function(gs, eb, itemId) {
                gs.removeFromInventory(itemId);
                eb.emit('narration:clear');
                eb.emit('narration:show', {
                    text: 'You toss the unmentionables at the Streaker. He catches them mid-stride.',
                    style: 'normal'
                });
                eb.emit('narration:show', {
                    text: '"Oh! OH! These are... mine?" His face turns beet red. "I\'ve been looking for these EVERYWHERE!" He quickly puts them on and shuffles away in shame.',
                    style: 'character'
                });
                gs.removeCharacterFromRoom('streaker', 'neighbors_garden');
                gs.setFlag('streaker_clothed', true);
                gs.addScore(5);
                eb.emit('puzzle:solved', { characterId: 'streaker', method: 'give' });
            },
            onWrongItem: function(gs, eb, itemId) {
                eb.emit('narration:show', {
                    text: '"OH YES THEY CALL HIM THE STREAK!" He does another lap around the garden, ignoring your offering entirely.',
                    style: 'character'
                });
            }
        }
    },

    'mugger': {
        name: 'A Mugger',
        description: 'A threatening figure lurking in the shadows of the alley. He does not look friendly.',
        portrait: '\uD83E\uDD78', // 🥸
        dialogueId: 'mugger',
        puzzle: {
            acceptedItems: ['bundle_of_money', 'dollar_bill'],
            onCorrectItem: function(gs, eb, itemId) {
                gs.removeFromInventory(itemId);
                eb.emit('narration:clear');
                if (itemId === 'dollar_bill') {
                    eb.emit('narration:show', {
                        text: '"A dollar?! ONE lousy dollar?!" The Mugger grabs it anyway. "Whatever. I\'m outta here." He throws something shiny on the ground as he bolts.',
                        style: 'character'
                    });
                } else {
                    eb.emit('narration:show', {
                        text: '"NOW we\'re talking!" The Mugger greedily grabs the cash. "You\'re alright, Fred. Here, take this — I don\'t need it anymore." He tosses something shiny on the ground and disappears into the shadows.',
                        style: 'character'
                    });
                }
                gs.addItemToRoom('switchblade', 'scuzzy_alley');
                gs.removeCharacterFromRoom('mugger', 'scuzzy_alley');
                gs.setFlag('mugger_paid', true);
                gs.addScore(10);
                eb.emit('puzzle:solved', { characterId: 'mugger', method: 'give' });
                // Refresh the scene to show switchblade
                eb.emit('scene:refresh');
            },
            onWrongItem: function(gs, eb, itemId) {
                eb.emit('narration:show', {
                    text: '"Your MONEY or your LIFE, dip! Not... whatever that is!"',
                    style: 'character'
                });
            }
        }
    },

    'tapeworm': {
        name: 'Scuzmodian Tapeworm',
        description: 'A hideous worm creature blocking the sewer passage. Its body coils across the entire tunnel.',
        portrait: '\uD83D\uDC1B', // 🐛
        dialogueId: 'tapeworm',
        puzzle: {
            acceptedItems: ['spade'],
            useOnEnvironment: true, // This is a "use on passage" puzzle, not give-to-character
            onCorrectItem: function(gs, eb, itemId) {
                // Don't consume the spade — player might need it later
                eb.emit('narration:clear');
                eb.emit('narration:show', {
                    text: 'You brandish the spade menacingly. The Tapeworm recoils!',
                    style: 'normal'
                });
                eb.emit('narration:show', {
                    text: '"Alright, ALRIGHT! I can take a hint! I shouldn\'t have picked on a TV star anyway!" The tapeworm slithers away into a crack in the wall.',
                    style: 'character'
                });
                gs.removeCharacterFromRoom('tapeworm', 'sewer');
                gs.setFlag('tapeworm_cleared', true);
                gs.addScore(10);
                eb.emit('puzzle:solved', { characterId: 'tapeworm', method: 'use' });
            },
            onWrongItem: function(gs, eb, itemId) {
                eb.emit('narration:show', {
                    text: '"I wouldn\'t come any closer, bub!" The tapeworm hisses, showing no interest in your offering.',
                    style: 'character'
                });
            }
        }
    },

    'rat': {
        name: 'Giant Rabid Rat',
        description: 'A big, ugly, probably rabid rat. Its red eyes glint in the darkness.',
        portrait: '\uD83D\uDC00', // 🐀
        dialogueId: 'rat',
        puzzle: {
            acceptedItems: ['body_slime'],
            onCorrectItem: function(gs, eb, itemId) {
                gs.removeFromInventory(itemId);
                eb.emit('narration:clear');
                eb.emit('narration:show', {
                    text: 'You fling the body slime into the far corner of the dark area. The rat\'s nose twitches excitedly.',
                    style: 'normal'
                });
                eb.emit('narration:show', {
                    text: 'The Giant Rat scurries after the slime, completely forgetting about you. The path ahead is clear!',
                    style: 'discovery'
                });
                gs.removeCharacterFromRoom('rat', 'dark_area');
                gs.setFlag('rat_cleared', true);
                gs.addScore(10);
                eb.emit('puzzle:solved', { characterId: 'rat', method: 'give' });
                eb.emit('narration:show', {
                    text: 'Beyond the darkness, you can feel a strange breeze... almost magical. The Neighborhood of Make-Believe awaits. Congratulations — you\'ve made it through!',
                    style: 'discovery'
                });
                eb.emit('narration:show', {
                    text: '~ To be continued... ~',
                    style: 'hint'
                });
                gs.addScore(25);
            },
            onWrongItem: function(gs, eb, itemId) {
                eb.emit('narration:show', {
                    text: 'The rat bares its diseased teeth and hisses. It has no interest in that. Maybe something smellier would distract it?',
                    style: 'normal'
                });
            }
        }
    }
};
