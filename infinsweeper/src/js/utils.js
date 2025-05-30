/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `utils.js`
 * @requires `third_party_utils.js`
 * @requires `constants.js`
 */

import { SipHash, LZW } from "./third_party_utils.js";
import {
  SECTOR_SIZE,
  DIFFICULTY,
  CENTRAL_AREA_DIFFICULTY_MODIFIER,
} from "./constants.js";

/**
 * @name DataHasher
 * @type {object}
 * @description An object with methods `hash` and `generate_key`
 *              such that `hash(key, data)` returns a number between 0 and 1 (deterministically),
 *              and `generate_key(seed)` returns an approprite key for `hash`
 * @property {function} generate_key
 * @property {function} hash
 * @access public
 * @exports DataHasher
 */
export const DataHasher = {
  /**
   * @function generate_key
   * @desc Generates a key
   * @param {string} seed - Seed for the hash function
   * @returns {Uint32Array} - Generated key
   *                     It can be the input itself for hashing
   *                     functions that dont require keys.
   */
  generate_key: SipHash.string16_to_key,
  /**
   * @function hash
   * @desc Hashes data
   * @param {Uint32Array} key - Key for the hash function
   *                       For hashing functions that dont require keys
   *                       it can be concatenated to the data
   * @param {string} data - Data to hash
   * @returns {number} - Psudo-random number between 0 and 1
   */
  hash: (key, data) =>
    (({ h, l }) => (((h >>> 0) * 0x100000000 + (l >>> 0)) % 101) / 100)(
      SipHash.hash(key, data),
    ),
};

/**
 * @name DataCompressor
 * @type {object}
 * @description An object with methods `zip` and `unzip`
 *              that accept/return strings and are reversable
 * @property {function} zip
 * @property {function} unzip
 * @access public
 * @exports DataCompressor
 */
export const DataCompressor = {
  /**
   * @function zip
   * @desc Compresses data
   * @param {string} data - Uncompressed data
   * @returns {string} - Compressed data
   */
  zip: (data) => String.fromCharCode(...LZW.compress(data)),
  /**
   * @function unzip
   * @desc Uncompresses data
   * @param {string} data - Compressed data
   * @returns {string} - Uncompressed data
   * @throws {Error} - If the compressed data is invalid
   */
  unzip: (data) =>
    LZW.uncompress(Uint16Array.from(data, (ch) => ch.charCodeAt(0))),
};

/**
 * @name LOOPS
 * @type {object}
 * @description An object with common loops used in game.
 * @property {function} overAdjacent
 * @property {function} overAdjacentSum
 * @property {function} anyAdjacent
 * @property {function} overOnScreenSectors
 * @property {function} overTilesInSector
 * @property {function} anyTilesInSector
 * @property {function} overTilesInSectorSum
 * @access public
 * @exports LOOPS
 */
