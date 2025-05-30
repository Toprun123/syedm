/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `ui_renderer.js`
 * @requires `constants.js`
 * @requires `utils.js`
 * @requires `game_renderer.js`
 * @requires `event_bus.js`
 */

import { SECTOR_SIZE, DETAIL_THRESHOLD } from "./constants.js";
import { LOOPS, convert } from "./utils.js";
import GameRenderer from "./game_renderer.js";
import EventBus from "./event_bus.js";

/**
 * @name UIRenderer
 * @access public
 * @extends GameRenderer
 * @classdesc Entry point for game rendering & ui renderer
 * @exports UIRenderer
 * @default
 */
export default class UIRenderer extends GameRenderer {
  /**
   * @constructs UIRenderer
   * @function constructor
   * @description Initializes the renderer
   * @param {Image} img
   * @param {Object} game_pos
   * @param {Uint32Array} key
   * @param {EventBus} bus
   */
  constructor(img, game_pos, key, bus) {
    super(img, game_pos, key, bus);
    /** @type {Function} - Bound `loop` function so `requestAnimationFrame` keeps `this` context */
    this.loop = this.loop.bind(this);
    /** @type {number} - ID of the animation frame */
    this.frame_id = undefined;
    /** @listens EventBus#start */
    this.bus.on("start", this.loop);
    /** @listens EventBus#drag */
    this.bus.on("drag", this.drag.bind(this));
    /** @listens EventBus#resize */
    this.bus.on("resize", this.resize.bind(this));
    /** @listens EventBus#update_key */
    this.bus.on("update_key", this.updateKey.bind(this));
    /** @listens EventBus#zoom */
    this.bus.onRetrievable("zoom", this.zoom.bind(this));
    /** @listens EventBus#is_buy_button */
    this.bus.onRetrievable("is_buy_button", this.isBuyButton.bind(this));
    /** @listens EventBus#sector_bounds */
    this.bus.onRetrievable("sector_bounds", this.sectorBounds.bind(this));
    /** @listens EventBus#click_convert */
    this.bus.onRetrievable("click_convert", this.clickConvert.bind(this));
  }
  /**
   * @function loop
   * @description Loops the animation frame and calls `draw`
   */
  loop() {
    this.draw();
    this.frame_id = requestAnimationFrame(this.loop);
  }
  /**
   * @function drag
   * @description Updates the offset
   * @param {number} x - X-offset
   * @param {number} y - Y-offset
   */
  drag(x, y) {
    this.offset[0] += x;
    this.offset[1] += y;
  }
  /**
   * @function resize
   * @description Resizes the canvas
   */
  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }
  /**
   * @function updateKey
   * @description Updates the key
   * @param {Uint32Array} key
   */
  updateKey(key) {
    this.key = key;
  }
  /**
   * @function zoom
   * @description Zooms in or out
   * @param {number} x - X-coordinate of center of zoom
   * @param {number} y - Y-coordinate of center of zoom
   * @param {boolean} is_zoom_in - True if zooming in, false if zooming out
   */
  zoom(x, y, is_zoom_in) {
    const NEW_TILE_SIZE = Math.max(
      10,
      Math.min(is_zoom_in ? this.tile_size * 1.1 : this.tile_size / 1.1, 100),
    );
    this.offset[0] =
      x - ((x - this.offset[0]) * NEW_TILE_SIZE) / this.tile_size;
    this.offset[1] =
      y - ((y - this.offset[1]) * NEW_TILE_SIZE) / this.tile_size;
    this.tile_size = NEW_TILE_SIZE;
    this.sector_pixel_size = SECTOR_SIZE * this.tile_size;
    this.hide_details = this.tile_size < DETAIL_THRESHOLD;
    this.border_width = this.hide_details ? 0 : this.tile_size * 0.065;
    return this.hide_details;
  }
  /**
   * @function isBuyButton
   * @description Checks if the tile is a buy button
   * @param {number} x - X-coordinate of the tile
   * @param {number} y - Y-coordinate of the tile
   * @returns {boolean} True if the tile is a buy button, false otherwise
   */
  isBuyButton(x, y) {
    const [S_X, S_Y, X, Y] = convert(true, x, y);
    const START_X = -Math.floor(this.offset[0] / this.sector_pixel_size);
    const START_Y = -Math.ceil(this.offset[1] / this.sector_pixel_size);
    let found = false;
    LOOPS.overOnScreenSectors(
      (s_x, s_y) => {
        if (
          this.game_pos.lost_sectors.hasOwnProperty(`${s_x}:${s_y}`) &&
          s_x === S_X &&
          s_y === S_Y &&
          X > 1 &&
          X < 7 &&
          Y > 2 &&
          Y < 6
        ) {
          found = true;
        }
      },
      START_X,
      START_Y,
      this.sector_pixel_size,
      this.canvas,
    );
    return found;
  }
  /**
   * @function sectorBounds
   * @description Returns the sector bounds
   * @returns {Array} - Array of [start_x, start_y, end_x, end_y]
   */
  sectorBounds() {
    const START_X = -Math.floor(this.offset[0] / this.sector_pixel_size);
    const START_Y = -Math.ceil(this.offset[1] / this.sector_pixel_size);
    return [
      START_X,
      START_Y,
      Math.ceil(START_X + this.canvas.width / this.sector_pixel_size + 1),
      Math.ceil(START_Y + this.canvas.height / this.sector_pixel_size + 1),
    ];
  }
  /**
   * @function clickConvert
   * @description Converts raw click coords to sector adjusted coords
   * @param {number} x - X-coordinate of the click
   * @param {number} y - Y-coordinate of the click
   * @returns {Array} - Array of [x, y]
   */
  clickConvert(x, y) {
    return [
      Math.floor((x - this.offset[0]) / this.tile_size),
      Math.floor((y - this.offset[1]) / this.tile_size),
    ];
  }
}
