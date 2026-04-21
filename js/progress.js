/**
 * Progress tracking and Badge system
 */

const STORAGE_KEY = 'chess_prep_progress';

const INITIAL_PROGRESS = {
    scores: {}, // variationId -> points
    badges: {}, // variationId -> tier (none, bronze, silver, gold, diamond)
    weakLines: {}, // variationId -> [fen strings]
    masteryLevels: {} // variationId -> depth X
};

export function getProgress() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : JSON.parse(JSON.stringify(INITIAL_PROGRESS));
}

export function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function addPoints(variationId, points) {
    const p = getProgress();
    p.scores[variationId] = (p.scores[variationId] || 0) + points;
    
    // Check for badge upgrades
    updateBadge(p, variationId);
    saveProgress(p);
    return p;
}

function updateBadge(p, variationId) {
    const score = p.scores[variationId] || 0;
    let badge = 'none';
    
    if (score >= 500) badge = 'diamond';
    else if (score >= 250) badge = 'gold';
    else if (score >= 100) badge = 'silver';
    else if (score >= 25) badge = 'bronze';
    
    if (p.badges[variationId] !== badge) {
        p.badges[variationId] = badge;
        // Trigger celebration event or similar
        window.dispatchEvent(new CustomEvent('badge-unlock', { detail: { badge, variationId } }));
    }
}

export function trackError(variationId, fen) {
    const p = getProgress();
    if (!p.weakLines[variationId]) p.weakLines[variationId] = [];
    if (!p.weakLines[variationId].includes(fen)) {
        p.weakLines[variationId].push(fen);
    }
    saveProgress(p);
}

export function getBadgeLabel(tier) {
    switch (tier) {
        case 'bronze': return '⭐ Bronze';
        case 'silver': return '🥈 Silver';
        case 'gold': return '🥇 Gold';
        case 'diamond': return '💎 Diamond';
        default: return '🌑 Apprentice';
    }
}
