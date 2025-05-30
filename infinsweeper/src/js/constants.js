/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `constants.js`
 */

/**
 * @constant Tile states
 * @type {Object}
 * @exports TILE_STATES
 * @property {number} LOST - Tile is lost
 * @property {number} HIDDEN - Tile is hidden
 * @property {number} FLAGGED - Tile is flagged
 * @property {number} REVEALED - Tile is revealed
 */
export const TILE_STATES = Object.freeze({
  LOST: -1,
  HIDDEN: 0,
  FLAGGED: 1,
  REVEALED: 2,
});

/**
 * @constant Colors to be used with the game
 * @type {Object}
 * @exports COLORS
 * @property {string} BACKGROUND - Background color
 * @property {string} BACKGROUND_ZOOMED - Background color when zoomed
 * @property {string} TILE_DEFAULT - Default tile color
 * @property {string} TILE_CLICKABLE - Tile color when it is clickable
 * @property {string} TILE_REVEALED_NUMBERED - Tile color when it is revealed and has a number
 * @property {string} TILE_REVEALED_EMPTY - Tile color when it is revealed and is empty
 * @property {string} TILE_FLAGGED - Tile color when it is flagged
 * @property {string} SECTOR_OVERLAY - Sector overlay color
 * @property {string} SECTOR_LOST_OVERLAY - Lost sector overlay color
 * @property {string} SECTOR_BORDER - Sector border color
 * @property {string} FLAG_PARTICLE_COLOR - Flag particle color
 * @property {string} SOLVED_PARTICLE_COLOR - Solved particle color
 * @property {string} LOST_PARTICLE_COLOR - Lost particle color
 */
export const COLORS = Object.freeze({
  BACKGROUND: "#1b262c",
  BACKGROUND_ZOOMED: "#0e4c75",
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
});

/**
 * @constant
 * @type {number}
 * @exports SOLVED
 */
export const SOLVED = 1;

/**
 * @constant
 * @type {number}
 * @exports MINE
 */
export const MINE = -1;

/**
 * @constant
 * @type {number}
 * @exports SECTOR_SIZE
 */
export const SECTOR_SIZE = 9;

/**
 * @constant
 * @type {number}
 * @exports DIFFICULTY
 */
export const DIFFICULTY = 19;

/**
 * @constant
 * @type {number}
 * @exports CENTRAL_AREA_DIFFICULTY_MODIFIER
 */
export const CENTRAL_AREA_DIFFICULTY_MODIFIER = 0.8;

/**
 * @constant
 * @type {number}
 * @exports DETAIL_THRESHOLD
 */
export const DETAIL_THRESHOLD = 25;

/**
 * @constant
 * @type {number}
 * @exports DRAG_THRESHOLD
 */
export const DRAG_THRESHOLD = 20;

/**
 * @constant
 * @type {number}
 * @exports MAX_TRIES
 */
export const MAX_TRIES = 50;

/**
 * @constant
 * @type {number}
 * @exports ANIMATION_SPEED_BASE
 */
export const ANIMATION_SPEED_BASE = 150;

/**
 * @constant
 * @type {string}
 * @exports CANVAS_ID
 */
export const CANVAS_ID = "main-canvas";
