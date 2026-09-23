/**
 * gameController.js
 * 
 * Demo/test controller for the Briscola frontend.
 * 
 * This file provides a working demo mode so you can see the UI
 * in action and test card rendering. When you're ready, you'll
 * replace the demo logic here with calls to your briscola.js backend.
 * 
 * ┌─────────────────────────────────────────────────────────┐
 * │  HOW TO CONNECT YOUR BACKEND:                           │
 * │                                                         │
 * │  1. Import your briscola.js (as a module or via script) │
 * │  2. In startNewGame(), use your shuffle/deal logic      │
 * │     instead of the demo shuffle below                   │
 * │  3. In handleCardClick(), add your turn/trick logic     │
 * │  4. Add your scoring using GameUI.renderScores()        │
 * └─────────────────────────────────────────────────────────┘
 */

const GameController = (() => {

    // ─── Demo state ─────────────────────────────────────────
    let state = {
        deck: [],
        playerHand: [],
        opponentHand: [],
        briscolaCard: null,
        playerScore: 0,
        opponentScore: 0,
        playerTricks: 0,
        opponentTricks: 0,
        tableCards: [],
        currentTurn: 'player',  // 'player' or 'opponent'
        roundStarter: 'player',
        gamePhase: 'idle',      // 'idle', 'playing', 'trick', 'gameOver'
    };

    /**
     * Shuffle an array (Fisher-Yates).
     */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /**
     * Start a new game (demo mode).
     */
    function startNewGame() {
        // Build deck: IDs 1–40
        state.deck = [];
        for (let i = 1; i <= 40; i++) {
            state.deck.push(i);
        }
        shuffle(state.deck);

        // Deal 3 cards to each player
        state.playerHand = [];
        state.opponentHand = [];
        for (let i = 0; i < 3; i++) {
            state.playerHand.push(state.deck.pop());
            state.opponentHand.push(state.deck.pop());
        }

        // Briscola card = last card in deck (visible underneath)
        state.briscolaCard = state.deck[0]; // bottom of deck

        // Reset scores
        state.playerScore = 0;
        state.opponentScore = 0;
        state.playerTricks = 0;
        state.opponentTricks = 0;
        state.tableCards = [];
        state.currentTurn = 'player';
        state.roundStarter = 'player';
        state.gamePhase = 'playing';

        // Render everything
        GameUI.clearTable();
        GameUI.renderDeck(state.deck.length, state.briscolaCard);
        GameUI.renderScores(0, 0, 0, 0);
        GameUI.renderOpponentHand(state.opponentHand.length);
        GameUI.renderPlayerHand(state.playerHand, true);
        GameUI.setTurn('player');

        const briscolaData = getCard(state.briscolaCard);
        GameUI.showMessage(`Briscola: ${briscolaData.name}`, 4000);
    }

    /**
     * Handle when the player clicks a card.
     */
    function handleCardClick(cardId, cardEl) {
        if (state.gamePhase !== 'playing') return;
        if (state.currentTurn !== 'player') return;

        // Remove card from hand
        state.playerHand = state.playerHand.filter(id => id !== cardId);
        state.tableCards.push({ cardId, player: 'player' });

        // Disable clicks during animation
        GameUI.disablePlayerCards();

        // Animate card to table
        GameUI.playCardToTable(cardId, 'player').then(() => {
            // Re-render player hand (without the played card)
            GameUI.renderPlayerHand(state.playerHand, false);

            if (state.roundStarter === 'player') {
                // Player started — now opponent responds
                state.currentTurn = 'opponent';
                GameUI.setTurn('opponent');
                setTimeout(() => opponentPlay(), 1000);
            } else {
                // Player responded — resolve the trick
                setTimeout(() => resolveTrick(), 800);
            }
        });
    }

    /**
     * Opponent plays a card (demo: random choice).
     * 
     * REPLACE THIS with your AI / briscola.js logic later.
     */
    function opponentPlay() {
        if (state.opponentHand.length === 0) return;

        // Demo: pick a random card
        const randomIndex = Math.floor(Math.random() * state.opponentHand.length);
        const cardId = state.opponentHand[randomIndex];
        state.opponentHand.splice(randomIndex, 1);
        state.tableCards.push({ cardId, player: 'opponent' });

        // Animate
        GameUI.renderOpponentHand(state.opponentHand.length);
        GameUI.playCardToTable(cardId, 'opponent').then(() => {
            if (state.roundStarter === 'opponent') {
                // Opponent started — now player responds
                state.currentTurn = 'player';
                GameUI.setTurn('player');
                GameUI.renderPlayerHand(state.playerHand, true);
            } else {
                // Opponent responded — resolve the trick
                setTimeout(() => resolveTrick(), 800);
            }
        });
    }

    /**
     * Resolve who wins the trick.
     * 
     * Demo: uses basic briscola rules.
     * REPLACE THIS with your briscola.js rules when ready.
     */
    function resolveTrick() {
        const card1 = state.tableCards[0];
        const card2 = state.tableCards[1];
        const data1 = getCard(card1.cardId);
        const data2 = getCard(card2.cardId);
        const briscolaSuit = getCard(state.briscolaCard).suit;

        let winner;

        // Determine winner
        if (data1.suit === data2.suit) {
            // Same suit → higher briscola value wins
            winner = data1.value >= data2.value ? card1.player : card2.player;
        } else if (data2.suit === briscolaSuit) {
            // Card 2 is briscola, card 1 is not → card 2 wins
            winner = card2.player;
        } else {
            // Different suits, no briscola → first card (lead) wins
            winner = card1.player;
        }

        // Calculate trick points
        const trickPoints = data1.value + data2.value;
        if (winner === 'player') {
            state.playerScore += trickPoints;
            state.playerTricks += 1;
        } else {
            state.opponentScore += trickPoints;
            state.opponentTricks += 1;
        }

        const winnerLabel = winner === 'player' ? 'Tu' : 'Avversario';
        GameUI.showMessage(`${winnerLabel} vince la mano! (+${trickPoints} punti)`, 2500);

        // Collect trick animation
        GameUI.collectTrick(winner).then(() => {
            state.tableCards = [];
            GameUI.renderScores(
                state.playerScore, state.opponentScore,
                state.playerTricks, state.opponentTricks
            );

            // Draw new cards if deck still has cards
            if (state.deck.length > 0) {
                // Winner draws first
                if (winner === 'player') {
                    if (state.deck.length > 0) state.playerHand.push(state.deck.pop());
                    if (state.deck.length > 0) state.opponentHand.push(state.deck.pop());
                } else {
                    if (state.deck.length > 0) state.opponentHand.push(state.deck.pop());
                    if (state.deck.length > 0) state.playerHand.push(state.deck.pop());
                }
            }

            // Update deck display
            GameUI.renderDeck(state.deck.length, state.briscolaCard);
            GameUI.renderOpponentHand(state.opponentHand.length);

            // Check if game is over
            if (state.playerHand.length === 0 && state.opponentHand.length === 0) {
                endGame();
                return;
            }

            // Winner leads next trick
            state.roundStarter = winner;
            state.currentTurn = winner;
            GameUI.setTurn(winner);

            if (winner === 'player') {
                GameUI.renderPlayerHand(state.playerHand, true);
            } else {
                GameUI.renderPlayerHand(state.playerHand, false);
                setTimeout(() => opponentPlay(), 1200);
            }
        });
    }

    /**
     * End the game and show results.
     */
    function endGame() {
        state.gamePhase = 'gameOver';
        let title, message;

        if (state.playerScore > state.opponentScore) {
            title = '🏆 Vittoria!';
            message = `Hai vinto ${state.playerScore} a ${state.opponentScore}!`;
        } else if (state.playerScore < state.opponentScore) {
            title = '😔 Sconfitta';
            message = `Hai perso ${state.opponentScore} a ${state.playerScore}.`;
        } else {
            title = '🤝 Pareggio!';
            message = `Pareggio a ${state.playerScore}!`;
        }

        setTimeout(() => {
            GameUI.showOverlay(title, message, 'Nuova Partita', startNewGame);
        }, 1000);
    }

    /**
     * Initialize the controller.
     */
    function init() {
        GameUI.init();
        GameUI.onCardClick(handleCardClick);

        // Show the start screen
        GameUI.showOverlay(
            '🃏 Briscola',
            'Oi vida kkkkk vamo aposta oq',
            'Partir pro abraço',
            startNewGame
        );
    }

    // ─── Public API ─────────────────────────────────────────
    return {
        init,
        startNewGame,
    };
})();

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    GameController.init();
});
