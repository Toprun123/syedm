## Modules

<dl>
<dt><a href="#module_Tile">Tile</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#module_Colors">Colors</a> : <code>Object</code></dt>
<dd></dd>
<dt><a href="#module_SOLVED">SOLVED</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_MINE">MINE</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_SECTOR_SIZE">SECTOR_SIZE</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_DIFFICULTY">DIFFICULTY</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_CENTRAL_AREA_DIFFICULTY_MODIFIER">CENTRAL_AREA_DIFFICULTY_MODIFIER</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_DETAIL_THRESHOLD">DETAIL_THRESHOLD</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_DRAG_THRESHOLD">DRAG_THRESHOLD</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_MAX_TRIES">MAX_TRIES</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_ANIMATION_SPEED_BASE">ANIMATION_SPEED_BASE</a> : <code>number</code></dt>
<dd></dd>
<dt><a href="#module_CANVAS_ID">CANVAS_ID</a> : <code>string</code></dt>
<dd></dd>
<dt><a href="#module_EventBus">EventBus</a></dt>
<dd></dd>
<dt><a href="#module_EventHandler">EventHandler</a></dt>
<dd></dd>
<dt><a href="#module_GameController">GameController</a></dt>
<dd></dd>
<dt><a href="#module_GameLogic">GameLogic</a></dt>
<dd></dd>
<dt><a href="#module_GameRenderer">GameRenderer</a></dt>
<dd></dd>
<dt><a href="#module_Saver">Saver</a></dt>
<dd></dd>
<dt><a href="#module_SipHash">SipHash</a></dt>
<dd></dd>
<dt><a href="#module_LZW">LZW</a></dt>
<dd></dd>
<dt><a href="#module_UIRenderer">UIRenderer</a> ⇐ <code>GameRenderer</code></dt>
<dd></dd>
<dt><a href="#module_DataHasher">DataHasher</a> : <code>object</code></dt>
<dd><p>An object with methods <code>hash</code> and <code>generate_key</code>
             such that <code>hash(key, data)</code> returns a number between 0 and 1 (deterministically),
             and <code>generate_key(seed)</code> returns an approprite key for <code>hash</code></p>
</dd>
<dt><a href="#module_DataCompressor">DataCompressor</a> : <code>object</code></dt>
<dd><p>An object with methods <code>zip</code> and <code>unzip</code>
             that accept/return strings and are reversable</p>
</dd>
<dt><a href="#module_LOOPS">LOOPS</a> : <code>object</code></dt>
<dd><p>An object with common loops used in game.</p>
</dd>
<dt><a href="#module_convert">convert</a> ⇒ <code>Array.&lt;number&gt;</code></dt>
<dd><p>Converts between tile and sector coordinates.</p>
</dd>
<dt><a href="#module_isMine">isMine</a> ⇒ <code>boolean</code></dt>
<dd><p>Get the type of a tile (mine or not) deterministically.</p>
</dd>
</dl>

## Members

<dl>
<dt><a href="#game">game</a> : <code>GameController</code></dt>
<dd><p>The game controller instance.</p>
</dd>
</dl>

## Events

<dl>
<dt><a href="#event_DOMContentLoaded">"DOMContentLoaded"</a></dt>
<dd></dd>
</dl>

<a name="module_Tile"></a>

## Tile : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| LOST | <code>number</code> | Tile is lost |
| HIDDEN | <code>number</code> | Tile is hidden |
| FLAGGED | <code>number</code> | Tile is flagged |
| REVEALED | <code>number</code> | Tile is revealed |

<a name="module_Colors"></a>

## Colors : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| BACKGROUND | <code>string</code> | Background color |
| BACKGROUND_ZOOMED | <code>string</code> | Background color when zoomed |
| TILE_DEFAULT | <code>string</code> | Default tile color |
| TILE_CLICKABLE | <code>string</code> | Tile color when it is clickable |
| TILE_REVEALED_NUMBERED | <code>string</code> | Tile color when it is revealed and has a number |
| TILE_REVEALED_EMPTY | <code>string</code> | Tile color when it is revealed and is empty |
| TILE_FLAGGED | <code>string</code> | Tile color when it is flagged |
| SECTOR_OVERLAY | <code>string</code> | Sector overlay color |
| SECTOR_LOST_OVERLAY | <code>string</code> | Lost sector overlay color |
| SECTOR_BORDER | <code>string</code> | Sector border color |
| FLAG_PARTICLE_COLOR | <code>string</code> | Flag particle color |
| SOLVED_PARTICLE_COLOR | <code>string</code> | Solved particle color |
| LOST_PARTICLE_COLOR | <code>string</code> | Lost particle color |

<a name="module_SOLVED"></a>

## SOLVED : <code>number</code>
<a name="module_MINE"></a>

## MINE : <code>number</code>
<a name="module_SECTOR_SIZE"></a>

## SECTOR\_SIZE : <code>number</code>
<a name="module_DIFFICULTY"></a>

## DIFFICULTY : <code>number</code>
<a name="module_CENTRAL_AREA_DIFFICULTY_MODIFIER"></a>

