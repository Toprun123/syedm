/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `game_renderer.js`
 * @requires `constants.js`
 * @requires `utils.js`
 * @requires `event_bus.js`
 */

import {
  TILE_STATES,
  COLORS,
  SOLVED,
  SECTOR_SIZE,
  ANIMATION_SPEED_BASE,
  DETAIL_THRESHOLD,
  CANVAS_ID,
} from "./constants.js";
import { DataHasher, LOOPS } from "./utils.js";
import EventBus from "./event_bus.js";

/**
 * @name GameRenderer
 * @access public
 * @classdesc Handles game rendering
 * @exports GameRenderer
 * @default
 */
export default class GameRenderer {
  /**
   * @constructs GameRenderer
   * @function constructor
   * @description Initializes the game renderer
   * @param {Image} img
   * @param {Object} game_pos
   * @param {Uint32Array} key
   * @param {EventBus} bus
   */
  constructor(img, game_pos, key, bus) {
    /** @type {HTMLCanvasElement} */
    this.canvas = document.getElementById(CANVAS_ID);
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    /** @type {CanvasRenderingContext2D} */
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.img = img;
    this.game_pos = game_pos;
    this.key = key;
    this.bus = bus;
    this.tile_size = 40;
    this.offset = [
      this.canvas.width / 2 -
        (this.tile_size * SECTOR_SIZE) / 2 +
        this.tile_size / 2,
      this.canvas.height / 2 -
        (this.tile_size * SECTOR_SIZE) / 2 +
        this.tile_size / 2,
    ];
    this.border_width = this.tile_size * 0.065;
    this.hide_details = false;
    this.sector_pixel_size = SECTOR_SIZE * this.tile_size;
    /** @listens EventBus#set_view_pos */
    this.bus.on("set_view_pos", this.setViewPos.bind(this));
    /** @listens EventBus#view_pos */
    this.bus.onRetrievable("view_pos", this.getViewPos.bind(this));
  }
  /**
   * @function getViewPos
   * @description Returns the current view position (for saving)
   * @return {Object} - The view position (offset, tile_size)
   */
  getViewPos() {
    return {
      offset: this.offset,
      tile_size: this.tile_size,
    };
  }
  /**
   * @function setViewPos
   * @description Sets the view position (from saved data)
   * @param {Object} view_pos - The view position (offset, tile_size)
   * @fires EventBus#disable_click - optionally
   */
  setViewPos(view_pos) {
    this.offset = view_pos.offset;
    this.tile_size = view_pos.tile_size;
    this.sector_pixel_size = SECTOR_SIZE * this.tile_size;
    this.hide_details = this.tile_size < DETAIL_THRESHOLD;
    if (this.hide_details) this.bus.emit("disable_click");
    this.border_width = this.hide_details ? 0 : this.tile_size * 0.065;
  }
  /**
   * @function drawGame
   * @description Draws the main game frame
   */
  drawGame() {
    this.ctx.fillStyle = !this.hide_details
      ? COLORS.BACKGROUND
      : COLORS.BACKGROUND_ZOOMED;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const START_X = -Math.floor(this.offset[0] / this.sector_pixel_size);
    const START_Y = -Math.ceil(this.offset[1] / this.sector_pixel_size);
    LOOPS.overOnScreenSectors(
      (s_x, s_y) => {
        const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
        const SECTOR =
          BOARD_SECTOR === SOLVED
            ? this.bus.get("request_cache", s_x, s_y) || false
            : BOARD_SECTOR || false;
        LOOPS.overTilesInSector((x, y) => {
          this.drawStaticTiles(SECTOR, s_x, s_y, x, y);
        });
      },
      START_X,
      START_Y,
      this.sector_pixel_size,
      this.canvas,
    );
    LOOPS.overOnScreenSectors(
      (s_x, s_y) => {
        const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
        const SECTOR =
          BOARD_SECTOR === SOLVED
            ? this.bus.get("request_cache", s_x, s_y) || false
            : BOARD_SECTOR || false;
        LOOPS.overTilesInSector((x, y) => {
          this.drawAnimatedTiles(SECTOR, s_x, s_y, x, y);
        });
        this.drawSectorOverlays(s_x, s_y);
        this.drawSolvedAnimations(s_x, s_y);
        this.drawLostAnimations(s_x, s_y);
        if (!this.hide_details) {
          this.drawSectorBorders(s_x, s_y);
          this.drawBuyButtons(s_x, s_y);
        }
      },
      START_X,
      START_Y,
      this.sector_pixel_size,
      this.canvas,
    );
    if (!this.hide_details) {
      this.drawSectorBorders(START_X, START_Y);
    }
  }
  /**
   * @function drawBuyButtons
   * @description Draws the buy buttons for a sector
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   */
  drawBuyButtons(s_x, s_y) {
    const KEY = `${s_x}:${s_y}`;
    if (
      this.game_pos.animated_sectors.lost.hasOwnProperty(KEY) ||
      !this.game_pos.lost_sectors.hasOwnProperty(KEY)
    ) {
      return;
    }
    const BASE_X = s_x * this.sector_pixel_size + this.offset[0];
    const BASE_Y = s_y * this.sector_pixel_size + this.offset[1];
    const B_WIDTH = this.sector_pixel_size - this.border_width;
    const EMOJI_SIZE = B_WIDTH / 4;
    this.ctx.drawImage(
      this.img,
      50,
      12,
      14,
      14,
      BASE_X + this.sector_pixel_size / 2 - EMOJI_SIZE / 2,
      BASE_Y + this.sector_pixel_size / 5 - EMOJI_SIZE / 2,
      EMOJI_SIZE,
      EMOJI_SIZE,
    );
    this.ctx.drawImage(
      this.img,
      26,
      46,
      47,
      7,
      BASE_X + this.sector_pixel_size / 8,
      BASE_Y + (7 * this.sector_pixel_size) / 10,
      ((B_WIDTH / 15) * 47) / 7,
      B_WIDTH / 15,
    );
    this.ctx.drawImage(
      this.img,
      0,
      60,
      31,
      8,
      BASE_X + this.sector_pixel_size / 5,
      BASE_Y + (8 * this.sector_pixel_size) / 10,
      ((B_WIDTH / 13) * 31) / 8,
      B_WIDTH / 13,
    );
    this.ctx.drawImage(
      this.img,
      49,
      54,
      11,
      14,
      BASE_X + (13 * this.sector_pixel_size) / 20,
      BASE_Y + (13 * this.sector_pixel_size) / 20,
      ((B_WIDTH / 4) * 11) / 14,
      B_WIDTH / 4,
    );
    const WIDTH_BUTTON = ((B_WIDTH / 5) * 25) / 13;
    const HEIGHT_BUTTON = B_WIDTH / 5;
    this.ctx.drawImage(
      this.img,
      0,
      46,
      25,
      13,
      BASE_X + this.sector_pixel_size / 2 - WIDTH_BUTTON / 2,
      BASE_Y + this.sector_pixel_size / 2 - HEIGHT_BUTTON / 2,
      WIDTH_BUTTON,
      HEIGHT_BUTTON,
    );
    const DIGIT_1 = Math.floor(this.game_pos.lost_sectors[KEY] / 10);
    const DIGIT_2 = this.game_pos.lost_sectors[KEY] % 10;
    const DIGIT_WIDTH = ((B_WIDTH / 13) * 3) / 5;
    const DIGIT_HEIGHT = B_WIDTH / 13;
    if (DIGIT_1 != 0) {
      this.ctx.drawImage(
        this.img,
        DIGIT_1 * 4,
        6,
        3,
        5,
        BASE_X +
          this.sector_pixel_size / 2 -
          WIDTH_BUTTON / 2 +
          (WIDTH_BUTTON / 25) * 6,
        BASE_Y +
          this.sector_pixel_size / 2 -
          HEIGHT_BUTTON / 2 +
          (HEIGHT_BUTTON / 13) * 4,
        DIGIT_WIDTH,
        DIGIT_HEIGHT,
      );
    }
    const DIGIT_OFFSET = DIGIT_1 == 0 ? (WIDTH_BUTTON / 25) * 2 : 0;
    this.ctx.drawImage(
      this.img,
      DIGIT_2 * 4,
      6,
      3,
      5,
      BASE_X +
        this.sector_pixel_size / 2 -
        WIDTH_BUTTON / 2 +
        (WIDTH_BUTTON / 25) * 10 -
        DIGIT_OFFSET,
      BASE_Y +
        this.sector_pixel_size / 2 -
        HEIGHT_BUTTON / 2 +
        (HEIGHT_BUTTON / 13) * 4,
      DIGIT_WIDTH,
      DIGIT_HEIGHT,
    );
  }
  /**
   * @function drawRoundedRect
   * @description Draws a rounded rectangle
   * @param {number} x - X-coordinate of top-left corner
   * @param {number} y - Y-coordinate of top-left corner
   * @param {number} width - Width of rectangle
   * @param {number} height - Height of rectangle
   * @param {number} radius - Radius of rounded corners
   */
  drawRoundedRect(x, y, width, height, radius) {
    if (this.hide_details) {
      this.ctx.fillRect(x, y, width, height);
      return;
    }
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height,
    );
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }
  /**
   * @function drawStaticTiles
   * @description Draws a static tile
   * @param {Array<Array<Array<number>>>|false} sector
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   */
  drawStaticTiles(sector, s_x, s_y, x, y) {
    const TILE_X = (s_x * SECTOR_SIZE + x) * this.tile_size + this.offset[0];
    const TILE_Y = (s_y * SECTOR_SIZE + y) * this.tile_size + this.offset[1];
    if (!sector) {
      if (this.hide_details) return;
      this._drawEmptyOrClickable(
        TILE_X,
        TILE_Y,
        this.tile_size - this.border_width,
        x,
        y,
        s_x,
        s_y,
      );
      return;
    }
    const [TILE_NUM, TILE_STATE] = sector[y][x];
    const KEY = `${s_x}:${s_y}:${x}:${y}`;
    if (Object.values(this.game_pos.animated_tiles).some((sub) => KEY in sub)) {
      return;
    }
    switch (TILE_STATE) {
      case TILE_STATES.REVEALED:
        this._drawRevealedStaticTile(TILE_X, TILE_Y, TILE_NUM);
        break;
      case TILE_STATES.FLAGGED:
      case TILE_STATES.LOST:
        this._drawFlaggedOrLostTile(TILE_X, TILE_Y, TILE_STATE);
        break;
      default:
        if (this.hide_details) return;
        this._drawEmptyOrClickable(
          TILE_X,
          TILE_Y,
          this.tile_size - this.border_width,
          x,
          y,
          s_x,
          s_y,
        );
    }
    if (this.hide_details) return;
    this._drawStaticTileDetails(
      TILE_X,
      TILE_Y,
      TILE_NUM,
      TILE_STATE,
      this.tile_size - this.border_width,
    );
  }
  /**
   * @function _drawEmptyOrClickable
   * @description Draws an empty or clickable tile
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} size - Size of tile
   * @param {number} x - local X-coordinate of tile
   * @param {number} y - local Y-coordinate of tile
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   */
  _drawEmptyOrClickable(tile_x, tile_y, size, x, y, s_x, s_y) {
    if (this.bus.get("is_clickable", x, y, s_x, s_y)) {
      this.ctx.fillStyle = COLORS.TILE_CLICKABLE;
      this.drawRoundedRect(tile_x, tile_y, size, size, this.tile_size / 15);
    } else {
      this.ctx.fillStyle = COLORS.TILE_DEFAULT;
      this.ctx.fillRect(tile_x, tile_y, size, size);
    }
  }
  /**
   * @function _drawRevealedStaticTile
   * @description Draws a revealed tile
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} tile_num - Number of mines adjacent to tile
   */
  _drawRevealedStaticTile(tile_x, tile_y, tile_num) {
    this.ctx.fillStyle =
      tile_num !== 0
        ? COLORS.TILE_REVEALED_NUMBERED
        : COLORS.TILE_REVEALED_EMPTY;
    this.ctx.fillRect(tile_x, tile_y, this.tile_size, this.tile_size);
  }
  /**
   * @function _drawFlaggedOrLostTile
   * @description Draws a flagged or lost tile
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} tile_state - State of tile
   */
  _drawFlaggedOrLostTile(tile_x, tile_y, tile_state) {
    this.ctx.fillStyle =
      tile_state === TILE_STATES.LOST
        ? COLORS.TILE_CLICKABLE
        : COLORS.TILE_FLAGGED;
    this.drawRoundedRect(
      tile_x,
      tile_y,
      this.tile_size - this.border_width,
      this.tile_size - this.border_width,
      this.tile_size / 6,
    );
  }
  /**
   * @function _drawStaticTileDetails
   * @description Draws the details of a static tile
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} tile_num - Number of mines adjacent to tile
   * @param {number} tile_state - State of tile
   * @param {number} size - Size of tile without border
   */
  _drawStaticTileDetails(tile_x, tile_y, tile_num, tile_state, size) {
    let sx, sW, sH;
    let dx, dy, dW, dH;
    switch (tile_state) {
      case TILE_STATES.REVEALED:
        if (tile_num === 0) return;
        (sx = (tile_num - 1) * 4), (sW = 3), (sH = 5);
        dx = tile_x + (3 * this.tile_size) / 10;
        dy = tile_y + this.tile_size / 6;
        dW = (2 * this.tile_size) / 5;
        dH = (2 * this.tile_size) / 3;
        break;
      case TILE_STATES.FLAGGED:
        (sx = 44), (sW = 4), (sH = 7);
        dx = tile_x + (3 * this.tile_size) / 10 - this.border_width / 2;
        dy = tile_y + this.tile_size / 6;
        dW = (2 * size) / 5;
        dH = (2 * size) / 3;
        break;
      case TILE_STATES.LOST:
        (sx = 32), (sW = sH = 5);
        dx = tile_x + size / 4;
        dy = tile_y + size / 4;
        dW = dH = size / 2;
        break;
      default:
        return;
    }
    this.ctx.drawImage(this.img, sx, 0, sW, sH, dx, dy, dW, dH);
  }
  /**
   * @function drawAnimatedTiles
   * @description Draws an animated tile
   * @param {Array<Array<Array<number>>>|false} sector
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   */
  drawAnimatedTiles(sector, s_x, s_y, x, y) {
    const ANIMATE_KEY = `${s_x}:${s_y}:${x}:${y}`;
    const ANIMATEDTILES = this.game_pos.animated_tiles;
    let type = null;
    let animation_data = null;
    for (const [T, SUB] of Object.entries(ANIMATEDTILES)) {
      if (SUB.hasOwnProperty(ANIMATE_KEY)) {
        type = T;
        animation_data = SUB[ANIMATE_KEY];
        break;
      }
    }
    if (!animation_data || !sector) return;
    const [START_TIME, SPEED] = animation_data;
    const FRAME_TIME = (Date.now() - START_TIME) / SPEED;
    const TILE_X = (s_x * SECTOR_SIZE + x) * this.tile_size + this.offset[0];
    const TILE_Y = (s_y * SECTOR_SIZE + y) * this.tile_size + this.offset[1];
    this.ctx.fillStyle = COLORS.TILE_REVEALED_EMPTY;
    this.ctx.fillRect(TILE_X, TILE_Y, this.tile_size, this.tile_size);
    const current_scale = this._calculateCurrentScale(FRAME_TIME);
    const [TILE_NUM] = sector[y][x];
    switch (type) {
      case "revealed":
        this._drawRevealedTileAnimated(TILE_X, TILE_Y, TILE_NUM, current_scale);
        break;
      case "flagged":
        this._drawFlaggedTileAnimated(
          TILE_X,
          TILE_Y,
          FRAME_TIME,
          current_scale,
        );
        break;
      case "bombed":
        this._drawBombedTileAnimated(TILE_X, TILE_Y, FRAME_TIME, current_scale);
        break;
    }
    if (FRAME_TIME >= 1) {
      delete ANIMATEDTILES[type][ANIMATE_KEY];
    }
  }
  /**
   * @function _calculateCurrentScale
   * @description Calculates the current scale of an animated tile
   * @access private
   * @param {number} frame_time - Time since animation start
   * @return {number} - Current scale of tile
   */
  _calculateCurrentScale(frame_time) {
    if (frame_time >= 1) {
      return 1.0;
    }
    const BASE_PROGRESS =
      frame_time < 0.5
        ? 2 * frame_time * frame_time
        : 1 - Math.pow(-2 * frame_time + 2, 2) / 2;
    return Math.max(
      BASE_PROGRESS <= 0.8
        ? 0.5 * BASE_PROGRESS
        : 1.2 - 0.2 * (1 - (5 * (BASE_PROGRESS - 0.8) - 1) ** 3),
      0,
    );
  }
  /**
   * @function _drawRevealedTileAnimated
   * @description Draws a revealed tiles animation
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} tile_num - Tile number
   * @param {number} current_scale - Current scale of tile
   */
  _drawRevealedTileAnimated(tile_x, tile_y, tile_num, current_scale) {
    if (this.hide_details || tile_num === 0) return;
    const W = ((2 * this.tile_size) / 5) * current_scale;
    const H = ((2 * this.tile_size) / 3) * current_scale;
    this.ctx.drawImage(
      this.img,
      (tile_num - 1) * 4,
      0,
      3,
      5,
      tile_x + (3 * this.tile_size) / 10 + ((2 * this.tile_size) / 5 - W) / 2,
      tile_y + this.tile_size / 6 + ((2 * this.tile_size) / 3 - H) / 2,
      W,
      H,
    );
  }
  /**
   * @function _drawFlaggedTileAnimated
   * @description Draws a flagged tiles animation
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} frame_time - Time since animation start (0-1)
   * @param {number} current_scale - Current scale of tile
   */
  _drawFlaggedTileAnimated(tile_x, tile_y, frame_time, current_scale) {
    this.ctx.fillStyle = COLORS.TILE_FLAGGED;
    this.drawRoundedRect(
      tile_x,
      tile_y,
      this.tile_size - this.border_width,
      this.tile_size - this.border_width,
      this.tile_size / 6,
    );
    if (this.hide_details) return;
    const W = ((2 * (this.tile_size - this.border_width)) / 5) * current_scale;
    const H = ((2 * (this.tile_size - this.border_width)) / 3) * current_scale;
    this.ctx.drawImage(
      this.img,
      44,
      0,
      4,
      7,
      tile_x +
        (3 * this.tile_size) / 10 +
        ((2 * (this.tile_size - this.border_width)) / 5 - W) / 2 -
        this.border_width / 2,
      tile_y +
        this.tile_size / 6 +
        ((2 * (this.tile_size - this.border_width)) / 3 - H) / 2,
      W,
      H,
    );
    this.drawParticles(tile_x, tile_y, frame_time, COLORS.FLAG_PARTICLE_COLOR);
  }
  /**
   * @function _drawBombedTileAnimated
   * @description Draws a bombed tiles animation
   * @access private
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} frame_time - Time since animation start (0-1)
   * @param {number} current_scale - Current scale of tile
   */
  _drawBombedTileAnimated(tile_x, tile_y, frame_time, current_scale) {
    this.ctx.fillStyle = COLORS.TILE_DEFAULT;
    this.drawRoundedRect(
      tile_x,
      tile_y,
      this.tile_size - this.border_width,
      this.tile_size - this.border_width,
      this.tile_size / 6,
    );
    if (this.hide_details) return;
    const S = ((this.tile_size - this.border_width) / 2) * current_scale;
    this.ctx.drawImage(
      this.img,
      32,
      0,
      5,
      5,
      tile_x + (this.tile_size - this.border_width) / 2 - S / 2,
      tile_y + (this.tile_size - this.border_width) / 2 - S / 2,
      S,
      S,
    );
    this.drawParticles(tile_x, tile_y, frame_time, COLORS.LOST_PARTICLE_COLOR);
  }
  /**
   * @function drawParticles
   * @description Draws particles
   * @param {number} tile_x - X-coordinate of top-left corner of tile
   * @param {number} tile_y - Y-coordinate of top-left corner of tile
   * @param {number} frame_time - Time since animation start (0-1)
   * @param {string} [color=COLORS.FLAG_PARTICLE_COLOR] - Color of particle
   */
  drawParticles(
    tile_x,
    tile_y,
    frame_time,
    color = COLORS.FLAG_PARTICLE_COLOR,
  ) {
    if (frame_time >= 1) return;
    for (let i = 0; i < 5; i++) {
      const HASH = DataHasher.hash(this.key, `${tile_x}:${tile_y}:${i}`);
      const ANGLE =
        HASH * Math.PI * 2 + frame_time * Math.PI * 4 * (1 + HASH * 0.7);
      const RADIUS = frame_time * this.tile_size * 1.5 * (0.9 + HASH * 0.6);
      const X = tile_x + this.tile_size / 2 + Math.cos(ANGLE) * RADIUS;
      const Y = tile_y + this.tile_size / 2 + Math.sin(ANGLE) * RADIUS;
      this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(frame_time, 1.5));
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(
        X,
        Y,
        (this.tile_size * 0.55 * (0.8 + HASH * 0.4) * (1 - frame_time)) / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }
  /**
   * @function drawSectorBorders
   * @description Draws sector borders
   * @param {number} start_x - X-coordinate of top-left corner of sector
   * @param {number} start_y - Y-coordinate of top-left corner of sector
   */
  drawSectorBorders(start_x, start_y) {
    this.ctx.strokeStyle = COLORS.SECTOR_BORDER;
    this.ctx.lineWidth = this.border_width;
    for (
      let s_x = start_x - 1;
      s_x < Math.ceil(start_x + this.canvas.width / this.sector_pixel_size + 1);
      s_x++
    ) {
      const SECTOR_X_POS = s_x * this.sector_pixel_size + this.offset[0];
      this.ctx.beginPath();
      this.ctx.moveTo(
        SECTOR_X_POS + this.sector_pixel_size - this.border_width / 2,
        0,
      );
      this.ctx.lineTo(
        SECTOR_X_POS + this.sector_pixel_size - this.border_width / 2,
        this.canvas.height,
      );
      this.ctx.stroke();
    }
    for (
      let s_y = start_y - 1;
      s_y <
      Math.ceil(start_y + this.canvas.height / this.sector_pixel_size + 1);
      s_y++
    ) {
      const SECTOR_Y_POS = s_y * this.sector_pixel_size + this.offset[1];
      this.ctx.beginPath();
      this.ctx.moveTo(
        0,
        SECTOR_Y_POS + this.sector_pixel_size - this.border_width / 2,
      );
      this.ctx.lineTo(
        this.canvas.width,
        SECTOR_Y_POS + this.sector_pixel_size - this.border_width / 2,
      );
      this.ctx.stroke();
    }
  }
  /**
   * @function drawSectorOverlays
   * @description Draws sector overlays
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   */
  drawSectorOverlays(s_x, s_y) {
    const KEY = `${s_x}:${s_y}`;
    const SECTOR_X_POS = s_x * this.sector_pixel_size + this.offset[0];
    const SECTOR_Y_POS = s_y * this.sector_pixel_size + this.offset[1];
    const fill = (spx = this.sector_pixel_size - this.border_width) => {
      this.ctx.fillRect(SECTOR_X_POS, SECTOR_Y_POS, spx, spx);
    };
    if (
      this.game_pos.data_sectors.hasOwnProperty(KEY) &&
      this.game_pos.data_sectors[KEY] === SOLVED &&
      !this.game_pos.animated_sectors.solved.hasOwnProperty(KEY)
    ) {
      this.ctx.fillStyle = COLORS.SECTOR_OVERLAY;
      this.ctx.globalAlpha = 0.1;
      fill();
    } else if (
      this.game_pos.data_sectors.hasOwnProperty(KEY) &&
      !this.game_pos.animated_sectors.lost.hasOwnProperty(KEY) &&
      this.game_pos.lost_sectors.hasOwnProperty(KEY)
    ) {
      this.ctx.fillStyle = COLORS.SECTOR_LOST_OVERLAY;
      this.ctx.globalAlpha = 0.4;
      fill();
    }
    this.ctx.globalAlpha = 1.0;
  }
  /**
   * @function drawSolvedAnimations
   * @description Draws solved sector animations
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   */
  drawSolvedAnimations(s_x, s_y) {
    this.ctx.fillStyle = COLORS.SECTOR_OVERLAY;
    const KEY = `${s_x}:${s_y}`;
    if (!this.game_pos.animated_sectors.solved.hasOwnProperty(KEY)) return;
    const FRAME_TIME =
      (Date.now() - this.game_pos.animated_sectors.solved[KEY]) /
      (ANIMATION_SPEED_BASE * 12);
    const SECTOR_X_POS = s_x * this.sector_pixel_size + this.offset[0];
    const SECTOR_Y_POS = s_y * this.sector_pixel_size + this.offset[1];
    this.ctx.globalAlpha = Math.min(FRAME_TIME, 1) * 0.1;
    this.ctx.fillRect(
      SECTOR_X_POS,
      SECTOR_Y_POS,
      this.sector_pixel_size - this.border_width,
      this.sector_pixel_size - this.border_width,
    );
    if (FRAME_TIME <= 0.25) {
      this.drawSolvedParticles(
        SECTOR_X_POS,
        SECTOR_Y_POS,
        Math.min(FRAME_TIME * 4, 1),
      );
    }
    const CURRENT_ANIMATION_SCALE = 0.5 + 0.7 * FRAME_TIME;
    const ANIMATED_WIDTH = this.sector_pixel_size * CURRENT_ANIMATION_SCALE;
    const ANIMATED_HEIGHT =
      ((this.sector_pixel_size * 16) / 80) * CURRENT_ANIMATION_SCALE;
    this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(FRAME_TIME, 1.5));
    this.ctx.drawImage(
      this.img,
      0,
      29,
      80,
      16,
      SECTOR_X_POS + this.sector_pixel_size / 2 - ANIMATED_WIDTH / 2,
      SECTOR_Y_POS +
        this.sector_pixel_size / 2 -
        ANIMATED_HEIGHT / 2 -
        this.sector_pixel_size * 0.3 * FRAME_TIME,
      ANIMATED_WIDTH,
      ANIMATED_HEIGHT,
    );
    if (FRAME_TIME >= 1) {
      delete this.game_pos.animated_sectors.solved[KEY];
    }
    this.ctx.globalAlpha = 1.0;
  }
  /**
   * @function drawSolvedParticles
   * @description Draws solved sector particles
   * @param {number} sector_x_pos - X-coordinate of sector
   * @param {number} sector_y_pos - Y-coordinate of sector
   * @param {number} frame_time - Current frame time (0-1)
   */
  drawSolvedParticles(sector_x_pos, sector_y_pos, frame_time) {
    if (frame_time >= 1) return;
    for (let i = 0; i < 20; i++) {
      const HASH = DataHasher.hash(
        this.key,
        `${sector_x_pos}:${sector_y_pos}:${i}`,
      );
      const ANGLE =
        HASH * Math.PI * 2 + frame_time * Math.PI * 2 * (0.5 + HASH * 0.5);
      const RADIUS = frame_time * this.sector_pixel_size * 0.7 * HASH;
      this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(frame_time, 2));
      this.ctx.fillStyle = COLORS.SOLVED_PARTICLE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc(
        sector_x_pos + this.sector_pixel_size / 2 + Math.cos(ANGLE) * RADIUS,
        sector_y_pos + this.sector_pixel_size / 2 + Math.sin(ANGLE) * RADIUS,
        (this.sector_pixel_size * 0.2 * (0.6 + HASH * 0.8) * (1 - frame_time)) /
          2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }
  /**
   * @function drawLostAnimations
   * @description Draws lost sector animations
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   */
  drawLostAnimations(s_x, s_y) {
    this.ctx.fillStyle = COLORS.SECTOR_LOST_OVERLAY;
    const KEY = `${s_x}:${s_y}`;
    if (!this.game_pos.animated_sectors.lost.hasOwnProperty(KEY)) return;
    const FRAME_TIME =
      (Date.now() - this.game_pos.animated_sectors.lost[KEY]) /
      (ANIMATION_SPEED_BASE * 12);
    const SECTOR_X_POS = s_x * this.sector_pixel_size + this.offset[0];
    const SECTOR_Y_POS = s_y * this.sector_pixel_size + this.offset[1];
    this.ctx.globalAlpha = Math.min(FRAME_TIME, 1) * 0.4;
    this.ctx.fillRect(
      SECTOR_X_POS,
      SECTOR_Y_POS,
      this.sector_pixel_size - this.border_width,
      this.sector_pixel_size - this.border_width,
    );
    const MAX_JITTER = 20;
    const DAMPEN = Math.max(1 - FRAME_TIME, 0);
    const JITTERX = (Math.random() - 0.5) * MAX_JITTER * DAMPEN;
    const JITTERY = (Math.random() - 0.5) * MAX_JITTER * DAMPEN;
    const CURRENT_ANIMATION_SCALE = 0.5 + 0.7 * FRAME_TIME;
    const ANIMATED_WIDTH = this.sector_pixel_size * CURRENT_ANIMATION_SCALE;
    const ANIMATED_HEIGHT =
      ((this.sector_pixel_size * 16) / 55) * CURRENT_ANIMATION_SCALE;
    this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(FRAME_TIME, 0.8)) * 0.9;
    this.ctx.drawImage(
      this.img,
      0,
      12,
      49,
      16,
      SECTOR_X_POS + this.sector_pixel_size / 2 - ANIMATED_WIDTH / 2 + JITTERX,
      SECTOR_Y_POS +
        this.sector_pixel_size / 2 -
        ANIMATED_HEIGHT / 2 -
        this.sector_pixel_size * 0.3 * FRAME_TIME +
        JITTERY,
      ANIMATED_WIDTH,
      ANIMATED_HEIGHT,
    );
    for (let i = 0; i < 3; i++) {
      const ANGLE = (Math.PI * 2 * i) / 3;
      const RADIUS = 20 + 10 * Math.random();
      const JITTERX = (Math.random() - 0.5) * 10;
      const JITTERY = (Math.random() - 0.5) * 10;
      const EMOJISIZE = 14 * (2 + 1 * FRAME_TIME);
      this.ctx.drawImage(
        this.img,
        50,
        12,
        14,
        14,
        SECTOR_X_POS +
          this.sector_pixel_size / 2 +
          Math.cos(ANGLE) * RADIUS +
          JITTERX -
          EMOJISIZE / 2,
        SECTOR_Y_POS +
          (3 * this.sector_pixel_size) / 4 +
          Math.sin(ANGLE) * RADIUS +
          JITTERY -
          EMOJISIZE / 2,
        EMOJISIZE,
        EMOJISIZE,
      );
    }
    if (FRAME_TIME >= 1) {
      delete this.game_pos.animated_sectors.lost[KEY];
    }
    this.ctx.globalAlpha = 1.0;
  }
}
