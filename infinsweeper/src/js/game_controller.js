/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `game_controller.js`
 * @requires `constants.js`
 * @requires `utils.js`
 * @requires `event_bus.js`
 * @requires `event_handler.js`
 * @requires `ui_renderer.js`
 * @requires `game_logic.js`
 * @requires `saver.js`
 */

import { SECTOR_SIZE, MAX_TRIES } from "./constants.js";
import { DataHasher } from "./utils.js";
import EventBus from "./event_bus.js";
import EventHandler from "./event_handler.js";
import UIRenderer from "./ui_renderer.js";
import GameLogic from "./game_logic.js";
import Saver from "./saver.js";

/**
 * @name GameController
 * @access public
 * @classdesc Entry point for all the game logic
 * @exports GameController
 * @default
 */
export default class GameController {
  /**
   * @constructs GameController
   * @function
   * @desc Initializes the game controller
   * @param {string} seed - Seed for the game
   */
  constructor(seed) {
    this.is_seeded = seed !== undefined;
    /** @type {string} - Seed for the game (by default a stringified 16 digit random number) */
    this.seed = seed || (Math.floor(Math.random() * 9e15) + 1e15).toString();
    /** @type {Uint32Array} */
    this.key = DataHasher.generate_key(this.seed);
    this.game_pos = {
      data_sectors: {},
      cached_sectors: {},
      lost_sectors: {},
      animated_tiles: { flagged: {}, revealed: {}, hidden: {}, bombed: {} },
      animated_sectors: { solved: {}, lost: {}, bought: {} },
    };
    this.img = new Image();
    this.bus = new EventBus();
    this.game_logic = new GameLogic(this.game_pos, this.key, this.bus);
    this.renderer = new UIRenderer(this.img, this.game_pos, this.key, this.bus);
    this.event_handler = new EventHandler(this.renderer.canvas, this.bus);
    this.saver = new Saver(this, this.bus);
    /** @listens EventBus#reset */
    this.bus.on("reset", this.reset.bind(this));
  }
  /**
   * @function init
   * @desc Initializes the game
   * @async
   */
  async init() {
    try {
      await this.loadImage();
    } catch (err) {
      console.error("Failed to load image:", err);
    }
    this.start();
  }
  /**
   * @function loadImage
   * @desc Loads the game image
   * @returns {Promise<void>} - Promise that resolves when the image is loaded
   * @throws {Error} - If the image fails to load
   */
  loadImage() {
    return new Promise((resolve, reject) => {
      this.img.onload = () => resolve();
      this.img.onerror = () => reject(new Error("Image failed to load"));
      this.img.src = "src/assets/img/minesweeper.png";
    });
  }
  /**
   * @function start
   * @desc Starts the game
   * @async
   * @param {number} tries - Number of times the game has been reset
   * @fires EventBus#start
   */
  async start(tries = 0) {
    if (this.bus.get("is_saved")) {
      this._loadSavedGame();
    } else {
      if (!(await this._tryOpening(tries))) return;
      this.bus.emit("start");
    }
  }
  /**
   * @function _loadSavedGame
   * @desc Loads a saved game
   * @access private
   * @fires EventBus#load_save
   * @fires EventBus#start_autosaver
   * @fires EventBus#start
   */
  _loadSavedGame() {
    this.bus.emit("load_save");
    this.bus.emit("start_autosaver");
    this.bus.emit("start");
  }
  /**
   * @function _tryOpening
   * @desc Tries to open the game
   * @async
   * @access private
   * @param {number} tries - Number of times the game has been reset
   * @returns {Promise<boolean>} - Promise that resolves to true if the game was opened successfully
   * @fires EventBus#reveal
   * @fires EventBus#start_autosaver
   */
  async _tryOpening(tries) {
    const CENTRE = (SECTOR_SIZE - 1) / 2;
    if (!this.is_seeded && tries < MAX_TRIES) {
      if (
        !(await this.bus.get(
          "reveal",
          CENTRE,
          CENTRE,
          undefined,
          undefined,
          true,
        ))
      ) {
        await this.reset(tries + 1);
        return false;
      }
    } else {
      this.bus.emit("reveal", CENTRE, CENTRE);
    }
    this.bus.emit("start_autosaver");
    return true;
  }
  /**
   * @function reset
   * @desc Resets the game
   * @async
   * @param {number} tries - Number of times the game has been reset
   */
  async reset(tries = 0) {
    this._clearGameState();
    this._generateNewSeed();
    await this.start(tries);
  }
  /**
   * @function _clearGameState
   * @desc Clears the game state
   * @access private
   */
  _clearGameState() {
    const {
      data_sectors,
      cached_sectors,
      lost_sectors,
      animated_tiles,
      animated_sectors,
    } = this.game_pos;
    [data_sectors, cached_sectors, lost_sectors].forEach((sector) => {
      for (const key in sector) delete sector[key];
    });
    [animated_tiles, animated_sectors].forEach((group) => {
      for (const type in group) group[type] = {};
    });
  }
  /**
   * @function _generateNewSeed
   * @desc Generates a new seed and key
   * @access private
   * @fires EventBus#update_key
   */
  _generateNewSeed() {
    this.seed = (Math.floor(Math.random() * 9e15) + 1e15).toString();
    this.key = DataHasher.generate_key(this.seed);
    this.bus.emit("update_key", this.key);
  }
}
