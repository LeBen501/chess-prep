/**
 * Core Training Engine Logic
 */
import * as Board from './board.js';
import * as Progress from './progress.js';
import { getVariationById } from './openings.js';

let currentVariation = null;
let currentPath = []; // Array of moves made in training
let currentNode = null; // Pointer into the variation tree
let sessionMoves = 0;
let maxDepth = 5;

export function startSession(variationId) {
    currentVariation = getVariationById(variationId);
    currentPath = [];
    currentNode = currentVariation.tree;
    sessionMoves = 0;
    
    // Reset board
    Board.resetToFen();
    
    return currentVariation;
}

/**
 * Handle user move
 */
export function handleUserMove(move) {
    const moveSan = move.san;
    const moveFen = Board.getGame().fen();
    
    // Validate against tree
    if (currentNode && currentNode[moveSan]) {
        // Correct Move
        const feedback = currentNode[moveSan];
        Board.highlightSquare(move.to, 'correct');
        Progress.addPoints(currentVariation.id, 10);
        
        sessionMoves++;
        
        // Move deep into the tree
        currentNode = feedback.after || null;
        
        return {
            status: 'correct',
            explanation: feedback.explanation || "Excellent move!",
            next: feedback.responses ? selectOpponentResponse(feedback.responses) : null
        };
    } else {
        // Check if playable (not in tree but might be acceptable)
        // For now, if not in tree, it's an error in "strict" training
        Board.highlightSquare(move.to, 'error');
        Progress.trackError(currentVariation.id, moveFen);
        
        return {
            status: 'error',
            explanation: `Not quite. In this line, the Chess Master recommends: ${Object.keys(currentNode || {}).join(', ')}`,
            retry: true
        };
    }
}

/**
 * Select a black response based on weights
 */
function selectOpponentResponse(responses) {
    const r = Math.random();
    let cumulative = 0;
    for (const [move, weight] of Object.entries(responses)) {
        cumulative += weight;
        if (r <= cumulative) return move;
    }
    return Object.keys(responses)[0];
}

/**
 * Execute the intro phase (auto-play moves)
 */
export async function runIntro(onMove) {
    Board.resetToFen();
    const moves = currentVariation.intro;
    
    for (const move of moves) {
        await new Promise(r => setTimeout(r, 1000));
        const m = Board.getGame().move(move);
        Board.updateBoard(Board.getGame().fen(), m);
        if (onMove) onMove(m);
    }
}

/**
 * reset to a safe branch point for repetition
 */
export function resetToBranch() {
    // Simple reset for now
    startSession(currentVariation.id);
}

export function getCurrentVariation() { return currentVariation; }
export function getSessionMoves() { return sessionMoves; }
