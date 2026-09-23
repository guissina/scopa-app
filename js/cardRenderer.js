/**
 * cardRenderer.js
 * 
 * Responsible for creating and managing card DOM elements.
 * Uses the Bresciane deck images from assets/cards/.
 */

const CARD_BACK_PATH = 'assets/cards/back.jpg';

/**
 * Create a card DOM element.
 * @param {number} cardId - Card ID (1–40)
 * @param {boolean} faceUp - Whether the card is face-up
 * @returns {HTMLElement} The card element
 */
function createCardElement(cardId, faceUp = true) {
    const cardData = getCard(cardId);
    if (!cardData) return null;

    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cardId = cardId;
    card.dataset.suit = cardData.suit;
    card.dataset.rank = cardData.rank;
    card.dataset.faceUp = faceUp;

    // Inner structure for 3D flip
    const inner = document.createElement('div');
    inner.className = 'card-inner';

    // Front face
    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const frontImg = document.createElement('img');
    frontImg.src = cardData.imagePath;
    frontImg.alt = cardData.name;
    frontImg.draggable = false;
    front.appendChild(frontImg);

    // Back face
    const back = document.createElement('div');
    back.className = 'card-face card-back';
    const backImg = document.createElement('img');
    backImg.src = CARD_BACK_PATH;
    backImg.alt = 'Carta coperta';
    backImg.draggable = false;
    back.appendChild(backImg);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    // Set initial state
    if (!faceUp) {
        card.classList.add('flipped');
    }

    return card;
}

/**
 * Create a card-back-only element (for deck pile, unknown cards).
 * @returns {HTMLElement} A card element showing only the back
 */
function createCardBack() {
    const card = document.createElement('div');
    card.className = 'card flipped deck-card';

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face card-front';

    const back = document.createElement('div');
    back.className = 'card-face card-back';
    const backImg = document.createElement('img');
    backImg.src = CARD_BACK_PATH;
    backImg.alt = 'Mazzo';
    backImg.draggable = false;
    back.appendChild(backImg);

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);

    return card;
}

/**
 * Flip a card element (toggle face-up/face-down).
 * @param {HTMLElement} cardEl - The card element to flip
 */
function flipCard(cardEl) {
    cardEl.classList.toggle('flipped');
    const isFaceUp = !cardEl.classList.contains('flipped');
    cardEl.dataset.faceUp = isFaceUp;
}

/**
 * Create the briscola indicator — a sideways card under the deck.
 * @param {number} cardId - The briscola card ID
 * @returns {HTMLElement}
 */
function createBriscolaIndicator(cardId) {
    const cardData = getCard(cardId);
    if (!cardData) return null;

    const wrapper = document.createElement('div');
    wrapper.className = 'briscola-indicator';

    const card = document.createElement('div');
    card.className = 'card briscola-card';
    card.dataset.cardId = cardId;

    const inner = document.createElement('div');
    inner.className = 'card-inner';

    const front = document.createElement('div');
    front.className = 'card-face card-front';
    const img = document.createElement('img');
    img.src = cardData.imagePath;
    img.alt = `Briscola: ${cardData.name}`;
    img.draggable = false;
    front.appendChild(img);

    const back = document.createElement('div');
    back.className = 'card-face card-back';

    inner.appendChild(front);
    inner.appendChild(back);
    card.appendChild(inner);
    wrapper.appendChild(card);

    // Label
    const label = document.createElement('div');
    label.className = 'briscola-label';
    label.innerHTML = `<span class="briscola-suit-name" style="color:${cardData.suitData.color}">${cardData.suitData.name}</span>`;
    wrapper.appendChild(label);

    return wrapper;
}
