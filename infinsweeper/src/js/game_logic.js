/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `game_logic.js`
 * @requires `constants.js`
 * @requires `utils.js`
 * @requires `event_bus.js`
 */

import {
  TILE_STATES,
  SOLVED,
  MINE,
  SECTOR_SIZE,
  ANIMATION_SPEED_BASE,
  DIFFICULTY,
} from "./constants.js";
import { DataHasher, LOOPS, convert, isMine } from "./utils.js";
import EventBus from "./event_bus.js";

/**
 * @name GameLogic
 * @access public
 * @classdesc Handles primary game logic
 * @exports GameLogic
 * @default
 */
export default class GameLogic {
  /**
   * @constructs GameLogic
   * @function constructor
   * @desc Initializes the game logic
   * @param {Object} game_pos
   * @param {Uint32Array} key
   * @param {EventBus} bus
   */
  constructor(game_pos, key, bus) {
    this.key = key;
    this.bus = bus;
    this.game_pos = game_pos;
    // TODO: Make the stats work
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
    /** @listens EventBus#click */
    this.bus.on("click", this.click.bind(this));
    /** @listens EventBus#clean_cache */
    this.bus.on("clean_cache", this.cleanSectorCache.bind(this));
    /** @listens EventBus#update_key */
    this.bus.on("update_key", this.updateKey.bind(this));
    /** @listens EventBus#reveal */
    this.bus.onRetrievable("reveal", this.reveal.bind(this));
    /** @listens EventBus#request_cache */
    this.bus.onRetrievable("request_cache", this.buildSectorCache.bind(this));
    /** @listens EventBus#is_clickable */
    this.bus.onRetrievable("is_clickable", this.isClickable.bind(this));
  }
  /**
   * @function click
   * @desc Handles a click
   * @param {number} x - X-coordinate in terms of screen
   * @param {number} y - Y-coordinate in terms of screen
   * @param {number} button - 0 for left, 1 for middle, 2 for right (from Event#button)
   * @fires EventBus#click_convert
   * @fires EventBus#is_buy_button
   */
  click(x, y, button) {
    const [X, Y] = this.bus.get("click_convert", x, y) || [
      undefined,
      undefined,
    ];
    if (X === undefined || Y === undefined) return;
    if (this.bus.get("is_buy_button", X, Y)) {
      if (button == 0) this.buy(X, Y);
      return;
    }
    if (!this.isClickable(X, Y)) return;
    if (button == 0) {
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
    } else if (button === 2) {
      this.flag(X, Y);
    }
  }
  /**
   * @function updateKey
   * @desc Updates the game key
   * @param {Uint32Array} key
   */
  updateKey(key) {
    this.key = key;
  }
  /**
   * @function buy
   * @desc Buys a sector
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   */
  buy(x, y, s_x, s_y) {
    const [S_X, S_Y] = convert(true, x, y, s_x, s_y);
    const SECTOR_KEY = `${S_X}:${S_Y}`;
    const PRICE = this.game_pos.lost_sectors[SECTOR_KEY];
    if (this.goldmines >= PRICE) {
      this.goldmines -= PRICE;
      if (this.game_pos.lost_sectors.hasOwnProperty(SECTOR_KEY)) {
        delete this.game_pos.lost_sectors[SECTOR_KEY];
        delete this.game_pos.animated_sectors.lost[SECTOR_KEY];
      }
    }
  }
  /**
   * @function reveal
   * @desc Reveals a tile
   * @async
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @param {boolean} [no_animate=false] - If true, no animation will be played
   * @returns {Promise<boolean>} - Resolves to whether the reveal caused more
   *                               than one tile to be revealed
   */
  async reveal(x, y, s_x, s_y, no_animate = false) {
    let recursed = false;
    [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.game_pos.data_sectors?.[SECTOR_KEY] === SOLVED) return;
    if (!this.game_pos.data_sectors.hasOwnProperty(SECTOR_KEY)) {
      this.buildSector(s_x, s_y);
    }
    const TILE = this.game_pos.data_sectors[SECTOR_KEY][y][x];
    if (TILE[1] != TILE_STATES.REVEALED) {
      if (TILE[0] == MINE) {
        TILE[1] = TILE_STATES.LOST;
        this.game_pos.lost_sectors[SECTOR_KEY] = Math.max(
          10,
          Math.floor(
            DIFFICULTY ** 2 / 50 +
              DataHasher.hash(this.key, `${SECTOR_KEY}`) * 20,
          ),
        );
        this.animate(SECTOR_KEY, "lost", false);
        this.animate(
          `${SECTOR_KEY}:${x}:${y}`,
          "bombed",
          true,
          ANIMATION_SPEED_BASE * 3,
        );
      } else if (TILE[0] === 0) {
        TILE[1] = TILE_STATES.REVEALED;
        if (!no_animate) {
          this.animate(
            `${SECTOR_KEY}:${x}:${y}`,
            "revealed",
            true,
            ANIMATION_SPEED_BASE * 0.2,
          );
          await new Promise((resolve) =>
            setTimeout(resolve, ANIMATION_SPEED_BASE * 0.2),
          );
        }
        recursed = true;
        let promises = [];
        LOOPS.overAdjacent(
          (x, y) => {
            if (!this.isRevealed(x, y)) {
              promises.push(this.reveal(x, y));
            }
          },
          x,
          y,
          s_x,
          s_y,
        );
        await Promise.all(promises);
      } else if (TILE[0] > 0) {
        TILE[1] = TILE_STATES.REVEALED;
        if (!no_animate) {
          this.animate(`${SECTOR_KEY}:${x}:${y}`, "revealed", true);
          await new Promise((resolve) =>
            setTimeout(resolve, ANIMATION_SPEED_BASE),
          );
        }
      }
    }
    if (
      this.isSectorSolved(s_x, s_y) &&
      this.game_pos.data_sectors[SECTOR_KEY] !== SOLVED
    ) {
      if (this.game_pos.lost_sectors.hasOwnProperty(SECTOR_KEY))
        delete this.game_pos.lost_sectors[SECTOR_KEY];
      this.game_pos.data_sectors[SECTOR_KEY] = SOLVED;
      this.animate(SECTOR_KEY, "solved", false);
      // TODO: Collect stats here
      this.goldmines++;
    }
    return recursed;
  }
  /**
   * @function flag
   * @desc Flags a tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   */
  flag(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? null
        : BOARD_SECTOR?.[y][x] || this.buildSector(s_x, s_y)?.[y][x] || null;
    if (!TILE) return;
    if (TILE[1] !== TILE_STATES.REVEALED) {
      if (TILE[1] === TILE_STATES.FLAGGED) {
        TILE[1] = TILE_STATES.HIDDEN;
      } else {
        TILE[1] = TILE_STATES.FLAGGED;
        this.game_pos.animated_tiles.flagged[`${s_x}:${s_y}:${x}:${y}`] = [
          Date.now(),
          ANIMATION_SPEED_BASE * 1.75,
        ];
      }
    }
  }
  /**
   * @function isClickable
   * @desc Checks if a tile is clickable
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - True if tile is clickable, false otherwise
   */
  isClickable(x, y, s_x, s_y) {
    [x, y] = convert(false, x, y, s_x, s_y);
    [s_x, s_y] = convert(true, x, y);
    if (this.game_pos.lost_sectors.hasOwnProperty(`${s_x}:${s_y}`))
      return false;
    if (this.isRevealed(x, y)) return true;
    return LOOPS.anyAdjacent(
      (x, y) => this.isRevealed(x, y) || this.isFlagged(x, y),
      x,
      y,
    );
  }
  /**
   * @function isFlagged
   * @desc Checks if a tile is flagged
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - True if tile is flagged, false otherwise
   */
  isFlagged(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? this.buildSectorCache(s_x, s_y)?.[y][x] || null
        : BOARD_SECTOR?.[y][x] || null;
    return TILE?.[1] === TILE_STATES.FLAGGED;
  }
  /**
   * @function isRevealed
   * @desc Checks if a tile is revealed
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {boolean} - True if tile is revealed, false otherwise
   */
  isRevealed(x, y, s_x, s_y) {
    [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
    const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
    const TILE =
      BOARD_SECTOR === SOLVED
        ? this.buildSectorCache(s_x, s_y)?.[y][x] || null
        : BOARD_SECTOR?.[y][x] || null;
    return TILE?.[1] === TILE_STATES.REVEALED;
  }
  /**
   * @function isSectorSolved
   * @desc Checks if a sector is solved
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   * @returns {boolean} - True if sector is solved, false otherwise
   */
  isSectorSolved(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    const SECTOR = this.game_pos.data_sectors[SECTOR_KEY];
    if (!SECTOR) return false;
    if (SECTOR === SOLVED) return true;
    return (
      LOOPS.overTilesInSectorSum((x, y) => {
        const [TILE_NUM, TILE_STATE] = SECTOR[y][x];
        if (TILE_NUM !== MINE && TILE_STATE !== TILE_STATES.REVEALED) {
          return false;
        }
        return true;
      }) ==
      SECTOR_SIZE ** 2
    );
  }
  /**
   * @function flagCount
   * @desc Counts the number of flags adjacent to a tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @returns {number} - The number of flags adjacent to the tile
   */
  flagCount(x, y, s_x, s_y) {
    [x, y] = convert(false, x, y, s_x, s_y);
    return LOOPS.overAdjacentSum((x, y) => this.isFlagged(x, y), x, y);
  }
  /**
   * @function mineCount
   * @desc Counts the number of mines adjacent to a tile
   * @param {number} x - X-coordinate of tile
   * @param {number} y - Y-coordinate of tile
   * @param {number} [s_x] - X-coordinate of sector if `x` is relative
   * @param {number} [s_y] - Y-coordinate of sector if `y` is relative
   * @param {boolean} [force=false] - Force count even if tile is revealed
   * @returns {number} - The number of mines adjacent to the tile
   */
  mineCount(x, y, s_x, s_y, force = false) {
    [s_x, s_y, x, y] = convert(true, x, y, s_x, s_y);
    const [G_X, G_Y] = convert(false, x, y, s_x, s_y);
    if (!force) {
      const BOARD_SECTOR = this.game_pos.data_sectors[`${s_x}:${s_y}`];
      const TILE =
        BOARD_SECTOR === SOLVED
          ? this.buildSectorCache(s_x, s_y)[y][x]
          : BOARD_SECTOR?.[y][x] || null;
      if (TILE) return TILE[0];
    }
    return LOOPS.overAdjacentSum(
      (x, y) => {
        const [S_X, S_Y, X, Y] = convert(true, x, y);
        const BOARD_SECTOR = this.game_pos.data_sectors[`${S_X}:${S_Y}`];
        if (force) {
          if (isMine(this.key, X, Y, S_X, S_Y)) return true;
        } else {
          const TILE =
            BOARD_SECTOR === SOLVED
              ? this.buildSectorCache(S_X, S_Y)[Y][X]
              : BOARD_SECTOR?.[Y][X] || null;
          if (TILE) {
            if (TILE[0] === MINE) return true;
          } else {
            if (isMine(this.key, X, Y, S_X, S_Y)) return true;
          }
        }
        return false;
      },
      G_X,
      G_Y,
    );
  }
  /**
   * @function buildSector
   * @desc Builds a new sector
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   * @returns {Array<Array<Array<number>>>} - The sector
   */
  buildSector(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.game_pos.data_sectors.hasOwnProperty(SECTOR_KEY))
      return this.game_pos.data_sectors[SECTOR_KEY];
    this.game_pos.data_sectors[SECTOR_KEY] = Array.from(
      { length: SECTOR_SIZE },
      (_, y) =>
        Array.from({ length: SECTOR_SIZE }, (_, x) => {
          return isMine(this.key, x, y, s_x, s_y)
            ? [MINE, TILE_STATES.HIDDEN]
            : [undefined, TILE_STATES.HIDDEN];
        }),
    );
    LOOPS.overTilesInSector((x, y) => {
      if (this.game_pos.data_sectors[SECTOR_KEY][y][x][0] !== MINE) {
        this.game_pos.data_sectors[SECTOR_KEY][y][x][0] = this.mineCount(
          x,
          y,
          s_x,
          s_y,
          true,
        );
      }
    });
    return this.game_pos.data_sectors[SECTOR_KEY];
  }
  /**
   * @function buildSectorCache
   * @desc Builds a sector cache
   * @param {number} s_x - X-coordinate of sector
   * @param {number} s_y - Y-coordinate of sector
   * @returns {Array<Array<Array<number>>>|false} - The cached sector
   */
  buildSectorCache(s_x, s_y) {
    const SECTOR_KEY = `${s_x}:${s_y}`;
    if (this.game_pos.data_sectors[SECTOR_KEY] !== 1) return false;
    if (this.game_pos.cached_sectors.hasOwnProperty(SECTOR_KEY))
      return this.game_pos.cached_sectors[SECTOR_KEY];
    this.game_pos.cached_sectors[SECTOR_KEY] = Array.from(
      { length: SECTOR_SIZE },
      () => new Array(SECTOR_SIZE),
    );
    LOOPS.overTilesInSector((x, y) => {
      const TILE = isMine(this.key, x, y, s_x, s_y)
        ? [MINE, TILE_STATES.FLAGGED]
        : [this.mineCount(x, y, s_x, s_y, true), TILE_STATES.REVEALED];
      this.game_pos.cached_sectors[SECTOR_KEY][y][x] = TILE;
    });
    return this.game_pos.cached_sectors[SECTOR_KEY];
  }
  /**
   * @function cleanSectorCache
   * @desc Cleans the sector cache
   * @fires EventBus#sector_bounds
   */
  cleanSectorCache() {
    const BOUNDS = this.bus.get("sector_bounds");
    if (!BOUNDS) return;
    const [START_X, START_Y, END_X, END_Y] = BOUNDS;
    for (const KEY in this.game_pos.cached_sectors) {
      const [X, Y] = KEY.split(":").map(Number);
      if (X < START_X - 1 || X >= END_X || Y < START_Y - 1 || Y >= END_Y) {
        delete this.game_pos.cached_sectors[KEY];
      }
    }
  }
  /**
   * @function animate
   * @desc Animate a tile or sector
   * @param {string} key - Key to use for hashing
   * @param {string} type - Type of animation
   * @param {boolean} is_tile - Whether the animation is for a tile
   * @param {number} [duration=ANIMATION_SPEED_BASE] - Duration of the animation
   *                                                   if it is a tile (in ms).
   */
  animate(key, type, is_tile = true, duration = ANIMATION_SPEED_BASE) {
    const now = Date.now();
    if (is_tile) {
      this.game_pos.animated_tiles[type][key] = [now, duration];
    } else {
      this.game_pos.animated_sectors[type][key] = now;
    }
  }
}
