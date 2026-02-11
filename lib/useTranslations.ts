/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import plTranslations from '@/locales/pl.json';

type Translations = Record<string, any>;

const translationMap: Record<string, Translations> = {
    pl: plTranslations as Translations,
};

let currentLocale: string = 'pl';

export function useTranslations() {
    const [locale] = useState(currentLocale);
    const translations: Translations = translationMap[locale] || {};

    const t = (key: string): string => {
        const keys = key.split('.');
        let value: any = translations;

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key;
            }
        }

        return typeof value === 'string' ? value : key;
    };

    return { t, locale };
}

export function setLocale(locale: string) {
    currentLocale = locale;
}
