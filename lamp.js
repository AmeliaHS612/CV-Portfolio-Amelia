const lamp = document.querySelector(".theme-lamp");
let glowTimer;

lamp.setAttribute("aria-pressed", String(document.body.classList.contains("dark-theme")));

lamp.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");

  try {
    localStorage.setItem("portfolio-theme", isDark ? "dark" : "light");
  } catch {
    // Theme switching still works when the browser blocks storage.
  }

  lamp.setAttribute("aria-pressed", String(isDark));
  lamp.setAttribute(
    "aria-label",
    isDark ? "Switch to light theme" : "Switch to dark theme"
  );

  lamp.classList.remove("is-touched");
  clearTimeout(glowTimer);

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (!reduceMotion) {
    void lamp.offsetWidth;
    lamp.classList.add("is-touched");

    glowTimer = setTimeout(() => {
      lamp.classList.remove("is-touched");
    }, 900);
  }
});
