/**
 * Main App Controller
 */
import * as Board from './board.js';
import * as Engine from './engine.js';
import * as Progress from './progress.js';
import { variations } from './openings.js';

// DOM Elements
const coachText = document.getElementById('coach-text');
const variationName = document.getElementById('variation-name');
const badgeDisplay = document.getElementById('badge-display');
const scoreDisplay = document.getElementById('score-display');
const variationSelector = document.getElementById('variation-selector');
const progressBar = document.getElementById('progress-bar-fill');
const overlay = document.getElementById('overlay');
const modalTitle = document.getElementById('modal-title');
const modalText = document.getElementById('modal-text');
const modalClose = document.getElementById('modal-close');
const hintBtn = document.getElementById('hint-btn');
const backBtn = document.getElementById('back-btn');

let state = {
    activeVariation: null,
    isTraining: false
};

/**
 * Initialize Application
 */
function init() {
    // Initialize Board
    Board.initBoard(document.getElementById('chess-board'), handleMove);
    
    // Setup Variation Selector
    renderVariationSelector();
    
    // Setup Listeners
    modalClose.addEventListener('click', () => {
        overlay.classList.add('hidden');
        startTraining();
    });
    
    hintBtn.addEventListener('click', showHint);
    backBtn.addEventListener('click', () => Engine.resetToBranch());
    
    window.addEventListener('badge-unlock', (e) => {
        updateStats();
        celebrateBadge(e.detail.badge);
    });

    // Update Initial Stats
    updateStats();
    
    // Auto-select first variation
    selectVariation(variations[0].id);
}

/**
 * Render variation buttons
 */
function renderVariationSelector() {
    variationSelector.innerHTML = '';
    const progress = Progress.getProgress();
    
    variations.forEach(v => {
        const btn = document.createElement('button');
        btn.className = `var-btn ${state.activeVariation?.id === v.id ? 'active' : ''}`;
        btn.innerText = v.name;
        btn.onclick = () => selectVariation(v.id);
        variationSelector.appendChild(btn);
    });
}

/**
 * Select a variation and show intro modal
 */
function selectVariation(id) {
    const variation = Engine.startSession(id);
    state.activeVariation = variation;
    
    variationName.innerText = variation.name;
    updateStats();
    renderVariationSelector();
    
    // Show Modal
    modalTitle.innerText = variation.name;
    modalText.innerText = variation.idea;
    overlay.classList.remove('hidden');
    
    say("Ready to learn the " + variation.name + "? Let's go!");
}

/**
 * Start the training loop
 */
async function startTraining() {
    state.isTraining = true;
    say("Watch the introduction moves carefully...");
    
    await Engine.runIntro((move) => {
        // Optional: show some text during intro
    });
    
    say("Now it's your turn. Make the first move for White!");
}

/**
 * Handle move from Board
 */
async function handleMove(move) {
    const result = Engine.handleUserMove(move);
    
    if (result.status === 'correct') {
        say(result.explanation);
        updateStats();
        
        if (result.next) {
            await new Promise(r => setTimeout(r, 600)); // Wait for player to see move
            Board.playCpuMove(result.next, (cpuMove) => {
                // Coach might comment on black's move
                // say("Black plays " + cpuMove.san + ". How do we respond?");
            });
        } else {
            say("Success! You've reached the end of this line. Let's repeat!");
            setTimeout(() => Engine.resetToBranch(), 2000);
        }
    } else {
        say(result.explanation);
        // Reset move on board after a bit
        setTimeout(() => {
            Board.updateBoard(Board.getGame().fen());
        }, 1000);
    }
}

/**
 * UI Utilities
 */
function say(text) {
    coachText.innerText = text;
    // Simple reset and trigger animation
    coachText.parentElement.style.animation = 'none';
    coachText.parentElement.offsetHeight; // trigger reflow
    coachText.parentElement.style.animation = 'fadeIn 0.3s ease-out';
}

function updateStats() {
    const progress = Progress.getProgress();
    const vid = state.activeVariation?.id;
    
    if (vid) {
        const score = progress.scores[vid] || 0;
        const badge = progress.badges[vid] || 'none';
        
        scoreDisplay.innerText = `Score: ${score}`;
        badgeDisplay.innerText = Progress.getBadgeLabel(badge);
        
        // Progress bar (faking it based on score milestone)
        const nextMilestone = score < 25 ? 25 : (score < 100 ? 100 : (score < 250 ? 250 : 500));
        const prevMilestone = score < 25 ? 0 : (score < 100 ? 25 : (score < 250 ? 100 : 250));
        const percent = ((score - prevMilestone) / (nextMilestone - prevMilestone)) * 100;
        progressBar.style.width = `${percent}%`;
    }
}

function showHint() {
    // In a real app, we'd look at the tree
    // For now, let's just highlight the best move from currentNode
    // This requires exposing some tree logic from Engine
}

function celebrateBadge(badge) {
    say(`🎉 Conratulations! You've earned the ${badge.toUpperCase()} badge for this variation!`);
    badgeDisplay.classList.add('badge-celebration');
    setTimeout(() => badgeDisplay.classList.remove('badge-celebration'), 2000);
}

// Start App
init();
