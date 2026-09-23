/**
 * cardData.js
 * 
 * Maps the backend's card IDs (1–40) to image filenames, Italian names,
 * suit info, and Briscola point values.
 * 
 * Backend suit mapping (from briscola.js):
 *   IDs  1–10  = copas    → Coppe   (Cups)     → file prefix 'c'
 *   IDs 11–20  = espadas  → Spade   (Swords)   → file prefix 's'
 *   IDs 21–30  = ouros    → Denari  (Coins)    → file prefix 'd'
 *   IDs 31–40  = paus     → Bastoni (Batons)   → file prefix 'b'
 * 
 * Bresciane deck files: {suit}{rank}.png where rank 1–10
 *   rank 1 = Asso, 2–7 = pip cards, 8 = Fante, 9 = Cavallo, 10 = Re
 */

const SUITS = {
    coppe:   { name: 'Coppe',   nameEn: 'Cups',    prefix: 'c', color: '#c0392b' },
    spade:   { name: 'Spade',   nameEn: 'Swords',  prefix: 's', color: '#2c3e50' },
    denari:  { name: 'Denari',  nameEn: 'Coins',   prefix: 'd', color: '#d4a017' },
    bastoni: { name: 'Bastoni', nameEn: 'Batons',  prefix: 'b', color: '#27ae60' },
};

const RANK_NAMES = {
    1:  'Asso',
    2:  'Due',
    3:  'Tre',
    4:  'Quattro',
    5:  'Cinque',
    6:  'Sei',
    7:  'Sette',
    8:  'Fante',
    9:  'Cavallo',
    10: 'Re',
};

// Briscola point values (same as backend index_val)
const BRISCOLA_VALUES = {
    1:  11,   // Asso
    2:  0,
    3:  10,   // Tre
    4:  0,
    5:  0,
    6:  0,
    7:  0,
    8:  2,    // Fante
    9:  3,    // Cavallo
    10: 4,    // Re
};

/**
 * Build the full card database: maps card ID (1–40) to all metadata.
 */
function buildCardDatabase() {
    const db = {};
    const suitOrder = ['coppe', 'spade', 'denari', 'bastoni'];

    for (let i = 1; i <= 40; i++) {
        const suitIndex = Math.floor((i - 1) / 10);
        const rank = ((i - 1) % 10) + 1;
        const suitKey = suitOrder[suitIndex];
        const suit = SUITS[suitKey];

        db[i] = {
            id: i,
            suit: suitKey,
            suitData: suit,
            rank: rank,
            rankName: RANK_NAMES[rank],
            name: `${RANK_NAMES[rank]} di ${suit.name}`,
            value: BRISCOLA_VALUES[rank],
            imageFile: `${suit.prefix}${rank}.png`,
            imagePath: `assets/cards/${suit.prefix}${rank}.png`,
        };
    }

    return db;
}

const CARD_DB = buildCardDatabase();

/**
 * Get card data by ID.
 * @param {number} cardId - Card ID from 1 to 40
 * @returns {object} Card metadata
 */
function getCard(cardId) {
    return CARD_DB[cardId] || null;
}

/**
 * Get the suit of the briscola (trump) card.
 * @param {number} briscolaCardId - ID of the briscola card
 * @returns {string} Suit key (e.g. 'coppe')
 */
function getBriscolaSuit(briscolaCardId) {
    const card = getCard(briscolaCardId);
    return card ? card.suit : null;
}

/**
 * Get all cards belonging to a specific suit.
 * @param {string} suitKey - Suit key (e.g. 'coppe')
 * @returns {object[]} Array of card data objects
 */
function getCardsBySuit(suitKey) {
    return Object.values(CARD_DB).filter(c => c.suit === suitKey);
}
