

/* global Button, Card, rand, suits, deckNumber, width, height, updateBalanceOnServer, openModal, showNotification */

// =================================================================
// FILE: js/game.js (Versi Final)
// =================================================================
// Deskripsi: Mengandung semua logika permainan inti, termasuk
//            logika game over yang mengontrol overlay HTML layar penuh.
// =================================================================

let game;
let player;
let bank;

/**
 * Fungsi utama untuk inisialisasi dan memulai game.
 * @param {object} userData - Data pengguna dari server.
 */
function init(userData) {
  const stage = new createjs.Stage('canvas');
  stage.enableMouseOver(10);
  createjs.Ticker.addEventListener('tick', () => stage.update());
  createjs.Ticker.setFPS(60);

  // Inisialisasi Sound Effects
  const sounds = [
    { src: 'assets/sounds/sfx_lose.ogg', id: 'lose' },
    { src: 'assets/sounds/sfx_shieldUp.ogg', id: 'win' },
    { src: 'assets/Bonus/cardPlace1.ogg', id: 'card' },
    { src: 'assets/Bonus/chipsCollide1.ogg', id: 'chip' },
    { src: 'assets/music/videoplayback.mp3', id: 'background-music' },
  ];

  createjs.Sound.registerSounds(sounds);

  createjs.Sound.on('fileload', (event) => {
    if (event.id === 'background-music') {
      createjs.Sound.play('background-music', {
        loop: -1,
        volume: 0.3,
        speed: 0.5,
      });
    }
  });
  createjs.Sound.on('fileerror', (event) => {
    console.error('Error memuat suara:', event.src);
  });

  const layout = {
    padding: 40,
    bankHand: { x: width / 2, y: 120 },
    playerHand: { x: width / 2, y: 420 },
    playerInfo: { x: 40, y: height - 100 },
    chipInfo: { x: width - 70, y: height - 100 },
    mainMessage: { x: 60, y: 50 },
    actionButtons: { x: width - 200, y: 280 },
    sideButtons: { x: 40, y: 280 },
    chipTray: { x: width - 600, y: height - 90 },
    bettingArea: { x: width / 2, y: 320 },
    scoreBox: {
      playerX: width / 2 + 220,
      playerY: 380,
      bankX: width / 2 + 220,
      bankY: 180,
    },
  };

  player = {
    deck: [],
    name: { value: userData.username, text: null },
    cardsContainer: null,
    chipsContainer: null,
    blackjack: false,
    insurance: false,
    doubled: false,
    funds: userData.chip_balance,
    fundsText: {
      text: null,
      init(stageRef) {
        /* Dihandle di titik mulai */
      },
      update() {
        if (this.text) {
          this.text.text = `Chips: ${player.funds}`;
        }
      },
    },
    betted: false,
    dealt: 0,
    chips: {},

    hit() {
      if (this.betted) {
        if (this.doubled && this.deck.length !== 2) {
          return game._alert(messages.warning.hit);
        } else if (this.doubled) {
          return game.distributeCard('player', false, true); // double hit
        }
        game.distributeCard('player');
      } else {
        game._alert(messages.warning.bet);
      }
    },

    stand() {
      if (!this.betted) {
        return game._alert(messages.warning.bet);
      }
      game.inProgress = true;
      bank.play();
    },

    insure() {
      if (
        game.inProgress &&
        bank.deck.length === 2 &&
        bank.deck[0].value === 'A'
      ) {
        this.insurance = Math.round(this.dealt / 2);
        this.funds -= this.insurance;
        this.chips = game.getBalancedChips(this.funds);
        player.fundsText.update();
        game._alert(messages.warning.insured);
      } else {
        game._alert(messages.warning.insurance);
      }
    },

    double() {
      if (game.inProgress && this.deck.length === 2 && !this.doubled) {
        if (this.funds >= this.dealt) {
          game._alert(messages.warning.doubled);
          this.doubled = true;
          this.funds -= this.dealt;
          this.dealt *= 2;
          this.chips = game.getBalancedChips(this.funds);
          game.addChips(stage);
          game.dealtChipContainer.children.forEach((chip) => {
            const clone = chip.clone(true);
            clone.y += 5;
            game.dealtChipContainer.addChild(clone);
          });
          player.fundsText.update();
        } else {
          game._alert(messages.warning.funds);
        }
      } else {
        game._alert(messages.warning.double);
      }
    },

    giveUp() {
      if (game.inProgress && this.deck.length === 2) {
        game._alert(messages.warning.gaveUp);
        const newFunds = player.funds + Math.round(player.dealt / 2);
        game.end({ funds: newFunds });
      } else {
        game._alert(messages.warning.giveUp);
      }
    },

    win() {
      if (game.gameControl.needTwoLosses) {
        game.gameControl.needTwoLosses = false;
        game.gameControl.consecutiveLosses = 0;
      }
      game.showResultPopup(messages.win, 'win', () => {
        createjs.Sound.play('win');
        const winnings = player.blackjack ? player.dealt * 1.5 : player.dealt;
        const newFunds = player.funds + player.dealt + winnings;
        game.end({ funds: newFunds });
      });
    },

    lose() {
      if (game.gameControl.needTwoLosses) {
        game.gameControl.consecutiveLosses++;
      }
      game.showResultPopup(messages.lose, 'lose', () => {
        createjs.Sound.play('lose');
        let newFunds = player.funds;
        if (bank.blackjack && player.insurance) {
          newFunds += player.insurance * 2;
        }
        if (newFunds <= 0) {
          game.over();
        } else {
          game.end({ funds: newFunds });
        }
      });
    },

    draw() {
      game.showResultPopup(messages.draw, 'draw', () => {
        let newFunds = player.funds + player.dealt;
        if (bank.blackjack && player.insurance) {
          newFunds += player.insurance * 2;
        }
        game.end({ funds: newFunds });
      });
    },
  };

  bank = {
    deck: [],
    cardsContainer: null,
    blackjack: false,

    play() {
      if (player.doubled && player.deck.length > 2) {
        game.flipCard(player.cardsContainer.children[2], player.deck[2]);
      }

      if (
        this.deck.length === 2 &&
        this.cardsContainer &&
        this.cardsContainer.children.length > 1
      ) {
        game.flipCard(this.cardsContainer.children[1], this.deck[1]);
      }

      const total = game.deckValue(this.deck);
      if (total < 17) {
        setTimeout(() => {
          game.distributeCard('bank');
          if (game.deckValue(this.deck) < 17) {
            setTimeout(() => bank.play(), 1000);
          } else {
            setTimeout(() => game.check(), 500);
          }
        }, 1000);
      } else {
        setTimeout(() => game.check(), 500);
      }
    },
  };

  game = {
    deck: [],
    chipsValue: { blue: 500, black: 100, green: 25, red: 5, white: 1 },
    buttons: [
      new Button(
        'Hit',
        'secondary',
        layout.actionButtons.x,
        layout.actionButtons.y,
        () => player.hit()
      ),
      new Button(
        'Stand',
        'secondary',
        layout.actionButtons.x,
        layout.actionButtons.y + 65,
        () => player.stand()
      ),
      new Button(
        'Double',
        'secondary',
        layout.actionButtons.x,
        layout.actionButtons.y + 130,
        () => player.double()
      ),
      new Button(
        'Insurance',
        'secondary',
        layout.sideButtons.x,
        layout.sideButtons.y,
        () => player.insure()
      ),
      new Button(
        'Surrender',
        'secondary',
        layout.sideButtons.x,
        layout.sideButtons.y + 65,
        () => player.giveUp()
      ),
      new Button('Go', 'primary', width - 250, 50, () => game.go()),
    ],
    buttonContainer: null,
    dealtChipContainer: null,
    inProgress: false,
    dealt: { blue: 0, black: 0, green: 0, red: 0, white: 0 },

    gameControl: {
      gamesPlayed: 0,
      phase: 1,
      consecutiveLosses: 0,
      needTwoLosses: false,
    },

    _alert(msg) {
      const alertContainer = new createjs.Container();
      const alertText = new createjs.Text(
        msg.msg,
        'bold 22px \'Roboto\', sans-serif',
        '#f5f5f5'
      );
      alertText.textAlign = 'center';
      alertText.lineWidth = 250;

      const bounds = alertText.getBounds();
      alertText.y = -bounds.height / 2;

      const bg = new createjs.Shape();
      bg.graphics
        .beginFill('#1a2c28')
        .beginStroke('#e2b344')
        .setStrokeStyle(2)
        .drawRoundRect(
          -bounds.width / 2 - 20,
          -bounds.height / 2 - 10,
          bounds.width + 40,
          bounds.height + 20,
          10
        );

      alertContainer.x = width / 2;
      alertContainer.y = height / 2;
      alertContainer.alpha = 0;
      alertContainer.scale = 0.8;

      alertContainer.addChild(bg, alertText);
      stage.addChild(alertContainer);

      createjs.Tween.get(alertContainer)
        .to({ alpha: 1, scale: 1 }, 300, createjs.Ease.quadOut)
        .wait(1500)
        .to({ alpha: 0, y: alertContainer.y - 30 }, 500, createjs.Ease.quadIn)
        .call(() => stage.removeChild(alertContainer));
    },

    // [[MODIFIKASI]] Fungsi `over` memanggil showGameOverScreen
    over() {
      if (typeof updateBalanceOnServer === 'function') {
        updateBalanceOnServer(0);
      }
      this.showGameOverScreen();
    },

    // [[MODIFIKASI]] Fungsi ini sekarang mengontrol elemen HTML, bukan canvas
    showGameOverScreen() {
      // 1. Bersihkan semua elemen dari canvas game
      stage.removeAllChildren();
      stage.removeAllEventListeners();
      stage.update(); // Penting untuk mengaplikasikan pembersihan

      // 2. Ambil elemen overlay HTML
      const overlayElement = document.getElementById('game-over-overlay');
      const contentElement = overlayElement.querySelector('.game-over-content');

      if (overlayElement && contentElement) {
        // 3. Isi konten teksnya
        contentElement.innerHTML = `
          <h2>Stop Judi Online!</h2>
          <p>Ingin Tetap Rungkad?<br>Silahkan Beli Chip untuk Bisa Bermain Kembali😈</p>
        `;

        // 4. Tampilkan overlay HTML
        overlayElement.style.display = 'flex';
      }
    },

    resetChips() {
      Object.keys(this.dealt).forEach((color) => {
        this.dealt[color] = 0;
      });
    },

    getBalancedChips(value) {
      const chips = { blue: 0, black: 0, green: 0, red: 0, white: 0 };
      const sortedChipColors = ['blue', 'black', 'green', 'red', 'white'];
      for (const color of sortedChipColors) {
        const chipValue = this.chipsValue[color];
        while (value >= chipValue) {
          value -= chipValue;
          chips[color]++;
        }
      }
      if (chips.blue > 0) {
        chips.blue--;
        chips.black += 5;
      }
      if (chips.black > 0) {
        chips.black--;
        chips.green += 4;
      }
      if (chips.green > 0) {
        chips.green--;
        chips.red += 5;
      }
      if (chips.red > 0) {
        chips.red--;
        chips.white += 5;
      }
      return chips;
    },

    shouldPlayerWin() {
      const currentBet = player.dealt;
      const playerFunds = player.funds;
      const CHIP_TRIGGER = 2000;

      if (this.gameControl.phase === 1) {
        if (playerFunds >= CHIP_TRIGGER && !this.gameControl.needTwoLosses) {
          this.gameControl.needTwoLosses = true;
          this.gameControl.consecutiveLosses = 0;
        }

        if (this.gameControl.needTwoLosses) {
          if (this.gameControl.consecutiveLosses < 2) {
            return false;
          } else {
            this.gameControl.needTwoLosses = false;
            this.gameControl.consecutiveLosses = 0;
            return true;
          }
        }

        return true;
      }

      if (this.gameControl.phase === 2) {
        if (playerFunds >= CHIP_TRIGGER) {
          return false;
        }

        if (currentBet < 100) {
          return true;
        } else {
          return false;
        }
      }

      return true;
    },

    getControlledCard(targetDeck, desiredOutcome) {
      const availableCards = [...this.deck];

      if (targetDeck === 'player') {
        return this.getPlayerCard(availableCards, desiredOutcome);
      } else {
        return this.getBankCard(availableCards, desiredOutcome);
      }
    },

    getPlayerCard(availableCards, shouldWin) {
      const currentTotal = this.deckValue(player.deck);

      if (shouldWin) {
        if (currentTotal <= 11) {
          const goodCards = availableCards.filter((card) => {
            const value = this.getCardNumericValue(card);
            return value >= 8;
          });
          if (goodCards.length > 0) {
            return goodCards[rand(0, goodCards.length - 1)];
          }
        } else if (currentTotal <= 16) {
          const safeCards = availableCards.filter((card) => {
            const value = this.getCardNumericValue(card);
            return currentTotal + value <= 21;
          });
          if (safeCards.length > 0) {
            return safeCards[rand(0, safeCards.length - 1)];
          }
        }
      } else {
        if (currentTotal >= 12) {
          const bustCards = availableCards.filter((card) => {
            const value = this.getCardNumericValue(card);
            return currentTotal + value > 21;
          });
          if (bustCards.length > 0) {
            return bustCards[rand(0, bustCards.length - 1)];
          }
        }
      }

      return availableCards[rand(0, availableCards.length - 1)];
    },

    getBankCard(availableCards, shouldWin) {
      const bankTotal = this.deckValue(bank.deck);
      const playerTotal = this.deckValue(player.deck);

      if (shouldWin) {
        if (bankTotal >= 12 && bankTotal <= 16) {
          const bustCards = availableCards.filter((card) => {
            const value = this.getCardNumericValue(card);
            return bankTotal + value > 21;
          });
          if (bustCards.length > 0) {
            return bustCards[rand(0, bustCards.length - 1)];
          }
        }

        const lowerCards = availableCards.filter((card) => {
          const value = this.getCardNumericValue(card);
          const newTotal = bankTotal + value;
          return newTotal < playerTotal && newTotal <= 21 && newTotal >= 17;
        });
        if (lowerCards.length > 0) {
          return lowerCards[rand(0, lowerCards.length - 1)];
        }
      } else {
        const goodCards = availableCards.filter((card) => {
          const value = this.getCardNumericValue(card);
          const newTotal = bankTotal + value;
          return newTotal >= playerTotal && newTotal <= 21 && newTotal >= 17;
        });
        if (goodCards.length > 0) {
          return goodCards[rand(0, goodCards.length - 1)];
        }
      }

      return availableCards[rand(0, availableCards.length - 1)];
    },

    getCardNumericValue(card) {
      if (card.value >= 2 && card.value <= 10) {
        return card.value;
      }
      if (['J', 'Q', 'K'].includes(card.value)) {
        return 10;
      }
      if (card.value === 'A') {
        return 11;
      }
      return 0;
    },

    showResultPopup(message, outcome, onContinue) {
      const popupContainer = new createjs.Container();
      const overlay = new createjs.Shape();
      overlay.graphics
        .beginFill('rgba(0,0,0,0.7)')
        .drawRect(0, 0, width, height);
      popupContainer.addChild(overlay);

      const panelWidth = 500;
      const panelHeight = 250;
      const panel = new createjs.Shape();
      const panelColor = outcome === 'win' ? '#e2b344' : '#A52A2A';
      panel.graphics
        .beginFill('#2a4d3e')
        .beginStroke(panelColor)
        .setStrokeStyle(4)
        .drawRoundRect(0, 0, panelWidth, panelHeight, 20);
      panel.x = (width - panelWidth) / 2;
      panel.y = (height - panelHeight) / 2;
      panel.shadow = new createjs.Shadow('#000000', 5, 5, 15);
      popupContainer.addChild(panel);

      const resultText = new createjs.Text(
        message,
        'bold 42px \'Playfair Display\', serif',
        '#f5f5f5'
      );
      resultText.textAlign = 'center';
      resultText.lineWidth = panelWidth - 40;
      resultText.x = width / 2;
      resultText.y = panel.y + 60;
      resultText.shadow = new createjs.Shadow(panelColor, 0, 0, 15);
      popupContainer.addChild(resultText);

      const continueButton = new Button(
        'Continue',
        'primary',
        (width - 150) / 2,
        panel.y + 150,
        () => {
          stage.removeChild(popupContainer);
          onContinue();
        }
      ).createVisual();
      popupContainer.addChild(continueButton);

      popupContainer.alpha = 0;
      stage.addChild(popupContainer);
      createjs.Tween.get(popupContainer).to(
        { alpha: 1 },
        500,
        createjs.Ease.quadOut
      );
    },

    new() {
      this.distributeCard('player');
      setTimeout(() => {
        game.distributeCard('player');
        setTimeout(() => {
          game.distributeCard('bank');
          setTimeout(() => {
            game.distributeCard('bank', true);
          }, 500);
        }, 500);
      }, 500);
    },

    buildDeck() {
      this.deck = [];
      for (let i = 0; i < deckNumber; i++) {
        for (const suit of suits) {
          for (let j = 2; j < 11; j++) {
            this.deck.push(new Card(suit, j));
          }
          for (const v of ['J', 'Q', 'K', 'A']) {
            this.deck.push(new Card(suit, v));
          }
        }
      }
    },

    deckValue(deck) {
      let total = 0;
      let aces = 0;
      deck.forEach((card) => {
        if (card.hidden) {
          return;
        }
        const value = card.value;
        if (value >= 2 && value < 11) {
          total += value;
        } else if (['J', 'Q', 'K'].includes(value)) {
          total += 10;
        } else if (value === 'A') {
          total += 11;
          aces++;
        }
      });
      while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
      }
      return total;
    },

    updateScores() {
      const playerScore = this.deckValue(player.deck);
      if (player.scoreText) {
        if (playerScore > 0) {
          player.scoreText.text = `Player: ${playerScore}`;
          player.scoreText.alpha = 1;
        } else {
          player.scoreText.alpha = 0;
        }
      }

      const bankScore = this.deckValue(bank.deck);
      if (bank.scoreText) {
        if (bankScore > 0) {
          bank.scoreText.text = `Dealer: ${bankScore}`;
          bank.scoreText.alpha = 1;
        } else {
          bank.scoreText.alpha = 0;
        }
      }
    },

    distributeCard(to, hidden = false, isDoubleHit = false) {
      const shouldWin = this.shouldPlayerWin();
      let card;

      if (this.gameControl.phase === 1 || this.gameControl.phase === 2) {
        card = this.getControlledCard(to, shouldWin);
      } else {
        const index = rand(0, this.deck.length - 1);
        card = this.deck[index];
      }

      if (hidden) {
        card.hidden = true;
      }

      const targetDeck = to === 'player' ? player.deck : bank.deck;
      targetDeck.push(card);

      const cardIndex = this.deck.indexOf(card);
      if (cardIndex > -1) {
        this.deck.splice(cardIndex, 1);
      }

      this.displayCard(card, to, isDoubleHit);
    },

    flipCard(cardBitmap, cardData) {
      if (!cardBitmap || !cardData) {
        return;
      }
      cardData.hidden = false;
      createjs.Tween.get(cardBitmap)
        .to({ scaleX: 0 }, 200, createjs.Ease.quadIn)
        .call(() => {
          cardBitmap.image.src = imgs.cards.get(cardData.suit, cardData.value);
        })
        .to({ scaleX: 1 }, 200, createjs.Ease.quadOut)
        .call(() => this.updateScores());
    },

    displayCard(card, owner, isDoubleHit) {
      if (!bank.cardsContainer) {
        bank.cardsContainer = new createjs.Container();
        bank.cardsContainer.y = layout.bankHand.y;
        bank.cardsContainer.x = layout.bankHand.x;
        stage.addChild(bank.cardsContainer);
      }
      if (!player.cardsContainer) {
        player.cardsContainer = new createjs.Container();
        player.cardsContainer.y = layout.playerHand.y;
        player.cardsContainer.x = layout.playerHand.x;
        stage.addChild(player.cardsContainer);
      }

      const targetContainer =
        owner === 'player' ? player.cardsContainer : bank.cardsContainer;

      if (!targetContainer.parent) {
        stage.addChild(targetContainer);
      }

      createjs.Sound.play('card');

      const imagePath = card.hidden
        ? imgs.cards.get('back', 'red')
        : imgs.cards.get(card.suit, card.value);

      const cardBitmap = new createjs.Bitmap(imagePath);
      cardBitmap.shadow = new createjs.Shadow('rgba(0,0,0,0.4)', 4, 4, 8);
      cardBitmap.regX = 73;
      cardBitmap.regY = 98;

      const cardCount = targetContainer.numChildren;

      cardBitmap.x = width - 100;
      cardBitmap.y = -150;
      targetContainer.addChild(cardBitmap);

      const cardSpacing = 40;
      targetContainer.regX = (cardCount * cardSpacing) / 2;
      const endX = cardCount * cardSpacing;
      const endRotation = rand(-6, 6);

      if (isDoubleHit) {
        cardBitmap.rotation = 90;
      }

      createjs.Tween.get(cardBitmap)
        .to(
          { x: endX, y: 0, rotation: endRotation },
          600,
          createjs.Ease.quadOut
        )
        .call(() => {
          this.updateScores();
          if (owner === 'player' && this.deckValue(player.deck) > 21) {
            player.lose();
          }
        });
    },

    addButtons(stageRef) {
      if (this.buttonContainer) {
        stageRef.removeChild(this.buttonContainer);
      }
      this.buttonContainer = new createjs.Container();
      this.buttonContainer.x = 0;
      this.buttonContainer.y = 0;
      stageRef.addChild(this.buttonContainer);
      this.buttons.forEach((b) => {
        this.buttonContainer.addChild(b.createVisual());
      });
    },

    addChips(stageRef) {
      if (!player.chipsContainer) {
        player.chipsContainer = new createjs.Container();
        player.chipsContainer.x = layout.chipTray.x;
        player.chipsContainer.y = layout.chipTray.y;
      }
      if (!game.dealtChipContainer) {
        game.dealtChipContainer = new createjs.Container();
      }

      if (!player.chipsContainer.parent) {
        stageRef.addChild(player.chipsContainer);
      }
      if (!game.dealtChipContainer.parent) {
        stageRef.addChild(game.dealtChipContainer);
      }

      player.chipsContainer.removeAllChildren();

      let chipOffsetX =
        -(
          (Object.keys(player.chips).filter((c) => player.chips[c] > 0).length *
            85) /
          2
        ) + 42.5;
      for (const chipColor in player.chips) {
        if (player.chips[chipColor] > 0) {
          const chipStack = new createjs.Container();
          chipStack.x = chipOffsetX;
          chipStack.name = chipColor;
          chipStack.cursor = 'Pointer';
          for (let i = 0; i < Math.min(player.chips[chipColor], 5); i++) {
            const chipImg = new createjs.Bitmap(
              imgs.chips.get(chipColor, 'side')
            );
            chipImg.y = -i * 6;
            chipImg.shadow = new createjs.Shadow('#000000', 3, 3, 5);
            chipStack.addChild(chipImg);
          }
          chipStack.on('click', () => game.throwChip(chipColor));
          player.chipsContainer.addChild(chipStack);
          chipOffsetX += 85;
        }
      }
    },

    throwChip(color) {
      if (game.inProgress) {
        return;
      }
      if (!game.dealtChipContainer) {
        game.dealtChipContainer = new createjs.Container();
        if (!game.dealtChipContainer.parent) {
          stage.addChild(game.dealtChipContainer);
        }
      }

      createjs.Sound.play('chip');
      const chipValue = this.chipsValue[color];
      player.dealt += chipValue;
      player.chips[color]--;
      game.message.text.text = `Bet: ${player.dealt}`;
      const chipImg = new createjs.Bitmap(imgs.chips.get(color, 'side'));
      const chipStack = player.chipsContainer.getChildByName(color);
      const startPos = chipStack
        ? chipStack.localToGlobal(0, 0)
        : { x: layout.chipTray.x, y: layout.chipTray.y };
      chipImg.x = startPos.x;
      chipImg.y = startPos.y;
      this.dealtChipContainer.addChild(chipImg);
      createjs.Tween.get(chipImg).to(
        {
          x: layout.bettingArea.x + rand(-100, 100),
          y: layout.bettingArea.y + rand(-40, 40),
        },
        400,
        createjs.Ease.quadOut
      );
      this.addChips(stage);
    },

    check() {
      const bankScore = this.deckValue(bank.deck);
      const playerScore = this.deckValue(player.deck);
      if (bankScore === 21 && bank.deck.length === 2) {
        bank.blackjack = true;
      }
      if (playerScore === 21 && player.deck.length === 2) {
        player.blackjack = true;
      }
      if (bank.blackjack && player.blackjack) {
        return player.draw();
      }
      if (bank.blackjack) {
        return player.lose();
      }
      if (player.blackjack) {
        return player.win();
      }
      if (bankScore > 21) {
        player.win();
      } else if (bankScore >= 17 && bankScore <= 21) {
        if (playerScore > bankScore) {
          player.win();
        } else if (playerScore === bankScore) {
          player.draw();
        } else {
          player.lose();
        }
      }
    },

    go() {
      if (player.dealt === 0) {
        return game._alert(messages.warning.bet);
      }
      if (game.inProgress) {
        return;
      }
      if (player.dealt > player.funds) {
        return game._alert(messages.warning.funds);
      }
      player.funds -= player.dealt;
      player.fundsText.update();
      game.inProgress = true;
      player.betted = true;
      game.message.text.text = '';
      this.new();
    },

    end(result) {
      player.funds = result.funds;
      player.fundsText.update();
      if (typeof updateBalanceOnServer === 'function') {
        updateBalanceOnServer(player.funds);
      }

      this.gameControl.gamesPlayed++;
      if (
        this.gameControl.phase === 1 &&
        this.gameControl.gamesPlayed >= 3 &&
        !this.gameControl.needTwoLosses
      ) {
        this.gameControl.phase = 2;
      }

      setTimeout(() => {
        const fadeOutComplete = () => {
          if (player.cardsContainer && player.cardsContainer.parent) {
            player.cardsContainer.parent.removeChild(player.cardsContainer);
          }
          if (bank.cardsContainer && bank.cardsContainer.parent) {
            bank.cardsContainer.parent.removeChild(bank.cardsContainer);
          }
          if (game.dealtChipContainer && game.dealtChipContainer.parent) {
            game.dealtChipContainer.parent.removeChild(game.dealtChipContainer);
          }

          player.cardsContainer = null;
          bank.cardsContainer = null;
          game.dealtChipContainer = null;

          game.inProgress = false;
          player.betted = false;
          player.insurance = false;
          player.doubled = false;
          player.deck = [];
          player.blackjack = false;
          bank.blackjack = false;
          bank.deck = [];
          player.dealt = 0;
          this.resetChips();

          player.chips = this.getBalancedChips(player.funds);
          this.addChips(stage);
          this.updateScores();
          game.message.text.text = messages.bet;
        };

        const tweens = [];
        if (game.dealtChipContainer) {
          tweens.push(
            createjs.Tween.get(game.dealtChipContainer).to({ alpha: 0 }, 500)
          );
        }
        if (player.cardsContainer) {
          tweens.push(
            createjs.Tween.get(player.cardsContainer).to({ alpha: 0 }, 500)
          );
        }
        if (bank.cardsContainer) {
          tweens.push(
            createjs.Tween.get(bank.cardsContainer).to({ alpha: 0 }, 500)
          );
        }

        if (tweens.length > 0) {
          tweens[tweens.length - 1].call(fadeOutComplete);
        } else {
          fadeOutComplete();
        }
      }, 2000);
    },

    reset() {
      this.gameControl = {
        gamesPlayed: 0,
        phase: 1,
        consecutiveLosses: 0,
        needTwoLosses: false,
      };
      location.reload();
    },
  };

  // --- Titik Mulai Permainan dari kode asli ---
  game.message = {
    text: null,
    init(stageRef) {
      this.text = new createjs.Text(
        messages.bet,
        'bold 40px \'Playfair Display\', serif',
        '#e2b344'
      );
      this.text.x = layout.mainMessage.x;
      this.text.y = layout.mainMessage.y;
      this.text.textAlign = 'left';
      this.text.shadow = new createjs.Shadow('#000000', 3, 3, 6);
      stageRef.addChild(this.text);
    },
  };

  game.message.init(stage);

  player.fundsText.init = function (stageRef) {
    this.text = new createjs.Text(
      `Chips: ${player.funds}`,
      '22px \'Roboto\', sans-serif',
      '#e2b344'
    );
    this.text.x = layout.chipInfo.x;
    this.text.y = layout.chipInfo.y;
    this.text.textAlign = 'right';
    this.text.shadow = new createjs.Shadow('#000000', 2, 2, 4);
    stageRef.addChild(this.text);
  };

  player.fundsText.init(stage);

  player.name.text = new createjs.Text(
    player.name.value,
    'bold 24px \'Roboto\', sans-serif',
    '#f5f5f5'
  );
  player.name.text.x = layout.playerInfo.x;
  player.name.text.y = layout.playerInfo.y;
  player.name.text.shadow = new createjs.Shadow('#000000', 2, 2, 4);
  stage.addChild(player.name.text);

  player.scoreText = new createjs.Text(
    '',
    'bold 24px \'Roboto\', sans-serif',
    '#e2b344'
  );
  player.scoreText.x = layout.scoreBox.playerX;
  player.scoreText.y = layout.scoreBox.playerY;
  player.scoreText.alpha = 0;
  player.scoreText.shadow = new createjs.Shadow('#000000', 2, 2, 4);

  bank.scoreText = new createjs.Text(
    '',
    'bold 24px \'Roboto\', sans-serif',
    '#e2b344'
  );
  bank.scoreText.x = layout.scoreBox.bankX;
  bank.scoreText.y = layout.scoreBox.bankY;
  bank.scoreText.alpha = 0;
  bank.scoreText.shadow = new createjs.Shadow('#000000', 2, 2, 4);

  stage.addChild(player.scoreText, bank.scoreText);

  game.buildDeck();
  game.addButtons(stage);
  player.chips = game.getBalancedChips(player.funds);
  game.addChips(stage);

  // [[MODIFIKASI]] Panggil fungsi game over jika chip habis saat game dimuat
  if (player.funds <= 0) {
    game.showGameOverScreen();
  }
}

function getGameInstances() {
  return { game, player, bank };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, getGameInstances };
}

window.toggleMusic = function (enabled) {
  if (enabled) {
    if (!createjs.Sound.isPlaying) {
      createjs.Sound.play('background-music', {
        loop: -1,
        volume: 0.3,
        speed: 0.5,
      });
    }
  } else {
    createjs.Sound.stop('background-music');
  }
};
