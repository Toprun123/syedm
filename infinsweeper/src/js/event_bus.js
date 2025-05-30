/**
 * @author Syed Daanish <me@syedm.dev>
 * @file `event_bus.js`
 */

/**
 * @name EventBus
 * @access public
 * @classdesc Handles event emission & listening
 *            to connect with other modules.
 * @exports EventBus
 * @default
 */
export default class EventBus {
  /**
   * @constructs EventBus
   * @function constructor
   * @desc Initializes the event bus
   */
  constructor() {
    this.retreivable_events = {};
    this.events = {};
  }
  /**
   * @function on
   * @desc Sets up an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to call
   *                              (multiple functions can be added)
   */
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }
  /**
   * @function emit
   * @desc Emits an event
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to the callback
   *                      functions (0 or more)
   */
  emit(event, ...args) {
    if (this.events[event]) {
      this.events[event].forEach((fn) => {
        fn(...args);
      });
    }
  }
  /**
   * @function onRetrievable
   * @desc Sets up a retrievable event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to call
   *                              (can only be used once)
   */
  onRetrievable(event, callback) {
    this.retreivable_events[event] = callback;
  }
  /**
   * @function get
   * @desc Retrieves data from an event
   * @param {string} event - Event name
   * @param {...*} args - Arguments to pass to the callback
   *                      function (only one)
   * @returns {any|undefined} - Data from the event or undefined
   */
  get(event, ...args) {
    if (this.retreivable_events[event]) {
      return this.retreivable_events[event](...args);
    }
    return undefined;
  }
}
