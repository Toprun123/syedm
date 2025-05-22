"use strict";

import { SipHash } from "./siphash.js";

const TILE_STATES = Object.freeze({
  LOST: -1,
  HIDDEN: 0,
  FLAGGED: 1,
  REVEALED: 2,
});

let COLORS = {
  BACKGROUND_ORIG: "#1b262c",
  BACKGROUND: "#1b262c",
  TILE_DEFAULT: "#0e4c75",
  TILE_CLICKABLE: "#115d8f",
  TILE_REVEALED_NUMBERED: "#1b262c",
  TILE_REVEALED_EMPTY: "#1b262c",
  TILE_FLAGGED: "#25353d",
  SECTOR_OVERLAY: "#90bdd9",
  SECTOR_LOST_OVERLAY: "#fa908c",
  SECTOR_BORDER: "#90bdd9",
  FLAG_PARTICLE_COLOR: "#90bdd9",
  SOLVED_PARTICLE_COLOR: "#90bdd9",
  LOST_PARTICLE_COLOR: "#fa908c",
};

const SOLVED = 1;
const MINE = -1;

/**
 * InfiniteMinesweeper
 * @class
 * @classdesc Represents an infinite minesweeper game
 */
class InfiniteMinesweeper {
  static SECTOR_SIZE = 9;
  static DEFAULT_DIFFICULTY = 19;
  static CENTRAL_AREA_DIFFICULTY_MODIFIER = 0.8;
  static DETAIL_THRESHOLD = 25;
  static DRAG_THRESHOLD = 20;
  static MAX_TRIES = 50;
  static ANIMATION_SPEED_BASE = 150;

