'use server';

import {cookies} from 'next/headers';

import {defaultLocale, Locale, locales} from '@/i18n/config';

const COOKIE_NAME = 'TRAFFIC_PAGE_LOCALE';

export async function getLocale() {
    return (await cookies()).get(COOKIE_NAME)?.value || defaultLocale;
}

export async function setLocale(locale: string) {
    if (!locales.includes((locale as Locale))) locale = 'en';
    (await cookies()).set(COOKIE_NAME, locale);
}

export async function getTranslation(messages: any, key: string, defaultValue: string) {
    if (!messages) return defaultValue;

    // 递归获取嵌套翻译值
    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return defaultValue;
        }
    }

    return typeof value === 'string' ? value : defaultValue;
}