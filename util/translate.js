// Common code for translation configuration in routes folder
const { I18n } = require("i18n");
const path = require("path");

// translationPath = payh.join(__dirname, "..", "translations", "auth")
exports.getI18n = (translationPath) => {
  const i18n = new I18n({
    locales: ["en", "fr", "hi", "ur"],
    directory: translationPath,
    defaultLocale: "en",
  });
  return i18n;
};


