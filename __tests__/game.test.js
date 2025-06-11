// __tests__/game.test.js

// Mock dependencies yang diperlukan
global.createjs = {
  Stage: jest.fn().mockImplementation(() => ({
    enableMouseOver: jest.fn(),
    addChild: jest.fn(),
    removeChild: jest.fn(),
    removeAllChildren: jest.fn(),
    update: jest.fn(),
    canvas: {
      width: 1024,
      height: 768,
    },
  })),
  Container: jest.fn(() => ({
    addChild: jest.fn(),
    removeChild: jest.fn(),
    removeAllChildren: jest.fn(),
    x: 0,
    y: 0,
    alpha: 0,
  })),
  Text: jest.fn(() => ({
    x: 0,
    y: 0,
    text: '',
    shadow: null,
    textAlign: '',
    lineWidth: 0,
    // FIX: Menambahkan fungsi 'center' yang hilang dari mock
    center: jest.fn(),
  })),
  Bitmap: jest.fn(() => ({
    x: 0,
    y: 0,
    image: { src: '' },
    shadow: null,
    scaleX: 1,
    scaleY: 1,
    cursor: '',
    dealt: false,
    color: '',
    on: jest.fn(),
    addEventListener: jest.fn(),
  })),
  Shape: jest.fn(() => ({
    graphics: {
      beginFill: jest.fn(() => ({
        beginStroke: jest.fn(() => ({
          setStrokeStyle: jest.fn(() => ({
            drawRect: jest.fn(),
            drawRoundRect: jest.fn(),
          })),
        })),
        drawRect: jest.fn(),
        drawRoundRect: jest.fn(),
      })),
    },
    x: 0,
    y: 0,
    shadow: null,
  })),
  Tween: {
    get: jest.fn(() => ({
      wait: jest.fn(() => ({
        to: jest.fn(),
        call: jest.fn(() => ({
          to: jest.fn(),
        })),
      })),
      to: jest.fn(() => ({
        call: jest.fn(),
      })),
      call: jest.fn(),
    })),
  },
  Ease: {
    getPowInOut: jest.fn(),
    quadOut: jest.fn(),
    quadIn: jest.fn(),
  },
  Ticker: {
    addEventListener: jest.fn(),
    setFPS: jest.fn(),
  },
  Sound: {
    registerSound: jest.fn(),
    registerSounds: jest.fn(),
    play: jest.fn(),
    on: jest.fn(),
  },
  Shadow: jest.fn(),
};

global.localStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};

global.location = {
  reload: jest.fn(),
};

global.document = {
  getElementById: jest.fn(() => ({
    width: 1024,
    height: 768,
  })),
};

global.deckNumber = 1;
global.suits = ['hearts', 'diamonds', 'clubs', 'spades'];
global.Card = function (suit, value) {
  this.suit = suit;
  this.value = value;
};
// Menghapus parameter 'max' yang tidak digunakan
global.rand = jest.fn((min) => min); // Selalu kembalikan nilai minimum untuk prediktabilitas
global.tick = jest.fn();

// Variabel untuk menangkap callback tombol "Continue"
let lastButtonClickCallback;
global.Button = jest.fn((text, color, x, y, onclick) => {
  // Jika tombol "Continue" dibuat, simpan fungsi onclick-nya
  if (text === 'Continue') {
    lastButtonClickCallback = onclick;
  }
  return {
    createVisual: jest.fn(() => ({
      on: jest.fn(),
      addEventListener: jest.fn(),
    })),
  };
});

global.TextInput = jest.fn(() => ({
  width: 200,
  _preCursorText: 'Test Player',
}));
global.imgs = {
  cards: {
    path: 'assets/cards/',
    back: { red: 'back' },
    ext: 'png',
    get: jest.fn((suit, value) => `assets/cards/${suit}_${value}.png`),
  },
  chips: {
    get: jest.fn((color, type) => `assets/chips/${color}_${type}.png`),
  },
};
global.messages = {
  bet: 'Place your bet',
  win: 'You win!',
  lose: 'You lose!',
  draw: 'Draw!',
  warning: {
    bet: 'Place a bet first',
    hit: 'Cannot hit',
    insurance: 'Cannot insure',
    insured: 'Insured',
    double: 'Cannot double',
    doubled: 'Doubled',
    funds: 'Insufficient funds',
    giveUp: 'Cannot give up',
    gaveUp: 'Gave up',
  },
};

// Menggunakan file game.js yang sudah diperbaiki sebelumnya
const { init, getGameInstances } = require('../js/game.js');

jest.useFakeTimers();

