import i18next from "i18next";
import en from "../locales/en.json";
import es from "../locales/es.json";

export async function initI18n(language: string) {
  await i18next.init({
    lng: language,
    fallbackLng: "en",
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
  });
}
