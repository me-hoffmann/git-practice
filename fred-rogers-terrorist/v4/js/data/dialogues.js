/**
 * dialogues.js — Dialogue Tree Definitions
 * Fred Rogers, Terrorist v4
 *
 * All Real World dialogue trees (Phase 1 + Phase 2).
 * Each tree has a startNode and a map of nodes.
 * Each node has: speaker, text, and optional options array.
 * Each option has: text (what player says) and next (node id or null to end).
 * Options can have onSelect callbacks for triggering game events.
 */
window.FRT = window.FRT || {};

window.FRT.DialogueDefs = {

    goldfish_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Goldfish',
                text: 'The larger goldfish swims to the glass and peers at you. "Betcha didn\'t think I could talk! Most people don\'t feed us, so we don\'t bother. Got anything tasty?"',
                options: [
                    {
                        text: "I might have something for you...",
                        next: 'deal'
                    },
                    {
                        text: "Talking fish? This neighborhood just keeps getting weirder.",
                        next: 'weird'
                    },
                    {
                        text: "Not right now.",
                        next: null
                    }
                ]
            },
            deal: {
                speaker: 'The Goldfish',
                text: '"Let\'s make a deal. You feed us, and we\'ll make it worth your while. We\'ve been collecting... things." The smaller fish winks.',
                options: [
                    {
                        text: "What kind of things?",
                        next: 'hint'
                    },
                    {
                        text: "Okay, let me see what I have.",
                        next: null
                    }
                ]
            },
            weird: {
                speaker: 'The Goldfish',
                text: '"You\'re one to talk, Fred. YOU\'RE the one who stole a trolley. We just swim and judge people." The fish blows a bubble pointedly.',
                options: [
                    {
                        text: "Fair point. Can you help me out?",
                        next: 'deal'
                    },
                    {
                        text: "I'll come back later.",
                        next: null
                    }
                ]
            },
            hint: {
                speaker: 'The Goldfish',
                text: '"Oh, a little of this, a little of that. Coins that fall in our tank. Secrets about the house plumbing. Feed us and find out."',
                options: [
                    {
                        text: "Alright, I'll find you some food.",
                        next: null
                    }
                ]
            }
        }
    },

    landlord_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Landlord',
                text: '"HA!! There you are, Rogers! You owe me SIX YEARS of back rent! You think you can just waltz out of here without paying?"',
                options: [
                    {
                        text: "How much do I owe?",
                        next: 'amount'
                    },
                    {
                        text: "I don't have any money right now.",
                        next: 'no_money'
                    },
                    {
                        text: "Can't we talk about this later?",
                        next: 'later'
                    }
                ]
            },
            amount: {
                speaker: 'The Landlord',
                text: '"Well... technically it\'s $47,000 with interest. But you know what, I\'ll take whatever you\'ve got. Just SOMETHING."',
                options: [
                    {
                        text: "Let me see what I can find.",
                        next: null
                    },
                    {
                        text: "$47,000?! For THIS place?",
                        next: 'insult'
                    }
                ]
            },
            no_money: {
                speaker: 'The Landlord',
                text: '"No money? NO MONEY?! Then you\'re not leaving until you pay up! I\'ll be right here." He crosses his arms and blocks the way to the street.',
                options: [
                    {
                        text: "Fine. I'll find some money.",
                        next: null
                    }
                ]
            },
            later: {
                speaker: 'The Landlord',
                text: '"LATER?! I\'ve been waiting SIX YEARS! There IS no later! Pay up or you\'re not getting past me, Rogers!"',
                options: [
                    {
                        text: "Okay, okay. I'll get your money.",
                        next: null
                    }
                ]
            },
            insult: {
                speaker: 'The Landlord',
                text: '"HEY! This is a perfectly good... well, it\'s a BUILDING. Just pay me something and we\'ll call it even. Deal?"',
                options: [
                    {
                        text: "Deal. Let me find some cash.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // PBS PRESIDENT
    // ====================================================
    pbs_president_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'PBS President',
                text: '"Rogers! How DARE you show your face here! You\'ve cost this network MILLIONS in trolley insurance!" He\'s delicately painting a tiny egg.',
                options: [
                    {
                        text: "Nice egg painting.",
                        next: 'egg_nice'
                    },
                    {
                        text: "That's the ugliest egg I've ever seen.",
                        next: 'egg_insult'
                    },
                    {
                        text: "I need an executive pass.",
                        next: 'pass_direct'
                    }
                ]
            },
            egg_nice: {
                speaker: 'PBS President',
                text: '"Why thank you! It\'s a Faberg\u00E9-style piece. I\'ve been working on it for MONTHS." He holds it up proudly. It looks terrible.',
                options: [
                    {
                        text: "It's... really something.",
                        next: 'egg_dodge'
                    },
                    {
                        text: "Actually, on closer inspection, it's awful.",
                        next: 'egg_insult'
                    }
                ]
            },
            egg_dodge: {
                speaker: 'PBS President',
                text: '"Isn\'t it though? I call it \'Sunrise Over Public Broadcasting.\' The critics will LOVE it." He goes back to painting, ignoring you.',
                options: [
                    {
                        text: "I'll come back later.",
                        next: null
                    }
                ]
            },
            egg_insult: {
                speaker: 'PBS President',
                text: '"WHAT?! HOW DARE\u2014" He stands up so fast he knocks the egg off the desk. It shatters. He stares at the pieces, then at you. "You... you MONSTER."',
                options: [
                    {
                        text: "Oops.",
                        next: 'egg_aftermath'
                    }
                ]
            },
            egg_aftermath: {
                speaker: 'PBS President',
                text: '"THAT EGG TOOK ME SIX MONTHS! GET OUT! TAKE THIS STUPID PASS AND GET OUT OF MY SIGHT!" He hurls an executive pass at your head.',
                options: [
                    {
                        text: "Thanks for the pass!",
                        next: null
                    }
                ],
                onEnter: function(state, eventBus) {
                    if (!state.getFlag('pbs_pass_given')) {
                        state.setFlag('pbs_pass_given', true);
                        state.revealItem('executive_pass');
                        state.addToInventory('executive_pass');
                        state.addScore(10);
                    }
                }
            },
            pass_direct: {
                speaker: 'PBS President',
                text: '"An executive pass?! You\'ve got NERVE, Rogers. The only way you\'re getting a pass is over my dead body. Or my dead egg." He glances protectively at his egg painting.',
                options: [
                    {
                        text: "That egg painting is terrible, by the way.",
                        next: 'egg_insult'
                    },
                    {
                        text: "I'll figure something out.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // MUGGER
    // ====================================================
    mugger_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Mugger',
                text: '"Alright, alright, this is a MUGGING! Hand over your valuables! ...please. I\'m having a really bad day."',
                options: [
                    {
                        text: "You said 'please' during a mugging?",
                        next: 'polite'
                    },
                    {
                        text: "I don't have much on me.",
                        next: 'broke'
                    },
                    {
                        text: "Do you know who I am?",
                        next: 'fame'
                    }
                ]
            },
            polite: {
                speaker: 'The Mugger',
                text: '"My mom raised me right, okay?! Now hand it over! ...if you don\'t mind. I mean\u2014GIVE ME YOUR MONEY!"',
                options: [
                    {
                        text: "Let me see what I have.",
                        next: null
                    },
                    {
                        text: "Your mom would be disappointed.",
                        next: 'guilt'
                    }
                ]
            },
            broke: {
                speaker: 'The Mugger',
                text: '"Join the club, pal. Look, just give me SOMETHING. A dollar, a fifty, whatever. I\'ll even trade you my switchblade for it."',
                options: [
                    {
                        text: "A switchblade for a dollar? Deal.",
                        next: null
                    }
                ]
            },
            fame: {
                speaker: 'The Mugger',
                text: '"Fred Rogers? THE Fred Rogers? ...I don\'t care if you\'re the Pope. Money. Now. Although... can I get an autograph after?"',
                options: [
                    {
                        text: "Sure, right after you put the knife away.",
                        next: null
                    }
                ]
            },
            guilt: {
                speaker: 'The Mugger',
                text: '"Don\'t you DARE bring my mother into this! She thinks I\'m an accountant!" He sniffles. "Just give me some money and we can both pretend this never happened."',
                options: [
                    {
                        text: "Fine. Let me find some cash.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // STREAKER
    // ====================================================
    streaker_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Streaker',
                text: '"DON\'T LOOK AT ME! I lost my clothes and I can\'t leave this hedge! Please, do you have ANYTHING I can wear?!"',
                options: [
                    {
                        text: "How did you lose your clothes?",
                        next: 'story'
                    },
                    {
                        text: "I might be able to help.",
                        next: 'help'
                    },
                    {
                        text: "I'm trying not to look. Trust me.",
                        next: 'awkward'
                    }
                ]
            },
            story: {
                speaker: 'The Streaker',
                text: '"I was... it was a BET, okay?! My friends dared me to run through the neighborhood and now they drove off with my clothes! Some friends!"',
                options: [
                    {
                        text: "That's rough. I'll keep an eye out for clothing.",
                        next: null
                    }
                ]
            },
            help: {
                speaker: 'The Streaker',
                text: '"Oh PLEASE! Even underwear would work! I just need SOMETHING so I can get home without being arrested. I\'ll pay you! I have a dollar somewhere... on my person."',
                options: [
                    {
                        text: "I'll see what I can find.",
                        next: null
                    }
                ]
            },
            awkward: {
                speaker: 'The Streaker',
                text: '"I KNOW, right?! This is the most embarrassing moment of my life, and I once accidentally called my teacher \'Mom\' in front of the whole class."',
                options: [
                    {
                        text: "I'll try to find you some clothes.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // TAPEWORM
    // ====================================================
    tapeworm_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Tapeworm',
                text: '"Sssssso... another surface dweller in MY sewer. You shall not passss! Unless you have something... interesting."',
                options: [
                    {
                        text: "What are you afraid of?",
                        next: 'fear'
                    },
                    {
                        text: "Get out of my way, worm.",
                        next: 'threaten'
                    },
                    {
                        text: "Nice sewer you have here.",
                        next: 'compliment'
                    }
                ]
            },
            fear: {
                speaker: 'The Tapeworm',
                text: '"Afraid?! ME?! I fear NOTHING! Well... except sharp things. And birds. And anyone with a shovel. But OTHER than that, nothing!"',
                options: [
                    {
                        text: "Good to know. I'll be back.",
                        next: null
                    }
                ]
            },
            threaten: {
                speaker: 'The Tapeworm',
                text: '"Big talk from a man in a cardigan! I\'ve eaten things bigger than you. Well, I\'ve been INSIDE things bigger than you. Point is, you\'re not getting past without the right... persuasion."',
                options: [
                    {
                        text: "What kind of persuasion?",
                        next: 'fear'
                    },
                    {
                        text: "We'll see about that.",
                        next: null
                    }
                ]
            },
            compliment: {
                speaker: 'The Tapeworm',
                text: '"Why thank you! I decorated it myself. The slime is organic, locally sourced. But flattery won\'t get you past me. Only something SHARP would make me move."',
                options: [
                    {
                        text: "Noted. I'll find something sharp.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // GIANT RAT
    // ====================================================
    giant_rat_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Giant Rat',
                text: '"SQUEAK." The rat is the size of a golden retriever. It blocks the passage completely. Its nose twitches, sniffing the air.',
                options: [
                    {
                        text: "Nice rat... good rat...",
                        next: 'calm'
                    },
                    {
                        text: "What do you want?",
                        next: 'want'
                    },
                    {
                        text: "SHOO! GO AWAY!",
                        next: 'shoo'
                    }
                ]
            },
            calm: {
                speaker: 'Giant Rat',
                text: '"SQUEAK SQUEAK." The rat tilts its head. It seems like it might be friendly, but it\'s not moving. Its nose keeps twitching, as if searching for a particular smell.',
                options: [
                    {
                        text: "Maybe I can find something it likes.",
                        next: null
                    }
                ]
            },
            want: {
                speaker: 'Giant Rat',
                text: '"SQUEEEAK." The rat licks its lips and sniffs eagerly. It seems to want something slimy. Rats are disgusting.',
                options: [
                    {
                        text: "Something slimy... got it.",
                        next: null
                    }
                ]
            },
            shoo: {
                speaker: 'Giant Rat',
                text: '"HISSSS!" The rat bares teeth the size of piano keys. Shooing was a mistake. It calms down but doesn\'t budge. Maybe offering it something would work better.',
                options: [
                    {
                        text: "Okay, okay! I'll bring you a treat.",
                        next: null
                    }
                ]
            }
        }
    },

    // ====================================================
    // PHASE 3: MAKE-BELIEVE DIALOGUES
    // ====================================================

    devil_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'The Devil',
                text: '"Well, well, WELL! Fred Rogers himself, in the Land of Make-Believe! I\'ve been WAITING for you." He grins, showing too many teeth. "I\'m a connoisseur of the PROFANE, you know. Got anything... naughty?"',
                options: [
                    {
                        text: "What kind of naughty?",
                        next: 'explain'
                    },
                    {
                        text: "I'm a children's TV host. I don't do naughty.",
                        next: 'irony'
                    },
                    {
                        text: "Get out of my way.",
                        next: 'refuse'
                    }
                ]
            },
            explain: {
                speaker: 'The Devil',
                text: '"Words, dear boy! WORDS! The filthier the better! I collect them like others collect stamps. Bring me something that would make a sailor blush and I\'ll make it worth your while."',
                options: [
                    {
                        text: "I'll see what I can find.",
                        next: null
                    }
                ]
            },
            irony: {
                speaker: 'The Devil',
                text: '"A children\'s TV host who STOLE A TROLLEY. Let\'s not pretend we\'re above anything, Fred. Bring me some truly CREATIVE profanity and I\'ll let you pass. Deal?"',
                options: [
                    {
                        text: "...Fair point. I'll find something.",
                        next: null
                    }
                ]
            },
            refuse: {
                speaker: 'The Devil',
                text: '"Oh, I\'m NOT moving, darling. Not until I get what I want. I\'m the DEVIL. Patience is literally my thing. I waited six thousand years for good coffee, I can wait for you."',
                options: [
                    {
                        text: "Fine. What do you want?",
                        next: 'explain'
                    }
                ]
            }
        }
    },

    lady_elaine_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Lady Elaine',
                text: '"DO I LOOK LIKE I\'M IN THE MOOD FOR VISITORS?!" Lady Elaine kicks the broken merry-go-round. "Some IDIOT broke my ride and now I\'m stuck here!"',
                options: [
                    {
                        text: "What happened to it?",
                        next: 'story'
                    },
                    {
                        text: "I might be able to fix it.",
                        next: 'fix'
                    },
                    {
                        text: "You seem... well-hydrated.",
                        next: 'flask'
                    }
                ]
            },
            story: {
                speaker: 'Lady Elaine',
                text: '"A piece SNAPPED OFF! The main arm! Without it, the whole thing is just a fancy hat rack!" She gestures wildly. "I think it ended up somewhere near Henrietta\'s place. That blind owl knocked it off a shelf."',
                options: [
                    {
                        text: "I'll look for it.",
                        next: null
                    }
                ]
            },
            fix: {
                speaker: 'Lady Elaine',
                text: '"Fix it? You\'d need the PIECE that broke off! It\'s an ornate metal arm. Last I heard, it was at Henrietta\'s. That place is a MESS since X went blind."',
                options: [
                    {
                        text: "I'll check Henrietta's place.",
                        next: null
                    }
                ]
            },
            flask: {
                speaker: 'Lady Elaine',
                text: '"It\'s APPLE JUICE! ...mostly." She takes a defensive swig. "Don\'t judge me, Rogers. Not everyone handles stress with cardigans and moral certainty."',
                options: [
                    {
                        text: "What's wrong with your ride?",
                        next: 'story'
                    },
                    {
                        text: "No judgment. I'll be back.",
                        next: null
                    }
                ]
            }
        }
    },

    henrietta_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Henrietta',
                text: '"Meow meow HELLO meow! Meow meow so HUNGRY meow!" Henrietta rubs against your leg pitifully. "Meow meow no FOOD meow meow days meow."',
                options: [
                    {
                        text: "What do you eat?",
                        next: 'food'
                    },
                    {
                        text: "Can you say anything besides meow?",
                        next: 'meow'
                    },
                    {
                        text: "I'll find you some food.",
                        next: null
                    }
                ]
            },
            food: {
                speaker: 'Henrietta',
                text: '"Meow meow FISH meow! Meow meow fish FOOD meow meow anything FISHY meow!" She licks her lips hopefully.',
                options: [
                    {
                        text: "Fish, got it. I'll look around.",
                        next: null
                    }
                ]
            },
            meow: {
                speaker: 'Henrietta',
                text: '"Meow meow YES meow meow obviously meow." She looks offended. "Meow meow just meow meow STYLE meow."',
                options: [
                    {
                        text: "Sorry. What do you need?",
                        next: 'food'
                    }
                ]
            }
        }
    },

    mutated_x_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Mutated X',
                text: '"HOO? Who\'s there?! I can\'t SEE!" X flaps around blindly, knocking things over. "Ever since the MUTATION, my eyes don\'t work! Everything is just... blobs!"',
                options: [
                    {
                        text: "What happened to you?",
                        next: 'mutation'
                    },
                    {
                        text: "Would glasses help?",
                        next: 'glasses'
                    },
                    {
                        text: "Try not to break anything else.",
                        next: null
                    }
                ]
            },
            mutation: {
                speaker: 'Mutated X',
                text: '"The Make-Believe water supply! Something got IN it! I grew to three times my size and my eyes went all milky! Hoo hoo, it\'s been TERRIBLE! I can\'t even read my own book collection!"',
                options: [
                    {
                        text: "Maybe I can find you some glasses.",
                        next: 'glasses'
                    },
                    {
                        text: "That's rough. I'll see what I can do.",
                        next: null
                    }
                ]
            },
            glasses: {
                speaker: 'Mutated X',
                text: '"GLASSES! Yes! Even cheap ones would help! My prescription is \'anything at all!\' Hoo hoo! Please, if you find ANY kind of eyewear, bring them to me!"',
                options: [
                    {
                        text: "I'll keep an eye out. No pun intended.",
                        next: null
                    }
                ]
            }
        }
    },

    dr_platypus_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Dr. Platypus',
                text: '"HALT! This area is restricted to AUTHORIZED PERSONNEL ONLY!" Dr. Platypus adjusts his tiny spectacles. "Do you have the proper credentials?"',
                options: [
                    {
                        text: "What credentials do I need?",
                        next: 'credentials'
                    },
                    {
                        text: "I'm Fred Rogers. Isn't that enough?",
                        next: 'fame'
                    },
                    {
                        text: "Can I just sneak past?",
                        next: 'sneak'
                    }
                ]
            },
            credentials: {
                speaker: 'Dr. Platypus',
                text: '"Executive-level authorization! A pass, a badge, something that says you\'re IMPORTANT! I don\'t make the rules, I just... actually, I DO make the rules. And the rules say: executive pass or no entry."',
                options: [
                    {
                        text: "I'll find one.",
                        next: null
                    }
                ]
            },
            fame: {
                speaker: 'Dr. Platypus',
                text: '"Fred Rogers, the TROLLEY THIEF? Oh, I know who you are. That makes you LESS qualified, not more. Bring me proper documentation or turn around."',
                options: [
                    {
                        text: "What kind of documentation?",
                        next: 'credentials'
                    },
                    {
                        text: "I'll be back with proof.",
                        next: null
                    }
                ]
            },
            sneak: {
                speaker: 'Dr. Platypus',
                text: '"SNEAK past a PLATYPUS? We have ELECTRORECEPTION. I can literally sense your bioelectric field. Nice try though."',
                options: [
                    {
                        text: "Fine. What do you need to see?",
                        next: 'credentials'
                    }
                ]
            }
        }
    },

    chef_brockett_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Chef Brockett',
                text: '"NO NO NO! The souffl\u00E9 collapsed AGAIN!" Chef Brockett is covered in flour. "I can\'t cut, I can\'t chop, I can\'t JULIENNE! My knife melted in the Great Oven Incident of last Tuesday!"',
                options: [
                    {
                        text: "What happened to your knife?",
                        next: 'knife_story'
                    },
                    {
                        text: "I might have something sharp.",
                        next: 'offer'
                    },
                    {
                        text: "Your kitchen is a disaster.",
                        next: 'insult'
                    }
                ]
            },
            knife_story: {
                speaker: 'Chef Brockett',
                text: '"I was trying to flamb\u00E9 while cutting bread. The oven exploded, the knife melted, and my eyebrows STILL haven\'t grown back!" He points to his singed face. "Any kind of sharp blade would save my career!"',
                options: [
                    {
                        text: "I'll look for something sharp.",
                        next: null
                    }
                ]
            },
            offer: {
                speaker: 'Chef Brockett',
                text: '"REALLY?! Oh, you\'d be my HERO! A knife, a blade, even a particularly sharp spoon! In return, the hidden tunnel behind my pantry leads somewhere VERY interesting. And you can take my rolling pin!"',
                options: [
                    {
                        text: "Let me see what I have.",
                        next: null
                    }
                ]
            },
            insult: {
                speaker: 'Chef Brockett',
                text: '"YOU try cooking without a KNIFE! Do you know how hard it is to dice onions with a SPOON? I\'ve been using my teeth, Fred. MY TEETH."',
                options: [
                    {
                        text: "Okay, I'll find you a blade.",
                        next: null
                    }
                ]
            }
        }
    },

    daniel_tiger_talk: {
        startNode: 'greeting',
        nodes: {
            greeting: {
                speaker: 'Daniel Tiger',
                text: '"Oh... hello." Daniel Tiger looks up at you with big, worried eyes. "Are you... are you here to take my clock too? Everyone always wants something from me."',
                options: [
                    {
                        text: "I'm scared too, sometimes.",
                        next: 'kind_1_right'
                    },
                    {
                        text: "Just tell me about the clock.",
                        next: 'kind_1_wrong'
                    },
                    {
                        text: "Give me the clock, tiger.",
                        next: 'kind_1_wrong'
                    }
                ]
            },
            kind_1_right: {
                speaker: 'Daniel Tiger',
                text: 'Daniel\'s eyes widen. "You... you get scared? Even grown-ups?" He relaxes a little. "My clock is special to me. Everyone keeps trying to take it apart."',
                options: [
                    {
                        text: "I understand why it's special to you.",
                        next: 'kind_2_right'
                    },
                    {
                        text: "I just need to look at it.",
                        next: 'kind_2_wrong'
                    }
                ]
            },
            kind_1_wrong: {
                speaker: 'Daniel Tiger',
                text: 'Daniel shrinks back. "That\'s... that\'s what everyone says." He clutches his stuffed animal tighter. Maybe try being nicer.',
                options: [
                    {
                        text: "I'm sorry. Let me try again.",
                        next: 'greeting'
                    },
                    {
                        text: "Whatever.",
                        next: null
                    }
                ]
            },
            kind_2_right: {
                speaker: 'Daniel Tiger',
                text: '"You really mean that?" Daniel looks at you searchingly. "Most people just want to USE it. But you actually... Do you really like me? Or do you just want something?"',
                options: [
                    {
                        text: "I like you just the way you are.",
                        next: 'kind_3_right'
                    },
                    {
                        text: "I like you AND I need your help.",
                        next: 'kind_3_almost'
                    }
                ]
            },
            kind_2_wrong: {
                speaker: 'Daniel Tiger',
                text: '"Just look at it? That\'s what the LAST person said. Then they tried to steal the hands!" Daniel backs away. Maybe try being more empathetic.',
                options: [
                    {
                        text: "You're right. I understand why it's special.",
                        next: 'kind_2_right'
                    },
                    {
                        text: "Fine, forget it.",
                        next: null
                    }
                ]
            },
            kind_3_right: {
                speaker: 'Daniel Tiger',
                text: 'Daniel Tiger smiles for the first time. A real, warm smile. "That\'s... that\'s what Mr. Rogers always said." He stands up. "The clock always points to THREE. That\'s the secret. Three is the magic number."',
                options: [
                    {
                        text: "Thank you, Daniel.",
                        next: null
                    }
                ],
                onEnter: function(state, eventBus) {
                    if (!state.getFlag('daniel_puzzle_solved')) {
                        state.setFlag('daniel_puzzle_solved', true);
                        state.revealItem('clock_note');
                        state.addToInventory('clock_note');
                        state.addScore(20);
                    }
                }
            },
            kind_3_almost: {
                speaker: 'Daniel Tiger',
                text: '"Hmm... that\'s honest at least." Daniel thinks. "But I need to know you REALLY care. Not just about the clock. About ME."',
                options: [
                    {
                        text: "I like you just the way you are.",
                        next: 'kind_3_right'
                    }
                ]
            }
        }
    }
};
