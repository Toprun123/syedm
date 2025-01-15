const today = new Date()
  .toLocaleDateString("en-GB")
  .split("/")
  .reverse()
  .join("-");
var pub_data;
var timer = new Timer();

setTimeout(
  () => {
    reload();
  },
  new Date().setHours(24, 0, 0, 0) - Date.now(),
);

id("start-btn").onclick = (_e) =>
  timer.running ? timer.pause() : timer.start();
id("restart-btn").onclick = (_e) => timer.reset();

reload();
update();

function reload() {
  fetch(
    "https://api.aladhan.com/v1/timingsByCity/" +
      today +
      "?city=Jeddah&country=Saudi+Arabia&method=4&adjustment=1",
  )
    .then((response) => response.json())
    .then((data) => {
      pub_data = data.data;
      elem(
        "date-text",
        pub_data.date.hijri.weekday.en +
          ", " +
          pub_data.date.hijri.day +
          " " +
          pub_data.date.hijri.month.en,
      );
      elem("date", pub_data.date.hijri.date);
      elem("fajr-time", ampm(pub_data.timings.Fajr));
      elem("dhuhr-time", ampm(pub_data.timings.Dhuhr));
      elem("asr-time", ampm(pub_data.timings.Asr));
      elem("maghrib-time", ampm(pub_data.timings.Maghrib));
      elem("isha-time", ampm(pub_data.timings.Isha));
    })
    .catch((error) => console.error(error));
}

function update() {
  if (pub_data) {
    elem("total-time", "Time spent today: " + timer.getPretty());
    elem("run-time", "Time spent since last break: " + timer.getPretty(1));
    var times_rel_prayer = [
      con(pub_data.timings.Fajr) - Date.now(),
      con(pub_data.timings.Dhuhr) - Date.now(),
      con(pub_data.timings.Asr) - Date.now(),
      con(pub_data.timings.Maghrib) - Date.now(),
      con(pub_data.timings.Isha) - Date.now(),
    ];
    var time_to_next_prayer = prettify(
      Math.min(...times_rel_prayer.filter((x) => x > 0)) || 0,
    );
    var time_past_prayer =
      (Math.abs(Math.max(...times_rel_prayer.filter((x) => x < 0))) || 0) /
      60000;
    if (time_to_next_prayer != "Infinity:NaN:NaN.N") {
      elem("prayer-time", "Time to next prayer: " + time_to_next_prayer);
    } else {
      elem("prayer-time", "No prayers left for today!");
    }
    if (timer.running && time_past_prayer > 7 && time_past_prayer < 8) {
      timer.pause();
      play();
    }
    if (timer.running && timer.get(1) > 1200) {
      timer.pause();
      play();
    }
  }
  requestIdleCallback(update);
}

console.log(toolbar);