## CENTRAL\_AREA\_DIFFICULTY\_MODIFIER : <code>number</code>
<a name="module_DETAIL_THRESHOLD"></a>

## DETAIL\_THRESHOLD : <code>number</code>
<a name="module_DRAG_THRESHOLD"></a>

## DRAG\_THRESHOLD : <code>number</code>
<a name="module_MAX_TRIES"></a>

## MAX\_TRIES : <code>number</code>
<a name="module_ANIMATION_SPEED_BASE"></a>

## ANIMATION\_SPEED\_BASE : <code>number</code>
<a name="module_CANVAS_ID"></a>

## CANVAS\_ID : <code>string</code>
<a name="module_EventBus"></a>

## EventBus
**Access**: public  

* [EventBus](#module_EventBus)
    * [~constructor()](#module_EventBus..constructor)
    * [~on(event, callback)](#module_EventBus..on)
    * [~emit(event, ...args)](#module_EventBus..emit)
    * [~onRetrievable(event, callback)](#module_EventBus..onRetrievable)
    * [~get(event, ...args)](#module_EventBus..get) ⇒ <code>any</code> \| <code>undefined</code>

<a name="module_EventBus..constructor"></a>

### EventBus~constructor()
Initializes the event bus

**Kind**: inner method of [<code>EventBus</code>](#module_EventBus)  
<a name="module_EventBus..on"></a>

### EventBus~on(event, callback)
Sets up an event listener

**Kind**: inner method of [<code>EventBus</code>](#module_EventBus)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function to call                              (multiple functions can be added) |

<a name="module_EventBus..emit"></a>

### EventBus~emit(event, ...args)
Emits an event

**Kind**: inner method of [<code>EventBus</code>](#module_EventBus)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| ...args | <code>\*</code> | Arguments to pass to the callback                      functions (0 or more) |

<a name="module_EventBus..onRetrievable"></a>

### EventBus~onRetrievable(event, callback)
Sets up a retrievable event listener

**Kind**: inner method of [<code>EventBus</code>](#module_EventBus)  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| callback | <code>function</code> | Callback function to call                              (can only be used once) |

<a name="module_EventBus..get"></a>

### EventBus~get(event, ...args) ⇒ <code>any</code> \| <code>undefined</code>
Retrieves data from an event

**Kind**: inner method of [<code>EventBus</code>](#module_EventBus)  
**Returns**: <code>any</code> \| <code>undefined</code> - - Data from the event or undefined  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>string</code> | Event name |
| ...args | <code>\*</code> | Arguments to pass to the callback                      function (only one) |

<a name="module_EventHandler"></a>

## EventHandler
**Access**: public  

* [EventHandler](#module_EventHandler)
    * [~constructor(canvas, bus)](#module_EventHandler..constructor)
    * ["mousedown"](#event_mousedown)
    * ["mousemove"](#event_mousemove)
    * ["mouseup"](#event_mouseup)
    * ["mouseleave"](#event_mouseleave)
    * ["wheel"](#event_wheel)
    * ["click"](#event_click)
    * ["contextmenu"](#event_contextmenu)
    * ["resize"](#event_resize)
    * ["beforeunload"](#event_beforeunload)
    * ["visibilitychange"](#event_visibilitychange)

<a name="module_EventHandler..constructor"></a>

### EventHandler~constructor(canvas, bus)
Initializes the event handler

**Kind**: inner method of [<code>EventHandler</code>](#module_EventHandler)  

| Param | Type |
| --- | --- |
| canvas | <code>HTMLCanvasElement</code> | 
| bus | <code>EventBus</code> | 

<a name="event_mousedown"></a>

### "mousedown"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
<a name="event_mousemove"></a>

### "mousemove"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:drag - optionally</code>  
<a name="event_mouseup"></a>

### "mouseup"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:click - optionally</code>, <code>EventBus#event:clean\_cache - optionally</code>  
<a name="event_mouseleave"></a>

### "mouseleave"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:clean\_cache - optionally</code>  
<a name="event_wheel"></a>

### "wheel"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:zoom</code>, <code>EventBus#event:clean\_cache</code>  
<a name="event_click"></a>

### "click"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
<a name="event_contextmenu"></a>

### "contextmenu"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
<a name="event_resize"></a>

### "resize"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:resize</code>  
<a name="event_beforeunload"></a>

### "beforeunload"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:save</code>  
<a name="event_visibilitychange"></a>

### "visibilitychange"
**Kind**: event emitted by [<code>EventHandler</code>](#module_EventHandler)  
**Emits**: <code>EventBus#event:save - optionally</code>  
<a name="module_GameController"></a>

## GameController
**Access**: public  

* [GameController](#module_GameController)
    * _instance_
        * [.seed](#module_GameController+seed) : <code>string</code>
        * [.key](#module_GameController+key) : <code>Uint32Array</code>
    * _inner_
        * [~constructor(seed)](#module_GameController..constructor)
        * [~init()](#module_GameController..init)
        * [~loadImage()](#module_GameController..loadImage) ⇒ <code>Promise.&lt;void&gt;</code>
        * [~start(tries)](#module_GameController..start)
        * [~reset(tries)](#module_GameController..reset)

<a name="module_GameController+seed"></a>

### gameController.seed : <code>string</code>
- Seed for the game (by default a stringified 16 digit random number)

**Kind**: instance property of [<code>GameController</code>](#module_GameController)  
<a name="module_GameController+key"></a>

### gameController.key : <code>Uint32Array</code>
**Kind**: instance property of [<code>GameController</code>](#module_GameController)  
<a name="module_GameController..constructor"></a>

### GameController~constructor(seed)
Initializes the game controller

**Kind**: inner method of [<code>GameController</code>](#module_GameController)  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | Seed for the game |

<a name="module_GameController..init"></a>

### GameController~init()
Initializes the game

**Kind**: inner method of [<code>GameController</code>](#module_GameController)  
<a name="module_GameController..loadImage"></a>

### GameController~loadImage() ⇒ <code>Promise.&lt;void&gt;</code>
Loads the game image

**Kind**: inner method of [<code>GameController</code>](#module_GameController)  
**Returns**: <code>Promise.&lt;void&gt;</code> - - Promise that resolves when the image is loaded  
**Throws**:

- <code>Error</code> - If the image fails to load

<a name="module_GameController..start"></a>

### GameController~start(tries)
Starts the game

**Kind**: inner method of [<code>GameController</code>](#module_GameController)  
**Emits**: <code>EventBus#event:start</code>  

| Param | Type | Description |
| --- | --- | --- |
| tries | <code>number</code> | Number of times the game has been reset |

<a name="module_GameController..reset"></a>

### GameController~reset(tries)
Resets the game

**Kind**: inner method of [<code>GameController</code>](#module_GameController)  

| Param | Type | Description |
| --- | --- | --- |
| tries | <code>number</code> | Number of times the game has been reset |

<a name="module_GameLogic"></a>

## GameLogic
**Access**: public  

* [GameLogic](#module_GameLogic)
    * _instance_
        * [.start_time](#module_GameLogic+start_time) : <code>Date</code>
    * _inner_
        * [~constructor(game_pos, key, bus)](#module_GameLogic..constructor)
        * [~time()](#module_GameLogic..time) ⇒ <code>Object</code>
        * [~setStats(stats)](#module_GameLogic..setStats)
        * [~click(x, y, button)](#module_GameLogic..click)
        * [~updateKey(key)](#module_GameLogic..updateKey)
        * [~buy(x, y, [s_x], [s_y])](#module_GameLogic..buy)
        * [~reveal(x, y, [s_x], [s_y], [no_animate])](#module_GameLogic..reveal) ⇒ <code>Promise.&lt;boolean&gt;</code>
        * [~flag(x, y, [s_x], [s_y])](#module_GameLogic..flag)
        * [~isClickable(x, y, [s_x], [s_y])](#module_GameLogic..isClickable) ⇒ <code>boolean</code>
        * [~isFlagged(x, y, [s_x], [s_y])](#module_GameLogic..isFlagged) ⇒ <code>boolean</code>
        * [~isRevealed(x, y, [s_x], [s_y])](#module_GameLogic..isRevealed) ⇒ <code>boolean</code>
        * [~isSectorSolved(sector_key)](#module_GameLogic..isSectorSolved) ⇒ <code>boolean</code>
        * [~collectStats(s_x, s_y)](#module_GameLogic..collectStats)
        * [~flagCount(x, y, [s_x], [s_y])](#module_GameLogic..flagCount) ⇒ <code>number</code>
        * [~mineCount(x, y, [s_x], [s_y], [force])](#module_GameLogic..mineCount) ⇒ <code>number</code>
        * [~buildSector(s_x, s_y)](#module_GameLogic..buildSector) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code>
        * [~buildSectorCache(s_x, s_y)](#module_GameLogic..buildSectorCache) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> \| <code>false</code>
        * [~cleanSectorCache()](#module_GameLogic..cleanSectorCache)
        * [~animate(key, type, is_tile, [duration])](#module_GameLogic..animate)

<a name="module_GameLogic+start_time"></a>

### gameLogic.start\_time : <code>Date</code>
**Kind**: instance property of [<code>GameLogic</code>](#module_GameLogic)  
<a name="module_GameLogic..constructor"></a>

### GameLogic~constructor(game_pos, key, bus)
Initializes the game logic

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type |
| --- | --- |
| game_pos | <code>Object</code> | 
| key | <code>Uint32Array</code> | 
| bus | <code>EventBus</code> | 

<a name="module_GameLogic..time"></a>

### GameLogic~time() ⇒ <code>Object</code>
Returns the current time in seconds

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>Object</code> - - Time and stats  
<a name="module_GameLogic..setStats"></a>

### GameLogic~setStats(stats)
Sets the stats

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type | Description |
| --- | --- | --- |
| stats | <code>Object</code> | Stats from the save |

<a name="module_GameLogic..click"></a>

### GameLogic~click(x, y, button)
Handles a click

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Emits**: <code>EventBus#event:click\_convert</code>, <code>EventBus#event:is\_buy\_button</code>  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate in terms of screen |
| y | <code>number</code> | Y-coordinate in terms of screen |
| button | <code>number</code> | 0 for left, 1 for middle, 2 for right (from Event#button) |

<a name="module_GameLogic..updateKey"></a>

### GameLogic~updateKey(key)
Updates the game key

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type |
| --- | --- |
| key | <code>Uint32Array</code> | 

<a name="module_GameLogic..buy"></a>

### GameLogic~buy(x, y, [s_x], [s_y])
Buys a sector

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..reveal"></a>

### GameLogic~reveal(x, y, [s_x], [s_y], [no_animate]) ⇒ <code>Promise.&lt;boolean&gt;</code>
Reveals a tile

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - - Resolves to whether the reveal caused more
                              than one tile to be revealed  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | X-coordinate of tile |
| y | <code>number</code> |  | Y-coordinate of tile |
| [s_x] | <code>number</code> |  | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> |  | Y-coordinate of sector if `y` is relative |
| [no_animate] | <code>boolean</code> | <code>false</code> | If true, no animation will be played |

<a name="module_GameLogic..flag"></a>

### GameLogic~flag(x, y, [s_x], [s_y])
Flags a tile

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..isClickable"></a>

### GameLogic~isClickable(x, y, [s_x], [s_y]) ⇒ <code>boolean</code>
Checks if a tile is clickable

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>boolean</code> - - True if tile is clickable, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..isFlagged"></a>

### GameLogic~isFlagged(x, y, [s_x], [s_y]) ⇒ <code>boolean</code>
Checks if a tile is flagged

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>boolean</code> - - True if tile is flagged, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..isRevealed"></a>

### GameLogic~isRevealed(x, y, [s_x], [s_y]) ⇒ <code>boolean</code>
Checks if a tile is revealed

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>boolean</code> - - True if tile is revealed, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..isSectorSolved"></a>

### GameLogic~isSectorSolved(sector_key) ⇒ <code>boolean</code>
Checks if a sector is solved

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>boolean</code> - - True if sector is solved, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| sector_key | <code>string</code> | Key of sector |

<a name="module_GameLogic..collectStats"></a>

### GameLogic~collectStats(s_x, s_y)
Collects statistics about a solved sector into the stats object

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameLogic..flagCount"></a>

### GameLogic~flagCount(x, y, [s_x], [s_y]) ⇒ <code>number</code>
Counts the number of flags adjacent to a tile

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>number</code> - - The number of flags adjacent to the tile  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_GameLogic..mineCount"></a>

### GameLogic~mineCount(x, y, [s_x], [s_y], [force]) ⇒ <code>number</code>
Counts the number of mines adjacent to a tile

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>number</code> - - The number of mines adjacent to the tile  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| x | <code>number</code> |  | X-coordinate of tile |
| y | <code>number</code> |  | Y-coordinate of tile |
| [s_x] | <code>number</code> |  | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> |  | Y-coordinate of sector if `y` is relative |
| [force] | <code>boolean</code> | <code>false</code> | Force count even if tile is revealed |

<a name="module_GameLogic..buildSector"></a>

### GameLogic~buildSector(s_x, s_y) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code>
Builds a new sector

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> - - The sector  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameLogic..buildSectorCache"></a>

### GameLogic~buildSectorCache(s_x, s_y) ⇒ <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> \| <code>false</code>
Builds a sector cache

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Returns**: <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> \| <code>false</code> - - The cached sector  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameLogic..cleanSectorCache"></a>

### GameLogic~cleanSectorCache()
Cleans the sector cache

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  
**Emits**: <code>EventBus#event:sector\_bounds</code>  
<a name="module_GameLogic..animate"></a>

### GameLogic~animate(key, type, is_tile, [duration])
Animate a tile or sector

**Kind**: inner method of [<code>GameLogic</code>](#module_GameLogic)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| key | <code>string</code> |  | Key to use for hashing |
| type | <code>string</code> |  | Type of animation |
| is_tile | <code>boolean</code> |  | Whether the animation is for a tile |
| [duration] | <code>number</code> | <code>ANIMATION_SPEED_BASE</code> | Duration of the animation                                                   if it is a tile (in ms). |

<a name="module_GameRenderer"></a>

## GameRenderer
**Access**: public  

* [GameRenderer](#module_GameRenderer)
    * _instance_
        * [.canvas](#module_GameRenderer+canvas) : <code>HTMLCanvasElement</code>
        * [.ctx](#module_GameRenderer+ctx) : <code>CanvasRenderingContext2D</code>
    * _inner_
        * [~constructor(img, game_pos, key, bus)](#module_GameRenderer..constructor)
        * [~getViewPos()](#module_GameRenderer..getViewPos) ⇒ <code>Object</code>
        * [~setViewPos(view_pos)](#module_GameRenderer..setViewPos)
        * [~draw()](#module_GameRenderer..draw)
        * [~drawBuyButtons(s_x, s_y)](#module_GameRenderer..drawBuyButtons)
        * [~drawRoundedRect(x, y, width, height, radius)](#module_GameRenderer..drawRoundedRect)
        * [~drawStaticTiles(sector, s_x, s_y, x, y)](#module_GameRenderer..drawStaticTiles)
        * [~drawAnimatedTiles(sector, s_x, s_y, x, y)](#module_GameRenderer..drawAnimatedTiles)
        * [~drawParticles(tile_x, tile_y, frame_time, [color])](#module_GameRenderer..drawParticles)
        * [~drawSectorBorders(start_x, start_y)](#module_GameRenderer..drawSectorBorders)
        * [~drawSectorOverlays(s_x, s_y)](#module_GameRenderer..drawSectorOverlays)
        * [~drawSolvedAnimations(s_x, s_y)](#module_GameRenderer..drawSolvedAnimations)
        * [~drawSolvedParticles(sector_x_pos, sector_y_pos, frame_time)](#module_GameRenderer..drawSolvedParticles)
        * [~drawLostAnimations(s_x, s_y)](#module_GameRenderer..drawLostAnimations)

<a name="module_GameRenderer+canvas"></a>

### gameRenderer.canvas : <code>HTMLCanvasElement</code>
**Kind**: instance property of [<code>GameRenderer</code>](#module_GameRenderer)  
<a name="module_GameRenderer+ctx"></a>

### gameRenderer.ctx : <code>CanvasRenderingContext2D</code>
**Kind**: instance property of [<code>GameRenderer</code>](#module_GameRenderer)  
<a name="module_GameRenderer..constructor"></a>

### GameRenderer~constructor(img, game_pos, key, bus)
Initializes the game renderer

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type |
| --- | --- |
| img | <code>Image</code> | 
| game_pos | <code>Object</code> | 
| key | <code>Uint32Array</code> | 
| bus | <code>EventBus</code> | 

<a name="module_GameRenderer..getViewPos"></a>

### GameRenderer~getViewPos() ⇒ <code>Object</code>
Returns the current view position (for saving)

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  
**Returns**: <code>Object</code> - - The view position (offset, tile_size)  
<a name="module_GameRenderer..setViewPos"></a>

### GameRenderer~setViewPos(view_pos)
Sets the view position (from saved data)

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  
**Emits**: <code>EventBus#event:disable\_click - optionally</code>  

| Param | Type | Description |
| --- | --- | --- |
| view_pos | <code>Object</code> | The view position (offset, tile_size) |

<a name="module_GameRenderer..draw"></a>

### GameRenderer~draw()
Draws the main game frame

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  
<a name="module_GameRenderer..drawBuyButtons"></a>

### GameRenderer~drawBuyButtons(s_x, s_y)
Draws the buy buttons for a sector

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameRenderer..drawRoundedRect"></a>

### GameRenderer~drawRoundedRect(x, y, width, height, radius)
Draws a rounded rectangle

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of top-left corner |
| y | <code>number</code> | Y-coordinate of top-left corner |
| width | <code>number</code> | Width of rectangle |
| height | <code>number</code> | Height of rectangle |
| radius | <code>number</code> | Radius of rounded corners |

<a name="module_GameRenderer..drawStaticTiles"></a>

### GameRenderer~drawStaticTiles(sector, s_x, s_y, x, y)
Draws a static tile

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| sector | <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> \| <code>false</code> |  |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |

<a name="module_GameRenderer..drawAnimatedTiles"></a>

### GameRenderer~drawAnimatedTiles(sector, s_x, s_y, x, y)
Draws an animated tile

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| sector | <code>Array.&lt;Array.&lt;Array.&lt;number&gt;&gt;&gt;</code> \| <code>false</code> |  |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |

<a name="module_GameRenderer..drawParticles"></a>

### GameRenderer~drawParticles(tile_x, tile_y, frame_time, [color])
Draws particles

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tile_x | <code>number</code> |  | X-coordinate of top-left corner of tile |
| tile_y | <code>number</code> |  | Y-coordinate of top-left corner of tile |
| frame_time | <code>number</code> |  | Time since animation start (0-1) |
| [color] | <code>string</code> | <code>&quot;COLORS.FLAG_PARTICLE_COLOR&quot;</code> | Color of particle |

<a name="module_GameRenderer..drawSectorBorders"></a>

### GameRenderer~drawSectorBorders(start_x, start_y)
Draws sector borders

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| start_x | <code>number</code> | X-coordinate of top-left corner of sector |
| start_y | <code>number</code> | Y-coordinate of top-left corner of sector |

<a name="module_GameRenderer..drawSectorOverlays"></a>

### GameRenderer~drawSectorOverlays(s_x, s_y)
Draws sector overlays

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameRenderer..drawSolvedAnimations"></a>

### GameRenderer~drawSolvedAnimations(s_x, s_y)
Draws solved sector animations

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_GameRenderer..drawSolvedParticles"></a>

### GameRenderer~drawSolvedParticles(sector_x_pos, sector_y_pos, frame_time)
Draws solved sector particles

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| sector_x_pos | <code>number</code> | X-coordinate of sector |
| sector_y_pos | <code>number</code> | Y-coordinate of sector |
| frame_time | <code>number</code> | Current frame time (0-1) |

<a name="module_GameRenderer..drawLostAnimations"></a>

### GameRenderer~drawLostAnimations(s_x, s_y)
Draws lost sector animations

**Kind**: inner method of [<code>GameRenderer</code>](#module_GameRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| s_x | <code>number</code> | X-coordinate of sector |
| s_y | <code>number</code> | Y-coordinate of sector |

<a name="module_Saver"></a>

## Saver
**Access**: public  

* [Saver](#module_Saver)
    * _instance_
        * [.save_interval_id](#module_Saver+save_interval_id) : <code>number</code>
    * _inner_
        * [~constructor(game, bus)](#module_Saver..constructor)
        * [~startAutosaver()](#module_Saver..startAutosaver)
        * [~stopAutosaver()](#module_Saver..stopAutosaver)
        * [~isSaved()](#module_Saver..isSaved)
        * [~save()](#module_Saver..save) ⇒ <code>string</code>
        * [~load([compressed])](#module_Saver..load)
        * [~saveToFile()](#module_Saver..saveToFile)
        * [~deleteSave()](#module_Saver..deleteSave)
        * [~loadFromFile()](#module_Saver..loadFromFile)

<a name="module_Saver+save_interval_id"></a>

### saver.save\_interval\_id : <code>number</code>
- ID of the autosave interval

**Kind**: instance property of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..constructor"></a>

### Saver~constructor(game, bus)
Initializes the game saver

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  

| Param | Type |
| --- | --- |
| game | <code>GameController</code> | 
| bus | <code>EventBus</code> | 

<a name="module_Saver..startAutosaver"></a>

### Saver~startAutosaver()
Starts the autosave feature

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..stopAutosaver"></a>

### Saver~stopAutosaver()
Stops the autosave feature

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..isSaved"></a>

### Saver~isSaved()
Checks if a save exists

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..save"></a>

### Saver~save() ⇒ <code>string</code>
Saves the game data

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
**Returns**: <code>string</code> - - Compressed game data  
**Emits**: <code>EventBus#event:view\_pos</code>  
<a name="module_Saver..load"></a>

### Saver~load([compressed])
Loads the game data

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
**Emits**: <code>EventBus#event:set\_view\_pos</code>, <code>EventBus#event:update\_key</code>, <code>EventBus#event:reset</code>  

| Param | Type | Description |
| --- | --- | --- |
| [compressed] | <code>string</code> | Compressed game data |

<a name="module_Saver..saveToFile"></a>

### Saver~saveToFile()
Saves the game data to a file

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..deleteSave"></a>

### Saver~deleteSave()
Deletes the save

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_Saver..loadFromFile"></a>

### Saver~loadFromFile()
Loads the game data from a file

**Kind**: inner method of [<code>Saver</code>](#module_Saver)  
<a name="module_SipHash"></a>

## SipHash
**Access**: package  
**Important**: - Siphash implementation taken from https://github.com/jedisct1/siphash-js (minified browser version)  
<a name="module_LZW"></a>

## LZW
**Access**: package  
<a name="module_UIRenderer"></a>

## UIRenderer ⇐ <code>GameRenderer</code>
**Extends**: <code>GameRenderer</code>  
**Access**: public  

* [UIRenderer](#module_UIRenderer) ⇐ <code>GameRenderer</code>
    * _instance_
        * [.loop](#module_UIRenderer+loop) : <code>function</code>
        * [.frame_id](#module_UIRenderer+frame_id) : <code>number</code>
    * _inner_
        * [~constructor(img, game_pos, key, bus)](#module_UIRenderer..constructor)
        * [~loop()](#module_UIRenderer..loop)
        * [~drag(x, y)](#module_UIRenderer..drag)
        * [~resize()](#module_UIRenderer..resize)
        * [~updateKey(key)](#module_UIRenderer..updateKey)
        * [~zoom(x, y, is_zoom_in)](#module_UIRenderer..zoom)
        * [~isBuyButton(x, y)](#module_UIRenderer..isBuyButton) ⇒ <code>boolean</code>
        * [~sectorBounds()](#module_UIRenderer..sectorBounds) ⇒ <code>Array</code>
        * [~clickConvert(x, y)](#module_UIRenderer..clickConvert) ⇒ <code>Array</code>

<a name="module_UIRenderer+loop"></a>

### uiRenderer.loop : <code>function</code>
- Bound `loop` function so `requestAnimationFrame` keeps `this` context

**Kind**: instance property of [<code>UIRenderer</code>](#module_UIRenderer)  
<a name="module_UIRenderer+frame_id"></a>

### uiRenderer.frame\_id : <code>number</code>
- ID of the animation frame

**Kind**: instance property of [<code>UIRenderer</code>](#module_UIRenderer)  
<a name="module_UIRenderer..constructor"></a>

### UIRenderer~constructor(img, game_pos, key, bus)
Initializes the renderer

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  

| Param | Type |
| --- | --- |
| img | <code>Image</code> | 
| game_pos | <code>Object</code> | 
| key | <code>Uint32Array</code> | 
| bus | <code>EventBus</code> | 

<a name="module_UIRenderer..loop"></a>

### UIRenderer~loop()
Loops the animation frame and calls `draw`

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  
<a name="module_UIRenderer..drag"></a>

### UIRenderer~drag(x, y)
Updates the offset

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-offset |
| y | <code>number</code> | Y-offset |

<a name="module_UIRenderer..resize"></a>

### UIRenderer~resize()
Resizes the canvas

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  
<a name="module_UIRenderer..updateKey"></a>

### UIRenderer~updateKey(key)
Updates the key

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  

| Param | Type |
| --- | --- |
| key | <code>Uint32Array</code> | 

<a name="module_UIRenderer..zoom"></a>

### UIRenderer~zoom(x, y, is_zoom_in)
Zooms in or out

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of center of zoom |
| y | <code>number</code> | Y-coordinate of center of zoom |
| is_zoom_in | <code>boolean</code> | True if zooming in, false if zooming out |

<a name="module_UIRenderer..isBuyButton"></a>

### UIRenderer~isBuyButton(x, y) ⇒ <code>boolean</code>
Checks if the tile is a buy button

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  
**Returns**: <code>boolean</code> - True if the tile is a buy button, false otherwise  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of the tile |
| y | <code>number</code> | Y-coordinate of the tile |

<a name="module_UIRenderer..sectorBounds"></a>

### UIRenderer~sectorBounds() ⇒ <code>Array</code>
Returns the sector bounds

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  
**Returns**: <code>Array</code> - - Array of [start_x, start_y, end_x, end_y]  
<a name="module_UIRenderer..clickConvert"></a>

### UIRenderer~clickConvert(x, y) ⇒ <code>Array</code>
Converts raw click coords to sector adjusted coords

**Kind**: inner method of [<code>UIRenderer</code>](#module_UIRenderer)  
**Returns**: <code>Array</code> - - Array of [x, y]  

| Param | Type | Description |
| --- | --- | --- |
| x | <code>number</code> | X-coordinate of the click |
| y | <code>number</code> | Y-coordinate of the click |

<a name="module_DataHasher"></a>

## DataHasher : <code>object</code>
An object with methods `hash` and `generate_key`
             such that `hash(key, data)` returns a number between 0 and 1 (deterministically),
             and `generate_key(seed)` returns an approprite key for `hash`

**Access**: public  
**Properties**

| Name | Type |
| --- | --- |
| generate_key | <code>function</code> | 
| hash | <code>function</code> | 


* [DataHasher](#module_DataHasher) : <code>object</code>
    * [~generate_key(seed)](#module_DataHasher..generate_key) ⇒ <code>Uint32Array</code>
    * [~hash(key, data)](#module_DataHasher..hash) ⇒ <code>number</code>

<a name="module_DataHasher..generate_key"></a>

### DataHasher~generate\_key(seed) ⇒ <code>Uint32Array</code>
Generates a key

**Kind**: inner method of [<code>DataHasher</code>](#module_DataHasher)  
**Returns**: <code>Uint32Array</code> - - Generated key
                    It can be the input itself for hashing
                    functions that dont require keys.  

| Param | Type | Description |
| --- | --- | --- |
| seed | <code>string</code> | Seed for the hash function |

<a name="module_DataHasher..hash"></a>

### DataHasher~hash(key, data) ⇒ <code>number</code>
Hashes data

**Kind**: inner method of [<code>DataHasher</code>](#module_DataHasher)  
**Returns**: <code>number</code> - - Psudo-random number between 0 and 1  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>Uint32Array</code> | Key for the hash function                       For hashing functions that dont require keys                       it can be concatenated to the data |
| data | <code>string</code> | Data to hash |

<a name="module_DataCompressor"></a>

## DataCompressor : <code>object</code>
An object with methods `zip` and `unzip`
             that accept/return strings and are reversable

**Access**: public  
**Properties**

| Name | Type |
| --- | --- |
| zip | <code>function</code> | 
| unzip | <code>function</code> | 


* [DataCompressor](#module_DataCompressor) : <code>object</code>
    * [~zip(data)](#module_DataCompressor..zip) ⇒ <code>string</code>
    * [~unzip(data)](#module_DataCompressor..unzip) ⇒ <code>string</code>

<a name="module_DataCompressor..zip"></a>

### DataCompressor~zip(data) ⇒ <code>string</code>
Compresses data

**Kind**: inner method of [<code>DataCompressor</code>](#module_DataCompressor)  
**Returns**: <code>string</code> - - Compressed data  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | Uncompressed data |

<a name="module_DataCompressor..unzip"></a>

### DataCompressor~unzip(data) ⇒ <code>string</code>
Uncompresses data

**Kind**: inner method of [<code>DataCompressor</code>](#module_DataCompressor)  
**Returns**: <code>string</code> - - Uncompressed data  
**Throws**:

- <code>Error</code> - If the compressed data is invalid


| Param | Type | Description |
| --- | --- | --- |
| data | <code>string</code> | Compressed data |

<a name="module_LOOPS"></a>

## LOOPS : <code>object</code>
An object with common loops used in game.

**Access**: public  
**Properties**

| Name | Type |
| --- | --- |
| overAdjacent | <code>function</code> | 
| overAdjacentSum | <code>function</code> | 
| anyAdjacent | <code>function</code> | 
| overOnScreenSectors | <code>function</code> | 
| overTilesInSector | <code>function</code> | 
| anyTilesInSector | <code>function</code> | 
| overTilesInSectorSum | <code>function</code> | 


* [LOOPS](#module_LOOPS) : <code>object</code>
    * [~overAdjacent(f, x, y, [s_x], [s_y])](#module_LOOPS..overAdjacent)
    * [~overAdjacentSum(condition, x, y, [s_x], [s_y])](#module_LOOPS..overAdjacentSum) ⇒ <code>number</code>
    * [~anyAdjacent(condition, x, y, [s_x], [s_y])](#module_LOOPS..anyAdjacent) ⇒ <code>boolean</code>
    * [~overOnScreenSectors(f, start_x, start_y, sector_size_in_px, canvas)](#module_LOOPS..overOnScreenSectors)
    * [~overTilesInSector(f)](#module_LOOPS..overTilesInSector)
    * [~anyTilesInSector(condition)](#module_LOOPS..anyTilesInSector) ⇒ <code>boolean</code>
    * [~overTilesInSectorSum(condition)](#module_LOOPS..overTilesInSectorSum) ⇒ <code>number</code>

<a name="module_LOOPS..overAdjacent"></a>

### LOOPS~overAdjacent(f, x, y, [s_x], [s_y])
Loops over adjacent tiles and calls a function

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function to call on each tile |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_LOOPS..overAdjacentSum"></a>

### LOOPS~overAdjacentSum(condition, x, y, [s_x], [s_y]) ⇒ <code>number</code>
Loops over adjacent tiles and checks if they satisfy a condition

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  
**Returns**: <code>number</code> - - Number of adjacent tiles that satisfy the condition  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to check |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_LOOPS..anyAdjacent"></a>

### LOOPS~anyAdjacent(condition, x, y, [s_x], [s_y]) ⇒ <code>boolean</code>
Loops over adjacent tiles and checks if they satisfy a condition

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  
**Returns**: <code>boolean</code> - - Whether any adjacent tile satisfies the condition or not  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to check |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_LOOPS..overOnScreenSectors"></a>

### LOOPS~overOnScreenSectors(f, start_x, start_y, sector_size_in_px, canvas)
Loops over all sectors in view

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function to call on each sector |
| start_x | <code>number</code> | X-coordinate of starting sector |
| start_y | <code>number</code> | Y-coordinate of starting sector |
| sector_size_in_px | <code>number</code> | Size of sector in pixels |
| canvas | <code>HTMLCanvasElement</code> | Canvas element |

<a name="module_LOOPS..overTilesInSector"></a>

### LOOPS~overTilesInSector(f)
Loops over all tiles in a sector

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  

| Param | Type | Description |
| --- | --- | --- |
| f | <code>function</code> | Function to call on each tile |

<a name="module_LOOPS..anyTilesInSector"></a>

### LOOPS~anyTilesInSector(condition) ⇒ <code>boolean</code>
Checks if any tile in a sector satisfies a condition

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  
**Returns**: <code>boolean</code> - - Whether any tile satisfies the condition or not  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to check |

<a name="module_LOOPS..overTilesInSectorSum"></a>

### LOOPS~overTilesInSectorSum(condition) ⇒ <code>number</code>
Checks if all tiles in a sector satisfy a condition

**Kind**: inner method of [<code>LOOPS</code>](#module_LOOPS)  
**Returns**: <code>number</code> - - Number of tiles that satisfy the condition  

| Param | Type | Description |
| --- | --- | --- |
| condition | <code>function</code> | The condition to check |

<a name="module_convert"></a>

## convert ⇒ <code>Array.&lt;number&gt;</code>
Converts between tile and sector coordinates.

**Returns**: <code>Array.&lt;number&gt;</code> - - An array containing resultant coords  

| Param | Type | Description |
| --- | --- | --- |
| to_local_coords | <code>boolean</code> | Whether to convert to local coordinates or not |
| x | <code>number</code> | X-coordinate of tile |
| y | <code>number</code> | Y-coordinate of tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="module_isMine"></a>

## isMine ⇒ <code>boolean</code>
Get the type of a tile (mine or not) deterministically.

**Returns**: <code>boolean</code> - - Whether the tile is a mine or not  

| Param | Type | Description |
| --- | --- | --- |
| key | <code>string</code> | Key to use for hashing |
| x | <code>number</code> | X-coordinate of the tile |
| y | <code>number</code> | Y-coordinate of the tile |
| [s_x] | <code>number</code> | X-coordinate of sector if `x` is relative |
| [s_y] | <code>number</code> | Y-coordinate of sector if `y` is relative |

<a name="game"></a>

## game : <code>GameController</code>
The game controller instance.

**Kind**: global variable  
**Access**: public  
<a name="event_DOMContentLoaded"></a>

## "DOMContentLoaded"
**Kind**: event emitted  
