// =================================================================
//           FILE: js/conf.js (Peningkatan Visual)
// =================================================================
// Deskripsi: Memperbarui konfigurasi dasar permainan, terutama
//            ukuran kanvas untuk memberikan ruang yang lebih luas.
// =================================================================

const imgs = {
  cards: {
    path: 'assets/PNG/Cards/',
    ext: 'png',
    back: {
      blue: 'cardBack_blue5',
      red: 'cardBack_red5',
    },
    // [[PERBAIKAN FINAL]] Fungsi get sekarang bisa menangani kartu tertutup
    get(suit, value = 'red') {
      // Jika suit adalah 'back', kembalikan gambar belakang kartu
      if (suit === 'back') {
        return `${this.path}${this.back[value]}.${this.ext}`;
      }
      // Jika tidak, kembalikan gambar kartu seperti biasa
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
    get(color, type = 'main') {
      return `${this.path}${this[color][type]}.${this.ext}`;
    },
  },
};

const deckNumber = 6;
const suits = ['Clubs', 'Diamonds', 'Hearts', 'Spades'];

// Pesan-pesan ini akan diposisikan secara dinamis di game.js
const messages = {
  bet: 'Bet!',
  win: 'You Win!',
  draw: 'Push!', // Istilah standar untuk seri di Blackjack
  lose: 'Dealer Wins',
  busted: 'Busted!',
  blackjack: 'Blackjack!',
  warning: {
    bet: { msg: 'You need to bet first' },
    insurance: { msg: 'Insurance is not available' },
    insured: { msg: 'Insurance placed!' },
    double: { msg: 'You cannot double now' },
    funds: { msg: "You don't have enough chips" },
    hit: { msg: 'You cannot hit anymore' },
    doubled: { msg: 'Bet Doubled!' },
    giveUp: { msg: 'You cannot surrender now' },
    gaveUp: { msg: 'You Surrendered' },
  },
};

// [[PERBAIKAN]] Dimensi canvas diperbesar untuk tampilan yang lebih luas
const width = 1200;
const height = 680;

// [[PERBAIKAN]] Fungsi center sekarang akan menggunakan variabel width/height yang baru secara otomatis
if (typeof createjs !== 'undefined' && createjs.Text) {
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

// Fungsi helper tidak berubah
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function l(v) {
  console.log(v);
}
function t(v) {
  console.table(v);
}

// Export untuk modul
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