  /**
   * Creates an instance of InfiniteMinesweeper.
   * @param {string|number} [seed] - The seed for the game
   * @param {number} [difficulty] - The difficulty of the game on a scale of 0 to 100
   */
  constructor(seed, difficulty) {
    this.board = {};
    this.frame_id = undefined;
    this.is_seeded = seed !== undefined;
    this.seed = seed || (Math.floor(Math.random() * 9e15) + 1e15).toString();
    this.difficulty = difficulty || InfiniteMinesweeper.DEFAULT_DIFFICULTY;
    this.canvas = document.getElementById("gameCanvas");
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.tile_size = 40;
    this.offset_x =
      this.canvas.width / 2 -
      (this.tile_size * InfiniteMinesweeper.SECTOR_SIZE) / 2 +
      this.tile_size / 2;
    this.offset_y =
      this.canvas.height / 2 -
      (this.tile_size * InfiniteMinesweeper.SECTOR_SIZE) / 2 +
      this.tile_size / 2;
    this.is_dragging = false;
    this.is_mouse_down = false;
    this.drag_start_pos = [0, 0];
    this.border_width = Math.floor(this.tile_size * 0.065);
    this.hide_details = false;
    this.cached_sectors = {};
    this.animations = {};
    this.animated_sectors = {};
    this.lost_animations = {};
    this.stats = {
      mines: 0,
      flags: 0,
      solved: 0,
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
      7: 0,
      8: 0,
      time: 0,
    };
    this.goldmines = 0;
    this.lost_sectors = new Set();
    this.img = new Image();
    this.loop = this.loop.bind(this);
    this.sip = SipHash;
    this.key = this.sip.string16_to_key(this.seed);
    this.setupEventListeners();
    this.loadImage();
  }
  /** Initializes the event listeners */
  setupEventListeners() {
    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.is_dragging = false;
      this.is_mouse_down = true;
      this.drag_start_pos = [e.offsetX, e.offsetY];
    });
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.is_dragging) {
        const DELTAX = e.offsetX - this.drag_start_pos[0];
        const DELTAY = e.offsetY - this.drag_start_pos[1];
        this.offset_x += DELTAX;
        this.offset_y += DELTAY;
        this.drag_start_pos = [e.offsetX, e.offsetY];
      } else if (this.is_mouse_down) {
        const DELTAX = Math.abs(e.offsetX - this.drag_start_pos[0]);
        const DELTAY = Math.abs(e.offsetY - this.drag_start_pos[1]);
        if (
          DELTAX > InfiniteMinesweeper.DRAG_THRESHOLD ||
          DELTAY > InfiniteMinesweeper.DRAG_THRESHOLD
        ) {
          this.is_dragging = true;
        }
      }
    });
    this.canvas.addEventListener("mouseup", (e) => {
      this.is_mouse_down = false;
      if (this.is_dragging) {
        this.is_dragging = false;
        this.cleanSectorCache();
        return;
      }
      const X = Math.floor((e.offsetX - this.offset_x) / this.tile_size);
      const Y = Math.floor((e.offsetY - this.offset_y) / this.tile_size);
      if (this.isButton(X, Y)) {
        this.buy(X, Y);
        return;
      }
      if (!this.isClickable(X, Y)) return;
      if (e.button === 0) {
        if (this.isFlagged(X, Y)) return;
        if (this.isRevealed(X, Y)) {
          if (this.flagCount(X, Y) === this.mineCount(X, Y)) {
            for (let i = -1; i <= 1; i++) {
              for (let j = -1; j <= 1; j++) {
                if (
                  (i != 0 || j != 0) &&
                  !this.isRevealed(X + i, Y + j) &&
                  !this.isFlagged(X + i, Y + j)
                ) {
                  this.reveal(X + i, Y + j);
                }
              }
            }
          }
          return;
        }
        this.reveal(X, Y);
      } else if (e.button === 2) {
        this.flag(X, Y);
      }
    });
    this.canvas.addEventListener("mouseleave", (_) => {
      this.is_mouse_down = false;
      if (this.is_dragging) {
        this.is_dragging = false;
        this.cleanSectorCache();
        return;
      }
    });
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const MOUSEX = e.offsetX;
      const MOUSEY = e.offsetY;
      let new_tile_size;
      if (e.deltaY < 0) {
        new_tile_size = this.tile_size * 1.1;
      } else {
        new_tile_size = this.tile_size / 1.1;
      }
      new_tile_size = Math.max(10, Math.min(new_tile_size, 100));
      const SCALE = new_tile_size / this.tile_size;
      this.offset_x = MOUSEX - (MOUSEX - this.offset_x) * SCALE;
      this.offset_y = MOUSEY - (MOUSEY - this.offset_y) * SCALE;
      this.tile_size = new_tile_size;
      this.hide_details = this.tile_size < InfiniteMinesweeper.DETAIL_THRESHOLD;
      this.border_width = this.hide_details
        ? 0
        : Math.floor(this.tile_size * 0.065);
      COLORS.BACKGROUND = this.hide_details
        ? COLORS.TILE_DEFAULT
        : COLORS.BACKGROUND_ORIG;
      this.cleanSectorCache();
    });
    this.canvas.addEventListener("click", (e) => {
      e.preventDefault();
    });
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    window.addEventListener("resize", () => {
      this.updateCanvasSize();
    });
  }
  /** Loads the game art image */
  loadImage() {
    this.img.onload = () => {
      this.start();
    };
    this.img.onerror = () => {
      this.ctx.fillStyle = "red";
      this.ctx.font = "16px Arial";
      this.ctx.textAlign = "center";
      this.ctx.fillText(
        "An error occurred while loading the game art.",
        this.canvas.width / 2,
        this.canvas.height / 2,
      );
    };
    this.img.src = "img/minesweeper.png";
  }
  /**
   * Starts the game and builds a game with better opening conditions
   * @param {number} [tries=0] - The number of tries in an unseeded game
   */
  async start(tries = 0) {
    const CENTRE = (InfiniteMinesweeper.SECTOR_SIZE - 1) / 2;
    if (!this.is_seeded && tries < InfiniteMinesweeper.MAX_TRIES) {
      let revealed = false;
      revealed = await this.reveal(CENTRE, CENTRE, undefined, undefined, true);
      if (!revealed) {
        await this.reset(tries + 1);
        return;
      }
    } else {
      this.reveal(CENTRE, CENTRE);
    }
    this.loop();
  }
  /**
   * Resets the game
   * @param {number} [tries=0] - Number of times the game has been reset in an unseeded game
   */
  async reset(tries = 0) {
    this.board = {};
    this.seed = (Math.floor(Math.random() * 9e15) + 1e15).toString();
    this.is_dragging = false;
    this.drag_start_pos = [0, 0];
    cancelAnimationFrame(this.frame_id);
    await this.start(tries);
  }
  /** Main game loop */
  loop() {
    this.draw();
    this.frame_id = requestAnimationFrame(this.loop);
  }
  /** Draws the game board */
  draw() {
    this.ctx.fillStyle = COLORS.BACKGROUND;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    const SECTOR_PIXEL_SIZE = InfiniteMinesweeper.SECTOR_SIZE * this.tile_size;
    const START_X = -Math.floor(this.offset_x / SECTOR_PIXEL_SIZE) - 1;
    const START_Y = -Math.ceil(this.offset_y / SECTOR_PIXEL_SIZE);
    const END_X = Math.ceil(
      START_X + this.canvas.width / SECTOR_PIXEL_SIZE + 1,
    );
    const END_Y = Math.ceil(
      START_Y + this.canvas.height / SECTOR_PIXEL_SIZE + 1,
    );
    this._drawStaticTiles(START_X, END_X, START_Y, END_Y);
    this._drawAnimations(START_X, END_X, START_Y, END_Y);
    this._drawLostSectorOverlays(
      START_X,
      END_X,
      START_Y,
      END_Y,
      SECTOR_PIXEL_SIZE,
    );
    this._drawSectorOverlays(START_X, END_X, START_Y, END_Y, SECTOR_PIXEL_SIZE);
    this._drawSectorAnimations(
      START_X,
      END_X,
      START_Y,
      END_Y,
      SECTOR_PIXEL_SIZE,
    );
    this._drawLostSectorAnimations(
      START_X,
      END_X,
      START_Y,
      END_Y,
      SECTOR_PIXEL_SIZE,
    );
    if (!this.hide_details) {
      this._drawSectorBorders(
        START_X,
        END_X,
        START_Y,
        END_Y,
        SECTOR_PIXEL_SIZE,
      );
      this._drawBuyButtons(START_X, END_X, START_Y, END_Y, SECTOR_PIXEL_SIZE);
    }
  }
  _drawBuyButtons(start_x, end_x, start_y, end_y, sector_pixel_size) {
    for (let s_x = start_x; s_x < end_x; s_x++) {
      for (let s_y = start_y; s_y < end_y; s_y++) {
        if (!this.board.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        if (this.lost_animations.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        if (!this.lost_sectors.has(`${s_x}:${s_y}`)) continue;
        const WIDTH_B =
          (((sector_pixel_size - this.border_width) / 5) * 25) / 13;
        const HEIGHT_B = (sector_pixel_size - this.border_width) / 5;
        let width = (sector_pixel_size - this.border_width) / 4;
        let height = (sector_pixel_size - this.border_width) / 4;
        this.ctx.drawImage(
          this.img,
          50,
          12,
          14,
          14,
          s_x * sector_pixel_size +
            this.offset_x +
            sector_pixel_size / 2 -
            width / 2,
          s_y * sector_pixel_size +
            this.offset_y +
            (1 * sector_pixel_size) / 5 -
            height / 2,
          width,
          height,
        );
        width = (((sector_pixel_size - this.border_width) / 15) * 47) / 7;
        height = (sector_pixel_size - this.border_width) / 15;
        this.ctx.drawImage(
          this.img,
          26,
          46,
          47,
          7,
          s_x * sector_pixel_size + this.offset_x + sector_pixel_size / 8,
          s_y * sector_pixel_size +
            this.offset_y +
            (7 * sector_pixel_size) / 10,
          width,
          height,
        );
        width = (((sector_pixel_size - this.border_width) / 13) * 31) / 8;
        height = (sector_pixel_size - this.border_width) / 13;
        this.ctx.drawImage(
          this.img,
          0,
          60,
          31,
          8,
          s_x * sector_pixel_size + this.offset_x + sector_pixel_size / 5,
          s_y * sector_pixel_size +
            this.offset_y +
            (8 * sector_pixel_size) / 10,
          width,
          height,
        );
        width = (((sector_pixel_size - this.border_width) / 4) * 11) / 14;
        height = (sector_pixel_size - this.border_width) / 4;
        this.ctx.drawImage(
          this.img,
          49,
          54,
          11,
          14,
          s_x * sector_pixel_size +
            this.offset_x +
            (13 * sector_pixel_size) / 20,
          s_y * sector_pixel_size +
            this.offset_y +
            (13 * sector_pixel_size) / 20,
          width,
          height,
        );
        this.ctx.drawImage(
          this.img,
          0,
          46,
          25,
          13,
          s_x * sector_pixel_size +
            this.offset_x +
            sector_pixel_size / 2 -
            WIDTH_B / 2,
          s_y * sector_pixel_size +
            this.offset_y +
            sector_pixel_size / 2 -
            HEIGHT_B / 2,
          WIDTH_B,
          HEIGHT_B,
        );
        let hash = this.sip.hash(this.key, `${this.seed}:${s_x}:${s_y}`);
        hash = ((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101;
        const [DIGIT_1, DIGIT_2] = (
          Math.max(10, Math.floor(this.difficulty ** 2 / 40 + hash / 4)) + ""
        )
          .split("")
          .map(Number);
        this.ctx.drawImage(
          this.img,
          DIGIT_1 * 4,
          6,
          3,
          5,
          s_x * sector_pixel_size +
            this.offset_x +
            sector_pixel_size / 2 -
            WIDTH_B / 2 +
            (WIDTH_B / 25) * 6,
          s_y * sector_pixel_size +
            this.offset_y +
            sector_pixel_size / 2 -
            HEIGHT_B / 2 +
            (HEIGHT_B / 13) * 4,
          (((sector_pixel_size - this.border_width) / 13) * 3) / 5,
          (sector_pixel_size - this.border_width) / 13,
        );
        this.ctx.drawImage(
          this.img,
          DIGIT_2 * 4,
          6,
          3,
          5,
          s_x * sector_pixel_size +
            this.offset_x +
            sector_pixel_size / 2 -
            WIDTH_B / 2 +
            (WIDTH_B / 25) * 10,
          s_y * sector_pixel_size +
            this.offset_y +
            sector_pixel_size / 2 -
            HEIGHT_B / 2 +
            (HEIGHT_B / 13) * 4,
          (((sector_pixel_size - this.border_width) / 13) * 3) / 5,
          (sector_pixel_size - this.border_width) / 13,
        );
      }
    }
  }
  /**
   * Draws a rounded rectangle
   * @param {number} x - The x position of the top left corner
   * @param {number} y - The y position of the top left corner
   * @param {number} width - The width of the rectangle
   * @param {number} height - The height of the rectangle
   * @param {number} radius - The radius of the rounded corners
   */
  _drawRoundedRect(x, y, width, height, radius) {
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
   * Draws the static tiles
   * @param {number} start_x - the starting sector x position onscreen
   * @param {number} end_x - the ending sector x position onscreen
   * @param {number} start_y - the starting sector y position onscreen
   * @param {number} end_y - the ending sector y position onscreen
   */
  _drawStaticTiles(start_x, end_x, start_y, end_y) {
    for (let s_y = start_y; s_y < end_y; s_y++) {
      for (let s_x = start_x; s_x < end_x; s_x++) {
        const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
        const SECTOR =
          BOARD_SECTOR === SOLVED
            ? this.buildSectorCache(s_x, s_y) || false
            : BOARD_SECTOR || false;
        for (let y = 0; y < InfiniteMinesweeper.SECTOR_SIZE; y++) {
          for (let x = 0; x < InfiniteMinesweeper.SECTOR_SIZE; x++) {
            const TILE_X =
              (s_x * InfiniteMinesweeper.SECTOR_SIZE + x) * this.tile_size +
              this.offset_x;
            const TILE_Y =
              (s_y * InfiniteMinesweeper.SECTOR_SIZE + y) * this.tile_size +
              this.offset_y;
            if (!SECTOR) {
              if (this.isClickable(x, y, s_x, s_y)) {
                this.ctx.fillStyle = COLORS.TILE_CLICKABLE;
                this._drawRoundedRect(
                  TILE_X,
                  TILE_Y,
                  this.tile_size - this.border_width,
                  this.tile_size - this.border_width,
                  this.tile_size / 15,
                );
              } else {
                this.ctx.fillStyle = COLORS.TILE_DEFAULT;
                this.ctx.fillRect(
                  TILE_X,
                  TILE_Y,
                  this.tile_size - this.border_width,
                  this.tile_size - this.border_width,
                );
              }
              continue;
            }
            const [TILE_NUM, TILE_STATE] = SECTOR[y][x];
            if (this.animations.hasOwnProperty(`${s_x}:${s_y}:${x}:${y}`)) {
              continue;
            }
            if (TILE_STATE === TILE_STATES.REVEALED && TILE_NUM !== 0) {
              this.ctx.fillStyle = COLORS.TILE_REVEALED_NUMBERED;
              this.ctx.fillRect(TILE_X, TILE_Y, this.tile_size, this.tile_size);
            } else if (TILE_STATE === TILE_STATES.REVEALED) {
              this.ctx.fillStyle = COLORS.TILE_REVEALED_EMPTY;
              this.ctx.fillRect(TILE_X, TILE_Y, this.tile_size, this.tile_size);
            } else if (TILE_STATE === TILE_STATES.LOST) {
              this.ctx.fillStyle = COLORS.TILE_CLICKABLE;
              this._drawRoundedRect(
                TILE_X,
                TILE_Y,
                this.tile_size - this.border_width,
                this.tile_size - this.border_width,
                this.tile_size / 6,
              );
            } else if (TILE_STATE === TILE_STATES.FLAGGED) {
              this.ctx.fillStyle = COLORS.TILE_FLAGGED;
              this._drawRoundedRect(
                TILE_X,
                TILE_Y,
                this.tile_size - this.border_width,
                this.tile_size - this.border_width,
                this.tile_size / 6,
              );
            } else if (this.isClickable(x, y, s_x, s_y)) {
              this.ctx.fillStyle = COLORS.TILE_CLICKABLE;
              this._drawRoundedRect(
                TILE_X,
                TILE_Y,
                this.tile_size - this.border_width,
                this.tile_size - this.border_width,
                this.tile_size / 15,
              );
            } else {
              this.ctx.fillStyle = COLORS.TILE_DEFAULT;
              this.ctx.fillRect(
                TILE_X,
                TILE_Y,
                this.tile_size - this.border_width,
                this.tile_size - this.border_width,
              );
            }
            if (!this.hide_details) {
              if (TILE_NUM !== 0 && TILE_STATE === TILE_STATES.REVEALED) {
                this.ctx.drawImage(
                  this.img,
                  (TILE_NUM - 1) * 4,
                  0,
                  3,
                  5,
                  TILE_X + (3 * this.tile_size) / 10,
                  TILE_Y + this.tile_size / 6,
                  (2 * this.tile_size) / 5,
                  (2 * this.tile_size) / 3,
                );
              } else if (TILE_STATE === TILE_STATES.FLAGGED) {
                this.ctx.drawImage(
                  this.img,
                  44,
                  0,
                  4,
                  7,
                  TILE_X + (3 * this.tile_size) / 10 - this.border_width / 2,
                  TILE_Y + this.tile_size / 6,
                  (2 * (this.tile_size - this.border_width)) / 5,
                  (2 * (this.tile_size - this.border_width)) / 3,
                );
              } else if (TILE_STATE === TILE_STATES.LOST) {
                this.ctx.drawImage(
                  this.img,
                  32,
                  0,
                  5,
                  5,
                  TILE_X +
                    (this.tile_size - this.border_width) / 2 -
                    (this.tile_size - this.border_width) / 4,
                  TILE_Y +
                    (this.tile_size - this.border_width) / 2 -
                    (this.tile_size - this.border_width) / 4,
                  (this.tile_size - this.border_width) / 2,
                  (this.tile_size - this.border_width) / 2,
                );
              }
            }
          }
        }
      }
    }
  }
  /**
   * Draws the animations on the board
   * @param {number} start_x - the starting sector x position onscreen
   * @param {number} end_x - the ending sector x position onscreen
   * @param {number} start_y - the starting sector y position onscreen
   * @param {number} end_y - the ending sector y position onscreen
   */
  _drawAnimations(start_x, end_x, start_y, end_y) {
    for (let s_y = start_y; s_y < end_y; s_y++) {
      for (let s_x = start_x; s_x < end_x; s_x++) {
        const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
        const SECTOR =
          BOARD_SECTOR === SOLVED
            ? this.buildSectorCache(s_x, s_y) || false
            : BOARD_SECTOR || false;
        for (let y = 0; y < InfiniteMinesweeper.SECTOR_SIZE; y++) {
          for (let x = 0; x < InfiniteMinesweeper.SECTOR_SIZE; x++) {
            const ANIMATE_KEY = `${s_x}:${s_y}:${x}:${y}`;
            if (this.animations.hasOwnProperty(ANIMATE_KEY)) {
              const [TARGET_STATE, START_TIME, SPEED] =
                this.animations[ANIMATE_KEY];
              const FRAME_TIME = (Date.now() - START_TIME) / SPEED;
              const TILE_X =
                (s_x * InfiniteMinesweeper.SECTOR_SIZE + x) * this.tile_size +
                this.offset_x;
              const TILE_Y =
                (s_y * InfiniteMinesweeper.SECTOR_SIZE + y) * this.tile_size +
                this.offset_y;
              this.ctx.fillStyle = COLORS.TILE_REVEALED_EMPTY;
              this.ctx.fillRect(TILE_X, TILE_Y, this.tile_size, this.tile_size);
              let current_scale = 1.0;
              if (FRAME_TIME < 1) {
                let base_progress;
                if (FRAME_TIME < 0.5) {
                  base_progress = 2 * FRAME_TIME * FRAME_TIME;
                } else {
                  base_progress = 1 - Math.pow(-2 * FRAME_TIME + 2, 2) / 2;
                }
                const OVERSHOOT_AMOUNT = 1.2;
                if (base_progress <= 0.8) {
                  current_scale = (base_progress / 0.8) * OVERSHOOT_AMOUNT;
                } else {
                  const settle_progress = (base_progress - 0.8) / 0.2;
                  current_scale =
                    OVERSHOOT_AMOUNT -
                    (OVERSHOOT_AMOUNT - 1.0) *
                      (1 - Math.pow(1 - settle_progress, 3));
                }
                current_scale = Math.max(current_scale, 0);
              } else {
                current_scale = 1.0;
                delete this.animations[ANIMATE_KEY];
              }
              if (!SECTOR) continue;
              const [TILE_NUM] = SECTOR[y][x];
              if (
                TARGET_STATE === TILE_STATES.REVEALED &&
                !this.hide_details &&
                TILE_NUM !== 0
              ) {
                const SCALED_WIDTH = ((2 * this.tile_size) / 5) * current_scale;
                const SCALED_HEIGHT =
                  ((2 * this.tile_size) / 3) * current_scale;
                this.ctx.drawImage(
                  this.img,
                  (TILE_NUM - 1) * 4,
                  0,
                  3,
                  5,
                  TILE_X +
                    (3 * this.tile_size) / 10 +
                    ((2 * this.tile_size) / 5 - SCALED_WIDTH) / 2,
                  TILE_Y +
                    this.tile_size / 6 +
                    ((2 * this.tile_size) / 3 - SCALED_HEIGHT) / 2,
                  SCALED_WIDTH,
                  SCALED_HEIGHT,
                );
              } else if (TARGET_STATE === TILE_STATES.FLAGGED) {
                this.ctx.fillStyle = COLORS.TILE_FLAGGED;
                this._drawRoundedRect(
                  TILE_X,
                  TILE_Y,
                  this.tile_size - this.border_width,
                  this.tile_size - this.border_width,
                  this.tile_size / 6,
                );
                if (!this.hide_details) {
                  const SCALED_WIDTH =
                    ((2 * (this.tile_size - this.border_width)) / 5) *
                    current_scale;
                  const SCALED_HEIGHT =
                    ((2 * (this.tile_size - this.border_width)) / 3) *
                    current_scale;
                  this.ctx.drawImage(
                    this.img,
                    44,
                    0,
                    4,
                    7,
                    TILE_X +
                      (3 * this.tile_size) / 10 +
                      ((2 * (this.tile_size - this.border_width)) / 5 -
                        SCALED_WIDTH) /
                        2 -
                      this.border_width / 2,
                    TILE_Y +
                      this.tile_size / 6 +
                      ((2 * (this.tile_size - this.border_width)) / 3 -
                        SCALED_HEIGHT) /
                        2,
                    SCALED_WIDTH,
                    SCALED_HEIGHT,
                  );
                  if (FRAME_TIME < 1.0) {
                    this._drawFlagParticles(TILE_X, TILE_Y, FRAME_TIME);
                  }
                }
              } else if (TARGET_STATE == TILE_STATES.LOST) {
                this.ctx.fillStyle = COLORS.TILE_DEFAULT;
                this._drawRoundedRect(
                  TILE_X,
                  TILE_Y,
                  this.tile_size - this.border_width,
                  this.tile_size - this.border_width,
                  this.tile_size / 6,
                );
                if (!this.hide_details) {
                  const SCALED =
                    ((this.tile_size - this.border_width) / 2) * current_scale;
                  this.ctx.drawImage(
                    this.img,
                    32,
                    0,
                    5,
                    5,
                    TILE_X +
                      (this.tile_size - this.border_width) / 2 -
                      SCALED / 2,
                    TILE_Y +
                      (this.tile_size - this.border_width) / 2 -
                      SCALED / 2,
                    SCALED,
                    SCALED,
                  );
                  if (FRAME_TIME < 1.0) {
                    this._drawMineParticles(TILE_X, TILE_Y, FRAME_TIME);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  /**
   * Draws flag particles for a tile
   * @param {number} tile_x - X-coordinate of tile
   * @param {number} tile_y - Y-coordinate of tile
   * @param {number} frame_time - The current animation frame (0-1)
   */
  _drawFlagParticles(tile_x, tile_y, frame_time) {
    const PARTICLE_SPEED = this.tile_size * 1.5;
    const PARTICLE_SIZE = this.tile_size * 0.55;
    for (let i = 0; i < 5; i++) {
      let hash = this.sip.hash(
        this.key,
        `${this.seed}:${tile_x}:${tile_y}:${i}`,
      );
      hash = (((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101) / 100;
      const angle_offset = hash * Math.PI * 2;
      const speed_multiplier = 0.9 + hash * 0.6;
      const size_multiplier = 0.8 + hash * 0.4;
      const current_particle_speed = PARTICLE_SPEED * speed_multiplier;
      const current_particle_size = PARTICLE_SIZE * size_multiplier;
      const angle = angle_offset + frame_time * Math.PI * 4 * (1 + hash * 0.7);
      const radius = frame_time * current_particle_speed;
      const particle_x = tile_x + this.tile_size / 2 + Math.cos(angle) * radius;
      const particle_y = tile_y + this.tile_size / 2 + Math.sin(angle) * radius;
      const particle_final_size = current_particle_size * (1 - frame_time);
      this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(frame_time, 1.5));
      this.ctx.fillStyle = COLORS.FLAG_PARTICLE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc(
        particle_x,
        particle_y,
        particle_final_size / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }
  _drawMineParticles(tile_x, tile_y, frame_time) {
    const PARTICLE_SPEED = this.tile_size;
    const PARTICLE_SIZE = this.tile_size * 0.2;
    for (let i = 0; i < 5; i++) {
      let hash = this.sip.hash(
        this.key,
        `${this.seed}:${tile_x}:${tile_y}:${i}`,
      );
      hash = (((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101) / 100;
      const angle_offset = hash * Math.PI * 2;
      const speed_multiplier = 0.9 + hash * 0.6;
      const size_multiplier = 0.8 + hash * 0.4;
      const current_particle_speed = PARTICLE_SPEED * speed_multiplier;
      const current_particle_size = PARTICLE_SIZE * size_multiplier;
      const angle = angle_offset + frame_time * Math.PI * 4 * (1 + hash * 0.7);
      const radius = frame_time * current_particle_speed;
      const particle_x = tile_x + this.tile_size / 2 + Math.cos(angle) * radius;
      const particle_y = tile_y + this.tile_size / 2 + Math.sin(angle) * radius;
      const particle_final_size = current_particle_size * (1 - frame_time);
      this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(frame_time, 1.5));
      this.ctx.fillStyle = COLORS.LOST_PARTICLE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc(
        particle_x,
        particle_y,
        particle_final_size / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }
  /**
   * Draws the sector borders
   * @param {number} start_x - the starting sector x position onscreen
   * @param {number} end_x - the ending sector x position onscreen
   * @param {number} start_y - the starting sector y position onscreen
   * @param {number} end_y - the ending sector y position onscreen
   * @param {number} sector_pixel_size - the size of a sector in pixels
   */
  _drawSectorBorders(start_x, end_x, start_y, end_y, sector_pixel_size) {
    this.ctx.strokeStyle = COLORS.SECTOR_BORDER;
    this.ctx.lineWidth = this.border_width;
    for (let s_x = start_x; s_x < end_x; s_x++) {
      const SECTOR_X_POS = s_x * sector_pixel_size + this.offset_x;
      this.ctx.beginPath();
      this.ctx.moveTo(
        SECTOR_X_POS + sector_pixel_size - this.border_width / 2,
        0,
      );
      this.ctx.lineTo(
        SECTOR_X_POS + sector_pixel_size - this.border_width / 2,
        this.canvas.height,
      );
      this.ctx.stroke();
    }
    for (let s_y = start_y; s_y < end_y; s_y++) {
      const SECTOR_Y_POS = s_y * sector_pixel_size + this.offset_y;
      this.ctx.beginPath();
      this.ctx.moveTo(
        0,
        SECTOR_Y_POS + sector_pixel_size - this.border_width / 2,
      );
      this.ctx.lineTo(
        this.canvas.width,
        SECTOR_Y_POS + sector_pixel_size - this.border_width / 2,
      );
      this.ctx.stroke();
    }
  }
  _drawSectorOverlays(start_x, end_x, start_y, end_y, sector_pixel_size) {
    this.ctx.fillStyle = COLORS.SECTOR_OVERLAY;
    this.ctx.globalAlpha = 0.1;
    for (let s_x = start_x; s_x < end_x; s_x++) {
      for (let s_y = start_y; s_y < end_y; s_y++) {
        if (!this.board.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        if (this.board[`${s_x}:${s_y}`] !== SOLVED) continue;
        if (this.animated_sectors.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        const SECTOR_X_POS = s_x * sector_pixel_size + this.offset_x;
        const SECTOR_Y_POS = s_y * sector_pixel_size + this.offset_y;
        this.ctx.fillRect(
          SECTOR_X_POS,
          SECTOR_Y_POS,
          sector_pixel_size - this.border_width,
          sector_pixel_size - this.border_width,
        );
      }
    }
    this.ctx.globalAlpha = 1.0;
  }
  _drawSectorAnimations(start_x, end_x, start_y, end_y, sector_pixel_size) {
    this.ctx.fillStyle = COLORS.SECTOR_OVERLAY;
    for (let s_x = start_x; s_x < end_x; s_x++) {
      for (let s_y = start_y; s_y < end_y; s_y++) {
        if (!this.animated_sectors.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        const FRAME_TIME =
          (Date.now() - this.animated_sectors[`${s_x}:${s_y}`]) /
          (InfiniteMinesweeper.ANIMATION_SPEED_BASE * 12);
        this.ctx.globalAlpha = Math.min(FRAME_TIME, 1) * 0.1;
        const SECTOR_X_POS = s_x * sector_pixel_size + this.offset_x;
        const SECTOR_Y_POS = s_y * sector_pixel_size + this.offset_y;
        this.ctx.fillRect(
          SECTOR_X_POS,
          SECTOR_Y_POS,
          sector_pixel_size - this.border_width,
          sector_pixel_size - this.border_width,
        );
        if (!(FRAME_TIME > 0.25)) {
          this._drawSectorParticles(
            SECTOR_X_POS,
            SECTOR_Y_POS,
            sector_pixel_size,
            Math.min(FRAME_TIME * 4, 1),
          );
        }
        const CURRENT_ANIMATION_SCALE = 0.5 + 0.7 * FRAME_TIME;
        const ANIMATED_WIDTH = sector_pixel_size * CURRENT_ANIMATION_SCALE;
        const ANIMATED_HEIGHT =
          ((sector_pixel_size * 16) / 80) * CURRENT_ANIMATION_SCALE;
        this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(FRAME_TIME, 1.5));
        this.ctx.drawImage(
          this.img,
          0,
          29,
          80,
          16,
          SECTOR_X_POS + sector_pixel_size / 2 - ANIMATED_WIDTH / 2,
          SECTOR_Y_POS +
            sector_pixel_size / 2 -
            ANIMATED_HEIGHT / 2 -
            sector_pixel_size * 0.3 * FRAME_TIME,
          ANIMATED_WIDTH,
          ANIMATED_HEIGHT,
        );
        if (FRAME_TIME >= 1) {
          delete this.animated_sectors[`${s_x}:${s_y}`];
        }
      }
    }
    this.ctx.globalAlpha = 1.0;
  }
  _drawSectorParticles(
    sector_x_pos,
    sector_y_pos,
    sector_pixel_size,
    frame_time,
  ) {
    const NUM_PARTICLES = 20;
    const PARTICLE_SPEED = sector_pixel_size * 0.7;
    const PARTICLE_SIZE = sector_pixel_size * 0.2;
    const center_x = sector_x_pos + sector_pixel_size / 2;
    const center_y = sector_y_pos + sector_pixel_size / 2;
    for (let i = 0; i < NUM_PARTICLES; i++) {
      let hash = this.sip.hash(
        this.key,
        `${this.seed}:${sector_x_pos}:${sector_y_pos}:${i}`,
      );
      hash = (((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101) / 100;
      const size_multiplier = 0.6 + hash * 0.8;
      const current_particle_speed = PARTICLE_SPEED * hash;
      const current_particle_size = PARTICLE_SIZE * size_multiplier;
      const angle =
        hash * Math.PI * 2 + frame_time * Math.PI * 2 * (0.5 + hash * 0.5);
      const radius = frame_time * current_particle_speed;
      const particle_x = center_x + Math.cos(angle) * radius;
      const particle_y = center_y + Math.sin(angle) * radius;
      const particle_final_size = current_particle_size * (1 - frame_time);
      this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(frame_time, 2));
      this.ctx.fillStyle = COLORS.SOLVED_PARTICLE_COLOR;
      this.ctx.beginPath();
      this.ctx.arc(
        particle_x,
        particle_y,
        particle_final_size / 2,
        0,
        Math.PI * 2,
      );
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    }
  }
  _drawLostSectorOverlays(start_x, end_x, start_y, end_y, sector_pixel_size) {
    this.ctx.fillStyle = COLORS.SECTOR_LOST_OVERLAY;
    this.ctx.globalAlpha = 0.4;
    for (let s_x = start_x; s_x < end_x; s_x++) {
      for (let s_y = start_y; s_y < end_y; s_y++) {
        if (!this.board.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        if (this.lost_animations.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        if (!this.lost_sectors.has(`${s_x}:${s_y}`)) continue;
        const SECTOR_X_POS = s_x * sector_pixel_size + this.offset_x;
        const SECTOR_Y_POS = s_y * sector_pixel_size + this.offset_y;
        this.ctx.fillRect(
          SECTOR_X_POS,
          SECTOR_Y_POS,
          sector_pixel_size - this.border_width,
          sector_pixel_size - this.border_width,
        );
      }
    }
    this.ctx.globalAlpha = 1.0;
  }
  _drawLostSectorAnimations(start_x, end_x, start_y, end_y, sector_pixel_size) {
    this.ctx.fillStyle = COLORS.SECTOR_LOST_OVERLAY;
    for (let s_x = start_x; s_x < end_x; s_x++) {
      for (let s_y = start_y; s_y < end_y; s_y++) {
        if (!this.lost_animations.hasOwnProperty(`${s_x}:${s_y}`)) continue;
        const FRAME_TIME =
          (Date.now() - this.lost_animations[`${s_x}:${s_y}`]) /
          (InfiniteMinesweeper.ANIMATION_SPEED_BASE * 12);
        this.ctx.globalAlpha = Math.min(FRAME_TIME, 1) * 0.4;
        const SECTOR_X_POS = s_x * sector_pixel_size + this.offset_x;
        const SECTOR_Y_POS = s_y * sector_pixel_size + this.offset_y;
        this.ctx.fillRect(
          SECTOR_X_POS,
          SECTOR_Y_POS,
          sector_pixel_size - this.border_width,
          sector_pixel_size - this.border_width,
        );
        const MAX_JITTER = 20;
        const DAMPEN = Math.max(1 - FRAME_TIME, 0);
        const jitterX = (Math.random() - 0.5) * MAX_JITTER * DAMPEN;
        const jitterY = (Math.random() - 0.5) * MAX_JITTER * DAMPEN;
        const CURRENT_ANIMATION_SCALE = 0.5 + 0.7 * FRAME_TIME;
        const ANIMATED_WIDTH = sector_pixel_size * CURRENT_ANIMATION_SCALE;
        const ANIMATED_HEIGHT =
          ((sector_pixel_size * 16) / 55) * CURRENT_ANIMATION_SCALE;
        this.ctx.globalAlpha = Math.max(0, 1 - Math.pow(FRAME_TIME, 0.8)) * 0.9;
        this.ctx.drawImage(
          this.img,
          0,
          12,
          49,
          16,
          SECTOR_X_POS + sector_pixel_size / 2 - ANIMATED_WIDTH / 2 + jitterX,
          SECTOR_Y_POS +
            sector_pixel_size / 2 -
            ANIMATED_HEIGHT / 2 -
            sector_pixel_size * 0.3 * FRAME_TIME +
            jitterY,
          ANIMATED_WIDTH,
          ANIMATED_HEIGHT,
        );
        for (let i = 0; i < 3; i++) {
          const angle = (Math.PI * 2 * i) / 3;
          const radius = 20 + 10 * Math.random();
          const baseX =
            SECTOR_X_POS + sector_pixel_size / 2 + Math.cos(angle) * radius;
          const baseY =
            SECTOR_Y_POS +
            (3 * sector_pixel_size) / 4 +
            Math.sin(angle) * radius;
          const jitterX = (Math.random() - 0.5) * 10;
          const jitterY = (Math.random() - 0.5) * 10;
          const emojiSize = 14 * (2 + 1 * FRAME_TIME);
          this.ctx.drawImage(
            this.img,
            50,
            12,
            14,
            14,
            baseX + jitterX - emojiSize / 2,
            baseY + jitterY - emojiSize / 2,
            emojiSize,
            emojiSize,
          );
        }
        if (FRAME_TIME >= 1) {
          delete this.lost_animations[`${s_x}:${s_y}`];
        }
      }
    }
    this.ctx.globalAlpha = 1.0;
  }
  isButton(x, y) {
    const [S_X, S_Y, X, Y] = this.convert(true, x, y);
    const SECTOR_PIXEL_SIZE = InfiniteMinesweeper.SECTOR_SIZE * this.tile_size;
    const START_X = -Math.floor(this.offset_x / SECTOR_PIXEL_SIZE) - 1;
    const START_Y = -Math.ceil(this.offset_y / SECTOR_PIXEL_SIZE);
    const END_X = Math.ceil(
      START_X + this.canvas.width / SECTOR_PIXEL_SIZE + 1,
    );
    const END_Y = Math.ceil(
      START_Y + this.canvas.height / SECTOR_PIXEL_SIZE + 1,
    );
    for (let s_y = START_Y; s_y < END_Y; s_y++) {
      for (let s_x = START_X; s_x < END_X; s_x++) {
        const SECTOR_KEY = `${s_x}:${s_y}`;
        if (!this.lost_sectors.has(SECTOR_KEY)) continue;
        if (s_x === S_X && s_y === S_Y && X > 2 && X < 7 && Y > 3 && Y < 6)
          return true;
      }
    }
  }
  buy(x, y) {
    const [S_X, S_Y] = this.convert(true, x, y);
    const SECTOR_KEY = `${S_X}:${S_Y}`;
    let hash = this.sip.hash(this.key, `${this.seed}:${SECTOR_KEY}`);
    hash = ((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101;
    const PRICE = Math.max(
      10,
      Math.floor(this.difficulty ** 2 / 40 + hash / 4),
    );
    if (this.goldmines >= PRICE) {
      this.goldmines -= PRICE;
      if (this.lost_sectors.has(SECTOR_KEY)) {
        this.lost_sectors.delete(SECTOR_KEY);
        this.lost_animations[SECTOR_KEY] = 0;
      }
    }
  }
  /**
   * Reveals a tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @param {boolean} [no_animate] - Whether to skip animation
   * @returns {Promise<boolean>} - Whether tiles was recursively revealed
   */
  async reveal(x, y, s_x, s_y, no_animate = false) {
    let recursed = false;
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.board?.[SECTOR_KEY] === SOLVED) return;
    if (!this.board.hasOwnProperty(SECTOR_KEY)) {
      this.buildSector(s_x, s_y);
    }
    const TILE = this.board[SECTOR_KEY][y][x];
    if (TILE[1] != TILE_STATES.REVEALED) {
      if (TILE[0] == MINE) {
        TILE[1] = TILE_STATES.LOST;
        this.lost_sectors.add(SECTOR_KEY);
        this.lost_animations[SECTOR_KEY] = Date.now();
        this.animateTile(
          x,
          y,
          s_x,
          s_y,
          InfiniteMinesweeper.ANIMATION_SPEED_BASE * 6,
          TILE_STATES.LOST,
        );
      } else if (TILE[0] === 0) {
        TILE[1] = TILE_STATES.REVEALED;
        if (!no_animate) {
          await this.animateTile(
            x,
            y,
            s_x,
            s_y,
            InfiniteMinesweeper.ANIMATION_SPEED_BASE * 0.2,
            TILE_STATES.REVEALED,
          );
        }
        recursed = true;
        let promises = [];
        const [G_X, G_Y] = this.convert(false, x, y, s_x, s_y);
        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if ((i != 0 || j != 0) && !this.isRevealed(G_X + i, G_Y + j)) {
              promises.push(this.reveal(G_X + i, G_Y + j));
            }
          }
        }
        await Promise.all(promises);
      } else if (TILE[0] > 0) {
        TILE[1] = TILE_STATES.REVEALED;
        if (!no_animate) {
          await this.animateTile(
            x,
            y,
            s_x,
            s_y,
            InfiniteMinesweeper.ANIMATION_SPEED_BASE,
            TILE_STATES.REVEALED,
          );
        }
      }
    }
    if (this.isSectorSolved(s_x, s_y) && this.board[SECTOR_KEY] !== SOLVED) {
      if (this.lost_sectors.has(SECTOR_KEY))
        this.lost_sectors.delete(SECTOR_KEY);
      this.board[SECTOR_KEY] = SOLVED;
      this.animated_sectors[SECTOR_KEY] = Date.now();
      this.goldmines++;
    }
    return recursed;
  }
  /**
   * Animates a tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @param {number} speed - Speed of animation
   * @param {number} state - State of tile
   * @returns {Promise<void>}
   */
  async animateTile(x, y, s_x, s_y, speed, state) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    this.animations[`${s_x}:${s_y}:${x}:${y}`] = [state, Date.now(), speed];
    await new Promise((resolve) => {
      setTimeout(resolve, speed);
    });
    delete this.animations[`${s_x}:${s_y}:${x}:${y}`];
  }
  /**
   * Flags/Unflags a tile.
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   */
  flag(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? null
        : BOARD_SECTOR?.[y][x] || this.buildSector(s_x, s_y)?.[y][x] || null;
    if (!TILE) return;
    if (TILE[1] !== TILE_STATES.REVEALED) {
      if (TILE[1] === TILE_STATES.FLAGGED) {
        TILE[1] = TILE_STATES.HIDDEN;
        this.animateTile(
          x,
          y,
          s_x,
          s_y,
          InfiniteMinesweeper.ANIMATION_SPEED_BASE * 0.2,
          TILE_STATES.HIDDEN,
        );
      } else {
        TILE[1] = TILE_STATES.FLAGGED;
        this.animateTile(
          x,
          y,
          s_x,
          s_y,
          InfiniteMinesweeper.ANIMATION_SPEED_BASE * 1.75,
          TILE_STATES.FLAGGED,
        );
      }
    }
  }
  /** Updates the canvas size */
  updateCanvasSize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.ctx.imageSmoothingEnabled = false;
  }
  /**
   * Checks if a tile is clickable
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - Whether the tile is clickable or not
   */
  isClickable(x, y, s_x, s_y) {
    [x, y] = this.convert(false, x, y, s_x, s_y);
    [s_x, s_y] = this.convert(true, x, y);
    if (this.lost_sectors.has(`${s_x}:${s_y}`)) return false;
    if (this.tile_size < 25) return false;
    if (this.isRevealed(x, y)) return true;
    for (let i = -1; i < 2; i++)
      for (let j = -1; j < 2; j++)
        if (
          (i != 0 || j != 0) &&
          (this.isRevealed(x + i, y + j) || this.isFlagged(x + i, y + j))
        )
          return true;
    return false;
  }
  /**
   * Checks if a tile is flagged
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - Whether the tile is flagged or not
   */
  isFlagged(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? this.buildSectorCache(s_x, s_y)?.[y][x] || null
        : BOARD_SECTOR?.[y][x] || null;
    return TILE?.[1] === TILE_STATES.FLAGGED;
  }
  /**
   * Checks if a tile is revealed
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - Whether the tile is revealed or not
   */
  isRevealed(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? this.buildSectorCache(s_x, s_y)?.[y][x] || null
        : BOARD_SECTOR?.[y][x] || null;
    return TILE?.[1] === TILE_STATES.REVEALED;
  }
  /**
   * Builds a solved sector into the cache
   * @param {number} [s_x] - X-coordinate of sector
   * @param {number} [s_y] - Y-coordinate of sector
   * @returns {Array<Array<[number, number]>>|false} - A solved sector built into
   *                                                   the cache.
   */
  buildSectorCache(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.board[SECTOR_KEY] !== 1) return false;
    if (this.cached_sectors.hasOwnProperty(SECTOR_KEY))
      return this.cached_sectors[SECTOR_KEY];
    this.cached_sectors[SECTOR_KEY] = Array.from(
      { length: InfiniteMinesweeper.SECTOR_SIZE },
      (_, y) =>
        Array.from({ length: InfiniteMinesweeper.SECTOR_SIZE }, (_, x) =>
          this.isMine(x, y, s_x, s_y)
            ? [MINE, TILE_STATES.FLAGGED]
            : [this.mineCount(x, y, s_x, s_y, true), TILE_STATES.REVEALED],
        ),
    );
    return this.cached_sectors[SECTOR_KEY];
  }
  /** Cleans the sector cache */
  cleanSectorCache() {
    const SECTOR_PIXEL_SIZE = InfiniteMinesweeper.SECTOR_SIZE * this.tile_size;
    const START_X = -Math.floor(this.offset_x / SECTOR_PIXEL_SIZE) - 1;
    const START_Y = -Math.ceil(this.offset_y / SECTOR_PIXEL_SIZE);
    const END_X = Math.ceil(
      START_X + this.canvas.width / SECTOR_PIXEL_SIZE + 1,
    );
    const END_Y = Math.ceil(
      START_Y + this.canvas.height / SECTOR_PIXEL_SIZE + 1,
    );
    for (const KEY in this.cached_sectors) {
      const [X, Y] = KEY.split(":").map(Number);
      if (X < START_X - 1 || X >= END_X || Y < START_Y - 1 || Y >= END_Y) {
        delete this.cached_sectors[KEY];
      }
    }
  }
  /**
   * Checks if a sector is solved.
   * @param {number} [s_x] - X-coordinate of sector
   * @param {number} [s_y] - Y-coordinate of sector
   * @returns {boolean} - Whether the sector is solved or not
   */
  isSectorSolved(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    const SECTOR = this.board[SECTOR_KEY];
    if (!SECTOR) return false;
    if (SECTOR === SOLVED) return true;
    for (let row of SECTOR) {
      for (let tile of row) {
        const [TILE_NUM, TILE_STATE] = tile;
        if (TILE_NUM !== MINE && TILE_STATE !== TILE_STATES.REVEALED) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Builds a sector into the main board.
   * @param {number} [s_x] - X-coordinate of sector
   * @param {number} [s_y] - Y-coordinate of sector
   * @returns {Array<Array<[number, number]>>|false} - A newly generated unsolved
   *                                                   sector or if exists, the
   *                                                   existing one.
   */
  buildSector(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.board.hasOwnProperty(SECTOR_KEY)) return this.board[SECTOR_KEY];
    const SECTOR = Array.from(
      { length: InfiniteMinesweeper.SECTOR_SIZE },
      (_, y) =>
        Array.from({ length: InfiniteMinesweeper.SECTOR_SIZE }, (_, x) => {
          return this.isMine(x, y, s_x, s_y)
            ? [MINE, TILE_STATES.HIDDEN]
            : [undefined, TILE_STATES.HIDDEN];
        }),
    );
    for (let y = 0; y < InfiniteMinesweeper.SECTOR_SIZE; y++) {
      for (let x = 0; x < InfiniteMinesweeper.SECTOR_SIZE; x++) {
        if (SECTOR[y][x][0] !== MINE) {
          SECTOR[y][x][0] = this.mineCount(x, y, s_x, s_y, true);
        }
      }
    }
    this.board[SECTOR_KEY] = SECTOR;
    return SECTOR;
  }
  /**
   * Returns the number of flags around a tile.
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {number} - Number of flags around tile
   */
  flagCount(x, y, s_x, s_y) {
    [x, y] = this.convert(false, x, y, s_x, s_y);
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if ((i != 0 || j != 0) && this.isFlagged(x + i, y + j)) sum++;
      }
    }
    return sum;
  }
  /**
   * Returns the number of mines around a tile.
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @param {boolean} [force=false] - Force check if `this.board` has wrong values
   * @returns {number} - Number of mines around tile
   */
  mineCount(x, y, s_x, s_y, force = false) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    const [G_X, G_Y] = this.convert(false, x, y, s_x, s_y);
    if (!force) {
      const BOARD_SECTOR = this.board[`${s_x}:${s_y}`];
      const TILE =
        BOARD_SECTOR === SOLVED
          ? this.buildSectorCache(s_x, s_y)[y][x]
          : BOARD_SECTOR?.[y][x] || null;
      if (TILE) return TILE[0];
    }
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        const [S_X, S_Y, X, Y] = this.convert(true, G_X + i, G_Y + j);
        const BOARD_SECTOR = this.board[`${S_X}:${S_Y}`];
        if (force) {
          if (this.isMine(X, Y, S_X, S_Y)) sum++;
          continue;
        }
        const TILE =
          BOARD_SECTOR === SOLVED
            ? this.buildSectorCache(S_X, S_Y)[Y][X]
            : BOARD_SECTOR?.[Y][X] || null;
        if (TILE) {
          if (TILE[0] === MINE) sum++;
        } else {
          if (this.isMine(X, Y, S_X, S_Y)) sum++;
        }
      }
    }
    return sum;
  }
  /**
   * Get the value of a tile (mine or not), deterministically.
   * @param {number} x - X-coordinate of the tile
   * @param {number} y - Y-coordinate of the tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - Whether the tile is a mine or not
   */
  isMine(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = this.convert(true, x, y, s_x, s_y);
    if (s_x == 0 && s_y == 0 && x == 4 && y == 4) return false;
    let hash = this.sip.hash(this.key, `${this.seed}:${s_x}:${s_y}:${x}:${y}`);
    hash = ((hash.h >>> 0) * 0x100000000 + (hash.l >>> 0)) % 101;
    return (
      hash <
      ([s_x, s_y].every((c) => c >= -1 && c <= 1)
        ? this.difficulty * InfiniteMinesweeper.CENTRAL_AREA_DIFFICULTY_MODIFIER
        : this.difficulty)
    );
  }
  /**
   * Converts between tile and sector coordinates.
   * @param {boolean} to_local_coords - Whether to convert to local coordinates or not
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {Array<number>} - An array containing resultant coords
   */
  convert(to_local_coords, x, y, s_x, s_y) {
    if (to_local_coords) {
      if (s_x != undefined && s_y != undefined) {
        return [s_x, s_y, x, y];
      } else {
        s_x = Math.floor(x / InfiniteMinesweeper.SECTOR_SIZE);
        s_y = Math.floor(y / InfiniteMinesweeper.SECTOR_SIZE);
        x =
          ((x % InfiniteMinesweeper.SECTOR_SIZE) +
            InfiniteMinesweeper.SECTOR_SIZE) %
          InfiniteMinesweeper.SECTOR_SIZE;
        y =
          ((y % InfiniteMinesweeper.SECTOR_SIZE) +
            InfiniteMinesweeper.SECTOR_SIZE) %
          InfiniteMinesweeper.SECTOR_SIZE;
        return [s_x, s_y, x, y];
      }
    } else {
      if (s_x != undefined && s_y != undefined) {
        return [
          s_x * InfiniteMinesweeper.SECTOR_SIZE + x,
          s_y * InfiniteMinesweeper.SECTOR_SIZE + y,
        ];
      } else {
        return [x, y];
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  window.game = new InfiniteMinesweeper();
});
