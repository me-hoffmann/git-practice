/**
 * dialogues.js - Dialogue Trees for NPCs
 * Fred Rogers, Terrorist v2
 *
 * Each dialogue is a tree of nodes. Each node has:
 *   text: what the NPC says
 *   options: array of { text, next, condition?, action? }
 *   action: optional script to run when node is displayed
 *
 * For simple characters, the dialogue is just a greeting + a few options.
 * Expanded from the original one-line responses for the point-and-click format.
 */
window.FRT = window.FRT || {};

window.FRT.DialogueDefs = {
    'landlord': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Landlord',
                text: '"HA!! You owe me 6 years rent!!"',
                options: [
                    { text: "I don't have any money.", next: 'no_money' },
                    { text: "How much do I owe?", next: 'how_much' },
                    { text: "Get lost!", next: 'get_lost' },
                    { text: "[Leave]", next: null }
                ]
            },
            'no_money': {
                speaker: 'The Landlord',
                text: '"That\'s NOT my problem, Freddy boy! You pay up or I\'ll take it out of your hide!"',
                options: [
                    { text: "Fine, here.", next: null, action: '$script:landlordOfferMoney' },
                    { text: "[Leave]", next: null }
                ]
            },
            'how_much': {
                speaker: 'The Landlord',
                text: '"ALL of it. Every last cent. You been dodging me for years!"',
                options: [
                    { text: "Okay, okay.", next: null },
                    { text: "[Leave]", next: null }
                ]
            },
            'get_lost': {
                speaker: 'The Landlord',
                text: '"Just pay up, Freddy boy. Or else."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'pbs_president': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The PBS President',
                text: '"Long time no see, Fred my boy."',
                options: [
                    { text: "What do you want?", next: 'contract' },
                    { text: "I want a raise.", next: 'raise' },
                    { text: "[Leave]", next: null }
                ]
            },
            'contract': {
                speaker: 'The PBS President',
                text: '"Here. Just sign this contract. Nothing to worry about, just standard stuff."',
                action: '$script:pbsSetTalked',
                options: [
                    { text: "Let me think about it.", next: 'think' },
                    { text: "No way!", next: 'refuse' },
                    { text: "[Leave]", next: null }
                ]
            },
            'raise': {
                speaker: 'The PBS President',
                text: '"YOU think YOU deserve a RAISE?? Ha! Be glad you have a job at all!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'think': {
                speaker: 'The PBS President',
                text: '"Okay. Be here tomorrow morning."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'refuse': {
                speaker: 'The PBS President',
                text: '"You\'ll regret this, Rogers."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'devil': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Devil',
                text: '"Your soul or your life, puny human!!"',
                options: [
                    { text: "You can't have either!", next: 'defiant' },
                    { text: "What are you doing here?", next: 'why_here' },
                    { text: "[Leave]", next: null }
                ]
            },
            'defiant': {
                speaker: 'The Devil',
                text: '"Your soul is too kind for my type!! But I\'ll take it anyway!!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'why_here': {
                speaker: 'The Devil',
                text: '"The Make-Believe Zone is MY kind of neighborhood. Full of lost souls and broken puppets!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'lady_elaine': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Lady Elaine Fairchild',
                text: '"That\'s no way to treat ME!!"',
                options: [
                    { text: "What do you want?", next: 'demands' },
                    { text: "Calm down!", next: 'calm' },
                    { text: "[Leave]", next: null }
                ]
            },
            'demands': {
                speaker: 'Lady Elaine Fairchild',
                text: '"Just give me a raise. My friends will see that you pay, Fred."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'calm': {
                speaker: 'Lady Elaine Fairchild',
                text: '"YOUR WORKING CONDITIONS SUCK! Don\'t tell ME to calm down!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'henrietta': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Henrietta Pussycat',
                text: '"I never make offers...but..."',
                options: [
                    { text: "What kind of offer?", next: 'offer' },
                    { text: "Nice kitty...", next: 'kitty' },
                    { text: "[Leave]", next: null }
                ]
            },
            'offer': {
                speaker: 'Henrietta Pussycat',
                text: '"Meow-meow... bring me something tasty and maybe we can talk."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'kitty': {
                speaker: 'Henrietta Pussycat',
                text: '"NO ONE gets away with THAT!!!!!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'tapeworm': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"I suppose, but you\'re lucky I like you!"',
                options: [
                    { text: "Let me pass!", next: 'pass' },
                    { text: "[Leave]", next: null }
                ]
            },
            'pass': {
                speaker: 'Scuzmodian Tapeworm',
                text: '"I wouldn\'t come any closer, bub!!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'dr_platypus': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Dr. Platypus',
                text: '"Hello!!"',
                options: [
                    { text: "What are you doing here?", next: 'doing' },
                    { text: "Can you help me?", next: 'help' },
                    { text: "[Leave]", next: null }
                ]
            },
            'doing': {
                speaker: 'Dr. Platypus',
                text: '"I live here! What are YOU doing here?"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'help': {
                speaker: 'Dr. Platypus',
                text: '"I don\'t take PBS money. It\'s worthless."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'chef_brockett': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Chef Brockett',
                text: '"How DARE you disturb me!?"',
                options: [
                    { text: "I'm just passing through.", next: 'passing' },
                    { text: "What's cooking?", next: 'cooking' },
                    { text: "[Leave]", next: null }
                ]
            },
            'passing': {
                speaker: 'Chef Brockett',
                text: '"No way, scuz face! Nobody passes through MY kitchen!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'cooking': {
                speaker: 'Chef Brockett',
                text: '"Stop it, you unit of cholesterol! Get OUT of my bakery!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'daniel_tiger': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'Daniel Tiger',
                text: '"Leave my clock alone."',
                action: '$script:danielSetTalked',
                options: [
                    { text: "What's special about the clock?", next: 'clock' },
                    { text: "Can I take a look?", next: 'look' },
                    { text: "[Leave]", next: null }
                ]
            },
            'clock': {
                speaker: 'Daniel Tiger',
                text: '"As long as you leave my clock alone. It\'s MINE."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'look': {
                speaker: 'Daniel Tiger',
                text: '"SORRY!!! I didn\'t MEAN to!!!!! But NO, you can\'t touch it!"',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'streaker': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Streaker',
                text: '"OH YES THEY CALL HIM THE STREAK!!"',
                options: [
                    { text: "Put some clothes on!", next: 'clothes' },
                    { text: "What are you doing in the garden?", next: 'garden' },
                    { text: "[Leave]", next: null }
                ]
            },
            'clothes': {
                speaker: 'The Streaker',
                text: '"Just leave me alone."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            },
            'garden': {
                speaker: 'The Streaker',
                text: '"Just leave me alone."',
                options: [
                    { text: "[Leave]", next: null }
                ]
            }
        }
    },

    'goldfish': {
        startNode: 'greeting',
        nodes: {
            'greeting': {
                speaker: 'The Goldfish',
                text: '"Betcha didn\'t think I could talk!"',
                action: '$script:goldfishSetTalked',
                options: [
                    { text: "A talking fish?!", next: 'deal' },
                    { text: "What do you want?", next: 'deal' },
                    { text: "[Leave]", next: null }
                ]
            },
            'deal': {
                speaker: 'The Goldfish',
                text: '"Let\'s make a deal. Bring me something tasty and I\'ll make it worth your while."',
                options: [
                    { text: "Okay, I'll find something.", next: null },
                    { text: "[Leave]", next: null }
                ]
            }
        }
    }
};
