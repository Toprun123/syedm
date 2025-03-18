const [num, ver, pass, salt, copy, f_pass, show] = [
  "num",
  "ver",
  "pass",
  "salt",
  "copy",
  "f_pass",
  "show",
].map((id) => document.getElementById(id));
show.addEventListener("click", () => {
  show.textContent = show.textContent == "" ? "" : "";
  pass.type = show.textContent == "" ? "password" : "text";
});
const gp = async () => {
  const charset =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{},.<>?";
  const hex = [
    ...new Uint8Array(
      await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(
          pass.value + salt.value + num.value + ver.value,
        ),
      ),
    ),
  ]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  let fPass = "";
  for (let i = 0; i < num.value - 3; i++) {
    const index = parseInt(hex.slice(i * 2, i * 2 + 2), 16) % charset.length;
    fPass += charset[index];
  }
  fPass += "Sd!";
  copy.addEventListener("click", () => {
    navigator.clipboard.writeText(fPass);
    copy.textContent = "";
    setTimeout(() => {
      copy.textContent = "";
    }, 1000);
  });
  f_pass.innerHTML = "";
  Array.from(fPass).forEach((char, i) => {
    let span = document.createElement("span");
    span.classList.add("pass_s");
    span.textContent = charset[Math.floor(Math.random() * charset.length)];
    f_pass.appendChild(span);
    let interval = setInterval(() => {
      span.textContent = charset[Math.floor(Math.random() * charset.length)];
    }, 50);
    setTimeout(
      () => {
        clearInterval(interval);
        span.textContent = char;
      },
      50 + i * 50,
    );
  });
};
