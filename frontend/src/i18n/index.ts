import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./locales/en.json";
import fr from "./locales/fr.json";
import sw from "./locales/sw.json";

export const SUPPORTED_LANGUAGES = [
  {
    code: "en",
    label: "English",
    flag: "🇬🇧",
    flagImg: "https://flagcdn.com/24x18/gb.png",
  },
  {
    code: "fr",
    label: "Français",
    flag: "🇫🇷",
    flagImg: "https://flagcdn.com/24x18/fr.png",
  },
  {
    code: "sw",
    label: "Kiswahili",
    flag: "🇹🇿",
    flagImg: "https://flagcdn.com/24x18/tz.png",
  },
] as const;

export type LangCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      sw: { translation: sw },
    },
    fallbackLng: "en",
    supportedLngs: ["en", "fr", "sw"],
    interpolation: { escapeValue: false },
    initImmediate: false,
    detection: {
      order: ["navigator"],
      cacheUserLanguage: false,
    },
  });

export default i18n;
