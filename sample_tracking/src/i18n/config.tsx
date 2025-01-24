import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  fallbackLng: "pt",
  lng: "pt",
  resources: {
    en: {
      translations: require("./locales/en/translations.json"),
    },
    pt: {
      translations: require("./locales/pt/translations.json"),
    },
  },
  ns: ["translations"],
  defaultNS: "translations",
});

i18n.languages = ["en", "pt"];

export default i18n;