export const LOOPS = {
  /**
   * @function overAdjacent
   * @desc Loops over adjacent tiles and calls a function
   * @param {function} f - Function to call on each tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   */
  overAdjacent: (f, x, y, s_x, s_y) => {
    [x, y] = convert(false, x, y, s_x, s_y);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue;
        f(x + i, y + j);
      }
    }
  },
  /**
   * @function overAdjacentSum
   * @desc Loops over adjacent tiles and checks if they satisfy a condition
   * @param {function} condition - The condition to check
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {number} - Number of adjacent tiles that satisfy the condition
   */
  overAdjacentSum: (condition, x, y, s_x, s_y) => {
    [x, y] = convert(false, x, y, s_x, s_y);
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue;
        if (condition(x + i, y + j)) sum++;
      }
    }
    return sum;
  },
  /**
   * @function anyAdjacent
   * @desc Loops over adjacent tiles and checks if they satisfy a condition
   * @param {function} condition - The condition to check
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - Whether any adjacent tile satisfies the condition or not
   */
  anyAdjacent: (condition, x, y, s_x, s_y) => {
    [x, y] = convert(false, x, y, s_x, s_y);
    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i == 0 && j == 0) continue;
        if (condition(x + i, y + j)) return true;
      }
    }
    return false;
  },
  /**
   * @function overOnScreenSectors
   * @desc Loops over all sectors in view
   * @param {function} f - Function to call on each sector
   * @param {number} start_x - X-coordinate of starting sector
   * @param {number} start_y - Y-coordinate of starting sector
   * @param {number} sector_size_in_px - Size of sector in pixels
   * @param {HTMLCanvasElement} canvas - Canvas element
   */
  overOnScreenSectors: (f, start_x, start_y, sector_size_in_px, canvas) => {
    let end_x = Math.ceil(start_x + canvas.width / sector_size_in_px);
    let end_y = Math.ceil(start_y + canvas.height / sector_size_in_px);
    for (let i = start_x - 1; i < end_x + 1; i++) {
      for (let j = start_y - 1; j < end_y + 1; j++) {
        f(i, j);
      }
    }
  },
  /**
   * @function overTilesInSector
   * @desc Loops over all tiles in a sector
   * @param {function} f - Function to call on each tile
   */
  overTilesInSector: (f) => {
    for (let i = 0; i < SECTOR_SIZE; i++) {
      for (let j = 0; j < SECTOR_SIZE; j++) {
        f(i, j);
      }
    }
  },
  /**
   * @function anyTilesInSector
   * @desc Checks if any tile in a sector satisfies a condition
   * @param {function} condition - The condition to check
   * @returns {boolean} - Whether any tile satisfies the condition or not
   */
  anyTilesInSector: (condition) => {
    for (let i = 0; i < SECTOR_SIZE; i++) {
      for (let j = 0; j < SECTOR_SIZE; j++) {
        if (condition(i, j)) return true;
      }
    }
    return false;
  },
  /**
   * @function overTilesInSectorSum
   * @desc Checks if all tiles in a sector satisfy a condition
   * @param {function} condition - The condition to check
   * @returns {number} - Number of tiles that satisfy the condition
   */
  overTilesInSectorSum: (condition) => {
    let sum = 0;
    for (let i = 0; i < SECTOR_SIZE; i++) {
      for (let j = 0; j < SECTOR_SIZE; j++) {
        if (condition(i, j)) sum++;
      }
    }
    return sum;
  },
};

/**
 * @function convert
 * @desc Converts between tile and sector coordinates.
 * @param {boolean} to_local_coords - Whether to convert to local coordinates or not
 * @param {number} x - X-coordinate of tile
 * @param {number} y - Y-coordinate of tile
 * @param {number} [s_x] - X-coordinate of sector if `x` is relative
 * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
 * @returns {Array<number>} - An array containing resultant coords
 * @exports convert
 */
export function convert(to_local_coords, x, y, s_x, s_y) {
  if (to_local_coords) {
    if (s_x != undefined && s_y != undefined) {
      return [s_x, s_y, x, y];
    } else {
      s_x = Math.floor(x / SECTOR_SIZE);
      s_y = Math.floor(y / SECTOR_SIZE);
      x = ((x % SECTOR_SIZE) + SECTOR_SIZE) % SECTOR_SIZE;
      y = ((y % SECTOR_SIZE) + SECTOR_SIZE) % SECTOR_SIZE;
      return [s_x, s_y, x, y];
    }
  } else {
    if (s_x != undefined && s_y != undefined) {
      return [s_x * SECTOR_SIZE + x, s_y * SECTOR_SIZE + y];
    } else {
      return [x, y];
    }
  }
}

/**
 * @function isMine
 * @desc Get the type of a tile (mine or not) deterministically.
 * @param {string} key - Key to use for hashing
 * @param {number} x - X-coordinate of the tile
 * @param {number} y - Y-coordinate of the tile
 * @param {number} [s_x] - X-coordinate of sector if `x` is relative
 * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
 * @returns {boolean} - Whether the tile is a mine or not
 * @exports isMine
 */
export function isMine(key, x, y, s_x, s_y) {
  [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
  if (s_x == 0 && s_y == 0 && x == 4 && y == 4) return false;
  return (
    DataHasher.hash(key, `${s_x}:${s_y}:${x}:${y}`) * 100 <
    ([s_x, s_y].every((c) => c >= -1 && c <= 1)
      ? DIFFICULTY * CENTRAL_AREA_DIFFICULTY_MODIFIER
      : DIFFICULTY)
  );
}
