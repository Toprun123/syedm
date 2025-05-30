/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `saver.js`
 * @requires `utils.js`
 * @requires `event_bus.js`
 * @requires `game_controller.js`
 */

import { DataHasher, DataCompressor } from "./utils.js";
import EventBus from "./event_bus.js";
import GameController from "./game_controller.js";

/**
 * @name Saver
 * @access public
 * @classdesc Handles saving & loading game data
 * @exports Saver
 * @default
 */
export default class Saver {
  /**
   * @constructs Saver
   * @function
   * @desc Initializes the game saver
   * @param {GameController} game
   * @param {EventBus} bus
   */
  constructor(game, bus) {
    /** @type {number} - ID of the autosave interval */
    this.save_interval_id = undefined;
    this.delete_save = false;
    this.game = game;
    this.bus = bus;
    /** @listens EventBus#is_saved */
    this.bus.on_retrievable("is_saved", this.isSaved.bind(this));
    /** @listens EventBus#save */
    this.bus.on("save", this.save.bind(this));
    /** @listens EventBus#load_save */
    this.bus.on("load_save", this.load.bind(this));
    /** @listens EventBus#delete_save */
    this.bus.on("delete_save", this.deleteSave.bind(this));
    /** @listens EventBus#start_autosaver */
    this.bus.on("start_autosaver", this.startAutosaver.bind(this));
    /** @listens EventBus#stop_autosaver */
    this.bus.on("stop_autosaver", this.stopAutosaver.bind(this));
  }
  /**
   * @function startAutosaver
   * @desc Starts the autosave feature
   */
  startAutosaver() {
    this.save_interval_id = setInterval(
      () => {
        this.bus.emit("save");
      },
      2 * 60 * 1000,
    );
  }
  /**
   * @function stopAutosaver
   * @desc Stops the autosave feature
   */
  stopAutosaver() {
    clearInterval(this.save_interval_id);
    this.save_interval_id = undefined;
  }
  /**
   * @function isSaved
   * @desc Checks if a save exists
   */
  isSaved() {
    return localStorage.getItem("save") !== null;
  }
  /**
   * @function save
   * @desc Saves the game data
   * @fires EventBus#view_pos
   */
  save() {
    if (this.delete_save) return;
    const data = {
      game_pos: this.game.game_pos,
      goldmines: this.game.goldmines,
      seed: this.game.seed,
      difficulty: this.game.difficulty,
      view_pos: this.bus.get("view_pos"),
    };
    const compressed = DataCompressor.zip(JSON.stringify(data));
    localStorage.setItem("save", compressed);
  }
  /**
   * @function load
   * @desc Loads the game data
   * @param {string} [compressed] - Compressed game data
   * @fires EventBus#set_view_pos
   * @fires EventBus#update_key
   * @fires EventBus#reset
   */
  load(compressed = undefined) {
    try {
      compressed = compressed || localStorage.getItem("save");
      if (!compressed) throw new Error("No save found");
      const uncompressed = DataCompressor.unzip(compressed);
      const savedData = JSON.parse(uncompressed);
      Object.assign(this.game, {
        goldmines: savedData.goldmines,
        seed: savedData.seed,
        key: DataHasher.generate_key(savedData.seed),
        difficulty: savedData.difficulty,
      });
      this.bus.emit("set_view_pos", savedData.view_pos);
      this.bus.emit("update_key", this.game.key);
      const savedGamePos = savedData.game_pos || {};
      Object.assign(this.game.game_pos, {
        animated_tiles: { flagged: {}, revealed: {}, hidden: {}, bombed: {} },
        animated_sectors: { solved: {}, lost: {}, bought: {} },
        data_sectors: savedGamePos.data_sectors || {},
        cached_sectors: savedGamePos.cached_sectors || {},
        lost_sectors: savedGamePos.lost_sectors || {},
      });
    } catch (e) {
      this.deleteSave();
      this.bus.emit("reset");
    }
  }
  /**
   * @function saveToFile
   * @desc Saves the game data to a file
   */
  saveToFile() {
    const data = {
      game_pos: this.game.game_pos,
      goldmines: this.game.goldmines,
      seed: this.game.seed,
      difficulty: this.game.difficulty,
      view_pos: this.bus.get("view_pos"),
    };
    let compressed = DataCompressor.zip(JSON.stringify(data));
    let url = URL.createObjectURL(
      new Blob([compressed], { type: "application/octet-stream" }),
      "save.txt",
    );
    let a = document.createElement("a");
    a.href = url;
    a.download = "save.txt";
    a.click();
  }
  /**
   * @function deleteSave
   * @desc Deletes the save
   */
  deleteSave() {
    localStorage.removeItem("save");
    this.delete_save = true;
    this.stopAutosaver();
  }
  /**
   * @function loadFromFile
   * @desc Loads the game data from a file
   */
  loadFromFile() {
    let input = document.createElement("input");
    input.type = "file";
    input.accept = "application/octet-stream";
    input.onchange = () => {
      let file = input.files[0];
      let reader = new FileReader();
      reader.onload = () => {
        return this.load(reader.result);
      };
      reader.readAsText(file);
    };
    input.click();
  }
}
