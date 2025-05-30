/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `event_handler.js`
 * @requires `constants.js`
 * @requires `event_bus.js`
 */

import { DRAG_THRESHOLD } from "./constants.js";
import EventBus from "./event_bus.js";

/**
 * @name EventHandler
 * @access public
 * @classdesc Handles user input & other events
 * @exports EventHandler
 * @default
 */
export default class EventHandler {
  /**
   * @constructs EventHandler
   * @function constructor
   * @desc Initializes the event handler
   * @param {HTMLCanvasElement} canvas
   * @param {EventBus} bus
   */
  constructor(canvas, bus) {
    this.canvas = canvas;
    this.bus = bus;
    this.is_dragging = false;
    this.is_mouse_down = false;
    this.drag_start_pos = [0, 0];
    this.disable_click = false;
    /** @listens EventBus#disable_click */
    this.bus.on("disable_click", () => {
      this.disable_click = true;
    });
    // Event listeners for game control
    /** @event mousedown */
    this.canvas.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.is_dragging = false;
      this.is_mouse_down = true;
      this.drag_start_pos = [e.offsetX, e.offsetY];
    });
    /**
     * @event mousemove
     * @fires EventBus#drag - optionally
     */
    this.canvas.addEventListener("mousemove", (e) => {
      if (this.is_dragging) {
        const DELTAX = e.offsetX - this.drag_start_pos[0];
        const DELTAY = e.offsetY - this.drag_start_pos[1];
        this.bus.emit("drag", DELTAX, DELTAY);
        this.drag_start_pos = [e.offsetX, e.offsetY];
      } else if (this.is_mouse_down) {
        const DELTAX = Math.abs(e.offsetX - this.drag_start_pos[0]);
        const DELTAY = Math.abs(e.offsetY - this.drag_start_pos[1]);
        if (DELTAX > DRAG_THRESHOLD || DELTAY > DRAG_THRESHOLD) {
          this.is_dragging = true;
        }
      }
    });
    /**
     * @event mouseup
     * @fires EventBus#click - optionally
     * @fires EventBus#clean_cache - optionally
     */
    this.canvas.addEventListener("mouseup", (e) => {
      this.is_mouse_down = false;
      if (this.is_dragging) {
        this.is_dragging = false;
        this.bus.emit("clean_cache");
        return;
      }
      if (this.disable_click) return;
      this.bus.emit("click", e.offsetX, e.offsetY, e.button);
    });
    /**
     * @event mouseleave
     * @fires EventBus#clean_cache - optionally
     */
    this.canvas.addEventListener("mouseleave", (_) => {
      this.is_mouse_down = false;
      if (this.is_dragging) {
        this.is_dragging = false;
        this.bus.emit("clean_cache");
        return;
      }
    });
    /**
     * @event wheel
     * @fires EventBus#zoom
     * @fires EventBus#clean_cache
     */
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      this.disable_click = this.bus.get(
        "zoom",
        e.offsetX,
        e.offsetY,
        e.deltaY > 0 ? false : true,
      );
      this.bus.emit("clean_cache");
    });
    /** @event click */
    this.canvas.addEventListener("click", (e) => {
      e.preventDefault();
    });
    /** @event contextmenu */
    this.canvas.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
    // Event Listeners for other events
    /**
     * @event resize
     * @fires EventBus#resize
     */
    window.addEventListener("resize", () => {
      this.bus.emit("resize");
    });
    /**
     * @event beforeunload
     * @fires EventBus#save
     */
    window.addEventListener("beforeunload", () => {
      this.bus.emit("save");
    });
    /**
     * @event visibilitychange
     * @fires EventBus#save - optionally
     */
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.bus.emit("save");
      }
    });
  }
}
