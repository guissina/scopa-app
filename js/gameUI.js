/**
 * gameUI.js
 * 
 * Frontend state management and UI rendering hooks.
 * These functions update the DOM to reflect the game state.
 * They are completely independent of the backend — call them
 * from gameController.js (or eventually from your briscola.js logic).
 */

const GameUI = (() => {
    // DOM references (cached on init)
    let dom = {};

    /**
     * Initialize UI — cache DOM references.
     * Call this once on page load.
     */
    function init() {
        dom = {
            playerHand:    document.getElementById('player-hand'),
            opponentHand:  document.getElementById('opponent-hand'),
            tableCards:     document.getElementById('table-cards'),
            deckArea:       document.getElementById('deck-area'),
            deckCount:      document.getElementById('deck-count'),
            briscolaSlot:   document.getElementById('briscola-slot'),
            playerScore:    document.getElementById('player-score'),
            opponentScore:  document.getElementById('opponent-score'),
            playerTricks:   document.getElementById('player-tricks'),
            opponentTricks: document.getElementById('opponent-tricks'),
            messageBox:     document.getElementById('message-box'),
            messageText:    document.getElementById('message-text'),
            turnIndicator:  document.getElementById('turn-indicator'),
            gameOverlay:    document.getElementById('game-overlay'),
            overlayTitle:   document.getElementById('overlay-title'),
            overlayMsg:     document.getElementById('overlay-message'),
            overlayBtn:     document.getElementById('overlay-btn'),
        };
    }

    // ─── Player Hand ────────────────────────────────────────

    /** Card click callback storage */
    let _onCardClickCallback = null;

    /**
     * Render the player's hand (face-up, clickable cards).
     * @param {number[]} cardIds - Array of card IDs in hand
     * @param {boolean} clickable - Whether cards are clickable (player's turn)
     */
    function renderPlayerHand(cardIds, clickable = true) {
        dom.playerHand.innerHTML = '';
        cardIds.forEach((id, index) => {
            const cardEl = createCardElement(id, true);
            if (clickable) {
                cardEl.classList.add('clickable');
                cardEl.addEventListener('click', () => {
                    if (_onCardClickCallback) {
                        _onCardClickCallback(id, cardEl);
                    }
                });
            }
            // Stagger the deal animation
            cardEl.style.animationDelay = `${index * 0.15}s`;
            cardEl.classList.add('deal-in');
            dom.playerHand.appendChild(cardEl);
        });
    }

    /**
     * Register a callback for when the player clicks a card.
     * @param {function(number, HTMLElement)} callback - Called with (cardId, cardElement)
     */
    function onCardClick(callback) {
        _onCardClickCallback = callback;
    }

    // ─── Opponent Hand ──────────────────────────────────────

    /**
     * Render the opponent's hand (face-down cards).
     * @param {number} count - Number of cards to show
     */
    function renderOpponentHand(count) {
        dom.opponentHand.innerHTML = '';
        for (let i = 0; i < count; i++) {
            const cardEl = createCardBack();
            cardEl.style.animationDelay = `${i * 0.15}s`;
            cardEl.classList.add('deal-in');
            dom.opponentHand.appendChild(cardEl);
        }
    }

    // ─── Table (played cards) ───────────────────────────────

    /**
     * Play a card to the table with animation.
     * @param {number} cardId - The card ID being played
     * @param {string} player - 'player' or 'opponent'
     * @returns {Promise} Resolves when animation completes
     */
    function playCardToTable(cardId, player) {
        return new Promise(resolve => {
            const cardEl = createCardElement(cardId, true);
            cardEl.classList.add('played-card', `played-by-${player}`);
            cardEl.classList.add('card-play-animation');
            dom.tableCards.appendChild(cardEl);

            cardEl.addEventListener('animationend', () => {
                cardEl.classList.remove('card-play-animation');
                resolve();
            }, { once: true });
        });
    }

    /**
     * Clear the table cards (after a trick is collected).
     * @param {string} winner - 'player' or 'opponent'
     * @returns {Promise} Resolves when animation completes
     */
    function collectTrick(winner) {
        return new Promise(resolve => {
            const cards = dom.tableCards.querySelectorAll('.card');
            const direction = winner === 'player' ? 'collect-down' : 'collect-up';

            cards.forEach(card => {
                card.classList.add(direction);
            });

            setTimeout(() => {
                dom.tableCards.innerHTML = '';
                resolve();
            }, 500);
        });
    }

    /**
     * Clear the table instantly (no animation).
     */
    function clearTable() {
        dom.tableCards.innerHTML = '';
    }

    // ─── Deck & Briscola ────────────────────────────────────

    /**
     * Render the deck area (card pile + briscola card).
     * @param {number} cardsRemaining - Number of cards left in deck
     * @param {number} briscolaCardId - The briscola (trump) card ID
     */
    function renderDeck(cardsRemaining, briscolaCardId) {
        // Deck pile
        dom.deckArea.innerHTML = '';
        if (cardsRemaining > 0) {
            // Show stacked backs to give depth effect
            const stackCount = Math.min(cardsRemaining, 5);
            for (let i = 0; i < stackCount; i++) {
                const deckCard = createCardBack();
                deckCard.classList.add('deck-stack-card');
                deckCard.style.transform = `translateY(${-i * 2}px) translateX(${-i * 1}px)`;
                dom.deckArea.appendChild(deckCard);
            }
        }

        // Deck counter
        if (dom.deckCount) {
            dom.deckCount.textContent = cardsRemaining;
        }

        // Briscola indicator
        dom.briscolaSlot.innerHTML = '';
        if (briscolaCardId && cardsRemaining > 0) {
            const briscolaEl = createBriscolaIndicator(briscolaCardId);
            dom.briscolaSlot.appendChild(briscolaEl);
        }
    }

    // ─── Scores ─────────────────────────────────────────────

    /**
     * Update the scoreboard.
     * @param {number} p1Score - Player 1 (you) score
     * @param {number} p2Score - Player 2 (opponent) score
     * @param {number} p1Tricks - Player 1 tricks won
     * @param {number} p2Tricks - Player 2 tricks won
     */
    function renderScores(p1Score, p2Score, p1Tricks = 0, p2Tricks = 0) {
        if (dom.playerScore)    dom.playerScore.textContent = p1Score;
        if (dom.opponentScore)  dom.opponentScore.textContent = p2Score;
        if (dom.playerTricks)   dom.playerTricks.textContent = p1Tricks;
        if (dom.opponentTricks) dom.opponentTricks.textContent = p2Tricks;
    }

    // ─── Messages & Turn ────────────────────────────────────

    /**
     * Show a game message (fades in/out).
     * @param {string} text - Message to display
     * @param {number} duration - How long to show (ms). 0 = permanent.
     */
    function showMessage(text, duration = 3000) {
        dom.messageText.textContent = text;
        dom.messageBox.classList.add('visible');

        if (duration > 0) {
            setTimeout(() => {
                dom.messageBox.classList.remove('visible');
            }, duration);
        }
    }

    /**
     * Hide the message box.
     */
    function hideMessage() {
        dom.messageBox.classList.remove('visible');
    }

    /**
     * Update the turn indicator.
     * @param {string} who - 'player' or 'opponent'
     */
    function setTurn(who) {
        if (dom.turnIndicator) {
            if (who === 'player') {
                dom.turnIndicator.textContent = 'Seu turno';
                dom.turnIndicator.className = 'turn-indicator your-turn';
            } else {
                dom.turnIndicator.textContent = 'Turno oponente';
                dom.turnIndicator.className = 'turn-indicator opponent-turn';
            }
        }
    }

    // ─── Overlay (game over, new game, etc.) ────────────────

    /**
     * Show a full-screen overlay (for game over, etc.)
     * @param {string} title - Overlay title
     * @param {string} message - Overlay message
     * @param {string} buttonText - Button label
     * @param {function} onButtonClick - Button callback
     */
    function showOverlay(title, message, buttonText, onButtonClick) {
        dom.overlayTitle.textContent = title;
        dom.overlayMsg.textContent = message;
        dom.overlayBtn.textContent = buttonText;
        dom.overlayBtn.onclick = () => {
            hideOverlay();
            if (onButtonClick) onButtonClick();
        };
        dom.gameOverlay.classList.add('visible');
    }

    function hideOverlay() {
        dom.gameOverlay.classList.remove('visible');
    }

    // ─── Utility ────────────────────────────────────────────

    /**
     * Highlight a card element briefly (e.g., to show the winning card).
     * @param {HTMLElement} cardEl 
     */
    function highlightCard(cardEl) {
        cardEl.classList.add('highlight');
        setTimeout(() => cardEl.classList.remove('highlight'), 1500);
    }

    /**
     * Disable all player card clicks.
     */
    function disablePlayerCards() {
        dom.playerHand.querySelectorAll('.card').forEach(c => {
            c.classList.remove('clickable');
        });
    }

    /**
     * Enable all player card clicks.
     */
    function enablePlayerCards() {
        dom.playerHand.querySelectorAll('.card').forEach(c => {
            c.classList.add('clickable');
        });
    }

    // ─── Public API ─────────────────────────────────────────
    return {
        init,
        renderPlayerHand,
        renderOpponentHand,
        playCardToTable,
        collectTrick,
        clearTable,
        renderDeck,
        renderScores,
        showMessage,
        hideMessage,
        setTurn,
        showOverlay,
        hideOverlay,
        highlightCard,
        onCardClick,
        disablePlayerCards,
        enablePlayerCards,
    };
})();
