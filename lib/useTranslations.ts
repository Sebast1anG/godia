/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";

type Translations = Record<string, any>;

let cachedTranslations: Translations | null = null;
let currentLocale: string = "pl";

export function useTranslations() {
  const [translations, setTranslations] = useState<Translations>(
    cachedTranslations || {}
  );

  useEffect(() => {
    if (!cachedTranslations) {
      import(`@/locales/${currentLocale}.json`)
        .then((module) => {
          cachedTranslations = module.default;
          setTranslations(module.default);
        })
        .catch((error) => {
          console.error("Błąd ładowania tłumaczeń:", error);
        });
    }
  }, []);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations;

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    return typeof value === "string" ? value : key;
  };

  return { t, locale: currentLocale };
}

export function setLocale(locale: string) {
  currentLocale = locale;
  cachedTranslations = null;
}
