/**
 * London System Opening Data Tree
 * Each node contains:
 * - correct: Array of optimal moves
 * - playable: Array of acceptable moves
 * - explanation: Text from the coach
 * - responses: Map of possible black moves with weights (0-1)
 * - after: Map of subsequent trees for each black response
 */

export const variations = [
    {
        id: "london_classical",
        name: "Classical (vs ...d5)",
        importance: 10,
        idea: "Solid development with Bf4, e3, c3. Control the d4-e5 squares.",
        intro: ["d4", "d5", "Bf4", "Nf6", "e3"],
        tree: {
            "d4": {
                responses: { "d5": 0.8, "Nf6": 0.2 },
                after: {
                    "d5": {
                        correct: ["Bf4"],
                        playable: ["Nf3"],
                        explanation: "Bf4 is the signature London move, developing the bishop actively before e3 closes the pawn chain.",
                        responses: { "Nf6": 0.7, "c5": 0.3 },
                        after: {
                            "Nf6": {
                                correct: ["e3"],
                                playable: ["Nf3"],
                                explanation: "Now we play e3 to solidify the d4 pawn and prepare the kingside development.",
                                responses: { "e6": 0.6, "c5": 0.4 },
                                after: {
                                    "e6": {
                                        correct: ["Nf3"],
                                        explanation: "Standard development. Nf3 controls e5 and prepares kingside castling.",
                                        responses: { "Bd6": 0.8, "c5": 0.2 },
                                        after: {
                                            "Bd6": {
                                                correct: ["Bg3"],
                                                playable: ["Bxd6"],
                                                explanation: "We prefer Bg3. If Black takes on g3, we open the h-file for our rook.",
                                                responses: { "O-O": 0.9, "c5": 0.1 },
                                                after: {
                                                    "O-O": {
                                                        correct: ["Bd3"],
                                                        explanation: "Developing the other bishop to its most active square, eyeing h7."
                                                    }
                                                }
                                            }
                                        }
                                    },
                                    "c5": {
                                        correct: ["c3"],
                                        explanation: "Solidify d4. If Black attacks b2 with ...Qb6, we are ready.",
                                        responses: { "Nc6": 0.9, "Qb6": 0.1 },
                                        after: {
                                            "Nc6": {
                                                correct: ["Nbd2"],
                                                explanation: "Continue developing. Nbd2 supports the center and the f3 knight."
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        id: "london_indian",
        name: "Indian Setup (vs ...g6)",
        importance: 7,
        idea: "Against King's Indian structures, stay solid and prepare for central expansion.",
        intro: ["d4", "Nf6", "Bf4", "g6", "e3"],
        tree: {
            "d4": {
                responses: { "Nf6": 0.9, "d5": 0.1 },
                after: {
                    "Nf6": {
                        correct: ["Bf4"],
                        explanation: "Even against Indian setups, Bf4 is very robust.",
                        responses: { "g6": 0.8, "e6": 0.2 },
                        after: {
                            "g6": {
                                correct: ["e3"],
                                explanation: "Creating the 'London Wall'.",
                                responses: { "Bg7": 1.0 },
                                after: {
                                    "Bg7": {
                                        correct: ["Nf3"],
                                        explanation: "Developing normally. Control the center.",
                                        responses: { "O-O": 0.7, "d6": 0.3 },
                                        after: {
                                            "O-O": {
                                                correct: ["Be2"],
                                                playable: ["Bd3"],
                                                explanation: "Against g6, Be2 is often more flexible to prevent ...Nh5 or ...Ng4 shenanigans.",
                                                responses: { "d6": 0.8, "c5": 0.2 },
                                                after: {
                                                    "d6": {
                                                        correct: ["h3"],
                                                        explanation: "A key prophalytic move! It gives the Bf4 a flight square on h2 if attacked by ...Nh5."
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
];

export function getVariationById(id) {
    return variations.find(v => v.id === id);
}

export function getRandomVariation() {
    // Weighted selection by importance
    const totalImportance = variations.reduce((sum, v) => sum + v.importance, 0);
    let random = Math.random() * totalImportance;
    
    for (const v of variations) {
        if (random < v.importance) return v;
        random -= v.importance;
    }
    return variations[0];
}
