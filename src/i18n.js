// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Cookies from "js-cookie";

import translationEN from "./locales/en.json";
import translationUR from "./locales/ur.json";
import translationAR from "./locales/ar.json";
import translationHI from "./locales/hi.json";

const resources = {
  en: { translation: translationEN },
  ur: { translation: translationUR },
  ar: { translation: translationAR },
  hi: { translation: translationHI },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: Cookies.get("lang") || "en", // ← language from cookie
    fallbackLng: "en",
    interpolation: { escapeValue: false },
  });

export default i18n;
