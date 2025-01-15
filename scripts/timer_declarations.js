class Timer {
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.playTime = 0;
    this.startPlayTime = 0;
    this.running = 0;
  }
  start() {
    if (!this.running) {
      this.startTime = Date.now() - this.elapsedTime;
      this.startPlayTime = Date.now();
      this.running = 1;
      this._update();
    }
  }
  pause() {
    this.running ? (this.running = this.playTime = 0) : 0;
  }
  reset() {
    this.pause();
    this.elapsedTime = this.playTime = 0;
  }
  _update() {
    if (this.running) {
      this.elapsedTime = Date.now() - this.startTime;
      this.playTime = Date.now() - this.startPlayTime;
      requestIdleCallback(() => this._update());
    }
  }
  get(t = false) {
    return t ? (this.playTime / 1000) | 0 : (this.elapsedTime / 1000) | 0;
  }
  getPretty(t = false) {
    return prettify(t ? this.playTime : this.elapsedTime);
  }
}

function prettify(ms) {
  const h = Math.floor(ms / 3600000),
    m = Math.floor((ms % 3600000) / 60000),
    s = Math.floor((ms % 60000) / 1000),
    l = ((ms % 1000) + "").slice(0, 1);
  return `${(h + "").padStart(2, "0")}:${(m + "").padStart(2, "0")}:${(s + "").padStart(2, "0")}.${l}`;
}

function play() {
  const audio = new Audio("../assets/timer.wav");
  audio.play();
}

function con(str) {
  const [h, m] = str.split(":").map((e) => +e);
  return new Date().setHours(h, m, 0, 0);
}

var ampm = (t) =>
  ((h) =>
    ((x) => (x < 9 ? "0" + x : x))(h % 12 || 12) +
    ":" +
    t.slice(-2) +
    " " +
    (h < 12 ? "AM" : "PM"))(+t.slice(0, 2));
var id = (id) => document.getElementById(id);
var elem = (id_, x) => (id(id_).innerText = x);
