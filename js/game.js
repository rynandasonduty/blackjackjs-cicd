/* eslint-disable no-unused-vars */
/* global Button, TextInput, deckNumber, suits, Card, rand, tick */

// Declare global game object and module-scoped variables for testing
let game;
let player;
let bank;

function init() {
  const stage = new createjs.Stage('canvas');

  game = {
    deck: [],
    chipsValue: {
      blue: 500,
      black: 100,
      green: 25,
      red: 5,
      white: 1,
    },
    startContainer: false,
    buttons: [
      new Button('Hit', '#008080', 100, 100, () => player.hit()),
      new Button('Stand', '#A52A2A', 300, 100, () => player.stand()),
      new Button('Go', '#4682B4', 935, -430, () => game.go()),
      new Button('Insurance', '#A0522D', 100, -130, () => player.insure()),
      new Button('Double', '#483D8B', 100, -65, () => player.double()),
      new Button('Give up', '#696969', 100, 0, () => player.giveUp()),
      new Button('New game', '#A52A2A', 100, -490, () => game.reset()),
    ],
    buttonContainer: false,
    dealtChipContainer: false,
    inProgress: false,
    dealt: {
      blue: 0,
      black: 0,
      green: 0,
      red: 0,
      white: 0,
    },

    gameControl: {
      gamesPlayed: 0,
      phase: 1,
      consecutiveLosses: 0,
      needTwoLosses: false,
    },

    resetChips() {
      Object.keys(this.dealt).forEach((color) => {
        this.dealt[color] = 0;
      });
    },

    message: {
      text: false,
      init() {
        this.text = new createjs.Text(
          messages.bet,
          'bold 40px \'Arial\', sans-serif',
          '#FFD700'
        );
        this.text.x = 850;
        this.text.y = 20;
        this.text.shadow = new createjs.Shadow('#000000', 3, 3, 5);
        stage.addChild(this.text);
      },
    },

    _alert(msg) {
      const alertText = new createjs.Text(
        msg.msg,
        'bold 30px \'Arial\', sans-serif',
        'orange'
      );
      alertText.x = msg.x || 745;
      alertText.y = 120;
      alertText.shadow = new createjs.Shadow('#000000', 2, 2, 4);
      stage.addChild(alertText);
      createjs.Tween.get(alertText)
        .wait(1500)
        .to({ alpha: 0, y: alertText.y - 20 }, 1000, createjs.Ease.quadOut);
    },

    reset() {
      ['userName', 'chips', 'funds'].forEach((v) =>
        localStorage.removeItem(`BlackJackJs-${v}`)
      );
      this.gameControl = {
        gamesPlayed: 0,
        phase: 1,
        consecutiveLosses: 0,
        needTwoLosses: false,
      };
      location.reload();
    },

    over() {
      stage.removeAllChildren();
      const gameOverText = new createjs.Text(
        'GAME OVER, STOP ONLINE GAMBLING',
        'bold 40px \'Arial\'',
        '#FF0000'
      );
      gameOverText.textAlign = 'center';
      gameOverText.lineWidth = stage.canvas.width - 50;
      gameOverText.x = stage.canvas.width / 2;
      gameOverText.y = stage.canvas.height / 2 - 30;
      gameOverText.shadow = new createjs.Shadow('#000000', 5, 5, 10);

      const buttonWidth = 150;
      const centeredButtonX = (stage.canvas.width - buttonWidth) / 2;
      const replayButton = new Button(
        'Replay',
        '#008080',
        centeredButtonX,
        gameOverText.y + 80,
        () => game.reset()
      ).createVisual();

      stage.addChild(gameOverText, replayButton);
    },

    balanceChips(value) {
      const chips = {
        blue: 0,
        black: 0,
        green: 0,
        red: 0,
        white: 0,
      };
      const sortedChipColors = ['blue', 'black', 'green', 'red', 'white'];

      for (const color of sortedChipColors) {
        const chipValue = this.chipsValue[color];
        while (value >= chipValue) {
          value -= chipValue;
          chips[color]++;
        }
      }

      return chips;
    },

    getBalancedChips(value) {
      const chips = this.balanceChips(value);

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

    showResultPopup(message, outcome, onContinue) {
      const popupContainer = new createjs.Container();

      const overlay = new createjs.Shape();
      overlay.graphics
        .beginFill('rgba(0,0,0,0.7)')
        .drawRect(0, 0, stage.canvas.width, stage.canvas.height);
      popupContainer.addChild(overlay);

      const panelWidth = 500;
      const panelHeight = 250;
      const panel = new createjs.Shape();
      const panelColor = outcome === 'win' ? '#008080' : '#A52A2A';
      panel.graphics
        .beginFill('#1C1C1C')
        .beginStroke(panelColor)
        .setStrokeStyle(4)
        .drawRoundRect(0, 0, panelWidth, panelHeight, 20);
      panel.x = (stage.canvas.width - panelWidth) / 2;
      panel.y = (stage.canvas.height - panelHeight) / 2;
      panel.shadow = new createjs.Shadow('#000000', 5, 5, 15);
      popupContainer.addChild(panel);

      const resultText = new createjs.Text(
        message,
        'bold 32px \'Arial\', sans-serif',
        '#FFFFFF'
      );
      resultText.textAlign = 'center';
      resultText.lineWidth = panelWidth - 40;
      resultText.x = stage.canvas.width / 2;
      resultText.y = panel.y + 60;
      resultText.shadow = new createjs.Shadow(panelColor, 0, 0, 15);
      popupContainer.addChild(resultText);

      const continueButton = new Button(
        'Continue',
        '#4682B4',
        (stage.canvas.width - 150) / 2,
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

    startScreen() {
      stage.enableMouseOver(10);
      createjs.Ticker.addEventListener('tick', tick);
      createjs.Ticker.setFPS(60);

      const sounds = [
        { src: 'assets/sounds/sfx_lose.ogg', id: 'lose' },
        { src: 'assets/sounds/sfx_shieldUp.ogg', id: 'win' },
        { src: 'assets/Bonus/cardPlace1.ogg', id: 'card' },
        { src: 'assets/Bonus/chipsCollide1.ogg', id: 'chip' },
        { src: 'assets/music/nama_lagu_anda.mp3', id: 'background-music' },
      ];

      createjs.Sound.registerSounds(sounds);

      createjs.Sound.on('fileload', (event) => {
        if (event.id === 'background-music') {
          createjs.Sound.play('background-music', { loop: -1, volume: 0.3 });
        }
      });
      createjs.Sound.on('fileerror', (event) => {
        console.error('Error memuat suara:', event.src);
      });

      if (localStorage.getItem('BlackJackJs-userName')) {
        player.name.value = localStorage.getItem('BlackJackJs-userName');
        player.funds = localStorage.getItem('BlackJackJs-funds');
        player.chips = JSON.parse(localStorage.getItem('BlackJackJs-chips'));
        this.start();
      } else {
        this.startContainer = new createjs.Container();
        const titleText = new createjs.Text(
          'BlackJackJs',
          'bold 70px \'Arial\', sans-serif',
          '#FFD700'
        );
        titleText.center(1, 1);
        titleText.shadow = new createjs.Shadow('#000000', 5, 5, 10);

        const nameInput = new TextInput();
        nameInput.x = (stage.canvas.width - nameInput.width) / 2;
        nameInput.y = 400;

        const buttonWidth = 150;
        const centeredButtonX = (stage.canvas.width - buttonWidth) / 2;

        const submitButton = new Button(
          'Play',
          '#008080',
          centeredButtonX,
          470,
          () => {
            player.name.value = nameInput._preCursorText || 'Player 1';
            localStorage.setItem('BlackJackJs-userName', player.name.value);
            localStorage.setItem('BlackJackJs-funds', '1000');
            localStorage.setItem(
              'BlackJackJs-chips',
              JSON.stringify(player.chips)
            );
            game.start();
          }
        ).createVisual();

        this.startContainer.addChild(titleText, nameInput, submitButton);
        stage.addChild(this.startContainer);
      }
    },

    start() {
      player.name.text = new createjs.Text(
        player.name.value,
        'bold 30px \'Arial\', sans-serif',
        '#FFFFFF'
      );
      player.name.text.center();
      player.name.text.y = 600;
      player.name.text.shadow = new createjs.Shadow('#000000', 2, 2, 4);
      stage.addChild(player.name.text);
      if (this.startContainer) {
        this.startContainer.removeAllChildren();
      }
      this.message.init();
      player.fundsText.init();
      this.buildDeck();
      this.addButtons();
      this.addChips();
    },

    go() {
      if (player.dealt && !this.inProgress) {
        game.inProgress = true;
        player.betted = true;
        this.message.text.text = '';
        this.new();
      } else if (!player.dealt) {
        game._alert(messages.warning.bet);
      }
    },

    end() {
      game.dealtChipContainer.removeAllChildren();
      game.inProgress = false;
      player.betted = false;
      player.insurance = false;
      player.doubled = false;
      player.deck = [];
      player.blackjack = false;
      bank.blackjack = false;
      bank.deck = [];
      player.dealt = 0;
      player.chips = game.getBalancedChips(player.funds);
      game.resetChips();
      game.addChips();
      player.store();
      bank.cardsContainer.removeAllChildren();
      player.cardsContainer.removeAllChildren();
      this.message.text.text = messages.bet;

      this.gameControl.gamesPlayed++;

      if (
        this.gameControl.phase === 1 &&
        this.gameControl.gamesPlayed >= 3 &&
        !this.gameControl.needTwoLosses
      ) {
        this.gameControl.phase = 2;
      }
    },

    new() {
      bank.cardsContainer.x = player.cardsContainer.x = 450;
      this.distributeCard('player');
      setTimeout(() => {
        game.distributeCard('player');
        setTimeout(() => {
          game.distributeCard('bank');
          setTimeout(() => {
            game.distributeCard('bank', true);
          }, 750);
        }, 750);
      }, 750);
    },

    buildDeck() {
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
        if (card.value >= 2 && card.value < 11) {
          total += card.value;
        }
        if (['J', 'Q', 'K'].includes(card.value)) {
          total += 10;
        }
        if (card.value === 'A') {
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

    distributeCard(to, hidden = false) {
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

      if (to === 'bank') {
        bank.deck.push(card);
      } else if (to === 'player') {
        player.deck.push(card);
      }

      const cardIndex = this.deck.indexOf(card);
      this.deck.splice(cardIndex, 1);

      this.displayCard(card, to);
    },

    flipCard(cardBitmap, cardData) {
      createjs.Tween.get(cardBitmap)
        .to({ scaleX: 0 }, 200, createjs.Ease.quadIn)
        .call(() => {
          cardBitmap.image.src = imgs.cards.get(cardData.suit, cardData.value);
        })
        .to({ scaleX: 1 }, 200, createjs.Ease.quadOut);
    },

    displayCard(card, owner) {
      if (!bank.cardsContainer) {
        bank.cardsContainer = new createjs.Container();
        bank.cardsContainer.y = -100;
        stage.addChild(bank.cardsContainer);
        bank.cardsContainer.x = 450;
      }
      if (!player.cardsContainer) {
        player.cardsContainer = new createjs.Container();
        player.cardsContainer.y = 300;
        stage.addChild(player.cardsContainer);
        player.cardsContainer.x = 450;
      }

      createjs.Sound.play('card');
      const cardBitmap = new createjs.Bitmap(
        card.hidden
          ? `${imgs.cards.path}${imgs.cards.back.red}.${imgs.cards.ext}`
          : imgs.cards.get(card.suit, card.value)
      );

      cardBitmap.shadow = new createjs.Shadow('rgba(0,0,0,0.4)', 4, 4, 8);

      if (owner === 'bank') {
        cardBitmap.x = 0;
        cardBitmap.y = -100;
        bank.cardsContainer.addChild(cardBitmap);
        createjs.Tween.get(cardBitmap).to(
          { x: 50 * (bank.deck.length - 1), y: 100 },
          750,
          createjs.Ease.getPowInOut(1)
        );
        bank.cardsContainer.x -= 20;
      } else if (owner === 'player') {
        cardBitmap.x = 100;
        cardBitmap.y = -400;
        player.cardsContainer.addChild(cardBitmap);
        createjs.Tween.get(cardBitmap).to(
          { x: 50 * (player.deck.length - 1), y: 100 },
          750,
          createjs.Ease.getPowInOut(1)
        );
        player.cardsContainer.x -= 20;
        if (this.deckValue(player.deck) > 21) {
          player.lose();
        }
      }
    },

    addButtons() {
      this.buttonContainer = new createjs.Container();
      this.buttonContainer.x = -70;
      this.buttonContainer.y = 500;
      stage.addChild(this.buttonContainer);

      this.buttons.forEach((b) => {
        const button = b.createVisual();
        game.buttonContainer.addChild(button);
      });
    },

    addChips() {
      if (!player.chipsContainer) {
        player.chipsContainer = new createjs.Container();
        player.chipsContainer.x = 600;
        player.chipsContainer.y = 500;

        game.dealtChipContainer = new createjs.Container();
        stage.addChild(player.chipsContainer, game.dealtChipContainer);
      } else {
        player.chipsContainer.removeAllChildren();
      }

      const base = { x: 100, y: 45 };
      for (const chip in player.chips) {
        if (Object.prototype.hasOwnProperty.call(player.chips, chip)) {
          for (let i = 0; i < player.chips[chip]; i++) {
            const chipImg = new createjs.Bitmap(imgs.chips.get(chip, 'side'));
            chipImg.x = base.x;
            chipImg.y = base.y;
            chipImg.color = chip;
            chipImg.dealt = false;
            chipImg.shadow = new createjs.Shadow('#000000', 3, 3, 5);
            player.chipsContainer.addChild(chipImg);
            base.y -= 10;
            if (i === player.chips[chip] - 1) {
              chipImg.cursor = 'Pointer';
              chipImg.on('mouseover', (event) => {
                event.currentTarget.scaleX = 1.1;
                event.currentTarget.scaleY = 1.1;
                event.currentTarget.y -= 8;
              });
              chipImg.on('mouseout', (event) => {
                event.currentTarget.scaleX = 1;
                event.currentTarget.scaleY = 1;
                event.currentTarget.y += 8;
              });
              chipImg.addEventListener('click', (event) =>
                game.throwChip(event.currentTarget)
              );
            }
          }
          base.y = 45;
          base.x += 75;
        }
      }
    },

    throwChip(chip) {
      if (chip.dealt || game.inProgress) {
        return;
      }
      chip.dealt = true;
      createjs.Sound.play('chip');
      player.chipsContainer.removeChildAt(
        player.chipsContainer.getChildIndex(chip)
      );
      chip.x = chip.x + player.chipsContainer.x;
      chip.y = chip.y + player.chipsContainer.y;
      game.dealtChipContainer.addChild(chip);
      createjs.Tween.get(chip).to(
        { x: rand(350, 675), y: rand(190, 350) },
        750,
        createjs.Ease.quadOut
      );
      const color = chip.color;
      player.dealt += this.chipsValue[color];
      player.chips[color] -= 1;
      player.funds -= game.chipsValue[color];
      player.fundsText.update();
      game.dealt[color] += 1;
      this.addChips();
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
      } else if (bank.blackjack) {
        return player.lose();
      } else if (player.blackjack) {
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
  };

  bank = {
    deck: [],
    cardsContainer: false,
    blackjack: false,

    play() {
      if (player.doubled && player.deck.length > 2) {
        game.flipCard(player.cardsContainer.children[2], player.deck[2]);
      }

      if (this.deck.length === 2) {
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

  player = {
    deck: [],
    name: {
      value: 'Player 1',
      text: false,
    },
    cardsContainer: false,
    chipsContainer: false,
    blackjack: false,
    insurance: false,
    doubled: false,
    funds: 1000,
    fundsText: {
      text: false,
      init() {
        this.text = new createjs.Text(
          player.funds,
          'bold 30px \'Arial\', sans-serif',
          '#FFFFFF'
        );
        this.text.x = 880;
        this.text.y = 590;
        this.text.shadow = new createjs.Shadow('#000000', 2, 2, 4);
        stage.addChild(this.text);
      },
      update() {
        this.text.text = player.funds;
      },
    },
    betted: false,
    dealt: 0,
    chips: {
      blue: 1,
      black: 3,
      green: 5,
      red: 11,
      white: 20,
    },

    hit() {
      if (this.betted) {
        if (this.doubled && this.deck.length !== 2) {
          return game._alert(messages.warning.hit);
        } else if (this.doubled) {
          return game.distributeCard('player', true);
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
        this.fundsText.update();
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
          this.store();
          game.addChips();
          for (const chip in game.dealt) {
            if (Object.prototype.hasOwnProperty.call(game.dealt, chip)) {
              for (let i = 0; i < game.dealt[chip]; i++) {
                const chipImg = new createjs.Bitmap(
                  imgs.chips.get(chip, 'side')
                );
                chipImg.x = rand(350, 675);
                chipImg.y = rand(190, 350);
                chipImg.color = chip;
                chipImg.dealt = true;
                game.dealtChipContainer.addChild(chipImg);
              }
            }
          }
          for (const chip in game.dealt) {
            if (Object.prototype.hasOwnProperty.call(game.dealt, chip)) {
              if (game.dealt[chip]) {
                game.dealt[chip] *= 2;
              }
            }
          }
          player.fundsText.update();
        } else {
          game._alert(messages.warning.funds);
        }
      } else {
        game._alert(messages.warning.double);
      }
    },

    giveUp() {
      if (game.inProgress && this.deck.length === 2 && bank.deck.length === 2) {
        game._alert(messages.warning.gaveUp);
        this.funds += Math.round(this.dealt / 2);
        this.chips = game.getBalancedChips(this.funds);
        this.fundsText.update();
        player.store();
        game.addChips();
        game.end();
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
        player.funds += player.blackjack ? player.dealt * 3 : player.dealt * 2;
        game.end();
        player.fundsText.update();
      });
    },

    lose() {
      if (game.gameControl.needTwoLosses) {
        game.gameControl.consecutiveLosses++;
      }
      if (this.doubled && this.deck.length === 3) {
        game.flipCard(this.cardsContainer.children[2], this.deck[2]);
      }

      let messageToShow;
      if (player.funds <= 0) {
        messageToShow = 'Anda kalah, stop judi online.';
      } else {
        messageToShow = messages.lose;
      }

      game.showResultPopup(messageToShow, 'lose', () => {
        createjs.Sound.play('lose');
        if (bank.blackjack && player.insurance) {
          player.funds += player.insurance * 2;
          this.chips = game.getBalancedChips(player.funds);
          player.fundsText.update();
        }
        if (player.funds <= 0) {
          return game.over();
        }
        game.end();
      });
    },

    draw() {
      game.showResultPopup(messages.draw, 'draw', () => {
        if (bank.blackjack && player.insurance) {
          player.funds += player.insurance * 2;
          this.chips = game.getBalancedChips(player.funds);
          player.fundsText.update();
        }
        player.funds += player.dealt;
        player.fundsText.update();
        game.end();
      });
    },

    store() {
      localStorage.setItem('BlackJackJs-funds', this.funds);
      localStorage.setItem('BlackJackJs-chips', JSON.stringify(this.chips));
    },
  };

  function tick() {
    stage.update();
  }

  game.startScreen();
}

// Function for Jest tests to access internal instances
function getGameInstances() {
  return { game, player, bank };
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { init, getGameInstances };
} else if (typeof global !== 'undefined') {
  global.game = game;
}
