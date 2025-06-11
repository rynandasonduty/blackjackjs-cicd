/**
 * Button class for creating interactive 3D buttons with gradients
 */
class Button {
  /**
   * Creates a new Button instance
   * @param {string} text - Button text
   * @param {string} color - Button color (hex)
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Function} onclick - Click handler function
   */
  constructor(text, color, x, y, onclick) {
    this.text = text;
    this.color = color;

    // --- MODIFICATION: Define colors for the gradient ---
    this.gradientLight = this._lightenColor(color, 20);
    this.gradientDark = this._darkenColor(color, 20);

    this.hoverLight = this._lightenColor(color, 40);
    this.hoverDark = this._lightenColor(color, 20);

    this.shadowColor = 'rgba(0, 0, 0, 0.5)';
    this.borderColor = '#F5F5F5';

    this.x = x;
    this.y = y;
    this.onclick = onclick;
    this.width = 150;
    this.height = 50;
    this.font = 'bold 24px \'Arial\', sans-serif';
    this.textColor = '#FFFFFF';
    this.depth = 5;
  }

  /**
   * Darkens a hex color by a specified percentage.
   * @private
   */
  _darkenColor(hex, percent) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = parseInt((r * (100 - percent)) / 100);
    g = parseInt((g * (100 - percent)) / 100);
    b = parseInt((b * (100 - percent)) / 100);

    r = r < 0 ? 0 : r;
    g = g < 0 ? 0 : g;
    b = b < 0 ? 0 : b;

    const rHex =
      r.toString(16).length === 1 ? '0' + r.toString(16) : r.toString(16);
    const gHex =
      g.toString(16).length === 1 ? '0' + g.toString(16) : g.toString(16);
    const bHex =
      b.toString(16).length === 1 ? '0' + b.toString(16) : b.toString(16);

    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * Lightens a hex color by a specified percentage.
   * @private
   */
  _lightenColor(hex, percent) {
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);

    r = parseInt((r * (100 + percent)) / 100);
    g = parseInt((g * (100 + percent)) / 100);
    b = parseInt((b * (100 + percent)) / 100);

    r = r > 255 ? 255 : r;
    g = g > 255 ? 255 : g;
    b = b > 255 ? 255 : b;

    const rHex =
      r.toString(16).length === 1 ? '0' + r.toString(16) : r.toString(16);
    const gHex =
      g.toString(16).length === 1 ? '0' + g.toString(16) : g.toString(16);
    const bHex =
      b.toString(16).length === 1 ? '0' + b.toString(16) : b.toString(16);

    return `#${rHex}${gHex}${bHex}`;
  }

  /**
   * Creates the button visual representation
   * @returns {createjs.Container} The button container
   */
  createVisual() {
    const button = new createjs.Container();
    button.x = this.x;
    button.y = this.y;
    button.cursor = 'pointer';

    const buttonDepth = new createjs.Shape();
    buttonDepth.graphics
      .beginFill(this.shadowColor)
      .drawRoundRect(0, this.depth, this.width, this.height, 10);
    button.addChild(buttonDepth);

    const background = new createjs.Shape();

    // --- MODIFICATION: Use beginLinearGradientFill for the main button face ---
    const setGradient = (g, colors) => {
      g.clear()
        .beginLinearGradientFill(colors, [0, 1], 0, 0, 0, this.height)
        .beginStroke(this.borderColor)
        .setStrokeStyle(1)
        .drawRoundRect(0, 0, this.width, this.height, 10);
    };

    setGradient(background.graphics, [this.gradientLight, this.color]);
    button.addChild(background);

    const buttonText = new createjs.Text(this.text, this.font, this.textColor);
    buttonText.textAlign = 'center';
    buttonText.textBaseline = 'middle';
    buttonText.x = this.width / 2;
    buttonText.y = this.height / 2;
    button.addChild(buttonText);

    const originalY = {
      background: background.y,
      text: buttonText.y,
    };

    button.on('mouseover', () => {
      setGradient(background.graphics, [this.hoverLight, this.hoverDark]);
    });

    button.on('mouseout', () => {
      setGradient(background.graphics, [this.gradientLight, this.color]);
      background.y = originalY.background;
      buttonText.y = originalY.text;
    });

    button.on('mousedown', () => {
      // Inverted gradient for a "pressed" feel
      setGradient(background.graphics, [this.gradientDark, this.color]);
      background.y = this.depth;
      buttonText.y = this.height / 2 + this.depth;
    });

    button.on('pressup', () => {
      setGradient(background.graphics, [this.hoverLight, this.hoverDark]); // Back to hover state
      background.y = originalY.background;
      buttonText.y = originalY.text;
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
