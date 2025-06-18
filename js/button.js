// =================================================================
//          FILE: js/button.js (Peningkatan Visual)
// =================================================================
// Deskripsi: Kelas Button didesain ulang untuk mendukung tema visual
//            baru, dengan palet warna spesifik untuk setiap aksi.
// =================================================================

/**
 * Button class for creating interactive buttons with modern styling.
 */
class Button {
  /**
   * Creates a new Button instance.
   * @param {string} text - The text to display on the button.
   * @param {string} type - The type of button ('primary' or 'secondary'), used as a fallback.
   * @param {number} x - The x-coordinate.
   * @param {number} y - The y-coordinate.
   * @param {Function} onclick - The function to call on click.
   */
  constructor(text, type, x, y, onclick) {
    this.text = text;
    this.type = type;
    this.x = x;
    this.y = y;
    this.onclick = onclick;

    this.width = 150;
    this.height = 50;
    this.font = "bold 20px 'Roboto', sans-serif";
    this.depth = 4;
    this.radius = 12;

    // [[PERBAIKAN]] Palet warna spesifik berdasarkan teks tombol dengan nuansa lebih gelap dan elegan
    switch (text) {
      case 'Go':
      case 'New Game':
      case 'Continue':
        this.gradientColors = ['#D4AF37', '#B8860B']; // Emas Tua
        this.hoverGradient = ['#E0C46B', '#C99A30'];
        this.textColor = '#FFFFFF';
        this.shadowColor = '#8C6400';
        this.borderColor = '#F0E68C';
        break;
      case 'Hit':
        this.gradientColors = ['#2F855A', '#276749']; // Hijau Gelap (Forest Green)
        this.hoverGradient = ['#38A169', '#2F855A'];
        this.textColor = '#F7FAFC';
        this.shadowColor = '#1C4532';
        this.borderColor = '#9AE6B4';
        break;
      case 'Stand':
        this.gradientColors = ['#2C5282', '#2A4365']; // Biru Tua (Navy)
        this.hoverGradient = ['#3182CE', '#2B6CB0'];
        this.textColor = '#F7FAFC';
        this.shadowColor = '#1A365D';
        this.borderColor = '#90CDF4';
        break;
      case 'Double':
        this.gradientColors = ['#C53030', '#9B2C2C']; // Merah Tua (Crimson)
        this.hoverGradient = ['#E53E3E', '#C53030'];
        this.textColor = '#F7FAFC';
        this.shadowColor = '#742A2A';
        this.borderColor = '#FEB2B2';
        break;
      case 'Insurance':
      case 'Surrender':
        this.gradientColors = ['#6A7584', '#4A5568']; // Abu-abu Gelap
        this.hoverGradient = ['#A0AEC0', '#718096'];
        this.textColor = '#F7FAFC';
        this.shadowColor = '#2D3748';
        this.borderColor = '#E2E8F0';
        break;
      default: // Fallback
        this.gradientColors = ['#6A7584', '#4A5568'];
        this.hoverGradient = ['#A0AEC0', '#718096'];
        this.textColor = '#F7FAFC';
        this.shadowColor = '#2D3748';
        this.borderColor = '#E2E8F0';
        break;
    }
  }

  /**
   * Creates the button visual representation.
   * @returns {createjs.Container} The button container.
   */
  createVisual() {
    const button = new createjs.Container();
    button.x = this.x;
    button.y = this.y;
    button.cursor = 'pointer';

    const buttonShadow = new createjs.Shape();
    buttonShadow.graphics
      .beginFill(this.shadowColor)
      .drawRoundRect(0, this.depth, this.width, this.height, this.radius);
    button.addChild(buttonShadow);

    const background = new createjs.Shape();

    const drawGradient = (colors) => {
      background.graphics
        .clear()
        .beginLinearGradientFill(colors, [0, 1], 0, 0, 0, this.height)
        .beginStroke(this.borderColor)
        .setStrokeStyle(1)
        .drawRoundRect(0, 0, this.width, this.height, this.radius);
    };

    drawGradient(this.gradientColors);
    button.addChild(background);

    const buttonText = new createjs.Text(this.text, this.font, this.textColor);
    buttonText.textAlign = 'center';
    buttonText.textBaseline = 'middle';
    buttonText.x = this.width / 2;
    buttonText.y = this.height / 2;
    button.addChild(buttonText);

    button.on('mouseover', (evt) => {
      drawGradient(this.hoverGradient);
      createjs.Tween.get(evt.currentTarget, { override: true }).to(
        { scale: 1.05 },
        200,
        createjs.Ease.quadOut
      );
    });

    button.on('mouseout', (evt) => {
      drawGradient(this.gradientColors);
      createjs.Tween.get(evt.currentTarget, { override: true }).to(
        { scale: 1.0 },
        200,
        createjs.Ease.quadOut
      );
      background.y = 0;
      buttonText.y = this.height / 2;
    });

    button.on('mousedown', () => {
      background.y = this.depth;
      buttonText.y = this.height / 2 + this.depth;
      buttonShadow.visible = false;
    });

    button.on('pressup', () => {
      background.y = 0;
      buttonText.y = this.height / 2;
      buttonShadow.visible = true;
      if (this.onclick) {
        this.onclick();
      }
    });

    return button;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Button;
}
