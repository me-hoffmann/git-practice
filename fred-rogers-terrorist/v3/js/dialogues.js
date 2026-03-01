/**
 * dialogues.js — Dialogue Trees
 * Fred Rogers, Terrorist v3
 *
 * Each character has a branching dialogue tree.
 * Nodes have speaker, text, and options.
 * During dialogue, players can also drag items to the drop zone.
 */
window.FRT3 = window.FRT3 || {};

window.FRT3.DialogueDefs = {
    'goldfish': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Goldfish',
                text: '"Hey! Yeah, YOU! Betcha didn\'t think I could talk, did ya?"',
                options: [
                    { text: 'A talking fish?! This is insane.', next: 'insane' },
                    { text: 'What do you want?', next: 'deal' },
                    { text: '...I need to lie down.', next: null }
                ]
            },
            'insane': {
                speaker: 'The Goldfish',
                text: '"Insane? You\'re the one talking to a FISH, pal. Look, I got a deal for you."',
                options: [
                    { text: 'I\'m listening.', next: 'deal' },
                    { text: 'No thanks. Goodbye, fish.', next: null }
                ]
            },
            'deal': {
                speaker: 'The Goldfish',
                text: '"Here\'s the thing — I\'m STARVING. Bring me something tasty and I\'ll make it worth your while. I might even share a little secret about what\'s hiding under this house..."',
                options: [
                    { text: 'Under the house? Tell me more!', next: 'hint' },
                    { text: 'I\'ll see what I can find.', next: null }
                ]
            },
            'hint': {
                speaker: 'The Goldfish',
                text: '"Feed me first, THEN we talk. A fish has to eat! But I\'ll say this much — your bathroom has more exits than you think. Now bring me some food!"',
                options: [
                    { text: 'Alright, I\'ll find something.', next: null }
                ]
            }
        }
    },

    'landlord': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Landlord',
                text: '"HA!! There you are, Freddy boy! You owe me SIX YEARS of back rent! Pay up or I\'ll take it out of your hide!"',
                options: [
                    { text: 'I don\'t have any money right now.', next: 'no_money' },
                    { text: 'How much do I owe exactly?', next: 'how_much' },
                    { text: 'Get lost, I\'m busy!', next: 'get_lost' },
                    { text: 'Let me see what I have...', next: null }
                ]
            },
            'no_money': {
                speaker: 'The Landlord',
                text: '"That\'s NOT my problem! I don\'t care if you\'re on TV — rent is rent! Find some cash or find a new house!"',
                options: [
                    { text: 'Fine, I\'ll be back.', next: null }
                ]
            },
            'how_much': {
                speaker: 'The Landlord',
                text: '"Let\'s see... six years at $8.33 a month... carry the one... I\'ll take $50 even and call it square. CASH. None of that PBS funny money."',
                options: [
                    { text: 'I\'ll find the money.', next: null },
                    { text: 'That\'s a real bargain for six years.', next: 'bargain' }
                ]
            },
            'bargain': {
                speaker: 'The Landlord',
                text: '"Don\'t push your luck, Freddy. The price goes UP the longer you make me wait!"',
                options: [
                    { text: 'I\'m going, I\'m going!', next: null }
                ]
            },
            'get_lost': {
                speaker: 'The Landlord',
                text: '"BUSY?! You\'re a kids\' show host! How BUSY can you be?! Pay me or I\'m calling my lawyer!"',
                options: [
                    { text: '...I\'ll find the money.', next: null }
                ]
            }
        }
    },

    'streaker': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Streaker',
                text: '"OH YES THEY CALL HIM THE STREAK! Fastest thing on two legs!" He does a lap around the garden. You shield your eyes.',
                options: [
                    { text: 'Please, for the love of all that is good, put some clothes on!', next: 'clothes' },
                    { text: 'Have you seen any interesting items around here?', next: 'items' },
                    { text: 'I\'m just going to... leave.', next: null }
                ]
            },
            'clothes': {
                speaker: 'The Streaker',
                text: '"Clothes? CLOTHES?! I\'d LOVE to wear clothes! But I seem to have... misplaced mine. It\'s very breezy out here. If you happen to find any garments, I\'d be eternally grateful."',
                options: [
                    { text: 'I\'ll keep an eye out.', next: null },
                    { text: 'How do you misplace ALL your clothes?', next: 'how' }
                ]
            },
            'how': {
                speaker: 'The Streaker',
                text: '"It\'s a long story involving a sandbox and some questionable life choices. Just... please help. I\'m starting to get sunburned in places that should never see the sun."',
                options: [
                    { text: 'I\'ll see what I can do.', next: null }
                ]
            },
            'items': {
                speaker: 'The Streaker',
                text: '"Items? I\'ve got nothing on me. LITERALLY nothing on me. But I did see someone digging around in the sandbox next door earlier. Left some stuff behind."',
                options: [
                    { text: 'Thanks for the tip.', next: null }
                ]
            }
        }
    },

    'mugger': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'A Mugger',
                text: '"Your money or your life, dip!" He blocks the alley with outstretched arms. He doesn\'t look like he\'s joking.',
                options: [
                    { text: 'I\'m Fred Rogers. From the show?', next: 'show' },
                    { text: 'Let me check my pockets...', next: null },
                    { text: 'How about we talk this through?', next: 'talk' }
                ]
            },
            'show': {
                speaker: 'A Mugger',
                text: '"Fred who? I don\'t watch PBS, man. Look, I don\'t care if you\'re the President. Give me some CASH and nobody gets hurt."',
                options: [
                    { text: 'Let me see what I have.', next: null }
                ]
            },
            'talk': {
                speaker: 'A Mugger',
                text: '"Talk? TALK?! Do I look like a therapist? Money. NOW. Or this gets ugly."',
                options: [
                    { text: 'Okay, okay! Let me check.', next: null }
                ]
            }
        }
    },

    'tapeworm': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"I wouldn\'t come any closer, bub!" The massive worm blocks the entire passage, its body coiling from wall to wall.',
                options: [
                    { text: 'I need to get through here.', next: 'through' },
                    { text: 'What ARE you?', next: 'what' },
                    { text: 'Maybe I\'ll come back later.', next: null }
                ]
            },
            'through': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"Tough luck! This is MY sewer, MY tunnel, and MY territory. Unless you\'ve got something that could convince me otherwise..."',
                options: [
                    { text: 'Like what?', next: 'hint' },
                    { text: 'I\'ll find a way.', next: null }
                ]
            },
            'what': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"I\'m a Scuzmodian Tapeworm, thank you very much! The finest parasite this side of the sewer system. And I\'m not moving."',
                options: [
                    { text: 'I need to get past you.', next: 'through' },
                    { text: 'Charming.', next: null }
                ]
            },
            'hint': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"Well, I\'m not exactly fond of sharp, pointy things. Makes me... nervous. But you didn\'t hear that from me!"',
                options: [
                    { text: 'Interesting. I\'ll remember that.', next: null }
                ]
            }
        }
    },

    'rat': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: '',
                text: 'The Giant Rat hisses and bares its teeth. It doesn\'t seem interested in conversation — more in making you its next meal. Maybe you could distract it with something?',
                options: [
                    { text: 'Nice rat... good rat...', next: 'nice' },
                    { text: 'Back off!', next: 'back' },
                    { text: 'Retreat carefully.', next: null }
                ]
            },
            'nice': {
                speaker: '',
                text: 'The rat does not appreciate your tone. It inches closer, teeth gnashing. You need to distract it with something smelly or edible — not sweet talk.',
                options: [
                    { text: 'I\'ll find something to bait it with.', next: null }
                ]
            },
            'back': {
                speaker: '',
                text: 'You shout, but the rat is unimpressed. If anything, it looks hungrier. You need something to lure it away from the path.',
                options: [
                    { text: 'Time for a different approach.', next: null }
                ]
            }
        }
    }
};
