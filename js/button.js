/**
 * Button class for creating interactive buttons
 */
class Button {
  /**
   * Creates a new Button instance
   * @param {string} text - Button text
   * @param {string} color - Button color
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Function} onclick - Click handler function
   */
  constructor(text, color, x, y, onclick) {
    this.text = text;
    this.color = color;
    this.x = x;
    this.y = y;
    this.onclick = onclick;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Button;
}
