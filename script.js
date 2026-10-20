const languageButton = document.querySelector(".language-toggle");
const lampButton = document.querySelector(".theme-lamp");

const translations = {
  en: {
    pageTitle: "Amelia Herlina — Portfolio",
    homeIntro: "Hello, I'm",
    heroNameFirst: "AMELIA",
    heroNameLast: "HERLINA",
    homeRole: "Architect & Designer",
    homeLabel: "ARCHITECTURE / CV",
    scrollCv: "SCROLL FOR CV ↓",
    switchLanguage: "Switch to Traditional Chinese",
    switchLight: "Switch to light theme",
    switchDark: "Switch to dark theme"
  },
  "zh-Hant": {
    pageTitle: "鄭涵歆 — 作品集",
    homeIntro: "你好，我是",
    heroNameFirst: "鄭",
    heroNameLast: "涵歆",
    homeRole: "建築師與設計師",
    homeLabel: "建築 / 履歷",
    scrollCv: "向下瀏覽履歷 ↓",
    switchLanguage: "切換為英文",
    switchLight: "切換為淺色模式",
    switchDark: "切換為深色模式"
  }
};

function updateLampLabel() {
  const language = document.documentElement.lang;
  const text = translations[language];
  const isDark = document.body.classList.contains("dark-theme");

  lampButton.setAttribute(
    "aria-label",
    isDark ? text.switchLight : text.switchDark
  );
}

function setLanguage(language) {
  document.documentElement.lang = language;

  const text = translations[language];

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.dataset.i18n;
    element.textContent = text[key];
  });

  document.title = text.pageTitle;
  languageButton.setAttribute("aria-label", text.switchLanguage);
  updateLampLabel();
  window.portfolioI18n.apply();
}

languageButton.addEventListener("click", () => {
  const nextLanguage =
    document.documentElement.lang === "en" ? "zh-Hant" : "en";

  setLanguage(nextLanguage);
});

lampButton.addEventListener("click", updateLampLabel);

setLanguage(document.documentElement.lang);

// A local-file preview has no login backend; send its admin link to Node.js.
const adminLink = document.querySelector('.admin-link');
if (adminLink && location.protocol === 'file:') {
  adminLink.href = 'http://127.0.0.1:3000/admin';
}

const portfolioButton = document.querySelector(".portfolio-button");
const portfolioPanel = document.querySelector("#portfolioPanel");
const portfolioClose = document.querySelector(".portfolio-close");

portfolioButton.addEventListener("click", () => {
  if (portfolioPanel.open) return;
  portfolioPanel.showModal();
  document.body.classList.add("portfolio-active");
  document.documentElement.classList.add("portfolio-open");
});

portfolioClose.addEventListener("click", () => portfolioPanel.close());

// Also runs when the reader closes the dialog with Escape.
portfolioPanel.addEventListener("close", () => {
  document.body.classList.remove("portfolio-active");
  document.documentElement.classList.remove("portfolio-open");
  portfolioButton.focus({ preventScroll: true });
});
