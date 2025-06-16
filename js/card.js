/**
 * Card class for representing playing cards
 */
class Card {
  /**
   * Creates a new Card instance
   * @param {string} suit - Card suit (Clubs, Diamonds, Hearts, Spades)
   * @param {string|number} value - Card value (A, 2-10, J, Q, K)
   * @param {boolean} hidden - Whether the card is face down
   */
  constructor(suit, value, hidden = false) {
    this.suit = suit;
    this.value = value;
    this.hidden = hidden;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Card;
}