describe('Game Logic Tests (Testing game.js)', () => {
  let game, player, bank;

  // Fungsi pembantu yang telah diperbaiki untuk mensimulasikan akhir ronde
  const simulateRoundEnd = (outcome) => {
    if (outcome === 'win') {
      player.win();
    } else if (outcome === 'lose') {
      player.lose();
    } else {
      // draw
      player.draw();
    }

    // Jalankan timer untuk memunculkan popup
    jest.runAllTimers();

    // Simulasikan klik tombol "Continue" dengan memanggil callback yang ditangkap
    if (typeof lastButtonClickCallback === 'function') {
      lastButtonClickCallback();
    }

    // Jalankan timer lagi untuk mengeksekusi logika di dalam callback (pembaruan dana, dll.)
    jest.runAllTimers();
  };

  beforeEach(() => {
    jest.clearAllMocks();
    lastButtonClickCallback = null; // Reset callback sebelum setiap tes

    // Inisialisasi game menggunakan file game.js yang sudah diperbaiki
    init();

    const instances = getGameInstances();
    game = instances.game;
    player = instances.player;
    bank = instances.bank;

    localStorage.getItem.mockReturnValue(null);
    game.startScreen();

    // Alur tes tidak menyimulasikan klik tombol "Play", sehingga game.start()
    // dan game.addChips() tidak pernah dipanggil. Akibatnya, container-container
    // yang coba dibersihkan oleh game.end() tidak pernah dibuat.
    // Kita inisialisasi secara manual di sini untuk memastikan tes dapat berjalan.
    if (!game.dealtChipContainer) {
      game.dealtChipContainer = new createjs.Container();
    }
    if (!player.cardsContainer) {
      player.cardsContainer = new createjs.Container();
    }
    if (!bank.cardsContainer) {
      bank.cardsContainer = new createjs.Container();
    }
  });

  describe('buildDeck', () => {
    test('should build a deck with 52 cards', () => {
      game.buildDeck();
      expect(game.deck).toHaveLength(52);
    });

    test('should build deck with correct card distribution', () => {
      game.buildDeck();
      const suitCounts = {};
      game.deck.forEach((card) => {
        suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
      });
      Object.values(suitCounts).forEach((count) => {
        expect(count).toBe(13);
      });
    });
  });

  describe('deckValue', () => {
    test('should calculate value correctly without Ace', () => {
      const deck = [{ value: 10 }, { value: 5 }];
      expect(game.deckValue(deck)).toBe(15);
    });

    test('should handle Ace as 1 if total > 21', () => {
      const deck = [{ value: 'A' }, { value: 10 }, { value: 10 }];
      expect(game.deckValue(deck)).toBe(21);
    });

    test('should handle multiple Aces correctly', () => {
      const deck = [{ value: 'A' }, { value: 'A' }, { value: 9 }];
      expect(game.deckValue(deck)).toBe(21);
    });
  });

  describe('balanceChips', () => {
    test('should convert funds to chips correctly', () => {
      const result = game.balanceChips(631);
      expect(result).toEqual({
        blue: 1,
        black: 1,
        green: 1,
        red: 1,
        white: 1,
      });
    });

    test('should handle exact chip values', () => {
      const result = game.balanceChips(500);
      expect(result).toEqual({ blue: 1, black: 0, green: 0, red: 0, white: 0 });
    });
  });

  describe('Game Logic Simulation', () => {
    test('Phase 1: should always win for the first few games', () => {
      game.gameControl.phase = 1;
      player.funds = 1000;
      const betAmount = 50;

      // Simulasikan taruhan (dana berkurang)
      player.funds -= betAmount;
      player.dealt = betAmount;

      const outcome = game.shouldPlayerWin();
      expect(outcome).toBe(true);

      simulateRoundEnd('win');

      // Dana akhir: 950 + (50 * 2) = 1050
      expect(player.funds).toBe(1050);
    });

    test('Phase 2: should win if bet < 100, lose if bet >= 100', () => {
      game.gameControl.phase = 2;

      // Skenario MENANG
      player.funds = 1500;
      const betWin = 50;
      player.funds -= betWin;
      player.dealt = betWin;

      let outcome = game.shouldPlayerWin();
      expect(outcome).toBe(true);
      simulateRoundEnd('win');
      expect(player.funds).toBe(1550);

      // Skenario KALAH
      const betLose = 150;
      player.funds -= betLose;
      player.dealt = betLose;

      outcome = game.shouldPlayerWin();
      expect(outcome).toBe(false);
      simulateRoundEnd('lose');
      expect(player.funds).toBe(1400);
    });

    test('should enter loss streak condition after reaching 2000 funds', () => {
      player.funds = 1900;
      game.gameControl.phase = 1;
      const betAmount = 100;

      player.funds -= betAmount;
      player.dealt = betAmount;
      simulateRoundEnd('win');
      expect(player.funds).toBe(2000);

      expect(game.gameControl.needTwoLosses).toBe(false);
      game.shouldPlayerWin();
      expect(game.gameControl.needTwoLosses).toBe(true);
    });

    test('should lose consistently when funds >= 2000', () => {
      player.funds = 2500;
      game.gameControl.phase = 2;
      const betAmount = 50;

      player.dealt = betAmount;
      const outcome = game.shouldPlayerWin();
      expect(outcome).toBe(false);

      player.funds -= betAmount;
      simulateRoundEnd('lose');

      expect(player.funds).toBe(2450);
    });
  });
});
