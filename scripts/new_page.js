let hoverTimeout;

window.onload = function () {
  /* age part */
  (async () => {
    const age = document.getElementById("age");
    const b = new Date(2008, 9, 8);
    const n = new Date();
    const y = n.getFullYear() - b.getFullYear();
    const m = n.getMonth() - b.getMonth();
    const d = n.getDate() - b.getDate();
    const [Y, M, D] = [
      d < 0 && m === 0 ? y - 1 : m < 0 || (m === 0 && d < 0) ? y - 1 : y,
      m < 0 || (m === 0 && d < 0)
        ? (12 + m - (d < 0 ? 1 : 0)) % 12
        : (m - (d < 0 ? 1 : 0)) % 12,
      d < 0 ? new Date(n.getFullYear(), n.getMonth(), 0).getDate() + d : d,
    ];
    age.innerText = `${Y} years, ${M} months & ${D} days old`;
  })();

  /* logos part */
  (async () => {
    var logos_fg = document.querySelectorAll(".logo:not(.bg)");
    var logos_bg = document.querySelectorAll(".logo.bg");
    var originalPos_fg = [];
    var originalPos_bg = [];
    const logos = [
      { id: "lua", top: 10, left: 10, color: "#2c2d72" },
      { id: "js", top: 15, left: 25, color: "#f7df1e" },
      { id: "html", top: 17, left: 37, color: "#e34f26" },
      { id: "css", top: 13, left: 53, color: "#1572B6" },
      { id: "python", top: 49, left: 90, color: "#3776ab" },
      { id: "ruby", top: 25, left: 12, color: "#cc342d" },
      { id: "go", top: 20, left: 67, color: "#00add8" },
      { id: "php", top: 23, left: 77, color: "#777bb4" },
      { id: "regex", top: 64, left: 10, color: "#d3d3d3" },
      { id: "haskell", top: 35, left: 29, color: "#5d4f85" },
      { id: "bash", top: 27, left: 50, color: "#4eaa25" },
      { id: "rust", top: 70, left: 57, color: "#000000" },
      { id: "i3wm", top: 56, left: 29, color: "#52C0FF" },
      { id: "react", top: 40, left: 67, color: "#61DAFB" },
      { id: "raspberrypi", top: 53, left: 75, color: "#A22846" },
      { id: "rails", top: 12, left: 86, color: "#d30001" },
      { id: "nodejs", top: 76, left: 70, color: "#5fa04e" },
      { id: "django", top: 72, left: 32, color: "#092e20" },
      { id: "flask", top: 77, left: 45, color: "#000000" },
      { id: "babylon", top: 70, left: 80, color: "#bb464b" },
      { id: "arduino", top: 47, left: 15, color: "#00878F" },
      { id: "processing", top: 80, left: 89, color: "#006699" },
      { id: "git", top: 87, left: 12, color: "#f05032" },
      { id: "github", top: 85, left: 27, color: "#181717" },
      { id: "nvim", top: 75, left: 22, color: "#57a143" },
      { id: "inkscape", top: 38, left: 80, color: "#000000" },
      { id: "blender", top: 82, left: 55, color: "#e87d0d" },
      { id: "linux", top: 87, left: 77, color: "#fcc624" },
    ];
    const logo_details = {
      lua: {
        name: "Lua",
      },
      js: {
        name: "JavaScript",
      },
      html: {
        name: "HTML",
      },
      css: {
        name: "CSS",
      },
      python: {
        name: "Python",
      },
      ruby: {
        name: "Ruby",
      },
      go: {
        name: "Go",
      },
      php: {
        name: "PHP",
      },
      regex: {
        name: "Reg Exp",
      },
      haskell: {
        name: "Haskell",
      },
      bash: {
        name: "Bash",
      },
      rust: {
        name: "Rust",
      },
      i3wm: {
        name: "i3wm",
      },
      react: {
        name: "React JS",
      },
      raspberrypi: {
        name: "Raspberry Pi",
      },
      rails: {
        name: "Ruby on Rails",
      },
      nodejs: {
        name: "Node.js",
      },
      django: {
        name: "Django",
      },
      flask: {
        name: "Flask",
      },
      babylon: {
        name: "Babylon.js",
      },
      arduino: {
        name: "Arduino",
      },
      processing: {
        name: "Processing",
      },
      git: {
        name: "Git",
      },
      github: {
        name: "GitHub",
      },
      nvim: {
        name: "NeoVim",
      },
      inkscape: {
        name: "Inkscape",
      },
      blender: {
        name: "Blender",
      },
      linux: {
        name: "Linux",
      },
    };
    function setLogos() {
      logos.forEach((logo) => {
        const element = document.getElementById(logo.id);
        if (element) {
          element.style.position = "absolute";
          element.style.top = logo.top + "%";
          element.style.left = logo.left + "%";
          element.style.setProperty("--logo-color", logo.color);
        }
      });
      originalPos_fg = [];
      for (let i = 0; i < logos_fg.length; i++) {
        var el = logos_fg[i];
        var computed = window.getComputedStyle(el);
        originalPos_fg.push({
          el,
          left: parseFloat(computed.left),
          top: parseFloat(computed.top),
        });
      }
      originalPos_bg = [];
      for (let i = 0; i < logos_bg.length; i++) {
        var el = logos_bg[i];
        var computed = window.getComputedStyle(el);
        originalPos_bg.push({
          el,
          left: parseFloat(computed.left),
          top: parseFloat(computed.top),
        });
      }
    }
    setLogos();
    function moveLogos(x, y) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dist = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
      for (const { el, top, left } of originalPos_fg) {
        const angle = Math.atan2(y - cy, x - cx);
        const nx = left + Math.cos(angle) * (dist / 10);
        const ny = top + Math.sin(angle) * (dist / 10);
        el.style.left = `${nx}px`;
        el.style.top = `${ny}px`;
      }
      for (const { el, top, left } of originalPos_bg) {
        const angle = Math.atan2(y - cy, x - cx);
        const nx = left + Math.cos(angle) * (dist / 20);
        const ny = top + Math.sin(angle) * (dist / 20);
        el.style.left = `${nx}px`;
        el.style.top = `${ny}px`;
      }
    }
    let topZIndex = 1000;
    logos.forEach((logo) => {
      const element = document.getElementById(logo.id);
      if (element) {
        element.addEventListener("click", function (e) {
          const existing = document.getElementById("popup-" + logo.id);
          const popup_win = existing || document.createElement("div");
          const page = element.closest(".page");
          const pageRect = page.getBoundingClientRect();
          let x = e.clientX - pageRect.left;
          let y = e.clientY - pageRect.top;
          if (existing) {
            const popupRect = existing.getBoundingClientRect();
            x = Math.max(0, Math.min(x, page.clientWidth - popupRect.width));
            y = Math.max(18, Math.min(y, page.clientHeight - popupRect.height));
          }
          popup_win.style.left = x + "px";
          popup_win.style.top = y + "px";
          popup_win.classList.add("popup");
          popup_win.style.zIndex = ++topZIndex;
          if (!existing) {
            popup_win.innerHTML = `
              <div class="popup-controls">
                <div class="popup-handle"></div>
                <button class="popup-close"></button>
              </div>
              <!-- <h1>${logo.id}</h1> -->
              <div class="popup-title">
                <div class="popup-logo">
                  ${element.id == "regex" ? `<span class="regex-logo">${element.innerHTML}</span>` : element.innerHTML}
                </div>
                ${logo_details[logo.id].name}
              </div>
            `;
            popup_win.id = "popup-" + logo.id;
            popup_win.style.setProperty("--logo-color", logo.color);
            document.getElementById("popups-container").appendChild(popup_win);
            const popupRect = popup_win.getBoundingClientRect();
            x = Math.max(0, Math.min(x, page.clientWidth - popupRect.width));
            y = Math.max(18, Math.min(y, page.clientHeight - popupRect.height));
            popup_win.style.left = x + "px";
            popup_win.style.top = y + "px";
            let isDragging = false;
            let offsetX = 0;
            let offsetY = 0;
            const handle = popup_win.querySelector(".popup-handle");
            handle.addEventListener("mousedown", function (e) {
              isDragging = true;
              const rect = popup_win.getBoundingClientRect();
              popup_win.style.zIndex = ++topZIndex;
              offsetX = e.clientX - rect.left;
              offsetY = e.clientY - rect.top;
              e.preventDefault();
            });
            popup_win.addEventListener("mousedown", function () {
              popup_win.style.zIndex = ++topZIndex;
            });
            document.addEventListener("mousemove", function (e) {
              if (isDragging) {
                const pageRect = page.getBoundingClientRect();
                const popupRect = popup_win.getBoundingClientRect();
                let x = e.clientX - offsetX - pageRect.left;
                let y = e.clientY - offsetY - pageRect.top;
                x = Math.max(
                  0,
                  Math.min(x, page.clientWidth - popupRect.width),
                );
                y = Math.max(
                  18,
                  Math.min(y, page.clientHeight - popupRect.height),
                );
                popup_win.style.left = x + "px";
                popup_win.style.top = y + "px";
              }
            });
            document.addEventListener("mouseup", function () {
              isDragging = false;
            });
            const closeBtn = popup_win.querySelector(".popup-close");
            closeBtn.addEventListener("click", function () {
              popup_win.classList.add("fade-out");
              setTimeout(function () {
                popup_win.remove();
              }, 250);
            });
          }
          e.stopPropagation();
        });
      }
    });
    document.addEventListener("mousemove", function (e) {
      var x = e.clientX;
      var y = e.clientY;
      moveLogos(x, y);
    });
    document.addEventListener("mouseout", function () {
      for (const { el } of originalPos_fg) {
        el.style.opacity = `0`;
      }
      for (const { el } of originalPos_bg) {
        el.style.opacity = `0`;
      }
    });
    document.addEventListener("mouseover", function () {
      for (const { el } of originalPos_fg) {
        el.style.opacity = `1`;
      }
      for (const { el } of originalPos_bg) {
        el.style.opacity = `1`;
      }
    });
    window.addEventListener("resize", setLogos);
  })();

  /* what-i-am part */

  (async () => {
    const whatIam = [
      { word: " Programmer", color: "#28fe00" },
      { word: "󰦆 UI/UX Designer", color: "#f4846f" },
      { word: "󰖟 Web Developer", color: "#b0a6ca" },
      { word: " CSS Nerd", color: "#90c8f1" },
      { word: "󰟓 GO Developer", color: "#8ae7ff" },
      { word: "󰴭 Ruby Lover", color: "#ff3031" },
      { word: " Linux Enthusiast", color: "#fcc624" },
      { word: " Neovim User", color: "#69b753" },
    ];
    whatIam.sort(() => Math.random() - 0.5);
    whatIam.sort(() => Math.random() - 0.5);
    whatIam.sort(() => Math.random() - 0.5);
    whatIam.sort(() => Math.random() - 0.5);
    whatIam.unshift({ word: " Indie Dev", color: "#ffff00" });
    let index = 0;
    let delay = (ms) => {
      return new Promise((resolve) => setTimeout(resolve, ms));
    };
    await delay(1000);
    while (true) {
      const elem = document.getElementById("what-i-am");
      let currentWord = whatIam[index].word;
      elem.style.color = whatIam[index].color;
      document.querySelector(".what-i-am .key-cursor").style.color =
        whatIam[index].color;
      const chars = Array.from(currentWord);
      for (let i = 0; i < chars.length; i++) {
        elem.innerText = chars.slice(0, i + 1).join("");
        await delay(200);
      }
      await delay(2000);
      for (let i = chars.length; i >= 0; i--) {
        elem.innerText = chars.slice(0, i).join("");
        await delay(200);
      }
      await delay(200);
      index = (index + 1) % whatIam.length;
    }
  })();

  /* Name part */

  (async () => {
    const lname = "DAANISH";
    const elem = document.getElementById("lname");
    await new Promise((resolve) => setTimeout(resolve, 300));
    for (let i = 0; i < lname.length; i++) {
      elem.innerText = lname.substring(0, i + 1);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await new Promise((resolve) => setTimeout(resolve, 2000));
    document.getElementById("lname-key-cursor").style.display = "none";
  })();

  /* Header scroll add class */

  window.addEventListener("scroll", () => {
    const header = document.getElementById("header");
    if (window.scrollY > 0) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
  const header = document.getElementById("header");
  if (window.scrollY > 0) {
    header.classList.add("scrolled");
  } else {
    header.classList.remove("scrolled");
  }

  /* Hover boxes */

  document.querySelectorAll(".hover-name").forEach((container) => {
    const tooltip = container.querySelector(".exp-tooltip");
    let mouseX, mouseY;
    let hoverTimeout;
    const updateMousePos = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    container.addEventListener("mouseenter", () => {
      container.addEventListener("mousemove", updateMousePos);
      hoverTimeout = setTimeout(() => {
        tooltip.classList.remove("hidden");
        tooltip.style.pointerEvents = "auto";
        const parentRect = container.getBoundingClientRect();
        tooltip.style.top = `${mouseY - parentRect.top + 50}px`;
        tooltip.style.left = `${mouseX - parentRect.left}px`;
      }, 200);
    });
    container.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      tooltip.classList.add("hidden");
      tooltip.style.pointerEvents = "none";
      container.removeEventListener("mousemove", updateMousePos);
    });
  });
};
