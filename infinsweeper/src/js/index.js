/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `index.js`
 * @requires `game_controller.js`
 */

import GameController from "./game_controller.js";

/**
 * @event DOMContentLoaded
 */
document.addEventListener("DOMContentLoaded", () => {
  /**
   * @name game
   * @type {GameController}
   * @description The game controller instance.
   * @access public
   */
  window.game = new GameController();
  window.game.init();
});
