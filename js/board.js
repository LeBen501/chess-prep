import { Chessground } from 'https://cdn.jsdelivr.net/npm/chessground@9.1.0/dist/chessground.js';

let board = null;
let game = null;

/**
 * Initialize the Chessground board and chess.js logic
 */
export function initBoard(element, onMoveCallback) {
    game = new Chess();
    
    const config = {
        fen: game.fen(),
        orientation: 'white',
        movable: {
            color: 'white',
            free: false,
            dests: getLegalMoves(game),
            events: {
                after: (orig, dest) => {
                    const move = game.move({ from: orig, to: dest, promotion: 'q' });
                    if (move) {
                        onMoveCallback(move);
                        board.set({
                            turnColor: 'black',
                            movable: { dests: new Map() } // Disable moves during CPU turn
                        });
                    }
                }
            }
        },
        animation: {
            enabled: true,
            duration: 200
        },
        premovable: { enabled: false },
        highlight: {
            lastMove: true,
            check: true
        }
    };

    board = Chessground(element, config);
    return { board, game };
}

/**
 * Get legal moves for Chessground format
 */
function getLegalMoves(chess) {
    const dests = new Map();
    chess.SQUARES.forEach(s => {
        const ms = chess.moves({ square: s, verbose: true });
        if (ms.length) dests.set(s, ms.map(m => m.to));
    });
    return dests;
}

/**
 * Update the board UI with the current game state
 */
export function updateBoard(fen, lastMove = null) {
    board.set({
        fen: fen,
        lastMove: lastMove ? [lastMove.from, lastMove.to] : null,
        movable: {
            color: game.turn() === 'w' ? 'white' : 'black',
            dests: getLegalMoves(game)
        }
    });
}

/**
 * Perform a CPU move
 */
export function playCpuMove(san, onComplete) {
    const move = game.move(san);
    if (!move) return null;
    
    updateBoard(game.fen(), move);
    if (onComplete) onComplete(move);
    return move;
}

/**
 * Reset board to a specific FEN or start
 */
export function resetToFen(fen) {
    game.load(fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    updateBoard(game.fen());
}

/**
 * Highlight a square with a feedback class
 */
export function highlightSquare(square, type) {
    // Types: 'correct', 'playable', 'error'
    const className = `square-${type}`;
    const el = document.querySelector(`square[data-key="${square}"]`);
    if (el) {
        el.classList.add(className);
        setTimeout(() => el.classList.remove(className), 1500);
    }
}

/**
 * Show a hint arrow
 */
export function showHint(from, to) {
    board.setShapes([{ orig: from, dest: to, brush: 'green' }]);
    setTimeout(() => board.setShapes([]), 2000);
}

export function getGame() { return game; }
export function getBoard() { return board; }
