const imgs = {
  cards: {
    path: 'assets/PNG/Cards/',
    ext: 'png',
    back: {
      blue: 'cardBack_blue5',
      red: 'cardBack_red5',
    },
    /**
     * Get card image path
     * @param {string} suit - Card suit
     * @param {string|number} value - Card value
     * @returns {string} Image path
     */
    get(suit, value) {
      return `${this.path}card${suit}${value}.${this.ext}`;
    },
  },
  chips: {
    path: 'assets/PNG/Chips/',
    ext: 'png',
    black: {
      main: 'chipBlackWhite',
      side: 'chipBlackWhite_side',
    },
    blue: {
      main: 'chipBlueWhite',
      side: 'chipBlueWhite_side',
    },
    green: {
      main: 'chipGreenWhite',
      side: 'chipGreenWhite_side',
    },
    red: {
      main: 'chipRedWhite',
      side: 'chipRedWhite_side',
    },
    white: {
      main: 'chipWhiteBlue',
      side: 'chipWhiteBlue_side',
    },
    /**
     * Get chip image path
     * @param {string} color - Chip color
     * @param {string} type - Chip type (main or side)
     * @returns {string} Image path
     */
    get(color, type = 'main') {
      return `${this.path}${this[color][type]}.${this.ext}`;
    },
  },
};

/**
 * Number of decks used in the game
 * @type {number}
 */
const deckNumber = 6;

/**
 * Available card suits
 * @type {string[]}
 */
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

/**
 * Game messages configuration
 */
const messages = {
  bet: 'Bet !',
  win: 'You win !',
  draw: 'Draw !',
  lose: 'Dealer wins',
  warning: {
    bet: { msg: 'You need to bet first', x: 750 },
    insurance: { msg: 'You can not use insurance', x: 725 },
    insured: { msg: 'insurance used !', x: 800 },
    double: { msg: 'You can not double now', x: 725 },
    funds: { msg: 'You haven\'t got enough funds', x: 680 },
    hit: { msg: 'You can not hit anymore', x: 720 },
    doubled: { msg: 'Bet doubled !', x: 800 },
    giveUp: { msg: 'You can not give up now !', x: 720 },
    gaveUp: { msg: 'You gave up', x: 800 },
  },
};

/**
 * Canvas dimensions
 */
const width = 1100;
const height = 650;

/**
 * Extend CreateJS Text with center method
 */
if (typeof createjs !== 'undefined' && createjs.Text) {
  /**
   * Center text horizontally and/or vertically
   * @param {boolean} x - Center horizontally
   * @param {boolean} y - Center vertically
   */
  createjs.Text.prototype.center = function center(x = true, y = false) {
    const bounds = this.getBounds();
    if (x) {
      this.x = width / 2 - bounds.width / 2;
    }
    if (y) {
      this.y = height / 2 - bounds.height / 2;
    }
  };
}

/**
 * Generate random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number
 */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Console log helper
 * @param {*} v - Value to log
 */
function l(v) {
  console.log(v);
}

/**
 * Console table helper
 * @param {*} v - Value to display as table
 */
function t(v) {
  console.table(v);
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    imgs,
    deckNumber,
    suits,
    messages,
    width,
    height,
    rand,
    l,
    t,
  };
}
